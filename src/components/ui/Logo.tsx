export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Dynamic Synaptic/Neural Path */}
      <path
        d="M6 16C9 16 11 10 13 10C15 10 17 22 19 22C21 22 23 16 26 16"
        stroke="rgb(var(--accent))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Neural Nodes */}
      <circle cx="6" cy="16" r="2.5" fill="rgb(var(--accent))" />
      <circle cx="13" cy="10" r="2" fill="rgb(var(--accent))" />
      <circle cx="19" cy="22" r="2" fill="rgb(var(--accent))" />
      <circle cx="26" cy="16" r="2.5" fill="rgb(var(--accent))" />
    </svg>
  );
}
