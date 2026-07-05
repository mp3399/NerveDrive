/** Core domain types for NerveDrive. */

export type Status = 'good' | 'warn' | 'bad' | 'neutral';

export interface Series {
  dates: string[];
  values: (number | null)[];
  /** optional extra channels (e.g. sleep bedtime/wake) */
  extra?: Record<string, (number | null)[]>;
}

export interface DataQuality {
  totalRecords: number;
  windowStart: string;
  windowEnd: string;
  daysSpan: number;
  coveragePct: number;
  watchWearPct: number;
  watchWornDays: number;
  strayOldDays: number;
  sources: Record<string, number>;
  contaminationRecords: number;
  contaminationNote: string | null;
  issues: { title: string; detail: string; handling: string }[];
}

export interface ActivityStats {
  stepsMean: number;
  stepsMedian: number;
  stepsStd: number;
  stepsMax: number;
  stepsMaxDate: string;
  p75: number;
  p90: number;
  daysOver10k: number;
  daysUnder5k: number;
  pctDaysOver10k: number;
  weekdayMean: number;
  weekendMean: number;
  byDow: number[];
  byMonth: Record<string, number>;
  longest10kStreak: number;
  longestInactiveStreak: number;
  activeEnergyMean: number;
  exerciseMinMean: number;
  weeklyExerciseMin: number;
  totalDistanceKm: number;
  flightsTotal: number;
}

export interface CardioStats {
  restingHrMean: number;
  restingHrMin: number;
  restingHrMax: number;
  restingHrFirst: number;
  restingHrLast: number;
  hrvMean: number;
  hrvFirst: number;
  hrvLast: number;
  vo2First: number;
  vo2Latest: number;
  hrAbsMin: number;
  hrAbsMax: number;
  hrReadings: number;
  hourlyHr: number[];
  hrZones: Record<string, number>;
  walkingHrMean?: number;
}

export interface SleepStats {
  nNights: number;
  meanSleepH: number;
  medianSleepH: number;
  meanEff: number;
  pctUnder6h: number;
  medianBedH: number;
  medianWakeH: number;
  bedStdH: number;
  deepPct: number;
  remPct: number;
  corePct: number;
  weekdaySleep: number;
  weekendSleep: number;
  nightsAfter2am: number;
}

export interface BodyStats {
  weightLatest?: number;
  weightRecords: { date: string; value: number }[];
  heightCm?: number;
  bmi?: number;
  bmiCat?: string;
}

export interface WorkoutStats {
  n: number;
  byType: Record<string, number>;
  totalMin: number;
  perWeek: number;
}

export interface MetabolicStats {
  meanActiveKcal: number;
  meanBasalKcal: number;
  meanTdee: number;
}

export interface CorrelationPair {
  a: string;
  b: string;
  r: number;
  n: number;
}

export interface Anomalies {
  highHrEvents: number;
  nightsUnder5h: number;
  worstSleep: { date: string; hours: number } | null;
  rhrSpikeDays: { date: string; rhr: number }[];
  hrvCrashDays: { date: string; hrv: number }[];
  contamination: number;
}

export interface PopulationRow {
  metric: string;
  value: number | string;
  category: string;
  status: Status;
  ref: string;
}

export type Scores = Record<string, number>;

export interface Extras {
  spo2?: { mean: number; pctUnder95: number };
  respRate?: { mean: number };
  envAudio?: { meanDb: number; maxDb: number; pctOver80: number };
  walking: Record<string, { mean: number; n: number }>;
  daylightMean?: number;
  mindful: number;
}

export interface Profile {
  name?: string;
  age: number;
  sex: 'male' | 'female';
}

export interface BiologicalAge {
  bioAge: number;
  delta: number;
  confidence: 'low' | 'medium' | 'high';
  factorsUsed: string[];
}

export interface AnalysisResult {
  generatedAt: string;
  profile: Profile;
  dataQuality: DataQuality;
  activity: ActivityStats;
  cardio: CardioStats;
  sleep: SleepStats;
  body: BodyStats;
  workouts: WorkoutStats;
  metabolic: MetabolicStats;
  correlations: CorrelationPair[];
  corrMatrix: { cols: string[]; data: (number | null)[][] };
  anomalies: Anomalies;
  population: PopulationRow[];
  scores: Scores;
  biologicalAge: BiologicalAge;
  extras: Extras;
  series: Record<string, Series>;
  inventory: { type: string; short: string; count: number; confidence: Status }[];
}

/** Worker <-> main messages */
export type WorkerRequest = { file: File; profile: Profile };
export type WorkerResponse =
  | { type: 'progress'; phase: string; pct: number }
  | { type: 'done'; result: AnalysisResult }
  | { type: 'error'; message: string };
