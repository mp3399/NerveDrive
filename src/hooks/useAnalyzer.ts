import { useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';
import type { WorkerResponse } from '../types/health';

/** Spawns the parsing worker and streams progress into the store. */
export function useAnalyzer() {
  const workerRef = useRef<Worker | null>(null);
  const { startProcessing, setProgress, setResult, setError, profile } = useStore();

  const analyzeFile = useCallback(
    (file: File) => {
      const name = file.name.toLowerCase();
      if (!name.endsWith('.zip') && !name.endsWith('.xml') && !name.endsWith('.db')) {
        setError('Please upload the Apple Health export ZIP, export.xml, or Health Connect .db file.');
        return;
      }
      startProcessing(file.name, file.size);
      workerRef.current?.terminate();
      const worker = new Worker(new URL('../workers/parser.worker.ts', import.meta.url), {
        type: 'module',
      });
      workerRef.current = worker;
      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const msg = e.data;
        if (msg.type === 'progress') setProgress(Math.round(msg.pct), msg.phase);
        else if (msg.type === 'done') {
          setResult(msg.result);
          worker.terminate();
        } else if (msg.type === 'error') {
          setError(msg.message);
          worker.terminate();
        }
      };
      worker.onerror = (err) => setError(err.message || 'Worker crashed while processing.');
      worker.postMessage({ file, profile });
    },
    [profile, startProcessing, setProgress, setResult, setError],
  );

  return { analyzeFile };
}
