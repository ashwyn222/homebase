import { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2, Circle } from 'lucide-react';
import type { WidgetContext } from './types';

type Entry = chrome.readingList.ReadingListEntry;

function faviconUrl(url: string): string | null {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
  } catch {
    return null;
  }
}

export function ReadingListWidget(_ctx: WidgetContext) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showRead, setShowRead] = useState(false);

  const load = async () => {
    try {
      if (!chrome.readingList) {
        setError('Reading list API unavailable. Requires Chrome 120+.');
        return;
      }
      const raw = await chrome.readingList.query({});
      raw.sort((a, b) => (b.creationTime ?? 0) - (a.creationTime ?? 0));
      setEntries(raw);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleRead = async (entry: Entry) => {
    try {
      await chrome.readingList.updateEntry({
        url: entry.url,
        hasBeenRead: !entry.hasBeenRead,
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const visible = entries.filter((e) => showRead || !e.hasBeenRead);

  return (
    <div className="rl-widget">
      <div className="rl-head">
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={showRead}
            onChange={(e) => setShowRead(e.target.checked)}
          />
          <span>Show read</span>
        </label>
        <button type="button" className="icon-btn" onClick={load}>
          <RefreshCw size={14} />
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <ul className="rl-list">
        {visible.map((e) => (
          <li key={e.url} className={e.hasBeenRead ? 'read' : ''}>
            <button
              type="button"
              className="icon-btn rl-check"
              title={e.hasBeenRead ? 'Mark unread' : 'Mark read'}
              onClick={() => toggleRead(e)}
            >
              {e.hasBeenRead ? (
                <CheckCircle2 size={14} />
              ) : (
                <Circle size={14} />
              )}
            </button>
            <a href={e.url} className="rl-link" rel="noopener noreferrer">
              {faviconUrl(e.url) && (
                <img
                  src={faviconUrl(e.url)!}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="rl-fav"
                />
              )}
              <span className="rl-title">{e.title || e.url}</span>
            </a>
          </li>
        ))}
        {visible.length === 0 && !error && (
          <li className="rl-empty">Nothing saved yet.</li>
        )}
      </ul>
    </div>
  );
}
