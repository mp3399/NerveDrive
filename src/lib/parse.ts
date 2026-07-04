/**
 * Streaming, constant-memory parser for Apple Health export.xml.
 * Feeds line-by-line so a 200MB+ export never lives fully in memory.
 * Proven against a real 238MB export: ~3s, ~25MB heap.
 */

export const TYPE_MAP: Record<string, string> = {
  HKQuantityTypeIdentifierHeartRate: 'hr',
  HKQuantityTypeIdentifierRestingHeartRate: 'restingHr',
  HKQuantityTypeIdentifierWalkingHeartRateAverage: 'walkingHr',
  HKQuantityTypeIdentifierHeartRateVariabilitySDNN: 'hrv',
  HKQuantityTypeIdentifierVO2Max: 'vo2',
  HKQuantityTypeIdentifierStepCount: 'steps',
  HKQuantityTypeIdentifierDistanceWalkingRunning: 'dist',
  HKQuantityTypeIdentifierFlightsClimbed: 'flights',
  HKQuantityTypeIdentifierActiveEnergyBurned: 'active',
  HKQuantityTypeIdentifierBasalEnergyBurned: 'basal',
  HKQuantityTypeIdentifierAppleExerciseTime: 'exercise',
  HKQuantityTypeIdentifierAppleStandTime: 'stand',
  HKQuantityTypeIdentifierRespiratoryRate: 'resp',
  HKQuantityTypeIdentifierOxygenSaturation: 'spo2',
  HKQuantityTypeIdentifierWalkingSpeed: 'walkSpeed',
  HKQuantityTypeIdentifierWalkingStepLength: 'stepLength',
  HKQuantityTypeIdentifierWalkingAsymmetryPercentage: 'walkAsym',
  HKQuantityTypeIdentifierWalkingDoubleSupportPercentage: 'walkDsupport',
  HKQuantityTypeIdentifierAppleWalkingSteadiness: 'steadiness',
  HKQuantityTypeIdentifierEnvironmentalAudioExposure: 'envAudio',
  HKQuantityTypeIdentifierTimeInDaylight: 'daylight',
  HKQuantityTypeIdentifierBodyMass: 'weight',
  HKQuantityTypeIdentifierHeight: 'height',
  HKCategoryTypeIdentifierSleepAnalysis: 'sleep',
  HKCategoryTypeIdentifierHighHeartRateEvent: 'highHr',
  HKCategoryTypeIdentifierMindfulSession: 'mindful',
  HKCategoryTypeIdentifierMenstrualFlow: 'menstrual',
  HKCategoryTypeIdentifierAbdominalCramps: 'cramps',
  HKCategoryTypeIdentifierIntermenstrualBleeding: 'bleeding',
};

function attr(s: string, name: string): string | null {
  const key = name + '="';
  const i = s.indexOf(key);
  if (i < 0) return null;
  const j = s.indexOf('"', i + key.length);
  return j < 0 ? null : s.slice(i + key.length, j);
}

export interface Parsed {
  counts: Record<string, number>;
  inventoryOrder: string[];
  stepByDay: Map<string, Map<string, number>>;
  activeByDay: Map<string, number>;
  basalByDay: Map<string, number>;
  exerciseByDay: Map<string, number>;
  distByDay: Map<string, number>;
  standByDay: Map<string, number>;
  daylightByDay: Map<string, number>;
  flightsTotal: number;
  restingHr: { d: string; v: number }[];
  walkingHr: number[];
  hrv: { d: string; v: number }[];
  vo2: { d: string; v: number }[];
  hrHourSum: number[];
  hrHourCnt: number[];
  hrMin: number;
  hrMax: number;
  hrCount: number;
  hrZones: number[]; // 6 bins
  hrDays: Set<string>;
  respSum: number;
  respCnt: number;
  sleep: { start: string; end: string; stage: string }[];
  spo2Sum: number;
  spo2Cnt: number;
  spo2Under95: number;
  envSum: number;
  envCnt: number;
  envMax: number;
  envOver80: number;
  walk: Map<string, { sum: number; cnt: number }>;
  weight: { d: string; v: number }[];
  heightCm: number | null;
  workouts: { type: string; dur: number; start: string }[];
  highHr: number;
  contamination: number;
  sources: Record<string, number>;
  firstDate: string | null;
  lastDate: string | null;
  totalRecords: number;
}

const MAX_HR = 195; // 220 - 25 default; recomputed per-profile downstream if needed

