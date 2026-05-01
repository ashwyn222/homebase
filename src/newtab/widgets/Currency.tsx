import { useEffect, useState } from 'react';
import { ArrowLeftRight, RefreshCw } from 'lucide-react';
import type { WidgetContext } from './types';

interface CurrencyConfig {
  from?: string;
  to?: string;
  amount?: number;
}

const COMMON = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'INR',
  'CNY',
  'AUD',
  'CAD',
  'CHF',
  'SGD',
  'HKD',
  'BRL',
];

interface RatesCache {
  base: string;
  date: string;
  rates: Record<string, number>;
  fetchedAt: number;
}

const RATES_KEY = 'widget_currency_rates';
const TTL = 6 * 60 * 60 * 1000;

async function fetchRates(base: string): Promise<RatesCache> {
  const res = await fetch(
    `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}`,
  );
  if (!res.ok) throw new Error(`rates failed: ${res.status}`);
  const json = (await res.json()) as {
    base: string;
    date: string;
    rates: Record<string, number>;
  };
  return {
    base: json.base,
    date: json.date,
    rates: { ...json.rates, [json.base]: 1 },
    fetchedAt: Date.now(),
  };
}

async function getRates(base: string, force = false): Promise<RatesCache> {
  if (!force) {
    const stored = localStorage.getItem(RATES_KEY);
    if (stored) {
      try {
        const cache = JSON.parse(stored) as RatesCache;
        if (
          cache.base === base &&
          Date.now() - cache.fetchedAt < TTL &&
          cache.rates
        ) {
          return cache;
        }
      } catch {
        /* ignore */
      }
    }
  }
  const fresh = await fetchRates(base);
  localStorage.setItem(RATES_KEY, JSON.stringify(fresh));
  return fresh;
}

export function CurrencyWidget({
  config,
  onConfigChange,
}: WidgetContext<CurrencyConfig>) {
  const from = config.from ?? 'USD';
  const to = config.to ?? 'EUR';
  const amount = config.amount ?? 1;

  const [rates, setRates] = useState<RatesCache | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const r = await getRates(from, force);
      setRates(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(false);
  }, [from]);

  const rate = rates?.rates[to];
  const converted = rate !== undefined ? amount * rate : null;
  const dateLabel = rates?.date
    ? new Date(rates.date).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div className="currency-widget">
      <div className="currency-row">
        <input
          type="number"
          className="currency-amount"
          value={amount}
          min={0}
          step={0.01}
          onChange={(e) =>
            onConfigChange({ ...config, amount: Number(e.target.value) || 0 })
          }
        />
        <select
          className="currency-select"
          value={from}
          onChange={(e) => onConfigChange({ ...config, from: e.target.value })}
        >
          {COMMON.map((c) => (
            <option key={c} value={c}>
              {c}
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
          className="currency-select"
          value={to}
          onChange={(e) => onConfigChange({ ...config, to: e.target.value })}
        >
          {COMMON.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="currency-result">
        {error ? (
          <span className="error">{error}</span>
        ) : loading && !rates ? (
          <span className="muted">Loading…</span>
        ) : converted !== null ? (
          <>
            <div className="currency-value">
              {converted.toLocaleString([], {
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="currency-unit">{to}</div>
          </>
        ) : (
          <span className="muted">—</span>
        )}
      </div>
      <div className="currency-footer">
        <span className="currency-meta" title={rates?.date}>
          1 {from} = {rate?.toFixed(4)} {to}
          {dateLabel ? ` · ${dateLabel}` : ''}
        </span>
        <button
          type="button"
          className="icon-btn"
          onClick={() => load(true)}
          disabled={loading}
          title="Refresh rates"
          aria-label="Refresh rates"
        >
          <RefreshCw size={12} />
        </button>
      </div>
    </div>
  );
}
