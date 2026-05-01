import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Circle, Plus, X, Eye, EyeOff } from 'lucide-react';
import type { WidgetContext } from './types';

type Entry = chrome.readingList.ReadingListEntry;

function faviconUrl(url: string): string | null {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
  } catch {
    return null;
  }
}

function normalizeUrl(input: string): string {
  const s = input.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function ReadingListWidget(_ctx: WidgetContext) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showRead, setShowRead] = useState(false);
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const urlInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (adding) urlInputRef.current?.focus();
  }, [adding]);

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

  const removeEntry = async (entry: Entry) => {
    try {
      await chrome.readingList.removeEntry({ url: entry.url });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove');
    }
  };

  const cancel = () => {
    setUrl('');
    setTitle('');
    setAdding(false);
    setError(null);
  };

  const save = async () => {
    const normalized = normalizeUrl(url);
    if (!normalized) return;
    try {
      await chrome.readingList.addEntry({
        url: normalized,
        title: title.trim() || hostname(normalized),
        hasBeenRead: false,
      });
      setUrl('');
      setTitle('');
      setAdding(false);
      setError(null);
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add';
      setError(msg.includes('Duplicate') ? 'Already in reading list' : msg);
    }
  };

  const visible = entries.filter((e) => showRead || !e.hasBeenRead);
  const unreadCount = entries.filter((e) => !e.hasBeenRead).length;

  return (
    <div className="ql-widget">
      <div className="ql-toolbar">
        <span className="ql-label">
          {unreadCount} unread
          {entries.length > unreadCount ? ` · ${entries.length} total` : ''}
        </span>
        <div className="ql-toolbar-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowRead((v) => !v)}
            title={showRead ? 'Hide read items' : 'Show read items'}
            aria-label={showRead ? 'Hide read items' : 'Show read items'}
          >
            {showRead ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => (adding ? cancel() : setAdding(true))}
            title={adding ? 'Cancel' : 'Add link'}
            aria-label={adding ? 'Cancel' : 'Add link'}
          >
            {adding ? <X size={14} /> : <Plus size={14} />}
          </button>
        </div>
      </div>
      {adding && (
        <form
          className="ql-add-form"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input
            ref={urlInputRef}
            type="text"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancel();
            }}
            required
          />
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancel();
            }}
          />
          <button type="submit" className="ql-add-submit">
            Add
          </button>
        </form>
      )}
      {error && <div className="error">{error}</div>}
      <ul className="ql-list">
        {visible.length === 0 && !adding && !error && (
          <li className="ql-empty">
            {entries.length === 0
              ? 'Nothing saved yet. Click + to add one.'
              : 'All caught up.'}
          </li>
        )}
        {visible.map((e) => {
          const src = faviconUrl(e.url);
          return (
            <li key={e.url} className={`ql-item${e.hasBeenRead ? ' read' : ''}`}>
              <button
                type="button"
                className="ql-check"
                title={e.hasBeenRead ? 'Mark unread' : 'Mark read'}
                aria-label={e.hasBeenRead ? 'Mark unread' : 'Mark read'}
                onClick={() => toggleRead(e)}
              >
                {e.hasBeenRead ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <Circle size={14} />
                )}
              </button>
              <span className="ql-ico">
                {src ? (
                  <img
                    src={src}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={(ev) =>
                      (ev.currentTarget.style.visibility = 'hidden')
                    }
                  />
                ) : null}
              </span>
              <a
                className="ql-link"
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {e.title || hostname(e.url)}
              </a>
              <button
                type="button"
                className="ql-del"
                onClick={() => removeEntry(e)}
                title="Remove"
                aria-label="Remove"
              >
                <X size={12} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
