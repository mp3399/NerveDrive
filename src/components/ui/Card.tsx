import { type ReactNode } from 'react';
export function Card({ children, className = '', as: Tag = 'div' }: { children: ReactNode; className?: string; as?: any }) {
  return <Tag className={`card p-5 sm:p-6 ${className}`}>{children}</Tag>;
}
export function SectionTitle({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <header className="mb-5">
      {eyebrow && <div className="text-xs font-medium uppercase tracking-[0.14em] text-faint">{eyebrow}</div>}
      <h2 className="font-grotesk text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {sub && <p className="mt-1 max-w-2xl text-sm text-muted">{sub}</p>}
    </header>
  );
}
