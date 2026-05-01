import {
  Clock,
  Calendar,
  Link,
  StickyNote,
  ListChecks,
  History,
  BookOpen,
  Download,
  Cloud,
  Wind,
  Globe,
  Coins,
  BookA,
  Ruler,
  Newspaper,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { WidgetDefinition, WidgetType } from './types';
import { ClockWidget, ClockConfigPanel } from './Clock';
import { CalendarWidget } from './Calendar';
import { QuickLinksWidget } from './QuickLinks';
import { NotesWidget } from './Notes';
import { TodosWidget } from './Todos';
import { HistoryWidget, HistoryConfigPanel } from './History';
import { ReadingListWidget } from './ReadingList';
import { DownloadsWidget, DownloadsConfigPanel } from './Downloads';
import { WeatherWidget, WeatherConfigPanel } from './Weather';
import { AirQualityWidget, AirQualityConfigPanel } from './AirQuality';
import { WorldClocksWidget } from './WorldClocks';
import { CurrencyWidget } from './Currency';
import { DictionaryWidget } from './Dictionary';
import { UnitConverterWidget } from './UnitConverter';
import { NewsWidget, NewsConfigPanel } from './News';

export const WIDGETS: Record<WidgetType, WidgetDefinition<any>> = {
  clock: {
    type: 'clock',
    title: 'Clock & greeting',
    description: 'Time, date, and a friendly hello.',
    defaultConfig: { showDate: true, showSeconds: false, format24: false },
    defaultSize: { w: 1, h: 1 },
    sizes: [
      { label: 'S', w: 1, h: 1 },
      { label: 'M', w: 2, h: 2 },
      { label: 'L', w: 3, h: 2 },
    ],
    minSize: { w: 1, h: 1 },
    component: ClockWidget,
    configComponent: ClockConfigPanel,
  },
  calendar: {
    type: 'calendar',
    title: 'Calendar',
    description: 'A classic monthly calendar.',
    defaultConfig: {},
    defaultSize: { w: 2, h: 2 },
    sizes: [
      { label: 'S', w: 2, h: 2 },
      { label: 'M', w: 2, h: 4 },
      { label: 'L', w: 3, h: 4 },
    ],
    minSize: { w: 2, h: 2 },
    component: CalendarWidget,
  },
  quicklinks: {
    type: 'quicklinks',
    title: 'Quick Links',
    description: 'A list of your most-visited sites.',
    defaultConfig: { links: [] },
    defaultSize: { w: 1, h: 2 },
    sizes: [
      { label: 'S', w: 1, h: 2 },
      { label: 'M', w: 2, h: 3 },
      { label: 'L', w: 3, h: 4 },
    ],
    minSize: { w: 1, h: 2 },
    component: QuickLinksWidget,
  },
  notes: {
    type: 'notes',
    title: 'Notes',
    description: 'A persistent scratchpad.',
    defaultConfig: { text: '' },
    defaultSize: { w: 2, h: 2 },
    sizes: [
      { label: 'S', w: 1, h: 2 },
      { label: 'M', w: 2, h: 2 },
      { label: 'L', w: 3, h: 3 },
      { label: 'XL', w: 4, h: 4 },
    ],
    minSize: { w: 1, h: 2 },
    component: NotesWidget,
  },
  todos: {
    type: 'todos',
    title: 'Todos',
    description: 'A simple checklist.',
    defaultConfig: { items: [] },
    defaultSize: { w: 2, h: 2 },
    sizes: [
      { label: 'S', w: 1, h: 2 },
      { label: 'M', w: 2, h: 2 },
      { label: 'L', w: 2, h: 3 },
      { label: 'XL', w: 3, h: 4 },
    ],
    minSize: { w: 1, h: 2 },
    component: TodosWidget,
  },
  history: {
    type: 'history',
    title: 'Browser history',
    description: 'Recently visited pages.',
    defaultConfig: { limit: 15, dedupeHosts: true },
    defaultSize: { w: 2, h: 2 },
    sizes: [
      { label: 'S', w: 2, h: 2 },
      { label: 'M', w: 2, h: 3 },
      { label: 'L', w: 3, h: 3 },
      { label: 'XL', w: 4, h: 4 },
    ],
    minSize: { w: 2, h: 2 },
    component: HistoryWidget,
    configComponent: HistoryConfigPanel,
  },
  readinglist: {
    type: 'readinglist',
    title: 'Reading list',
    description: 'Chrome reading list entries.',
    defaultConfig: {},
    defaultSize: { w: 1, h: 2 },
    sizes: [
      { label: 'S', w: 1, h: 2 },
      { label: 'M', w: 2, h: 3 },
      { label: 'L', w: 3, h: 4 },
    ],
    minSize: { w: 1, h: 2 },
    component: ReadingListWidget,
  },
  downloads: {
    type: 'downloads',
    title: 'Downloads',
    description: 'Your recent downloads.',
    defaultConfig: { limit: 10 },
    defaultSize: { w: 2, h: 2 },
    sizes: [
      { label: 'S', w: 1, h: 2 },
      { label: 'M', w: 2, h: 2 },
      { label: 'L', w: 2, h: 3 },
      { label: 'XL', w: 3, h: 4 },
    ],
    minSize: { w: 1, h: 2 },
    component: DownloadsWidget,
    configComponent: DownloadsConfigPanel,
  },
  weather: {
    type: 'weather',
    title: 'Weather',
    description: 'Current conditions + 3-day forecast.',
    defaultConfig: { unit: 'celsius' },
    defaultSize: { w: 1, h: 1 },
    sizes: [
      { label: 'S', w: 1, h: 1 },
      { label: 'M', w: 2, h: 2 },
      { label: 'L', w: 3, h: 3 },
    ],
    minSize: { w: 1, h: 1 },
    component: WeatherWidget,
    configComponent: WeatherConfigPanel,
  },
  airquality: {
    type: 'airquality',
    title: 'Air quality',
    description: 'Current AQI and pollutant levels.',
    defaultConfig: {},
    defaultSize: { w: 1, h: 1 },
    sizes: [
      { label: 'S', w: 1, h: 1 },
      { label: 'M', w: 2, h: 1 },
      { label: 'L', w: 2, h: 2 },
    ],
    minSize: { w: 1, h: 1 },
    component: AirQualityWidget,
    configComponent: AirQualityConfigPanel,
  },
  worldclocks: {
    type: 'worldclocks',
    title: 'World clocks',
    description: 'Time across multiple timezones.',
    defaultConfig: {},
    defaultSize: { w: 1, h: 2 },
    sizes: [
      { label: 'S', w: 1, h: 2 },
      { label: 'M', w: 2, h: 2 },
      { label: 'L', w: 2, h: 3 },
      { label: 'XL', w: 3, h: 3 },
    ],
    minSize: { w: 1, h: 2 },
    component: WorldClocksWidget,
  },
  currency: {
    type: 'currency',
    title: 'Currency converter',
    description: 'Convert between common currencies.',
    defaultConfig: { from: 'USD', to: 'EUR', amount: 1 },
    defaultSize: { w: 1, h: 1 },
    sizes: [
      { label: 'S', w: 1, h: 1 },
      { label: 'M', w: 2, h: 2 },
      { label: 'L', w: 3, h: 2 },
    ],
    minSize: { w: 1, h: 1 },
    component: CurrencyWidget,
  },
  dictionary: {
    type: 'dictionary',
    title: 'Dictionary',
    description: 'Look up word definitions.',
    defaultConfig: {},
    defaultSize: { w: 1, h: 2 },
    sizes: [
      { label: 'S', w: 1, h: 2 },
      { label: 'M', w: 2, h: 3 },
      { label: 'L', w: 3, h: 4 },
    ],
    minSize: { w: 1, h: 2 },
    component: DictionaryWidget,
  },
  unitconverter: {
    type: 'unitconverter',
    title: 'Unit converter',
    description: 'Convert between length, weight, temperature, and more.',
    defaultConfig: { category: 'length', from: 'm', to: 'ft', amount: 1 },
    defaultSize: { w: 1, h: 1 },
    sizes: [
      { label: 'S', w: 1, h: 1 },
      { label: 'M', w: 2, h: 1 },
      { label: 'L', w: 2, h: 2 },
    ],
    minSize: { w: 1, h: 1 },
    component: UnitConverterWidget,
  },
  news: {
    type: 'news',
    title: 'News',
    description: 'Latest news by topic — tech, AI, sports, politics, and more.',
    defaultConfig: { category: 'tech', limit: 12 },
    defaultSize: { w: 3, h: 2 },
    sizes: [
      { label: 'S', w: 2, h: 2 },
      { label: 'M', w: 3, h: 2 },
      { label: 'L', w: 3, h: 3 },
      { label: 'XL', w: 4, h: 3 },
    ],
    minSize: { w: 2, h: 2 },
    component: NewsWidget,
    configComponent: NewsConfigPanel,
  },
};

export const WIDGET_ICONS: Record<WidgetType, ComponentType<{ size?: number }>> = {
  clock: Clock,
  calendar: Calendar,
  quicklinks: Link,
  notes: StickyNote,
  todos: ListChecks,
  history: History,
  readinglist: BookOpen,
  downloads: Download,
  weather: Cloud,
  airquality: Wind,
  worldclocks: Globe,
  currency: Coins,
  dictionary: BookA,
  unitconverter: Ruler,
  news: Newspaper,
};
