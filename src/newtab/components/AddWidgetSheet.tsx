import { useEffect, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { useDashboard } from '../store/dashboard';
import { WIDGETS, WIDGET_ICONS } from '../widgets/registry';
import type { WidgetType } from '../widgets/types';

interface Props {
  onClose: () => void;
}

export function AddWidgetSheet({ onClose }: Props) {
  const addWidget = useDashboard((s) => s.addWidget);
  const widgets = useDashboard((s) => s.widgets);

  const counts = useMemo(() => {
    const c = new Map<WidgetType, number>();
    for (const w of widgets) c.set(w.type, (c.get(w.type) ?? 0) + 1);
    return c;
  }, [widgets]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const types = (Object.keys(WIDGETS) as WidgetType[]).sort((a, b) =>
    WIDGETS[a].title.localeCompare(WIDGETS[b].title),
  );

  return (
    <div
      className="sheet-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet" role="dialog" aria-label="Add widget">
        <div className="sheet-head">
          <div>
            <h2>Widgets</h2>
            <p className="hint">Tap to add. Already-added widgets are marked.</p>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="sheet-body">
          {types.map((t) => {
            const def = WIDGETS[t];
            const Icon = WIDGET_ICONS[t];
            const count = counts.get(t) ?? 0;
            const added = count > 0;
            return (
              <button
                key={t}
                type="button"
                className={`sheet-item ${added ? 'added' : ''}`}
                onClick={() => addWidget(t)}
              >
                <span className="sheet-item-icon">
                  <Icon size={18} />
                </span>
                <span className="sheet-item-text">
                  <span className="sheet-item-title">{def.title}</span>
                  <span className="sheet-item-desc">{def.description}</span>
                </span>
                {added && (
                  <span className="sheet-item-badge">
                    <Check size={10} strokeWidth={3} />
                    {count > 1 ? `×${count}` : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
