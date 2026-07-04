import { Check, Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { fileSize } from '../../lib/format';
import { DotMatrixNumber } from '../ui/DotMatrixNumber';

const STAGES = [
  { at: 8, label: 'Extracting ZIP' },
  { at: 15, label: 'Reading export.xml' },
  { at: 60, label: 'Parsing health records' },
  { at: 90, label: 'Running analysis' },
  { at: 99, label: 'Building dashboard' },
];

export function Processing() {
  const { progress, progressPhase, fileName, fileSize: size } = useStore();
  return (
    <div className="mx-auto grid min-h-screen max-w-lg place-items-center px-6">
      <div className="w-full">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 w-fit text-accent">
            <DotMatrixNumber value={progress} size={11} gap={4} />
          </div>
          <h1 className="font-grotesk text-2xl font-semibold">Analysing your health data</h1>
          <p className="mt-1 text-sm text-muted">
            {fileName} {size ? `· ${fileSize(size)}` : ''} · stays on your device
          </p>
        </div>

        <div className="card p-5">
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ul className="space-y-2.5">
            {STAGES.map((s) => {
              const done = progress > s.at + 5;
              const active = !done && progress >= s.at - 6;
              return (
                <li key={s.label} className="flex items-center gap-3 text-sm">
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full ${
                      done ? 'bg-good/20 text-good' : active ? 'text-accent' : 'text-faint'
                    }`}
                  >
                    {done ? <Check size={13} /> : active ? <Loader2 size={13} className="animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                  </span>
                  <span className={done || active ? 'text-ink' : 'text-muted'}>{s.label}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-center text-xs text-muted">{progressPhase}…</p>
        </div>
      </div>
    </div>
  );
}

export function ErrorScreen() {
  const { error, reset } = useStore();
  return (
    <div className="mx-auto grid min-h-screen max-w-md place-items-center px-6 text-center">
      <div className="card p-8">
        <AlertTriangle className="mx-auto text-bad" size={32} />
        <h1 className="mt-4 font-grotesk text-xl font-semibold">Could not process that file</h1>
        <p className="mt-2 text-sm text-muted">{error}</p>
        <button className="btn-primary mt-6" onClick={reset}>
          <RotateCcw size={16} /> Try another file
        </button>
      </div>
    </div>
  );
}
