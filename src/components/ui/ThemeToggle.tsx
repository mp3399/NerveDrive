import { Moon, Sun } from 'lucide-react';
import { useStore } from '../../store/useStore';
export function ThemeToggle() {
  const { theme, toggleTheme } = useStore();
  return (
    <button
      onClick={toggleTheme}
      className="btn-ghost !p-2.5"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
