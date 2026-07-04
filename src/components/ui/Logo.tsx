export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .logo-path {
          stroke: rgb(var(--accent));
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
          animation: pulsePath 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .logo-node-1 {
          fill: rgb(var(--accent));
          animation: pulseNode1 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .logo-node-2 {
          fill: rgb(var(--accent));
          animation: pulseNode2 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .logo-node-static {
          fill: rgb(var(--accent));
          animation: pulseNodeStatic 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes pulsePath {
          0%, 100%, 70% {
            d: path("M6 16C9 16 11 16 13 16C15 16 17 16 19 16C21 16 23 16 26 16");
          }
          15% {
            d: path("M6 16C9 16 11 10 13 10C15 10 17 16 19 16C21 16 23 16 26 16");
          }
          35% {
            d: path("M6 16C9 16 11 16 13 16C15 16 17 22 19 22C21 22 23 16 26 16");
          }
          50% {
            d: path("M6 16C9 16 11 10 13 10C15 10 17 22 19 22C21 22 23 16 26 16");
          }
        }

        @keyframes pulseNode1 {
          0%, 100%, 70% { cy: 16; r: 2; opacity: 0.7; }
          15% { cy: 10; r: 3; opacity: 1; }
          35%, 50% { cy: 16; r: 2; opacity: 0.7; }
        }

        @keyframes pulseNode2 {
          0%, 15%, 100%, 70% { cy: 16; r: 2; opacity: 0.7; }
          35% { cy: 22; r: 3; opacity: 1; }
          50% { cy: 16; r: 2; opacity: 0.7; }
        }

        @keyframes pulseNodeStatic {
          0%, 100%, 70% { r: 2.5; opacity: 0.8; }
          15%, 35% { r: 3.5; opacity: 1; }
        }
      `}</style>
      
      {/* Dynamic Synaptic/Neural Path */}
      <path className="logo-path" d="M6 16C9 16 11 16 13 16C15 16 17 16 19 16C21 16 23 16 26 16" />
      
      {/* Neural Nodes */}
      <circle className="logo-node-static" cx="6" cy="16" r="2.5" />
      <circle className="logo-node-1" cx="13" cy="16" r="2" />
      <circle className="logo-node-2" cx="19" cy="16" r="2" />
      <circle className="logo-node-static" cx="26" cy="16" r="2.5" />
    </svg>
  );
}
