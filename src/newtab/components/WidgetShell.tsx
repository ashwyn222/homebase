import { forwardRef, useState, type ReactNode, type CSSProperties } from 'react';
import { X, Settings2, GripVertical } from 'lucide-react';
import { useDashboard } from '../store/dashboard';
import type { WidgetSizePreset } from '../widgets/types';

interface Props {
  id: string;
  title: string;
  editing: boolean;
  children: ReactNode;
  onConfigure?: () => void;
  sizes?: WidgetSizePreset[];
  currentW?: number;
  currentH?: number;
  style?: CSSProperties;
  className?: string;
  onMouseDown?: React.MouseEventHandler;
  onTouchEnd?: React.TouchEventHandler;
  onTouchStart?: React.TouchEventHandler;
}

export const WidgetShell = forwardRef<HTMLDivElement, Props>(function WidgetShell(
  {
    id,
    title,
    editing,
    children,
    onConfigure,
    sizes,
    currentW,
    currentH,
    style,
    className = '',
    onMouseDown,
    onTouchEnd,
    onTouchStart,
    ...rest
  },
  ref,
) {
  const removeWidget = useDashboard((s) => s.removeWidget);
  const setWidgetSize = useDashboard((s) => s.setWidgetSize);
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      ref={ref}
      style={style}
      className={`widget-shell ${editing ? 'is-editing' : ''} ${className}`}
      onMouseDown={onMouseDown}
      onTouchEnd={onTouchEnd}
      onTouchStart={onTouchStart}
      {...rest}
    >
      {editing && (
        <div className="widget-chrome">
          <span className="widget-handle drag-handle" title="Drag to move">
            <GripVertical size={14} />
            <span className="widget-title">{title}</span>
          </span>
          <span className="widget-actions">
            {sizes && sizes.length > 1 && (
              <span className="size-switcher" role="group" aria-label="Size">
                {sizes.map((s) => {
                  const active = currentW === s.w && currentH === s.h;
                  return (
                    <button
                      key={s.label}
                      type="button"
                      className={`size-btn ${active ? 'active' : ''}`}
                      title={`Size: ${s.label} (${s.w}×${s.h})`}
                      onClick={() => setWidgetSize(id, s.w, s.h)}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </span>
            )}
            {onConfigure && (
              <button
                type="button"
                className="widget-btn"
                onClick={onConfigure}
                title="Configure"
              >
                <Settings2 size={14} />
              </button>
            )}
            {confirming ? (
              <>
                <button
                  type="button"
                  className="widget-btn danger"
                  onClick={() => removeWidget(id)}
                  title="Confirm remove"
                >
                  Remove
                </button>
                <button
                  type="button"
                  className="widget-btn"
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="widget-btn"
                onClick={() => setConfirming(true)}
                title="Remove widget"
              >
                <X size={14} />
              </button>
            )}
          </span>
        </div>
      )}
      <div className="widget-body">{children}</div>
    </div>
  );
});
