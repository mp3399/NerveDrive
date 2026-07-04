import { create } from 'zustand';
import type { AnalysisResult, Profile } from '../types/health';

export type Phase = 'idle' | 'processing' | 'ready' | 'error';
export type Theme = 'dark' | 'light';

interface State {
  phase: Phase;
  progress: number;
  progressPhase: string;
  result: AnalysisResult | null;
  error: string | null;
  fileName: string | null;
  fileSize: number | null;
  profile: Profile;
  theme: Theme;
  section: string;
  setProfile: (p: Partial<Profile>) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setSection: (s: string) => void;
  startProcessing: (name: string, size: number) => void;
  setProgress: (pct: number, phase: string) => void;
  setResult: (r: AnalysisResult) => void;
  setError: (msg: string) => void;
  reset: () => void;
}

const preferredTheme = (): Theme => 'light';

export const useStore = create<State>((set) => ({
  phase: 'idle',
  progress: 0,
  progressPhase: '',
  result: null,
  error: null,
  fileName: null,
  fileSize: null,
  profile: { name: '', age: 30, sex: 'male' },
  theme: preferredTheme(),
  section: 'overview',
  setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
  setTheme: (t) => set({ theme: t }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  setSection: (section) => set({ section }),
  startProcessing: (fileName, fileSize) =>
    set({ phase: 'processing', progress: 0, progressPhase: 'Starting', fileName, fileSize, error: null }),
  setProgress: (progress, progressPhase) => set({ progress, progressPhase }),
  setResult: (result) => set({ result, phase: 'ready', progress: 100 }),
  setError: (error) => set({ error, phase: 'error' }),
  reset: () => set({ phase: 'idle', result: null, error: null, progress: 0, fileName: null, fileSize: null, section: 'overview' }),
}));
