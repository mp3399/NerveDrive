import {
  LayoutDashboard, Activity, History, GitCompare, Compass, BrainCircuit, ShieldAlert
} from 'lucide-react';

export const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bodysystems', label: 'Body Systems', icon: Activity },
  { id: 'timeline', label: 'Timeline', icon: History },
  { id: 'correlations', label: 'Correlations', icon: GitCompare },
  { id: 'predictions', label: 'Predictions', icon: Compass },
  { id: 'coach', label: 'AI Coach', icon: BrainCircuit },
  { id: 'quality', label: 'Data Quality', icon: ShieldAlert },
] as const;

export type NavId = (typeof NAV)[number]['id'];
