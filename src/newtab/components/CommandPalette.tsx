import { useEffect, useMemo, useState } from 'react';
import { Command } from 'cmdk';
import { Pencil, SlidersHorizontal, Palette, Focus } from 'lucide-react';
import { useDashboard } from '../store/dashboard';
import { THEMES, type ThemeId } from '../theme/themes';
import { WIDGETS, WIDGET_ICONS } from '../widgets/registry';
import type { WidgetType } from '../widgets/types';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const setTheme = useDashboard((s) => s.setTheme);
  const toggleEditing = useDashboard((s) => s.toggleEditing);
  const toggleFocus = useDashboard((s) => s.toggleFocus);
  const addWidget = useDashboard((s) => s.addWidget);
  const widgets = useDashboard((s) => s.widgets);

  const widgetCounts = useMemo(() => {
    const c = new Map<WidgetType, number>();
    for (const w of widgets) c.set(w.type, (c.get(w.type) ?? 0) + 1);
    return c;
  }, [widgets]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const run = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="cmdk-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <Command className="cmdk" label="Command palette">
        <Command.Input placeholder="Type a command or search…" autoFocus />
        <Command.List>
          <Command.Empty>No results.</Command.Empty>

          <Command.Group heading="Actions">
            <Command.Item onSelect={() => run(toggleEditing)}>
              <Pencil size={14} />
              <span>Toggle customize mode</span>
            </Command.Item>
            <Command.Item onSelect={() => run(toggleFocus)}>
              <Focus size={14} />
              <span>Toggle focus mode</span>
            </Command.Item>
            <Command.Item
              onSelect={() => run(() => chrome.runtime.openOptionsPage())}
            >
              <SlidersHorizontal size={14} />
              <span>Open advanced settings</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Add widget">
            {(Object.keys(WIDGETS) as WidgetType[])
              .sort((a, b) => WIDGETS[a].title.localeCompare(WIDGETS[b].title))
              .map((t) => {
                const def = WIDGETS[t];
                const Icon = WIDGET_ICONS[t];
                const count = widgetCounts.get(t) ?? 0;
                return (
                  <Command.Item
                    key={t}
                    onSelect={() => run(() => addWidget(t))}
                    value={`add ${def.title}`}
                  >
                    <Icon size={14} />
                    <span>Add {def.title}</span>
                    {count > 0 && (
                      <span className="cmdk-badge">
                        Added{count > 1 ? ` ×${count}` : ''}
                      </span>
                    )}
                  </Command.Item>
                );
              })}
          </Command.Group>

          <Command.Group heading="Theme">
            {THEMES.map((t) => (
              <Command.Item
                key={t.id}
                onSelect={() => run(() => setTheme(t.id as ThemeId))}
                value={`theme ${t.label}`}
              >
                <Palette size={14} color={t.dot} />
                <span>Theme: {t.label}</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
