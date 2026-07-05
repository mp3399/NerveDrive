import type { Config } from 'tailwindcss';

/**
 * NerveDrive design tokens, distilled from the reference design language:
 * near-black + off-white dual themes, single-accent status system,
 * large radii, frosted glass, thin grotesk numerals.
 * All colors are CSS variables (see src/index.css) so themes swap at runtime.
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        faint: 'rgb(var(--faint) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        good: 'rgb(var(--good) / <alpha-value>)',
        warn: 'rgb(var(--warn) / <alpha-value>)',
        bad: 'rgb(var(--bad) / <alpha-value>)',
        lime: 'rgb(var(--lime) / <alpha-value>)',
      },
      borderRadius: { xl: '16px', '2xl': '22px', '3xl': '28px', '4xl': '34px' },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        grotesk: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgb(var(--line) / 0.6), 0 8px 30px -12px rgb(0 0 0 / 0.45)',
        glow: '0 0 0 1px rgb(var(--accent) / 0.35), 0 0 40px -8px rgb(var(--accent) / 0.4)',
      },
      backdropBlur: { xs: '2px' },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'pulse-soft': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
