/// <reference lib="webworker" />
/**
 * Off-main-thread pipeline: ZIP -> locate export.xml -> stream-parse -> analyze.
 * Also parses Android Health Connect SQLite databases (.db).
 * Posts progress so the UI stays responsive.
 */
import JSZip from 'jszip';
import initSqlJs from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { createParser } from '../lib/parse';
import { analyze } from '../lib/analysis';
import type { WorkerRequest, WorkerResponse } from '../types/health';

const post = (m: WorkerResponse) => (self as unknown as Worker).postMessage(m);

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { file, profile } = e.data;
  try {
    post({ type: 'progress', phase: 'Reading file', pct: 3 });
    const parser = createParser();
    const name = file.name.toLowerCase();

    if (name.endsWith('.xml')) {
      // Raw export.xml uploaded directly.
      await streamFile(file, parser.feed, (pct) => post({ type: 'progress', phase: 'Parsing health records', pct: 5 + pct * 0.8 }));
    } else if (name.endsWith('.db')) {
      // Android Health Connect SQLite database import.
      post({ type: 'progress', phase: 'Initializing SQLite parser', pct: 10 });
      await parseSQLiteDb(file, parser, (phase, pct) => post({ type: 'progress', phase, pct }));
    } else {
      // ZIP flow.
      post({ type: 'progress', phase: 'Extracting ZIP', pct: 8 });
      const zip = await JSZip.loadAsync(file);
      const entry = findExportXml(zip);
      if (!entry) throw new Error('NO_EXPORT_XML');
      post({ type: 'progress', phase: 'Reading export.xml', pct: 15 });
      await streamZipEntry(entry, parser.feed, (pct) =>
        post({ type: 'progress', phase: 'Parsing health records', pct: 15 + pct * 0.7 }),
      );
    }

    post({ type: 'progress', phase: 'Running analysis', pct: 90 });
    const parsed = parser.finalize();
    if (parsed.totalRecords === 0) throw new Error('NO_RECORDS');
    const result = analyze(parsed, profile);
    post({ type: 'progress', phase: 'Finalizing report', pct: 99 });
    post({ type: 'done', result });
  } catch (err: any) {
    post({ type: 'error', message: normalizeError(err) });
  }
};

function findExportXml(zip: JSZip): JSZip.JSZipObject | null {
  let found: JSZip.JSZipObject | null = null;
  zip.forEach((path, obj) => {
    const p = path.toLowerCase();
    if (p.endsWith('export.xml') && !p.endsWith('export_cda.xml') && !obj.dir) found = obj;
  });
  return found;
}

/** Stream a File through a TextDecoder in chunks (constant memory). */
async function streamFile(file: File, feed: (s: string) => void, onPct: (pct: number) => void) {
  const total = file.size || 1;
  let read = 0;
  const decoder = new TextDecoder('utf-8');
  const reader = (file.stream() as ReadableStream<Uint8Array>).getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    read += value.byteLength;
    feed(decoder.decode(value, { stream: true }));
    onPct(Math.min(100, (read / total) * 100));
  }
  feed(decoder.decode());
}

/** Stream a zip entry as text chunks. */
function streamZipEntry(
  entry: JSZip.JSZipObject,
  feed: (s: string) => void,
  onPct: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let seen = 0;
    const stream = (entry as any).internalStream('string');
    stream
      .on('data', (chunk: string, meta: { percent: number }) => {
        seen += chunk.length;
        feed(chunk);
        if (meta?.percent != null) onPct(meta.percent);
        else onPct(Math.min(99, seen / 5_000_000));
      })
      .on('error', reject)
      .on('end', () => resolve());
    stream.resume();
  });
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as ArrayBuffer);
    r.onerror = () => reject(r.error);
    r.readAsArrayBuffer(file);
  });
}

