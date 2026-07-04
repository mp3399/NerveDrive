import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, ArrowDownToLine, Zap, CheckCircle2, HeartPulse, Smartphone } from 'lucide-react';
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
  { 
    name: 'Google Fit', 
    desc: 'Google health & fitness',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.218 4.868c-1.235-2.194-3.927-3.356-6.378-2.843-1.11.243-2.173.774-2.979 1.583-.622.613-1.242 1.229-1.864 1.841-.915-.91-1.788-1.937-2.882-2.648a5.98 5.98 0 0 0-3.904-.845c-4.757.578-6.936 6.346-3.615 9.85 3.481 3.418 6.937 6.863 10.413 10.288 3.291-3.251 6.573-6.51 9.871-9.752 2.132-1.831 2.8-5.026 1.338-7.474zM6.162 11.223c-.692-.755-1.511-1.404-2.141-2.208-.821-1.218-.158-3.012 1.26-3.397.781-.256 1.683-.031 2.279.527.627.609 1.236 1.237 1.866 1.843l.005.006a414.706 414.706 0 0 0-3.269 3.229zm5.846 5.758a3300.079 3300.079 0 0 1-3.255-3.22c2.555-2.516 5.103-5.042 7.65-7.566.393-.394.93-.646 1.487-.673 2.086-.154 3.285 2.372 1.801 3.866-2.549 2.542-5.121 5.062-7.683 7.593z" /></svg>
  },
  { 
    name: 'Garmin', 
    desc: 'GPS & cardiovascular stats',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M6.265 12.024a.289.289 0 0 0-.236-.146h-.182a.289.289 0 0 0-.234.146l-1.449 3.025c-.041.079.004.138.094.138h.335c.132 0 .193-.061.228-.134.037-.073.116-.234.13-.266.02-.045.083-.071.175-.071h1.559c.089 0 .148.016.175.071.018.035.098.179.136.256a.24.24 0 0 0 .234.142h.486c.089 0 .13-.069.098-.132-.034-.061-1.549-3.029-1.549-3.029zm-.914 2.224c-.089 0-.132-.067-.094-.148l.571-1.222c.039-.081.1-.081.136 0l.555 1.222c.037.081-.006.148-.096.148H5.351zm12.105-2.201v3.001c0 .083.073.138.163.138h.396c.089 0 .163-.057.163-.146v-2.998c0-.089-.059-.163-.148-.163h-.411c-.09-.001-.163.054-.163.168zm-6.631 1.88c-.051-.073-.022-.154.063-.181 0 0 .342-.102.506-.25.165-.146.246-.36.246-.636a1 1 0 0 0-.096-.457.787.787 0 0 0-.27-.303 1.276 1.276 0 0 0-.423-.171c-.165-.035-.386-.047-.386-.047a8.81 8.81 0 0 0-.325-.008H8.495a.164.164 0 0 0-.163.163v2.998c0 .089.073.146.163.146h.388c.089 0 .163-.057.163-.146v-1.193s.002 0 .002-.002l.738-.002c.089 0 .205.061.258.134l.766 1.077c.071.096.138.132.228.132h.508c.089 0 .104-.085.073-.128-.032-.038-.794-1.126-.794-1.126zm-.311-.61a1.57 1.57 0 0 1-.213.028 8.807 8.807 0 0 1-.325.006h-.763a.164.164 0 0 1-.163-.163v-.608c0-.089.073-.163.163-.163h.762c.089 0 .236.004.325.006 0 0 .114.004.213.028a.629.629 0 0 1 .24.098.358.358 0 0 1 .126.148.473.473 0 0 1 0 .374.352.352 0 0 1-.126.148.617.617 0 0 1-.239.098zm11.803-1.439c-.089 0-.163.059-.163.146v1.919c0 .089-.051.11-.114.047l-1.921-1.992a.376.376 0 0 0-.276-.118h-.362c-.114 0-.163.061-.163.122v3.068c0 .061.059.12.148.12h.362c.089 0 .152-.049.152-.132l.002-2.021c0-.089.051-.11.114-.045l2.004 2.082a.36.36 0 0 0 .279.116h.272a.164.164 0 0 0 .163-.163v-2.986a.164.164 0 0 0-.163-.163h-.334zm-7.835 1.87c-.043.079-.116.077-.159 0l-.939-1.724a.262.262 0 0 0-.236-.146h-.51a.164.164 0 0 0-.163.163v2.996c0 .089.059.15.163.15h.317c.089 0 .154-.057.154-.142 0-.041.002-2.179.004-2.179.004 0 1.173 2.177 1.173 2.177a.105.105 0 0 0 .189 0s1.179-2.173 1.181-2.173c.004 0 .002 2.11.002 2.173 0 .087.069.142.159.142h.364c.089 0 .163-.045.163-.163V12.04a.164.164 0 0 0-.163-.163h-.488a.265.265 0 0 0-.244.142l-.967 1.729zM0 13.529c0 1.616 1.653 1.697 1.984 1.697 1.098 0 1.561-.297 1.58-.309a.29.29 0 0 0 .152-.264v-1.116a.186.186 0 0 0-.187-.187H2.151c-.104 0-.171.083-.171.187v.116c0 .104.067.187.171.187h.797a.14.14 0 0 1 .14.14v.52c-.157.065-.874.274-1.451.136-.836-.199-.901-.89-.901-1.096 0-.173.053-1.043 1.079-1.13.831-.071 1.378.264 1.384.268.098.051.199.014.254-.089l.104-.209c.043-.085.028-.175-.077-.246-.006-.004-.59-.319-1.494-.319C.055 11.813 0 13.354 0 13.529zm22.134-2.478h-2.165c-.079 0-.148-.039-.187-.108s-.039-.146 0-.215l1.084-1.874a.21.21 0 0 1 .187-.108.21.21 0 0 1 .187.108l1.084 1.874a.203.203 0 0 1 0 .215.22.22 0 0 1-.19.108zm1.488 3.447c.207 0 .378.169.378.378a.379.379 0 0 1-.378.378.379.379 0 0 1-.378-.378.38.38 0 0 1 .378-.378zm.002.7c.173 0 .305-.14.305-.321s-.13-.321-.305-.321-.307.14-.307.321c0 .18.13.321.307.321zm-.146-.543h.169c.102 0 .152.041.152.124 0 .071-.045.122-.114.122l.126.195h-.077l-.124-.195h-.061v.195h-.073v-.441h.002zm.073.189h.085c.055 0 .091-.012.091-.069 0-.051-.045-.065-.091-.065h-.085v.134z" /></svg>
  },
  { 
    name: 'Fitbit', 
    desc: 'Daily activity tracking',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M13.298 1.825c0 .976-.81 1.785-1.786 1.785-.972 0-1.784-.81-1.784-1.785 0-.973.813-1.785 1.784-1.785.976 0 1.786.813 1.786 1.785zm-1.786 3.243c-1.052 0-1.863.81-1.863 1.866 0 1.053.81 1.865 1.865 1.865 1.053 0 1.865-.811 1.865-1.865s-.825-1.866-1.875-1.866h.008zm0 5.029c-1.052 0-1.945.891-1.945 1.945s.894 1.945 1.947 1.945 1.946-.891 1.946-1.945-.894-1.945-1.946-1.945h-.002zm0 5.107c-1.052 0-1.863.81-1.863 1.864s.81 1.866 1.865 1.866c1.053 0 1.865-.811 1.865-1.866 0-.972-.825-1.864-1.875-1.864h.008zm0 5.191c-.972 0-1.784.809-1.784 1.784 0 .97.813 1.781 1.784 1.781.977 0 1.786-.809 1.786-1.784 0-.973-.81-1.781-1.786-1.781zM16.46 4.823c-1.136 0-2.108.977-2.108 2.111 0 1.134.973 2.107 2.108 2.107 1.135 0 2.106-.975 2.106-2.107 0-1.135-.972-2.109-2.106-2.109v-.002zm0 5.03c-1.216 0-2.19.973-2.19 2.19 0 1.216.975 2.187 2.19 2.187 1.215 0 2.189-.971 2.189-2.189 0-1.216-.974-2.188-2.189-2.188zm0 5.108c-1.136 0-2.108.976-2.108 2.107 0 1.135.973 2.109 2.108 2.109 1.135 0 2.106-.976 2.106-2.109s-.971-2.107-2.106-2.107zm5.106-5.353c-1.296 0-2.43 1.055-2.43 2.434 0 1.297 1.051 2.433 2.43 2.433 1.381 0 2.434-1.065 2.434-2.444-.082-1.382-1.135-2.431-2.434-2.431v.008zM6.486 5.312c-.892 0-1.62.73-1.62 1.623 0 .891.729 1.62 1.62 1.62.893 0 1.619-.729 1.619-1.62 0-.893-.727-1.62-1.619-1.62v-.003zm0 5.027c-.973 0-1.703.729-1.703 1.703 0 .975.721 1.703 1.695 1.703s1.695-.73 1.695-1.703c0-.975-.735-1.703-1.71-1.703h.023zm0 5.107c-.892 0-1.62.731-1.62 1.62 0 .895.729 1.623 1.62 1.623.893 0 1.619-.735 1.619-1.635s-.727-1.62-1.619-1.62v.012zm-5.025-4.863c-.813 0-1.461.646-1.461 1.459 0 .81.648 1.459 1.46 1.459.81 0 1.459-.648 1.459-1.459s-.648-1.459-1.458-1.459z" /></svg>
  },
  { 
    name: 'WHOOP', 
    desc: 'Strain & recovery data',
    icon: <HeartPulse className="w-5 h-5 text-current opacity-80" />
  },
  { 
    name: 'Oura', 
    desc: 'Nocturnal biometrics',
    icon: <div className="w-[18px] h-[18px] rounded-full border-[3px] border-current opacity-80 mx-auto" />
  },
  { 
    name: 'Polar', 
    desc: 'Heart rate training',
    icon: <HeartPulse className="w-5 h-5 text-current opacity-80" />
  },
  { 
    name: 'Strava', 
    desc: 'Athletic performance',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" /></svg>
  },
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
          className="mt-20 relative overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Apple Health Card */}
            <div className="flex-1 card p-6 bg-surface/30 backdrop-blur-md border border-white/5 relative overflow-hidden group hover:border-line transition-colors">
              <div className="absolute -left-20 -bottom-20 w-48 h-48 rounded-full bg-accent/5 blur-3xl pointer-events-none group-hover:bg-accent/10 transition-colors" />
              <div className="flex flex-col gap-4 relative z-10">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-md border border-slate-100 p-2">
                  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                    <path d="M12 7.5C12 7.5 10.5 5 8 5C5.5 5 4 7 4 9.5C4 13.5 12 19 12 19C12 19 20 13.5 20 9.5C20 7 18.5 5 16 5C13.5 5 12 7.5 12 7.5Z" fill="#ff2d55"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-grotesk text-lg font-bold text-ink">Apple Health</h3>
                  <p className="text-sm text-muted mt-1">Export your data directly from the iOS Health App as a ZIP file.</p>
                </div>
              </div>
            </div>

            {/* Android Health Connect Card */}
            <div className="flex-1 card p-6 bg-surface/30 backdrop-blur-md border border-white/5 relative overflow-hidden group hover:border-line transition-colors">
              <div className="absolute -right-20 -bottom-20 w-48 h-48 rounded-full bg-green-500/5 blur-3xl pointer-events-none group-hover:bg-green-500/10 transition-colors" />
              <div className="flex flex-col gap-4 relative z-10">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-md border border-slate-100 overflow-hidden">
                  <img src="https://play-lh.googleusercontent.com/i-Hg2OdvwgRlkY5eBHERgSpEgUS8HCBxYIVtkG_wXKApMr9UvyhHnQgwF4yqtK8fFXlhH3jRxyM-CPzSKszN9g=w240-h480" alt="Health Connect" className="w-9 h-9 object-contain" />
                </div>
                <div>
                  <h3 className="font-grotesk text-lg font-bold text-ink">Android Health Connect</h3>
                  <p className="text-sm text-muted mt-1">Easily back up your Health Connect database via system settings.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 sm:p-8 border border-white/5 bg-surface/30 backdrop-blur-md">
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
                  Health Connect
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
              <div className="animate-in fade-in zoom-in-95 duration-200 space-y-6 p-2">
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
          
          <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-4 md:grid-cols-7 text-left">
            {INTEGRATIONS.map((integ) => (
              <div key={integ.name} className="flex flex-col items-center text-center card p-4 border border-white/[0.02] bg-surface/10 opacity-70 backdrop-blur-xs select-none hover:opacity-100 transition-all group">
                <div className="mb-3 text-ink/70 group-hover:text-ink transition-colors">
                  {integ.icon}
                </div>
                <h5 className="font-semibold text-sm text-ink">{integ.name}</h5>
                <p className="mt-1 text-[10px] text-faint uppercase tracking-wider">{integ.desc}</p>
                <div className="mt-3 text-[10px] font-semibold text-accent/60 flex items-center gap-1">
                  <Zap size={8} /> Planned
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
