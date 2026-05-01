export type ThemeId = 'indigo' | 'emerald' | 'amber' | 'rose';

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  dot: string;
}

export const THEMES: ThemeMeta[] = [
  { id: 'indigo', label: 'Indigo', dot: '#6366f1' },
  { id: 'emerald', label: 'Emerald', dot: '#10b981' },
  { id: 'amber', label: 'Amber', dot: '#f59e0b' },
  { id: 'rose', label: 'Rose', dot: '#f43f5e' },
];

export const DEFAULT_THEME: ThemeId = 'indigo';

export function getTheme(id: string | undefined): ThemeMeta {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
