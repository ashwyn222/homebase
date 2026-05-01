import { useEffect, useRef, useState } from 'react';
import { Palette, Plus, Pencil, SlidersHorizontal, Check } from 'lucide-react';
import { useDashboard } from '../store/dashboard';
import { THEMES, type ThemeId } from '../theme/themes';
import { AddWidgetSheet } from './AddWidgetSheet';

export function RightRail() {
  const theme = useDashboard((s) => s.theme);
  const editing = useDashboard((s) => s.editing);
  const setTheme = useDashboard((s) => s.setTheme);
  const toggleEditing = useDashboard((s) => s.toggleEditing);

  const [expanded, setExpanded] = useState(false);
  const [widgetSheet, setWidgetSheet] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;
    const onClick = (e: MouseEvent) => {
      if (!pillRef.current) return;
      if (!pillRef.current.contains(e.target as Node)) setExpanded(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [expanded]);

  return (
    <>
      <aside className="right-rail" aria-label="Quick controls">
        <div
          ref={pillRef}
          className={`theme-pill ${expanded ? 'expanded' : 'collapsed'}`}
        >
          <button
            type="button"
            className="theme-trigger"
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? 'Collapse' : 'Themes'}
            aria-expanded={expanded}
          >
            <Palette size={14} />
          </button>
          <div className="theme-swatches" aria-hidden={!expanded}>
            {THEMES.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`theme-dot ${active ? 'active' : ''}`}
                  style={{ background: t.dot }}
                  onClick={() => setTheme(t.id as ThemeId)}
                  title={t.label}
                  aria-label={`Theme: ${t.label}`}
                  tabIndex={expanded ? 0 : -1}
                >
                  {active && <Check size={12} color="#fff" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="rail-btn"
          onClick={() => setWidgetSheet(true)}
          title="Add widget"
          aria-label="Add widget"
        >
          <Plus size={16} />
        </button>

        <button
          type="button"
          className={`rail-btn ${editing ? 'active' : ''}`}
          onClick={toggleEditing}
          title={editing ? 'Exit customize mode' : 'Customize dashboard'}
          aria-label="Toggle customize mode"
          aria-pressed={editing}
        >
          <Pencil size={16} />
        </button>

        <button
          type="button"
          className="rail-btn"
          onClick={() => chrome.runtime.openOptionsPage()}
          title="Advanced settings"
          aria-label="Advanced settings"
        >
          <SlidersHorizontal size={16} />
        </button>
      </aside>

      {widgetSheet && <AddWidgetSheet onClose={() => setWidgetSheet(false)} />}
    </>
  );
}
