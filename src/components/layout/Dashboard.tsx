import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Download, RotateCcw, ChevronDown } from 'lucide-react';
import { NAV } from './nav';
import { useStore } from '../../store/useStore';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Logo } from '../ui/Logo';
import { exportJSON, exportCSV, exportMarkdown, exportPDF } from '../../lib/exporters';
import { Overview } from '../sections/Overview';
import { BodySystems } from '../sections/BodySystems';
import { TimelineSection } from '../sections/TimelineSection';
import { CorrelationsSection } from '../sections/CorrelationsSection';
import { PredictionsSection } from '../sections/PredictionsSection';
import { CoachSection } from '../sections/CoachSection';
import { QualitySection } from '../sections/QualitySection';

function ExportMenu() {
  const [open, setOpen] = useState(false);
  const r = useStore((s) => s.result!);
  const items: [string, () => void][] = [
    ['PDF report', () => exportPDF(r)],
    ['Markdown', () => exportMarkdown(r)],
    ['CSV (daily)', () => exportCSV(r)],
    ['JSON (full)', () => exportJSON(r)],
  ];
  return (
    <div className="relative">
      <button className="btn-ghost" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        <Download size={16} /> Export <ChevronDown size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div role="menu" className="card absolute right-0 z-20 mt-2 w-44 p-1.5">
            {items.map(([label, fn]) => (
              <button
                key={label}
                role="menuitem"
                className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-2"
                onClick={() => {
                  fn();
                  setOpen(false);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function renderSection(id: string) {
  switch (id) {
    case 'dashboard': return <Overview />;
    case 'bodysystems': return <BodySystems />;
    case 'timeline': return <TimelineSection />;
    case 'correlations': return <CorrelationsSection />;
    case 'predictions': return <PredictionsSection />;
    case 'coach': return <CoachSection />;
    case 'quality': return <QualitySection />;
    default: return <Overview />;
  }
}

export function Dashboard() {
  const { section, setSection, reset, result } = useStore();
  const [mobileNav, setMobileNav] = useState(false);
  const dq = result!.dataQuality;

  const NavList = (
    <nav className="space-y-1" aria-label="Sections">
      {NAV.map((item) => (
        <button
          key={item.id}
          aria-current={section === item.id}
          onClick={() => {
            setSection(item.id);
            setMobileNav(false);
          }}
          className="nav-item w-full text-left"
        >
          <item.icon size={17} />
          {item.label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-bg relative selection:bg-accent/20">
      {/* Floating Pill Sidebar (desktop) */}
      <aside className="sticky top-6 bottom-6 ml-6 hidden h-[calc(100vh-48px)] w-[280px] shrink-0 flex-col rounded-[2.5rem] border border-white/5 bg-surface/60 p-6 backdrop-blur-3xl shadow-2xl lg:flex overflow-hidden z-40">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-surface-2 border border-line shadow-sm">
            <Logo className="h-6 w-6" />
          </div>
          <span className="font-grotesk text-xl font-bold tracking-tight text-ink">NerveDrive</span>
        </div>
        {NavList}
        <div className="mt-auto rounded-2xl bg-surface-2/50 p-4 border border-line/30">
          <div className="text-xs font-semibold text-ink mb-2 border-b border-line/50 pb-2">Analysis Window</div>
          <div className="space-y-1.5 text-xs text-muted">
            <div className="flex justify-between"><span>Start:</span> <span>{dq.windowStart}</span></div>
            <div className="flex justify-between"><span>End:</span> <span>{dq.windowEnd}</span></div>
            <div className="flex justify-between mt-2 pt-2 border-t border-line/50 text-accent font-medium"><span>Duration:</span> <span>{dq.daysSpan} days</span></div>
          </div>
        </div>
      </aside>

      {/* Floating Pill Bottom Bar (mobile) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex w-[90%] max-w-sm items-center justify-between rounded-full border border-white/10 bg-surface/80 px-4 py-3 backdrop-blur-xl shadow-2xl lg:hidden">
        {NAV.slice(0, 5).map((item) => (
          <button
            key={item.id}
            aria-current={section === item.id}
            onClick={() => setSection(item.id)}
            className={`grid h-12 w-12 place-items-center rounded-full transition-all ${
              section === item.id ? 'bg-accent text-bg shadow-glow scale-110' : 'text-muted hover:text-ink'
            }`}
          >
            <item.icon size={22} strokeWidth={section === item.id ? 2.5 : 2} />
          </button>
        ))}
        <button
          onClick={() => setMobileNav(true)}
          className="grid h-12 w-12 place-items-center rounded-full text-muted hover:text-ink transition-all"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile nav drawer (for the rest of the items) */}
      {mobileNav && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileNav(false)} />
          <div className="absolute bottom-0 left-0 w-full rounded-t-3xl border-t border-white/10 bg-bg p-6 shadow-2xl transition-transform duration-300">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-grotesk text-xl font-bold">All Sections</span>
              <button onClick={() => setMobileNav(false)} className="grid h-8 w-8 place-items-center rounded-full bg-surface-2"><X size={18} /></button>
            </div>
            <nav className="space-y-2">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSection(item.id);
                    setMobileNav(false);
                  }}
                  className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 transition-all ${
                    section === item.id ? 'bg-accent/10 text-accent font-semibold border border-accent/20' : 'bg-surface-2/40 text-ink hover:bg-surface-2'
                  }`}
                >
                  <item.icon size={20} className={section === item.id ? 'text-accent' : 'text-muted'} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-8 lg:pr-6">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-bg/80 px-4 py-4 backdrop-blur-md sm:px-6 lg:rounded-b-3xl lg:border-b lg:border-white/5 lg:px-8">
          <div className="flex items-center gap-3">
            <div>
              <div className="font-grotesk text-sm font-semibold sm:text-lg">
                {result!.profile.name ? `${result!.profile.name}'s Intelligence` : 'Health Intelligence'}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                <span className="pill bg-surface-2 border border-line px-2 py-0.5">{result!.profile.age ? `${result!.profile.age}y` : 'Adult'}</span>
                <span className="pill bg-surface-2 border border-line px-2 py-0.5">{result!.profile.sex.charAt(0).toUpperCase() + result!.profile.sex.slice(1)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-surface-2/50 rounded-full p-1 border border-line/30">
            <ExportMenu />
            <div className="w-px h-4 bg-line/50 mx-1" />
            <button className="grid h-9 w-9 place-items-center rounded-full text-muted hover:text-ink hover:bg-surface-2 transition-colors" onClick={reset} aria-label="Start over" title="New file"><RotateCcw size={16} /></button>
            <ThemeToggle />
          </div>
        </header>

        <motion.main
          key={section}
          initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 pb-24 lg:pb-8"
        >
          {renderSection(section)}
        </motion.main>
      </div>
    </div>
  );
}
