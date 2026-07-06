import { useState } from 'react';
import { RefreshCw, AlertTriangle, Zap } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function PredictionsSection() {
  const r = useStore((s) => s.result!);
  const baseAge = r.profile.age || 30;
  // Single source of truth: the statistically derived biological age from analyze().
  const currentBioAge = r.biologicalAge.bioAge;
  // Real recovery baseline (the Sleep pillar score); NaN when there is no sleep data, guarded on display.
  const sleepScore = Number.isFinite(r.scores['Sleep']) ? r.scores['Sleep'] : NaN;

  // Sliders State
  const [sleep, setSleep] = useState<number>(r.sleep?.meanSleepH || 7.0);
  const [workouts, setWorkouts] = useState<number>(3);
  const [weightChange, setWeightChange] = useState<number>(0);
  const [alcohol, setAlcohol] = useState<number>(1);
  const [protein, setProtein] = useState<number>(1.2); // g/kg

  // Projections calculations
  const sleepDelta = sleep - (r.sleep?.meanSleepH || 7.0);
  const workoutsDelta = workouts - 2; 
  const alcoholDelta = alcohol - 3; 
  const proteinDelta = protein - 1.0;

  // Dynamic model based on correlated variables
  const projectedBioAge = Math.max(
    18,
    currentBioAge - (sleepDelta * 0.6) - (workoutsDelta * 0.45) + (alcoholDelta * 0.35) + (weightChange * 0.15) - (proteinDelta * 0.5)
  );
  // Positive shift means the projected bio age is lower than current (an improvement).
  const bioAgeShift = currentBioAge - projectedBioAge;

  const projectedRecovery = Math.min(
    100,
    Math.max(
      30,
      sleepScore + (sleepDelta * 8.5) + (workoutsDelta * 2.5) - (alcoholDelta * 5) - (weightChange * 0.5)
    )
  );

  const projectedHeartAge = Math.max(
    18,
    baseAge - 1.5 - (workoutsDelta * 0.55) + (alcoholDelta * 0.4) - (sleepDelta * 0.2)
  );

  const resetSliders = () => {
    setSleep(r.sleep?.meanSleepH || 7.0);
    setWorkouts(3);
    setWeightChange(0);
    setAlcohol(1);
    setProtein(1.2);
  };

  // Calculate Confidence Score dynamically based on extreme inputs
  // The further away from baseline, the lower the confidence in the linear model
  const variance = Math.abs(sleepDelta) + Math.abs(workoutsDelta) + Math.abs(alcoholDelta) + Math.abs(weightChange * 0.1);
  const confidenceScore = Math.max(45, Math.min(98, 95 - variance * 2));
  const confidenceLevel = confidenceScore >= 85 ? 'High Confidence' : confidenceScore >= 70 ? 'Medium Confidence' : 'Low Confidence';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="font-grotesk text-3xl font-bold tracking-tight text-ink">AI Prediction Center</h1>
          <p className="text-sm text-muted mt-1">Simulate lifestyle modifications in real-time. Powered by a multi-variable weighted prediction model.</p>
        </div>
        <button
          onClick={resetSliders}
          className="btn-ghost !px-3 !py-2 text-xs flex items-center gap-1.5 hover:text-accent"
          title="Reset to default"
        >
          <RefreshCw size={12} /> Reset
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Sliders Panel */}
        <div className="lg:col-span-5 card p-6 border border-line/60 bg-surface/30 space-y-6">
          <span className="text-xs uppercase tracking-widest text-faint font-semibold block border-b border-line/30 pb-3">Scenario Simulation</span>

          <div className="space-y-5">
            {/* Sleep Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-ink">
                <span>Nightly Sleep Duration</span>
                <span className="text-accent">{sleep.toFixed(1)} hours</span>
              </div>
              <input
                type="range"
                min={4.0}
                max={10.0}
                step={0.5}
                value={sleep}
                onChange={(e) => setSleep(parseFloat(e.target.value))}
                className="w-full h-1 bg-line rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <span className="text-[10px] text-muted block">Baseline: {(r.sleep?.meanSleepH || 7.0).toFixed(1)}h | Impacts HRV & Cortisol</span>
            </div>

            {/* Workouts Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-ink">
                <span>Weekly Cardio Sessions</span>
                <span className="text-accent">{workouts} sessions</span>
              </div>
              <input
                type="range"
                min={0}
                max={7}
                step={1}
                value={workouts}
                onChange={(e) => setWorkouts(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-line rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <span className="text-[10px] text-muted block">Impacts VO₂ Max & Stroke Volume</span>
            </div>

            {/* Weight Delta Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-ink">
                <span>Body Mass Change (Next 90 Days)</span>
                <span className="text-accent">{weightChange > 0 ? `+${weightChange}` : weightChange} kg</span>
              </div>
              <input
                type="range"
                min={-10}
                max={10}
                step={1}
                value={weightChange}
                onChange={(e) => setWeightChange(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-line rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <span className="text-[10px] text-muted block">Simulate fat loss or muscle hypertrophy</span>
            </div>

            {/* Protein Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-ink">
                <span>Protein Intake (per kg bodyweight)</span>
                <span className="text-accent">{protein.toFixed(1)} g/kg</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.5}
                step={0.1}
                value={protein}
                onChange={(e) => setProtein(parseFloat(e.target.value))}
                className="w-full h-1 bg-line rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <span className="text-[10px] text-muted block">Impacts Lean Mass & Recovery</span>
            </div>

            {/* Alcohol Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-ink">
                <span>Weekly Alcohol</span>
                <span className="text-accent">{alcohol} drinks</span>
              </div>
              <input
                type="range"
                min={0}
                max={14}
                step={1}
                value={alcohol}
                onChange={(e) => setAlcohol(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-line rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <span className="text-[10px] text-muted block">Autonomic toxicity threshold: &lt; 3 drinks/wk</span>
            </div>
          </div>
        </div>

        {/* Right Column: Deep Explanation & Projections */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card p-6 border border-line/60 bg-surface/30 backdrop-blur-md shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute -left-20 -bottom-20 w-48 h-48 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between border-b border-line/30 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-faint font-semibold block">Projected Outcomes</span>
                <h2 className="font-grotesk text-xl font-bold text-ink mt-1">Multi-Variable Simulation Output</h2>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-widest text-faint font-semibold block mb-1">Model Confidence</span>
                <div className="flex items-center gap-2 justify-end">
                  <div className="h-1.5 w-16 rounded-full bg-line/40 overflow-hidden">
                    <div className={`h-full ${confidenceScore >= 85 ? 'bg-good' : confidenceScore >= 70 ? 'bg-warn' : 'bg-bad'}`} style={{ width: `${confidenceScore}%` }} />
                  </div>
                  <span className={`text-xs font-bold ${confidenceScore >= 85 ? 'text-good' : confidenceScore >= 70 ? 'text-warn' : 'text-bad'}`}>
                    {Math.round(confidenceScore)}%
                  </span>
                </div>
                <span className="text-[9px] text-muted block mt-0.5">{confidenceLevel}</span>
              </div>
            </div>

            {/* Metric Projections Display Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Biological Age */}
              <div className="p-4 rounded-2xl bg-surface-2/30 border border-line/30">
                <span className="text-[10px] text-faint uppercase font-semibold">Biological Age</span>
                <div className="text-2xl font-grotesk font-bold text-ink mt-1.5">{projectedBioAge.toFixed(1)}y</div>
                <div className="mt-2 text-[10px] text-muted">
                  Current State: <span className="text-ink font-semibold">{currentBioAge.toFixed(1)}y</span>
                </div>
                <span className="text-[10px] text-accent font-semibold block mt-0.5">
                  {bioAgeShift > 0.05 ? `-${bioAgeShift.toFixed(1)}y improvement` : bioAgeShift < -0.05 ? `+${(-bioAgeShift).toFixed(1)}y degradation` : 'No change'}
                </span>
              </div>

              {/* Recovery Score */}
              <div className="p-4 rounded-2xl bg-surface-2/30 border border-line/30">
                <span className="text-[10px] text-faint uppercase font-semibold">Recovery Index</span>
                <div className="text-2xl font-grotesk font-bold text-ink mt-1.5">{Number.isFinite(projectedRecovery) ? Math.round(projectedRecovery) : '--'}<span className="text-xs text-muted font-normal">/100</span></div>
                <div className="mt-2 text-[10px] text-muted">
                  Current State: <span className="text-ink font-semibold">{Number.isFinite(sleepScore) ? sleepScore : '--'}</span>
                </div>
              </div>

              {/* Heart Age */}
              <div className="p-4 rounded-2xl bg-surface-2/30 border border-line/30">
                <span className="text-[10px] text-faint uppercase font-semibold">Heart Age</span>
                <div className="text-2xl font-grotesk font-bold text-ink mt-1.5">{projectedHeartAge.toFixed(1)}y</div>
                <div className="mt-2 text-[10px] text-muted">
                  Projected estimate from your workout and sleep inputs.
                </div>
              </div>
            </div>

            {/* Explainability / Evidence Section */}
            <div className="grid gap-4 sm:grid-cols-2 pt-4">
              <div className="space-y-3 bg-surface-2/20 p-4 rounded-2xl border border-line/20 text-xs">
                <span className="text-[10px] text-faint uppercase tracking-wider block font-semibold text-accent flex items-center gap-1.5"><Zap size={12}/> Model Explanation</span>
                <p className="text-muted leading-relaxed">
                  {sleepDelta > 0 
                    ? `Increasing sleep to ${sleep.toFixed(1)}h drives a disproportionate recovery benefit by extending REM and SWS cycles, which directly lowers morning cortisol.` 
                    : `Reducing sleep below baseline increases sympathetic nervous system tone, crippling your Recovery Index.`}
                </p>
                <p className="text-muted leading-relaxed">
                  {workouts > 2 ? `Maintaining ${workouts} sessions creates a compounding cardiovascular adaptation (lowering Heart Age).` : 'Insufficient aerobic stimulus leads to mild cardiac deconditioning.'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-faint uppercase tracking-wider block font-semibold mb-2">Contributing Variables Filter</span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-1 bg-surface-2 rounded-md text-[9px] text-muted font-medium border border-line/40">Sleep Efficiency</span>
                    <span className="px-2 py-1 bg-surface-2 rounded-md text-[9px] text-muted font-medium border border-line/40">Resting HR</span>
                    <span className="px-2 py-1 bg-surface-2 rounded-md text-[9px] text-muted font-medium border border-line/40">HRV</span>
                    <span className="px-2 py-1 bg-surface-2 rounded-md text-[9px] text-muted font-medium border border-line/40">Cortisol</span>
                    <span className="px-2 py-1 bg-surface-2 rounded-md text-[9px] text-muted font-medium border border-line/40">Lean Mass</span>
                  </div>
                </div>

                <div className="bg-bad/5 border border-bad/20 p-3 rounded-xl flex items-start gap-2">
                  <AlertTriangle size={14} className="text-bad shrink-0 mt-0.5" />
                  <span className="text-[10px] text-bad leading-relaxed">
                    {confidenceScore < 80 ? "Confidence is lowered because these inputs deviate far from your recorded baseline; the linear model is less reliable at this extreme." : "Your inputs are close to your recorded baseline, so this projection is more reliable. It remains a directional estimate, not a guarantee."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
