import { useEffect } from 'react';
import { useDashboard } from '../store/dashboard';
import { getTheme } from './themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useDashboard((s) => s.theme);
  const background = useDashboard((s) => s.background);

  useEffect(() => {
    document.documentElement.dataset.theme = getTheme(theme).id;
  }, [theme]);

  useEffect(() => {
    const body = document.body;
    body.classList.remove('app-bg-image');
    if (background.type === 'image' && background.value) {
      body.style.backgroundImage = `url("${background.value}")`;
      body.classList.add('app-bg-image');
    } else if (background.type === 'gradient' && background.value) {
      body.style.backgroundImage = background.value;
    } else if (background.type === 'color' && background.value) {
      body.style.backgroundImage = 'none';
      body.style.backgroundColor = background.value;
    } else {
      body.style.backgroundImage = '';
      body.style.backgroundColor = '';
    }
  }, [background]);

  return children;
}
