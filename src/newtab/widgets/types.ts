import type { ComponentType } from 'react';

export type WidgetType =
  | 'clock'
  | 'calendar'
  | 'quicklinks'
  | 'notes'
  | 'todos'
  | 'history'
  | 'readinglist'
  | 'downloads'
  | 'weather'
  | 'airquality'
  | 'worldclocks'
  | 'currency'
  | 'dictionary'
  | 'unitconverter'
  | 'news';

export interface WidgetInstance<C = Record<string, unknown>> {
  id: string;
  type: WidgetType;
  config: C;
}

export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface WidgetContext<C = Record<string, unknown>> {
  id: string;
  config: C;
  onConfigChange: (next: C) => void;
  isEditing: boolean;
}

export interface WidgetSizePreset {
  label: string;
  w: number;
  h: number;
}

export interface WidgetDefinition<C = Record<string, unknown>> {
  type: WidgetType;
  title: string;
  description: string;
  defaultConfig: C;
  defaultSize: { w: number; h: number };
  sizes: WidgetSizePreset[];
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
  component: ComponentType<WidgetContext<C>>;
  configComponent?: ComponentType<WidgetContext<C>>;
}