async function parseSQLiteDb(
  file: File,
  parser: any,
  postProgress: (phase: string, pct: number) => void,
) {
  postProgress('Loading SQLite WASM engine', 12);
  const SQL = await initSqlJs({
    locateFile: () => sqlWasmUrl,
  });

  postProgress('Reading database file', 20);
  const buf = await readFileAsArrayBuffer(file);
  const db = new SQL.Database(new Uint8Array(buf));

  postProgress('Querying database tables', 30);
  
  // Helper to check table existence
  const tableExists = (tblName: string): boolean => {
    const res = db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tblName}';`);
    return res.length > 0 && res[0].values.length > 0;
  };

  const parsed = parser.finalize(); // Get direct reference to internal parsed object so we can populate it!

  // 1. Weight Table
  if (tableExists('weight_record_table')) {
    postProgress('Reading weight measurements', 40);
    const res = db.exec(`
      SELECT 
        datetime((time + zone_offset * 1000) / 1000, 'unixepoch') as dt, 
        weight / 1000.0 as val 
      FROM weight_record_table
      ORDER BY time ASC;
    `);
    if (res.length > 0) {
      const rows = res[0].values;
      rows.forEach(([dt, val]) => {
        if (dt && val != null) {
          parsed.weight.push({ d: String(dt), v: Number(val) });
          parsed.totalRecords++;
          parsed.counts['HKQuantityTypeIdentifierBodyMass'] = (parsed.counts['HKQuantityTypeIdentifierBodyMass'] ?? 0) + 1;
        }
      });
    }
  }

  // 2. Basal Metabolic Rate Table (BMR)
  if (tableExists('basal_metabolic_rate_record_table')) {
    postProgress('Reading basal metabolic rate', 50);
    const res = db.exec(`
      SELECT 
        strftime('%Y-%m-%d', datetime((time + zone_offset * 1000) / 1000, 'unixepoch')) as day,
        basal_metabolic_rate * 20.65 as val
      FROM basal_metabolic_rate_record_table
      ORDER BY time ASC;
    `);
    if (res.length > 0) {
      const rows = res[0].values;
      rows.forEach(([day, val]) => {
        if (day && val != null) {
          parsed.basalByDay.set(String(day), Number(val));
          parsed.totalRecords++;
          parsed.counts['HKQuantityTypeIdentifierBasalEnergyBurned'] = (parsed.counts['HKQuantityTypeIdentifierBasalEnergyBurned'] ?? 0) + 1;
        }
      });
    }
  }

  // 3. Active Calories Burned
  if (tableExists('active_calories_burned_record_table')) {
    postProgress('Reading active energy expenditure', 60);
    const res = db.exec(`
      SELECT 
        strftime('%Y-%m-%d', datetime((start_time + start_zone_offset * 1000) / 1000, 'unixepoch')) as day,
        SUM(energy) / 4184.0 as val
      FROM active_calories_burned_record_table
      GROUP BY day
      ORDER BY day ASC;
    `);
    if (res.length > 0) {
      const rows = res[0].values;
      rows.forEach(([day, val]) => {
        if (day && val != null) {
          parsed.activeByDay.set(String(day), Number(val));
          parsed.totalRecords++;
          parsed.counts['HKQuantityTypeIdentifierActiveEnergyBurned'] = (parsed.counts['HKQuantityTypeIdentifierActiveEnergyBurned'] ?? 0) + 1;
        }
      });
    }
  }

  // 4. Steps Table
  if (tableExists('steps_record_table')) {
    postProgress('Reading steps records', 65);
    const res = db.exec(`
      SELECT 
        strftime('%Y-%m-%d', datetime((start_time + start_zone_offset * 1000) / 1000, 'unixepoch')) as day,
        SUM(count) as val
      FROM steps_record_table
      GROUP BY day
      ORDER BY day ASC;
    `);
    if (res.length > 0) {
      const rows = res[0].values;
      rows.forEach(([day, val]) => {
        if (day && val != null) {
          let m = parsed.stepByDay.get(String(day));
          if (!m) {
            m = new Map();
            parsed.stepByDay.set(String(day), m);
          }
          m.set('Health Connect', Number(val));
          parsed.totalRecords++;
          parsed.counts['HKQuantityTypeIdentifierStepCount'] = (parsed.counts['HKQuantityTypeIdentifierStepCount'] ?? 0) + 1;
        }
      });
    }
  }

  // 5. Heart Rate Table (Series data)
  if (tableExists('heart_rate_record_series_table') && tableExists('heart_rate_record_table')) {
    postProgress('Reading heart rate records', 70);
    const res = db.exec(`
      SELECT 
        s.beats_per_minute as bpm,
        s.epoch_millis as time,
        p.start_zone_offset as zone_offset
      FROM heart_rate_record_series_table s
      JOIN heart_rate_record_table p ON s.parent_key = p.row_id
      ORDER BY s.epoch_millis ASC;
    `);
    if (res.length > 0) {
      const rows = res[0].values;
      rows.forEach(([bpm, time, zone_offset]) => {
        if (bpm != null && time != null) {
          const val = Number(bpm);
          const sd = new Date(Number(time) + Number(zone_offset || 0) * 1000).toISOString();
          const day = sd.slice(0, 10);
          const hour = parseInt(sd.slice(11, 13), 10) || 0;

          if (!parsed.firstDate || day < parsed.firstDate) parsed.firstDate = day;
          if (!parsed.lastDate || day > parsed.lastDate) parsed.lastDate = day;

          parsed.hrCount++;
          parsed.hrHourSum[hour] += val;
          parsed.hrHourCnt[hour]++;
          if (val < parsed.hrMin) parsed.hrMin = val;
          if (val > parsed.hrMax) parsed.hrMax = val;
          parsed.hrDays.add(day);
          const frac = val / 195; // default max HR
          const bin = frac < 0.5 ? 0 : frac < 0.6 ? 1 : frac < 0.7 ? 2 : frac < 0.8 ? 3 : frac < 0.9 ? 4 : 5;
          parsed.hrZones[bin]++;

          parsed.totalRecords++;
          parsed.counts['HKQuantityTypeIdentifierHeartRate'] = (parsed.counts['HKQuantityTypeIdentifierHeartRate'] ?? 0) + 1;
        }
      });
    }
  }

  // 6. HRV Table
  if (tableExists('heart_rate_variability_rmssd_record_table')) {
    postProgress('Reading heart rate variability', 75);
    const res = db.exec(`
      SELECT 
        strftime('%Y-%m-%d', datetime((time + zone_offset * 1000) / 1000, 'unixepoch')) as day,
        heart_rate_variability_millis as val 
      FROM heart_rate_variability_rmssd_record_table
      ORDER BY time ASC;
    `);
    if (res.length > 0) {
      const rows = res[0].values;
      rows.forEach(([day, val]) => {
        if (day && val != null) {
          parsed.hrv.push({ d: String(day), v: Number(val) });
          parsed.totalRecords++;
          parsed.counts['HKQuantityTypeIdentifierHeartRateVariabilitySDNN'] = (parsed.counts['HKQuantityTypeIdentifierHeartRateVariabilitySDNN'] ?? 0) + 1;
        }
      });
    }
  }

  // 7. Sleep Table
  if (tableExists('sleep_session_record_table')) {
    postProgress('Reading sleep session records', 80);
    // If stages exist, parse them
    if (tableExists('sleep_stages_table')) {
      const res = db.exec(`
        SELECT 
          datetime((s.stage_start_time + p.start_zone_offset * 1000) / 1000, 'unixepoch') as start,
          datetime((s.stage_end_time + p.start_zone_offset * 1000) / 1000, 'unixepoch') as end,
          s.stage_type as type
        FROM sleep_stages_table s
        JOIN sleep_session_record_table p ON s.parent_key = p.row_id
        ORDER BY s.stage_start_time ASC;
      `);
      if (res.length > 0) {
        const rows = res[0].values;
        rows.forEach(([start, end, type]) => {
          if (start && end && type != null) {
            let stage = 'InBed';
            const t = Number(type);
            if (t === 1) stage = 'Awake';
            else if (t === 3) stage = 'Deep';
            else if (t === 4) stage = 'REM';
            else if (t === 6) stage = 'Core';
            parsed.sleep.push({ start: String(start), end: String(end), stage });
            parsed.totalRecords++;
            parsed.counts['HKCategoryTypeIdentifierSleepAnalysis'] = (parsed.counts['HKCategoryTypeIdentifierSleepAnalysis'] ?? 0) + 1;
          }
        });
      }
    } else {
      // Fallback to sessions duration
      const res = db.exec(`
        SELECT 
          datetime((start_time + start_zone_offset * 1000) / 1000, 'unixepoch') as start,
          datetime((end_time + end_zone_offset * 1000) / 1000, 'unixepoch') as end
        FROM sleep_session_record_table
        ORDER BY start_time ASC;
      `);
      if (res.length > 0) {
        const rows = res[0].values;
        rows.forEach(([start, end]) => {
          if (start && end) {
            parsed.sleep.push({ start: String(start), end: String(end), stage: 'InBed' });
            parsed.totalRecords++;
            parsed.counts['HKCategoryTypeIdentifierSleepAnalysis'] = (parsed.counts['HKCategoryTypeIdentifierSleepAnalysis'] ?? 0) + 1;
          }
        });
      }
    }
  }

  // 8. VO2 Max Table
  if (tableExists('vo2_max_record_table')) {
    postProgress('Reading VO2 Max values', 85);
    const res = db.exec(`
      SELECT 
        strftime('%Y-%m-%d', datetime((time + zone_offset * 1000) / 1000, 'unixepoch')) as day,
        vo2_milliliters_per_minute_kilogram as val 
      FROM vo2_max_record_table
      ORDER BY time ASC;
    `);
    if (res.length > 0) {
      const rows = res[0].values;
      rows.forEach(([day, val]) => {
        if (day && val != null) {
          parsed.vo2.push({ d: String(day), v: Number(val) });
          parsed.totalRecords++;
          parsed.counts['HKQuantityTypeIdentifierVO2Max'] = (parsed.counts['HKQuantityTypeIdentifierVO2Max'] ?? 0) + 1;
        }
      });
    }
  }

  // 8b. Resting Heart Rate Table (drives cardio scoring + biological age; Apple parses this too)
  if (tableExists('resting_heart_rate_record_table')) {
    postProgress('Reading resting heart rate', 86);
    const res = db.exec(`
      SELECT
        strftime('%Y-%m-%d', datetime((time + zone_offset * 1000) / 1000, 'unixepoch')) as day,
        beats_per_minute as val
      FROM resting_heart_rate_record_table
      ORDER BY time ASC;
    `);
    if (res.length > 0) {
      res[0].values.forEach(([day, val]) => {
        if (day && val != null) {
          parsed.restingHr.push({ d: String(day), v: Number(val) });
          parsed.totalRecords++;
          parsed.counts['HKQuantityTypeIdentifierRestingHeartRate'] = (parsed.counts['HKQuantityTypeIdentifierRestingHeartRate'] ?? 0) + 1;
        }
      });
    }
  }

  // 8c. Respiratory Rate Table (breaths/min, same unit as Apple; aggregated running mean)
  if (tableExists('respiratory_rate_record_table')) {
    postProgress('Reading respiratory rate', 87);
    const res = db.exec(`SELECT rate as val FROM respiratory_rate_record_table;`);
    if (res.length > 0) {
      res[0].values.forEach(([val]) => {
        if (val != null) {
          parsed.respSum += Number(val);
          parsed.respCnt++;
          parsed.totalRecords++;
          parsed.counts['HKQuantityTypeIdentifierRespiratoryRate'] = (parsed.counts['HKQuantityTypeIdentifierRespiratoryRate'] ?? 0) + 1;
        }
      });
    }
  }

  // 8d. Oxygen Saturation Table (Health Connect stores 0-100; the app expects a 0-1 fraction)
  if (tableExists('oxygen_saturation_record_table')) {
    postProgress('Reading oxygen saturation', 88);
    const res = db.exec(`SELECT percentage as val FROM oxygen_saturation_record_table;`);
    if (res.length > 0) {
      res[0].values.forEach(([val]) => {
        if (val != null) {
          const frac = Number(val) / 100;
          if (frac <= 0 || frac > 1) return; // ignore malformed rows
          parsed.spo2Sum += frac;
          parsed.spo2Cnt++;
          if (frac < 0.95) parsed.spo2Under95++;
          parsed.totalRecords++;
          parsed.counts['HKQuantityTypeIdentifierOxygenSaturation'] = (parsed.counts['HKQuantityTypeIdentifierOxygenSaturation'] ?? 0) + 1;
        }
      });
    }
  }

  // 9. Workouts
  if (tableExists('exercise_session_record_table')) {
    postProgress('Reading exercise sessions', 88);
    const res = db.exec(`
      SELECT 
        title, 
        exercise_type,
        (end_time - start_time) / (1000.0 * 60.0) as dur_min,
        datetime((start_time + start_zone_offset * 1000) / 1000, 'unixepoch') as start
      FROM exercise_session_record_table
      ORDER BY start_time ASC;
    `);
    if (res.length > 0) {
      const rows = res[0].values;
      rows.forEach(([title, type, dur, start]) => {
        if (start && dur != null) {
          const wType = title ? String(title) : type === 8 ? 'Running' : type === 14 ? 'Walking' : type === 17 ? 'Cycling' : 'Exercise';
          parsed.workouts.push({ type: wType, dur: Number(dur), start: String(start) });
          parsed.totalRecords++;
        }
      });
    }
  }

  // Define dates fallback from arrays if first/last dates are missing
  if (!parsed.firstDate && parsed.weight.length > 0) parsed.firstDate = parsed.weight[0].d.slice(0, 10);
  if (!parsed.lastDate && parsed.weight.length > 0) parsed.lastDate = parsed.weight[parsed.weight.length - 1].d.slice(0, 10);

  // Populate inventory order
  Object.keys(parsed.counts).forEach((k) => {
    if (!parsed.inventoryOrder.includes(k)) parsed.inventoryOrder.push(k);
  });

  // Close database to free memory
  db.close();
  postProgress('DB successfully parsed', 90);
}

function normalizeError(err: any): string {
  const msg = String(err?.message ?? err);
  if (msg.includes('NO_EXPORT_XML'))
    return 'Could not find export.xml inside the ZIP. Make sure you uploaded the "Export.zip" from Apple Health (Health app → profile → Export All Health Data).';
  if (msg.includes('NO_RECORDS'))
    return 'No health records were found in this file. It may be an empty or partial export.';
  if (msg.toLowerCase().includes('corrupt') || msg.toLowerCase().includes('zip'))
    return 'This file could not be read as a valid ZIP. Try re-exporting from the Health app.';
  return `Unexpected error while processing: ${msg}`;
}
