import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, ArrowDownToLine, Zap, CheckCircle2 } from 'lucide-react';
import { UploadZone } from './UploadZone';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Logo } from '../ui/Logo';

const EXPORT_STEPS = [
  { step: '1', title: 'Open Health App', desc: 'Launch the Apple Health app on your iPhone.' },
  { step: '2', title: 'Profile Photo', desc: 'Tap your profile photo in the upper-right corner.' },
  { step: '3', title: 'Export Data', desc: 'Scroll to the bottom and select "Export All Health Data".' },
  { step: '4', title: 'Wait & Save', desc: 'Confirm the export and save/share the generated ZIP file.' },
  { step: '5', title: 'Drop ZIP Here', desc: 'Select or drop the exported file into the upload zone above.' },
];

const INTEGRATIONS = [
  { name: 'Oura Ring', desc: 'Nocturnal biometrics' },
  { name: 'WHOOP', desc: 'Strain & recovery data' },
  { name: 'Garmin', desc: 'GPS & cardiovascular stats' },
  { name: 'Fitbit', desc: 'Daily activity tracking' },
  { name: 'Samsung Health', desc: 'Android health data' },
  { name: 'Strava', desc: 'Workout & athletic performance' },
];

export function Landing() {
  const [exportTab, setExportTab] = useState<'apple' | 'android'>('apple');

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-5 py-8 sm:px-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-surface border border-line shadow-sm">
            <Logo className="h-6 w-6" />
          </div>
          <span className="font-grotesk text-lg font-bold tracking-tight text-ink">NerveDrive</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="mt-14 sm:mt-20">
        {/* Hero Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="pill bg-accent/10 text-accent mx-auto border border-accent/20 mb-6 py-1 px-3.5">
            <ShieldCheck size={14} className="mr-1" /> 100% On-Device · Fully Private
          </div>
          <h1 className="max-w-3xl mx-auto font-grotesk text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl text-ink">
            Unlock deep insights from your Health data.
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-muted">
            Transform raw biometrics into a clean, premium dashboard. Track cardiovascular trends, sleep stages, daily recovery, activity scores, and correlations. Your data never leaves your browser.
          </p>
        </motion.div>

        {/* Upload Card / Onboarding */}
        <motion.div
          className="mt-10 sm:mt-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <UploadZone />
        </motion.div>

        {/* Compatibility Block */}
        <motion.section
          className="mt-20 card p-6 sm:p-8 border border-white/5 bg-surface/30 backdrop-blur-md relative overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute -left-20 -bottom-20 w-48 h-48 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-line/40">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-md border border-slate-100 p-2">
                  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                    <path d="M12 7.5C12 7.5 10.5 5 8 5C5.5 5 4 7 4 9.5C4 13.5 12 19 12 19C12 19 20 13.5 20 9.5C20 7 18.5 5 16 5C13.5 5 12 7.5 12 7.5Z" fill="#ff2d55"/>
                  </svg>
                </div>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface-2 border border-line shadow-md p-2">
                  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M21 12H3" />
                    <path d="M12 3v18" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-grotesk text-lg font-bold text-ink">Apple Health & Health Connect</h3>
                <p className="text-sm text-muted">NerveDrive is fully compatible with Apple Health exports (.zip) and Android Health Connect (.db or .zip) files.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start md:self-auto text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
              <CheckCircle2 size={13} /> Full Compatibility
            </div>
          </div>

          <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h4 className="font-grotesk font-semibold text-ink flex items-center gap-2">
                <ArrowDownToLine size={16} className="text-accent" /> How to Export Your Data
              </h4>
              <div className="flex items-center gap-2 bg-surface-2 p-1 rounded-xl border border-line">
                <button
                  onClick={() => setExportTab('apple')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${exportTab === 'apple' ? 'bg-bg text-ink shadow-sm border border-line/50' : 'text-muted hover:text-ink'}`}
                >
                  Apple Health
                </button>
                <button
                  onClick={() => setExportTab('android')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${exportTab === 'android' ? 'bg-bg text-ink shadow-sm border border-line/50' : 'text-muted hover:text-ink'}`}
                >
                  Android Health Connect
                </button>
              </div>
            </div>

            {exportTab === 'apple' ? (
              <div className="grid gap-6 sm:grid-cols-5 animate-in fade-in zoom-in-95 duration-200">
                {EXPORT_STEPS.map((s, idx) => (
                  <div key={s.step} className="relative flex flex-col items-start">
                    <div className="flex items-center gap-2.5 sm:flex-col sm:items-start w-full">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface-2 border border-line text-xs font-bold font-grotesk text-ink shadow-sm">
                        {s.step}
                      </span>
                      <h5 className="font-semibold text-sm text-ink sm:mt-3">{s.title}</h5>
                    </div>
                    <p className="mt-1 text-xs text-muted leading-relaxed pl-9.5 sm:pl-0">{s.desc}</p>
                    
                    {idx < EXPORT_STEPS.length - 1 && (
                      <div className="hidden sm:block absolute top-3.5 left-[130px] right-[-10px] h-[1px] bg-line/40" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-200 bg-surface/50 rounded-2xl p-5 border border-white/5 space-y-6">
                <div>
                  <h5 className="font-grotesk text-base font-semibold text-ink mb-2">Method 1: Built-In Android Backup (Recommended)</h5>
                  <ol className="list-decimal list-inside text-sm text-muted space-y-1.5 ml-2">
                    <li>Open your device's <strong>Settings</strong> app.</li>
                    <li>Navigate to <strong>Security & privacy → Privacy → Health Connect</strong> (or search "Health Connect").</li>
                    <li>Tap on <strong>Manage data</strong>.</li>
                    <li>Select <strong>Backup and restore</strong>.</li>
                    <li>Tap <strong>Export data</strong> and select your cloud storage provider (like Google Drive).</li>
                    <li>Set your export frequency (Daily, Weekly, or Monthly). Android will save a ZIP file automatically!</li>
                  </ol>
                </div>
                <div>
                  <h5 className="font-grotesk text-base font-semibold text-ink mb-2">Method 2: Third-Party Exporters</h5>
                  <p className="text-sm text-muted mb-2">Use free, privacy-focused apps from the Google Play Store:</p>
                  <ul className="list-disc list-inside text-sm text-muted space-y-1.5 ml-2">
                    <li><strong>Health Data Export</strong>: Push your data directly into a structured Google Sheets document or CSV.</li>
                    <li><strong>Health.md</strong>: Reads Health Connect locally and saves into Markdown, JSON, or CSV on your device.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* Coming Soon Section */}
        <motion.section
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <h3 className="font-grotesk text-xl font-semibold text-ink flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-accent" /> Future Integrations
          </h3>
          <p className="text-sm text-muted mt-1 max-w-md mx-auto">We are building support to sync directly with your favorite fitness devices.</p>
          
          <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-6 text-left">
            {INTEGRATIONS.map((integ) => (
              <div key={integ.name} className="card p-4 border border-white/[0.02] bg-surface/10 opacity-60 backdrop-blur-xs select-none hover:opacity-75 transition-all">
                <h5 className="font-semibold text-sm text-ink">{integ.name}</h5>
                <p className="mt-1 text-[10px] text-faint uppercase tracking-wider">{integ.desc}</p>
                <div className="mt-3 text-[10px] font-semibold text-accent/60 flex items-center gap-1">
                  <Zap size={8} /> Coming Soon
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="mt-20 border-t border-line/40 py-8 text-center text-xs text-muted leading-relaxed">
          NerveDrive is not a medical device. Our report is generated to assist users in understanding their personal biometric trends. It does not provide medical diagnosis, treatment, or clinical intervention. For health concerns, always consult a medical professional.
        </footer>
      </main>
    </div>
  );
}