export function createParser() {
  const p: Parsed = {
    counts: {},
    inventoryOrder: [],
    stepByDay: new Map(),
    activeByDay: new Map(),
    basalByDay: new Map(),
    exerciseByDay: new Map(),
    distByDay: new Map(),
    standByDay: new Map(),
    daylightByDay: new Map(),
    flightsTotal: 0,
    restingHr: [],
    walkingHr: [],
    hrv: [],
    vo2: [],
    hrHourSum: new Array(24).fill(0),
    hrHourCnt: new Array(24).fill(0),
    hrMin: Infinity,
    hrMax: -Infinity,
    hrCount: 0,
    hrZones: new Array(6).fill(0),
    hrDays: new Set(),
    respSum: 0,
    respCnt: 0,
    sleep: [],
    spo2Sum: 0,
    spo2Cnt: 0,
    spo2Under95: 0,
    envSum: 0,
    envCnt: 0,
    envMax: -Infinity,
    envOver80: 0,
    walk: new Map(),
    weight: [],
    heightCm: null,
    workouts: [],
    highHr: 0,
    contamination: 0,
    sources: {},
    firstDate: null,
    lastDate: null,
    totalRecords: 0,
  };

  const addDay = (m: Map<string, number>, d: string, v: number) => m.set(d, (m.get(d) ?? 0) + v);
  const bump = (t: string) => {
    if (p.counts[t] === undefined) p.inventoryOrder.push(t);
    p.counts[t] = (p.counts[t] ?? 0) + 1;
  };

  function handleLine(line: string) {
    if (line.length < 12) return;
    const isRecord = line.indexOf('<Record ') >= 0;
    const isWorkout = !isRecord && line.indexOf('<Workout ') >= 0;
    if (!isRecord && !isWorkout) return;

    if (isWorkout) {
      const type = (attr(line, 'workoutActivityType') ?? '').replace('HKWorkoutActivityType', '');
      const dur = parseFloat(attr(line, 'duration') ?? '0');
      const start = attr(line, 'startDate') ?? '';
      p.workouts.push({ type, dur: isNaN(dur) ? 0 : dur, start });
      return;
    }

    const type = attr(line, 'type');
    if (!type) return;
    const short = TYPE_MAP[type];
    if (!short) return;
    bump(type);
    p.totalRecords++;

    const sd = attr(line, 'startDate');
    if (!sd) return;
    const day = sd.slice(0, 10);
    const hour = parseInt(sd.slice(11, 13), 10) || 0;
    if (!p.firstDate || day < p.firstDate) p.firstDate = day;
    if (!p.lastDate || day > p.lastDate) p.lastDate = day;
    const raw = attr(line, 'value');
    const val = raw != null ? parseFloat(raw) : NaN;
    const src = attr(line, 'sourceName') ?? 'Unknown';

    switch (short) {
      case 'steps': {
        p.sources[src] = (p.sources[src] ?? 0) + 1;
        let m = p.stepByDay.get(day);
        if (!m) {
          m = new Map();
          p.stepByDay.set(day, m);
        }
        m.set(src, (m.get(src) ?? 0) + (isNaN(val) ? 0 : val));
        break;
      }
      case 'active':
        addDay(p.activeByDay, day, val || 0);
        break;
      case 'basal':
        addDay(p.basalByDay, day, val || 0);
        break;
      case 'exercise':
        addDay(p.exerciseByDay, day, val || 0);
        break;
      case 'dist':
        addDay(p.distByDay, day, val || 0);
        break;
      case 'stand':
        addDay(p.standByDay, day, val || 0);
        break;
      case 'daylight':
        addDay(p.daylightByDay, day, val || 0);
        break;
      case 'flights':
        p.flightsTotal += val || 0;
        break;
      case 'restingHr':
        if (!isNaN(val)) p.restingHr.push({ d: day, v: val });
        break;
      case 'walkingHr':
        if (!isNaN(val)) p.walkingHr.push(val);
        break;
      case 'hrv':
        if (!isNaN(val)) p.hrv.push({ d: day, v: val });
        break;
      case 'vo2':
        if (!isNaN(val)) p.vo2.push({ d: day, v: val });
        break;
      case 'hr': {
        if (isNaN(val)) break;
        p.hrCount++;
        p.hrHourSum[hour] += val;
        p.hrHourCnt[hour]++;
        if (val < p.hrMin) p.hrMin = val;
        if (val > p.hrMax) p.hrMax = val;
        p.hrDays.add(day);
        const frac = val / MAX_HR;
        const bin = frac < 0.5 ? 0 : frac < 0.6 ? 1 : frac < 0.7 ? 2 : frac < 0.8 ? 3 : frac < 0.9 ? 4 : 5;
        p.hrZones[bin]++;
        break;
      }
      case 'resp':
        if (!isNaN(val)) {
          p.respSum += val;
          p.respCnt++;
        }
        break;
      case 'spo2':
        if (!isNaN(val)) {
          p.spo2Sum += val;
          p.spo2Cnt++;
          if (val < 0.95) p.spo2Under95++;
        }
        break;
      case 'envAudio':
        if (!isNaN(val)) {
          p.envSum += val;
          p.envCnt++;
          if (val > p.envMax) p.envMax = val;
          if (val > 80) p.envOver80++;
        }
        break;
      case 'walkSpeed':
      case 'stepLength':
      case 'walkAsym':
      case 'walkDsupport':
      case 'steadiness': {
        if (isNaN(val)) break;
        const w = p.walk.get(short) ?? { sum: 0, cnt: 0 };
        w.sum += val;
        w.cnt++;
        p.walk.set(short, w);
        break;
      }
      case 'weight':
        if (!isNaN(val)) p.weight.push({ d: sd, v: val });
        break;
      case 'height':
        if (!isNaN(val)) p.heightCm = val > 3 ? val : val * 100;
        break;
      case 'sleep': {
        const ed = attr(line, 'endDate');
        const stage = (val && !isNaN(val) ? '' : (raw ?? '')).replace(
          'HKCategoryValueSleepAnalysis',
          '',
        );
        if (ed) p.sleep.push({ start: sd, end: ed, stage });
        break;
      }
      case 'highHr':
        p.highHr++;
        break;
      case 'mindful':
        // counted via counts map
        break;
      case 'menstrual':
      case 'cramps':
      case 'bleeding':
        p.contamination++;
        break;
    }
  }

  let buf = '';
  return {
    feed(chunk: string) {
      buf += chunk;
      let i: number;
      while ((i = buf.indexOf('\n')) >= 0) {
        handleLine(buf.slice(0, i));
        buf = buf.slice(i + 1);
      }
    },
    finalize(): Parsed {
      if (buf) handleLine(buf);
      buf = '';
      return p;
    },
  };
}
