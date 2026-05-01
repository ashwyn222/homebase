import { useEffect, useState } from 'react';
import { RefreshCw, FileDown, Folder, Trash2 } from 'lucide-react';
import type { WidgetContext } from './types';

interface DownloadsConfig {
  limit?: number;
}

function formatBytes(bytes: number): string {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function fileName(d: chrome.downloads.DownloadItem): string {
  const path = d.filename || d.finalUrl || d.url;
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

export function DownloadsWidget({ config }: WidgetContext<DownloadsConfig>) {
  const limit = config.limit ?? 10;
  const [items, setItems] = useState<chrome.downloads.DownloadItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const raw = await chrome.downloads.search({
        limit,
        orderBy: ['-startTime'],
      });
      setItems(raw);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  };

  useEffect(() => {
    load();
    const onChange = () => load();
    chrome.downloads.onCreated?.addListener(onChange);
    chrome.downloads.onChanged?.addListener(onChange);
    return () => {
      chrome.downloads.onCreated?.removeListener(onChange);
      chrome.downloads.onChanged?.removeListener(onChange);
    };
  }, [limit]);

  const open = (id: number) => {
    chrome.downloads.open(id).catch(() => {});
  };

  const show = (id: number) => {
    chrome.downloads.show(id);
  };

  const clearAll = async () => {
    if (items.length === 0) return;
    if (!confirm('Clear all downloads from history? Files on disk are not deleted.'))
      return;
    try {
      await chrome.downloads.erase({});
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to clear');
    }
  };

  return (
    <div className="dl-widget">
      <div className="dl-head">
        <span className="muted">Recent downloads</span>
        <span className="dl-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={clearAll}
            disabled={items.length === 0}
            title="Clear all from history"
            aria-label="Clear all from history"
          >
            <Trash2 size={14} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={load}
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </span>
      </div>
      {error && <div className="error">{error}</div>}
      <ul className="dl-list">
        {items.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              className="dl-link"
              onClick={() =>
                d.state === 'complete' && d.exists ? open(d.id) : show(d.id)
              }
              title={d.filename}
            >
              <FileDown size={14} />
              <span className="dl-name">{fileName(d)}</span>
              <span className="dl-size muted">{formatBytes(d.totalBytes)}</span>
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => show(d.id)}
              title="Show in folder"
            >
              <Folder size={12} />
            </button>
          </li>
        ))}
        {items.length === 0 && !error && <li className="dl-empty">None yet.</li>}
      </ul>
    </div>
  );
}

export function DownloadsConfigPanel({
  config,
  onConfigChange,
}: WidgetContext<DownloadsConfig>) {
  return (
    <div className="config-panel">
      <label className="config-row">
        <span>Show last</span>
        <input
          type="number"
          min={3}
          max={30}
          value={config.limit ?? 10}
          onChange={(e) =>
            onConfigChange({ ...config, limit: Number(e.target.value) || 10 })
          }
        />
      </label>
    </div>
  );
}
