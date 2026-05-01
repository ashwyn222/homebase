import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { WidgetContext } from './types';

interface HistoryConfig {
  limit?: number;
  dedupeHosts?: boolean;
}

function faviconUrl(url: string): string | null {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
  } catch {
    return null;
  }
}

function timeAgo(ms: number): string {
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86_400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86_400)}d ago`;
}

export function HistoryWidget({ config }: WidgetContext<HistoryConfig>) {
  const limit = config.limit ?? 15;
  const dedupe = config.dedupeHosts ?? true;
  const [items, setItems] = useState<chrome.history.HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const raw = await chrome.history.search({
        text: '',
        maxResults: limit * 3,
        startTime: Date.now() - 1000 * 60 * 60 * 24 * 14,
      });
      raw.sort((a, b) => (b.lastVisitTime ?? 0) - (a.lastVisitTime ?? 0));
      if (dedupe) {
        const seen = new Set<string>();
        const deduped: chrome.history.HistoryItem[] = [];
        for (const h of raw) {
          try {
            const host = new URL(h.url!).hostname;
            if (seen.has(host)) continue;
            seen.add(host);
            deduped.push(h);
          } catch {
            deduped.push(h);
          }
          if (deduped.length >= limit) break;
        }
        setItems(deduped);
      } else {
        setItems(raw.slice(0, limit));
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  };

  useEffect(() => {
    load();
  }, [limit, dedupe]);

  return (
    <div className="history-widget">
      <div className="hw-head">
        <span className="muted">Recent history</span>
        <button
          type="button"
          className="icon-btn"
          onClick={load}
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <ul className="hw-list">
        {items.map((h) => (
          <li key={h.id}>
            <a href={h.url} className="hw-link" rel="noopener noreferrer">
              {faviconUrl(h.url!) && (
                <img
                  src={faviconUrl(h.url!)!}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="hw-fav"
                />
              )}
              <span className="hw-title">{h.title || h.url}</span>
              <span className="hw-time muted">
                {h.lastVisitTime ? timeAgo(h.lastVisitTime) : ''}
              </span>
            </a>
          </li>
        ))}
        {items.length === 0 && !error && (
          <li className="hw-empty">No history yet.</li>
        )}
      </ul>
    </div>
  );
}

export function HistoryConfigPanel({
  config,
  onConfigChange,
}: WidgetContext<HistoryConfig>) {
  return (
    <div className="config-panel">
      <label className="config-row">
        <span>Number of items</span>
        <input
          type="number"
          min={5}
          max={50}
          value={config.limit ?? 15}
          onChange={(e) =>
            onConfigChange({ ...config, limit: Number(e.target.value) || 15 })
          }
        />
      </label>
      <label className="config-row checkbox">
        <input
          type="checkbox"
          checked={config.dedupeHosts ?? true}
          onChange={(e) =>
            onConfigChange({ ...config, dedupeHosts: e.target.checked })
          }
        />
        <span>One entry per domain</span>
      </label>
    </div>
  );
}
