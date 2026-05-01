import { useEffect, useRef, useState } from 'react';
import { Plus, X, GripVertical, Globe, Search } from 'lucide-react';
import type { WidgetContext } from './types';

interface WorldClock {
  label: string;
  timezone: string;
}

interface WorldClocksConfig {
  clocks?: WorldClock[];
}

const DEFAULTS: WorldClock[] = [
  { label: 'New York', timezone: 'America/New_York' },
  { label: 'London', timezone: 'Europe/London' },
  { label: 'Tokyo', timezone: 'Asia/Tokyo' },
];

interface CityHit {
  name: string;
  admin1?: string;
  country?: string;
  timezone: string;
}

async function searchCities(query: string): Promise<CityHit[]> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query,
    )}&count=8&language=en&format=json`,
  );
  if (!res.ok) return [];
  const data = (await res.json()) as {
    results?: {
      name: string;
      admin1?: string;
      country?: string;
      timezone?: string;
    }[];
  };
  return (data.results ?? [])
    .filter((r) => !!r.timezone)
    .map((r) => ({
      name: r.name,
      admin1: r.admin1,
      country: r.country,
      timezone: r.timezone!,
    }));
}

function tzAbbr(tz: string, date: Date): string {
  try {
    const part = new Intl.DateTimeFormat([], {
      timeZone: tz,
      timeZoneName: 'short',
    })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName');
    return part?.value ?? '';
  } catch {
    return '';
  }
}

export function WorldClocksWidget({
  config,
  onConfigChange,
}: WidgetContext<WorldClocksConfig>) {
  const clocks = config.clocks ?? DEFAULTS;
  const [now, setNow] = useState(() => new Date());
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (adding) searchInputRef.current?.focus();
  }, [adding]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      const hits = await searchCities(q);
      setResults(hits);
      setHighlight(0);
      setLoading(false);
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  const update = (next: WorldClock[]) =>
    onConfigChange({ ...config, clocks: next });

  const pick = (hit: CityHit) => {
    const label = hit.name;
    update([...clocks, { label, timezone: hit.timezone }]);
    setQuery('');
    setResults([]);
    setAdding(false);
  };

  const cancel = () => {
    setQuery('');
    setResults([]);
    setAdding(false);
  };

  const remove = (i: number) => update(clocks.filter((_, j) => j !== i));

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...clocks];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    update(next);
  };

  return (
    <div className="wc-widget">
      <div className="wc-toolbar">
        <span className="wc-label-count">
          {clocks.length} zone{clocks.length === 1 ? '' : 's'}
        </span>
        <button
          type="button"
          className="icon-btn"
          onClick={() => (adding ? cancel() : setAdding(true))}
          title={adding ? 'Cancel' : 'Add clock'}
          aria-label={adding ? 'Cancel' : 'Add clock'}
        >
          {adding ? <X size={14} /> : <Plus size={14} />}
        </button>
      </div>
      {adding && (
        <div className="wc-search">
          <div className="wc-search-input">
            <Search size={12} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search any city…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  cancel();
                  return;
                }
                if (!results.length) return;
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setHighlight((h) => (h + 1) % results.length);
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setHighlight((h) => (h - 1 + results.length) % results.length);
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  pick(results[highlight]);
                }
              }}
            />
          </div>
          {query.trim().length >= 2 && (
            <ul className="wc-results">
              {loading && <li className="wc-hint">Searching…</li>}
              {!loading && results.length === 0 && (
                <li className="wc-hint">No cities found.</li>
              )}
              {results.map((r, i) => (
                <li key={`${r.name}-${r.timezone}-${i}`}>
                  <button
                    type="button"
                    className={`wc-result ${i === highlight ? 'active' : ''}`}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => pick(r)}
                  >
                    <span className="wc-result-name">{r.name}</span>
                    <span className="wc-result-meta">
                      {[r.admin1, r.country].filter(Boolean).join(', ')}
                    </span>
                    <span className="wc-result-tz">{tzAbbr(r.timezone, now)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <ul className="wc-list">
        {clocks.length === 0 && !adding && (
          <li className="wc-empty">No zones yet. Click + to add one.</li>
        )}
        {clocks.map((c, i) => (
          <WorldClockRow
            key={`${c.timezone}-${i}`}
            clock={c}
            now={now}
            dragging={dragIdx === i}
            over={overIdx === i && dragIdx !== null && dragIdx !== i}
            onDelete={() => remove(i)}
            onDragStart={() => setDragIdx(i)}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragIdx !== null) setOverIdx(i);
            }}
            onDrop={() => {
              if (dragIdx !== null) reorder(dragIdx, i);
              setDragIdx(null);
              setOverIdx(null);
            }}
            onDragEnd={() => {
              setDragIdx(null);
              setOverIdx(null);
            }}
          />
        ))}
      </ul>
    </div>
  );
}

function WorldClockRow({
  clock,
  now,
  dragging,
  over,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  clock: WorldClock;
  now: Date;
  dragging: boolean;
  over: boolean;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const [draggable, setDraggable] = useState(false);

  let time = '—';
  let tzLabel = clock.timezone;
  try {
    time = new Intl.DateTimeFormat([], {
      timeZone: clock.timezone,
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);
    tzLabel =
      new Intl.DateTimeFormat([], {
        timeZone: clock.timezone,
        timeZoneName: 'short',
      })
        .formatToParts(now)
        .find((p) => p.type === 'timeZoneName')?.value || clock.timezone;
  } catch {
    /* invalid tz */
  }

  return (
    <li
      className={`wc-item${dragging ? ' dragging' : ''}${over ? ' over' : ''}`}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={() => {
        setDraggable(false);
        onDragEnd();
      }}
    >
      <span
        className="wc-grip"
        onMouseDown={() => setDraggable(true)}
        onMouseUp={() => setDraggable(false)}
        title="Drag to reorder"
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </span>
      <span className="wc-ico">
        <Globe size={14} />
      </span>
      <span className="wc-text">
        <span className="wc-name">{clock.label}</span>
        <span className="wc-tz">{tzLabel}</span>
      </span>
      <span className="wc-time">{time}</span>
      <button
        type="button"
        className="wc-del"
        onClick={onDelete}
        title="Delete zone"
        aria-label="Delete zone"
      >
        <X size={12} />
      </button>
    </li>
  );
}
