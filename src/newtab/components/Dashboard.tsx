import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Responsive,
  useContainerWidth,
  type Layout,
  type LayoutItem,
  type ResponsiveLayouts,
} from 'react-grid-layout';
import { useDashboard } from '../store/dashboard';
import { WIDGETS } from '../widgets/registry';
import type { WidgetLayout } from '../widgets/types';
import { WidgetShell } from './WidgetShell';
import { WidgetConfigPopover } from './WidgetConfigPopover';

const COLS = { lg: 6, md: 4, sm: 2 };
const BREAKPOINTS = { lg: 1000, md: 640, sm: 0 };
const MARGIN = 16;
const CONTAINER_PAD = 8;
const ROW_HEIGHT = 200;

type BP = 'lg' | 'md' | 'sm';

export function Dashboard() {
  const editing = useDashboard((s) => s.editing);
  const widgets = useDashboard((s) => s.widgets);
  const layouts = useDashboard((s) => s.layouts);
  const setLayouts = useDashboard((s) => s.setLayouts);
  const updateWidgetConfig = useDashboard((s) => s.updateWidgetConfig);
  const hydrated = useDashboard((s) => s.hydrated);

  const [configuring, setConfiguring] = useState<string | null>(null);
  const anchorRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { width, containerRef, mounted } = useContainerWidth();

  const onLayoutChange = (_current: Layout, all: ResponsiveLayouts<BP>) => {
    if (!editing) return;
    const normalize = (arr?: Layout): WidgetLayout[] =>
      (arr ?? []).map((l: LayoutItem) => ({
        i: l.i,
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
      }));
    setLayouts({
      lg: normalize(all.lg ?? (layouts.lg as unknown as Layout)),
      md: normalize(all.md ?? (layouts.md as unknown as Layout)),
      sm: normalize(all.sm ?? (layouts.sm as unknown as Layout)),
    });
  };

  const missing = widgets.filter(
    (w) => WIDGETS[w.type] && !layouts.lg.some((l) => l.i === w.id),
  );

  useEffect(() => {
    if (missing.length === 0) return;
    const pad = (layout: WidgetLayout[], cols: number): WidgetLayout[] => {
      let y = layout.reduce((m, l) => Math.max(m, l.y + l.h), 0);
      const additions: WidgetLayout[] = missing.map((w) => {
        const def = WIDGETS[w.type];
        const size = def?.defaultSize ?? { w: 2, h: 2 };
        const entry: WidgetLayout = {
          i: w.id,
          x: 0,
          y,
          w: Math.min(size.w, cols),
          h: size.h,
        };
        y += size.h;
        return entry;
      });
      return [...layout, ...additions];
    };
    setLayouts({
      lg: pad(layouts.lg, COLS.lg),
      md: pad(layouts.md, COLS.md),
      sm: pad(layouts.sm, COLS.sm),
    });
  }, [missing, layouts.lg, layouts.md, layouts.sm, setLayouts]);

  if (!hydrated) {
    return <div className="dash-loading">Loading…</div>;
  }

  const responsiveLayouts: ResponsiveLayouts<BP> = {
    lg: layouts.lg as unknown as Layout,
    md: layouts.md as unknown as Layout,
    sm: layouts.sm as unknown as Layout,
  };

  return (
    <>
      <div ref={containerRef} style={{ width: '100%' }}>
        {mounted && (
          <Responsive<BP>
            className="dash-grid"
            width={width}
            layouts={responsiveLayouts}
            breakpoints={BREAKPOINTS}
            cols={COLS}
            rowHeight={ROW_HEIGHT}
            margin={[MARGIN, MARGIN]}
            containerPadding={[CONTAINER_PAD, CONTAINER_PAD]}
            dragConfig={{ enabled: editing, handle: '.drag-handle' }}
            resizeConfig={{ enabled: editing, handles: ['se'] }}
            onLayoutChange={onLayoutChange}
          >
            {widgets.map((w) => {
              const def = WIDGETS[w.type];
              if (!def) return null;
              const Component = def.component;
              const style: CSSProperties = {};
              const layout = layouts.lg.find((l) => l.i === w.id);
              return (
                <div
                  key={w.id}
                  className={editing ? 'is-editing' : ''}
                  style={style}
                  data-widget-id={w.id}
                  ref={(el) => {
                    if (el) anchorRefs.current.set(w.id, el);
                    else anchorRefs.current.delete(w.id);
                  }}
                >
                  <WidgetShell
                    id={w.id}
                    title={def.title}
                    editing={editing}
                    sizes={def.sizes}
                    currentW={layout?.w}
                    currentH={layout?.h}
                    onConfigure={
                      def.configComponent ? () => setConfiguring(w.id) : undefined
                    }
                  >
                    <Component
                      id={w.id}
                      config={w.config}
                      isEditing={editing}
                      onConfigChange={(next) => updateWidgetConfig(w.id, next)}
                    />
                  </WidgetShell>
                </div>
              );
            })}
          </Responsive>
        )}
      </div>

      {configuring &&
        (() => {
          const widget = widgets.find((w) => w.id === configuring);
          if (!widget) return null;
          const def = WIDGETS[widget.type];
          if (!def?.configComponent) return null;
          const ConfigComponent = def.configComponent;
          const anchor = anchorRefs.current.get(widget.id) ?? null;
          return (
            <WidgetConfigPopover
              title={def.title}
              anchor={anchor}
              onClose={() => setConfiguring(null)}
            >
              <ConfigComponent
                id={widget.id}
                config={widget.config}
                isEditing
                onConfigChange={(next) => updateWidgetConfig(widget.id, next)}
              />
            </WidgetConfigPopover>
          );
        })()}
    </>
  );
}
