import { ThemeProvider } from './theme/ThemeProvider';
import { Dashboard } from './components/Dashboard';
import { RightRail } from './components/RightRail';
import { EditToolbar } from './components/EditToolbar';
import { CommandPalette } from './components/CommandPalette';
import { useDashboard } from './store/dashboard';
import { useEffect } from 'react';

export function App() {
  const focus = useDashboard((s) => s.focus);
  const toggleFocus = useDashboard((s) => s.toggleFocus);
  const toggleEditing = useDashboard((s) => s.toggleEditing);
  const editing = useDashboard((s) => s.editing);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isText =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isText) return;
      if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        toggleFocus();
      }
      if (e.key.toLowerCase() === 'e' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        toggleEditing();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [toggleFocus, toggleEditing]);

  return (
    <ThemeProvider>
      <div className={`app ${focus ? 'focus' : ''} ${editing ? 'editing' : ''}`}>
        <EditToolbar />
        <main className="dash-main">
          <Dashboard />
        </main>
        <RightRail />
        <CommandPalette />
      </div>
    </ThemeProvider>
  );
}
