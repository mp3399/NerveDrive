import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { Landing } from './components/upload/Landing';
import { Processing, ErrorScreen } from './components/upload/Processing';
import { Dashboard } from './components/layout/Dashboard';

export default function App() {
  const { phase, theme } = useStore();

  // Apply theme class to <html>
  useEffect(() => {
    const el = document.documentElement;
    el.classList.remove('dark', 'light');
    el.classList.add(theme);
  }, [theme]);

  if (phase === 'processing') return <Processing />;
  if (phase === 'error') return <ErrorScreen />;
  if (phase === 'ready') return <Dashboard />;
  return <Landing />;
}
