/** Reads live CSS custom properties so ECharts matches the active theme. */
export function chartColors() {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string) => `rgb(${cs.getPropertyValue(name).trim() || '255 255 255'})`;
  return {
    ink: v('--ink'),
    muted: v('--muted'),
    line: v('--line'),
    accent: v('--accent'),
    good: v('--good'),
    warn: v('--warn'),
    bad: v('--bad'),
    surface: v('--surface'),
  };
}
