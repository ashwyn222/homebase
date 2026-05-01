import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chromeStorage } from '../lib/chromeStorage';
import { getTheme, type ThemeId } from '../theme/themes';
import { WIDGETS } from '../widgets/registry';
import type { WidgetInstance, WidgetLayout, WidgetType } from '../widgets/types';

export interface DashboardState {
  hydrated: boolean;
  editing: boolean;
  focus: boolean;
  userName: string;

  theme: ThemeId;

  background: {
    type: 'none' | 'gradient' | 'color' | 'image';
    value: string;
  };

  widgets: WidgetInstance[];
  layouts: {
    lg: WidgetLayout[];
    md: WidgetLayout[];
    sm: WidgetLayout[];
  };

  setEditing: (editing: boolean) => void;
  toggleEditing: () => void;
  toggleFocus: () => void;

  setTheme: (theme: ThemeId) => void;
  setUserName: (name: string) => void;
  setBackground: (bg: DashboardState['background']) => void;

  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  updateWidgetConfig: (id: string, config: Record<string, unknown>) => void;
  setLayouts: (layouts: DashboardState['layouts']) => void;
  setWidgetSize: (id: string, w: number, h: number) => void;

  resetAll: () => void;
  importState: (state: Partial<PersistedShape>) => void;
}

type PersistedShape = Pick<
  DashboardState,
  'theme' | 'background' | 'userName' | 'widgets' | 'layouts'
>;

const uid = (): string =>
  `w_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const defaultWidgets = (): WidgetInstance[] => [
  { id: 'clock-default', type: 'clock', config: {} },
  { id: 'calendar-default', type: 'calendar', config: {} },
  { id: 'weather-default', type: 'weather', config: {} },
  {
    id: 'quicklinks-default',
    type: 'quicklinks',
    config: {
      links: [
        { title: 'Gmail', url: 'https://mail.google.com' },
        { title: 'GitHub', url: 'https://github.com' },
        { title: 'YouTube', url: 'https://youtube.com' },
        { title: 'Calendar', url: 'https://calendar.google.com' },
      ],
    },
  },
  { id: 'todos-default', type: 'todos', config: { items: [] } },
  { id: 'notes-default', type: 'notes', config: { text: '' } },
];

const defaultLayouts = (): DashboardState['layouts'] => {
  const lg: WidgetLayout[] = [
    { i: 'clock-default', x: 0, y: 0, w: 1, h: 1 },
    { i: 'weather-default', x: 0, y: 1, w: 1, h: 1 },
    { i: 'calendar-default', x: 1, y: 0, w: 2, h: 2 },
    { i: 'quicklinks-default', x: 3, y: 0, w: 1, h: 2 },
    { i: 'todos-default', x: 0, y: 2, w: 2, h: 2 },
    { i: 'notes-default', x: 2, y: 2, w: 2, h: 2 },
  ];
  const md: WidgetLayout[] = [
    { i: 'clock-default', x: 0, y: 0, w: 1, h: 1 },
    { i: 'weather-default', x: 0, y: 1, w: 1, h: 1 },
    { i: 'calendar-default', x: 1, y: 0, w: 2, h: 2 },
    { i: 'quicklinks-default', x: 3, y: 0, w: 1, h: 2 },
    { i: 'todos-default', x: 0, y: 2, w: 2, h: 2 },
    { i: 'notes-default', x: 2, y: 2, w: 2, h: 2 },
  ];
  const sm: WidgetLayout[] = [
    { i: 'clock-default', x: 0, y: 0, w: 1, h: 1 },
    { i: 'weather-default', x: 1, y: 0, w: 1, h: 1 },
    { i: 'quicklinks-default', x: 0, y: 1, w: 1, h: 2 },
    { i: 'calendar-default', x: 0, y: 3, w: 2, h: 2 },
    { i: 'todos-default', x: 0, y: 5, w: 2, h: 2 },
    { i: 'notes-default', x: 0, y: 7, w: 2, h: 2 },
  ];
  return { lg, md, sm };
};

const initialPersisted = (): PersistedShape => ({
  theme: 'indigo',
  background: { type: 'none', value: '' },
  userName: '',
  widgets: defaultWidgets(),
  layouts: defaultLayouts(),
});

export const useDashboard = create<DashboardState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      editing: false,
      focus: false,
      ...initialPersisted(),

      setEditing: (editing) => set({ editing }),
      toggleEditing: () => set({ editing: !get().editing }),
      toggleFocus: () => set({ focus: !get().focus }),

      setTheme: (theme) => {
        const meta = getTheme(theme);
        set({
          theme: meta.id,
          background: { type: 'none', value: '' },
        });
      },
      setUserName: (userName) => set({ userName }),
      setBackground: (background) => set({ background }),

      addWidget: (type) => {
        const id = uid();
        const widget: WidgetInstance = { id, type, config: {} };
        const def = WIDGETS[type];
        const size = def?.defaultSize ?? { w: 2, h: 2 };
        const layouts = get().layouts;
        const append = (layout: WidgetLayout[], cols: number): WidgetLayout[] => {
          const maxY = layout.reduce((m, l) => Math.max(m, l.y + l.h), 0);
          return [
            ...layout,
            {
              i: id,
              x: 0,
              y: maxY,
              w: Math.min(size.w, cols),
              h: Math.max(1, size.h),
            },
          ];
        };
        set({
          widgets: [...get().widgets, widget],
          layouts: {
            lg: append(layouts.lg, 6),
            md: append(layouts.md, 4),
            sm: append(layouts.sm, 2),
          },
          editing: true,
        });
      },

      removeWidget: (id) => {
        const strip = (layout: WidgetLayout[]): WidgetLayout[] =>
          layout.filter((l) => l.i !== id);
        const layouts = get().layouts;
        set({
          widgets: get().widgets.filter((w) => w.id !== id),
          layouts: {
            lg: strip(layouts.lg),
            md: strip(layouts.md),
            sm: strip(layouts.sm),
          },
        });
      },

      updateWidgetConfig: (id, config) => {
        set({
          widgets: get().widgets.map((w) =>
            w.id === id ? { ...w, config: { ...w.config, ...config } } : w,
          ),
        });
      },

      setLayouts: (layouts) => set({ layouts }),

      setWidgetSize: (id, w, h) => {
        const resize = (layout: WidgetLayout[], cols: number) =>
          layout.map((l) =>
            l.i === id
              ? { ...l, w: Math.min(w, cols), h: Math.max(1, h) }
              : l,
          );
        const layouts = get().layouts;
        set({
          layouts: {
            lg: resize(layouts.lg, 6),
            md: resize(layouts.md, 4),
            sm: resize(layouts.sm, 2),
          },
        });
      },

      resetAll: () => set({ ...initialPersisted() }),
      importState: (state) => set({ ...state }),
    }),
    {
      name: 'dashboard',
      storage: chromeStorage<PersistedShape>('sync'),
      partialize: (state): PersistedShape => ({
        theme: state.theme,
        background: state.background,
        userName: state.userName,
        widgets: state.widgets,
        layouts: state.layouts,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const validWidgets = state.widgets.filter((w) => WIDGETS[w.type]);
        if (validWidgets.length !== state.widgets.length) {
          const validIds = new Set(validWidgets.map((w) => w.id));
          const strip = (layout: WidgetLayout[]) =>
            layout.filter((l) => validIds.has(l.i));
          state.widgets = validWidgets;
          state.layouts = {
            lg: strip(state.layouts.lg),
            md: strip(state.layouts.md),
            sm: strip(state.layouts.sm),
          };
        }
        state.hydrated = true;
      },
    },
  ),
);
