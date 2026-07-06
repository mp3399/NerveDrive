import { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileArchive, ArrowRight, User, Edit2 } from 'lucide-react';
import { useAnalyzer } from '../../hooks/useAnalyzer';
import { useStore } from '../../store/useStore';

export function UploadZone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [step, setStep] = useState<'info' | 'file'>('info');
  const { analyzeFile } = useAnalyzer();
  const { profile, setProfile } = useStore();

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (files && files[0]) analyzeFile(files[0]);
    },
    [analyzeFile],
  );

  const isNameValid = profile.name && profile.name.trim().length > 0;

  if (step === 'info') {
    return (
      <div className="card max-w-xl mx-auto p-6 sm:p-8 border border-line/60 bg-surface/40 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
            <User size={20} />
          </div>
          <div>
            <h2 className="font-grotesk text-xl font-semibold text-ink">Personalize Your Report</h2>
            <p className="text-xs text-muted">No data ever leaves your device. Stored 100% locally.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-semibold">Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={profile.name || ''}
              onChange={(e) => setProfile({ name: e.target.value })}
              className="w-full rounded-2xl border-2 border-line bg-surface-2/30 px-5 py-4 font-grotesk text-lg text-ink font-medium outline-none focus:border-accent/60 focus:bg-surface transition-all placeholder:text-muted/30 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-semibold">Age (Optional)</label>
              <input
                type="number"
                min={1}
                max={120}
                placeholder="e.g. 30"
                value={profile.age || ''}
                onChange={(e) => setProfile({ age: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="w-full rounded-2xl border-2 border-line bg-surface-2/30 px-5 py-4 font-grotesk text-lg text-ink font-medium outline-none focus:border-accent/60 focus:bg-surface transition-all placeholder:text-muted/30 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-2 font-semibold">Sex (Optional)</label>
              <select
                value={profile.sex}
                onChange={(e) => setProfile({ sex: e.target.value as 'male' | 'female' })}
                className="w-full rounded-2xl border-2 border-line bg-surface-2/30 px-5 py-4 font-grotesk text-lg text-ink font-medium outline-none focus:border-accent/60 focus:bg-surface transition-all shadow-sm appearance-none cursor-pointer"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => isNameValid && setStep('file')}
              disabled={!isNameValid}
              className="w-full btn bg-ink text-bg hover:opacity-90 font-semibold py-3.5 rounded-xl shadow-glow disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 transition-all"
            >
              Continue to Upload <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card max-w-xl mx-auto p-6 border border-line/60 bg-surface/40 backdrop-blur-md shadow-2xl relative overflow-hidden">
      {/* Profile summary banner */}
      <div className="mb-5 flex items-center justify-between rounded-xl bg-surface-2/40 border border-line/30 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2 text-muted">
          <span className="font-semibold text-ink">{profile.name}</span>
          {profile.age && <span>· {profile.age}y</span>}
          <span>· {profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1)}</span>
        </div>
        <button
          onClick={() => setStep('info')}
          className="text-accent hover:text-accent/80 flex items-center gap-1 font-semibold transition-colors"
        >
          <Edit2 size={12} /> Edit Details
        </button>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload Apple Health export ZIP"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          onFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-300 ${
          drag ? 'border-accent bg-accent/5 scale-[1.01]' : 'border-line hover:border-accent hover:bg-accent/[0.01]'
        }`}
      >
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-surface-2/60 border border-line shadow-card text-muted transition-colors">
          {drag ? <FileArchive className="text-accent animate-pulse" size={28} /> : <UploadCloud className="text-accent" size={28} />}
        </div>
        <p className="mt-5 font-grotesk text-xl font-semibold text-ink">
          Drop your <span className="text-accent">Export.zip</span> here
        </p>
        <p className="mt-1 text-sm text-muted">or click to choose a file · .zip, .db, or export.xml</p>
        
        <input
          ref={inputRef}
          type="file"
          accept=".zip,.xml,.db,application/zip,text/xml,application/x-sqlite3"
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
