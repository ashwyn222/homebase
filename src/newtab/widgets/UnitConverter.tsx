import { ArrowLeftRight } from 'lucide-react';
import type { WidgetContext } from './types';

interface UnitConverterConfig {
  category?: string;
  from?: string;
  to?: string;
  amount?: number;
}

interface UnitDef {
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

interface CategoryDef {
  label: string;
  units: Record<string, UnitDef>;
}

function ratioUnit(label: string, ratio: number): UnitDef {
  return {
    label,
    toBase: (v) => v * ratio,
    fromBase: (v) => v / ratio,
  };
}

const CATEGORIES: Record<string, CategoryDef> = {
  length: {
    label: 'Length',
    units: {
      mm: ratioUnit('mm', 0.001),
      cm: ratioUnit('cm', 0.01),
      m: ratioUnit('m', 1),
      km: ratioUnit('km', 1000),
      in: ratioUnit('in', 0.0254),
      ft: ratioUnit('ft', 0.3048),
      yd: ratioUnit('yd', 0.9144),
      mi: ratioUnit('mi', 1609.344),
    },
  },
  weight: {
    label: 'Weight',
    units: {
      mg: ratioUnit('mg', 0.001),
      g: ratioUnit('g', 1),
      kg: ratioUnit('kg', 1000),
      oz: ratioUnit('oz', 28.3495),
      lb: ratioUnit('lb', 453.592),
    },
  },
  temp: {
    label: 'Temperature',
    units: {
      C: { label: '°C', toBase: (v) => v, fromBase: (v) => v },
      F: {
        label: '°F',
        toBase: (v) => ((v - 32) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 32,
      },
      K: {
        label: 'K',
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
      },
    },
  },
  volume: {
    label: 'Volume',
    units: {
      ml: ratioUnit('ml', 1),
      l: ratioUnit('l', 1000),
      'fl oz': ratioUnit('fl oz', 29.5735),
      cup: ratioUnit('cup', 236.588),
      pt: ratioUnit('pt', 473.176),
      gal: ratioUnit('gal', 3785.41),
    },
  },
  speed: {
    label: 'Speed',
    units: {
      'm/s': ratioUnit('m/s', 1),
      'km/h': ratioUnit('km/h', 1 / 3.6),
      mph: ratioUnit('mph', 0.44704),
      knot: ratioUnit('kn', 0.514444),
    },
  },
  time: {
    label: 'Time',
    units: {
      s: ratioUnit('s', 1),
      min: ratioUnit('min', 60),
      h: ratioUnit('h', 3600),
      d: ratioUnit('d', 86400),
      wk: ratioUnit('wk', 604800),
    },
  },
};

function convert(
  catKey: string,
  fromKey: string,
  toKey: string,
  value: number,
): number {
  const cat = CATEGORIES[catKey];
  if (!cat) return 0;
  const from = cat.units[fromKey];
  const to = cat.units[toKey];
  if (!from || !to) return 0;
  return to.fromBase(from.toBase(value));
}

function formatNumber(n: number, big = false): string {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs !== 0 && abs < 0.001) return n.toExponential(2);
  const digits = big ? (abs >= 100 ? 2 : 4) : abs >= 100 ? 2 : 4;
  return n.toLocaleString([], { maximumFractionDigits: digits });
}

export function UnitConverterWidget({
  config,
  onConfigChange,
}: WidgetContext<UnitConverterConfig>) {
  const categoryKey = CATEGORIES[config.category ?? '']
    ? (config.category as string)
    : 'length';
  const cat = CATEGORIES[categoryKey];
  const unitKeys = Object.keys(cat.units);
  const from =
    config.from && cat.units[config.from] ? config.from : unitKeys[0];
  const to =
    config.to && cat.units[config.to]
      ? config.to
      : unitKeys[1] ?? unitKeys[0];
  const amount = config.amount ?? 1;

  const converted = convert(categoryKey, from, to, amount);
  const oneUnit = convert(categoryKey, from, to, 1);

  const setCategory = (c: string) => {
    const ukeys = Object.keys(CATEGORIES[c].units);
    onConfigChange({
      category: c,
      from: ukeys[0],
      to: ukeys[1] ?? ukeys[0],
      amount: 1,
    });
  };

  return (
    <div className="uc-widget">
      <div className="uc-row">
        <input
          type="number"
          className="uc-amount"
          value={amount}
          step="any"
          onChange={(e) =>
            onConfigChange({
              ...config,
              amount: Number(e.target.value) || 0,
            })
          }
        />
        <select
          className="uc-unit"
          value={from}
          onChange={(e) => onConfigChange({ ...config, from: e.target.value })}
        >
          {unitKeys.map((k) => (
            <option key={k} value={k}>
              {cat.units[k].label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="icon-btn"
          title="Swap"
          onClick={() => onConfigChange({ ...config, from: to, to: from })}
        >
          <ArrowLeftRight size={14} />
        </button>
        <select
          className="uc-unit"
          value={to}
          onChange={(e) => onConfigChange({ ...config, to: e.target.value })}
        >
          {unitKeys.map((k) => (
            <option key={k} value={k}>
              {cat.units[k].label}
            </option>
          ))}
        </select>
      </div>

      <div className="uc-result">
        <div className="uc-value">{formatNumber(converted, true)}</div>
        <div className="uc-unit-label">{cat.units[to].label}</div>
      </div>

      <div className="uc-footer">
        <span className="uc-meta">
          1 {cat.units[from].label} = {formatNumber(oneUnit)}{' '}
          {cat.units[to].label}
        </span>
        <select
          className="uc-cat"
          value={categoryKey}
          onChange={(e) => setCategory(e.target.value)}
          title="Category"
        >
          {Object.entries(CATEGORIES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
