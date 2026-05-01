import { useState, useRef, useEffect } from 'react';
import { Plus, X, Link as LinkIcon, GripVertical } from 'lucide-react';
import type { WidgetContext } from './types';

interface QuickLink {
  title: string;
  url: string;
}

interface QuickLinksConfig {
  links?: QuickLink[];
}

function normalizeUrl(input: string): string {
  const s = input.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

function faviconUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return null;
  }
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function QuickLinksWidget({
  config,
  onConfigChange,
}: WidgetContext<QuickLinksConfig>) {
  const links = config.links ?? [];
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) urlInputRef.current?.focus();
  }, [adding]);

  const save = () => {
    const normalized = normalizeUrl(url);
    if (!normalized) return;
    const t = title.trim() || hostname(normalized);
    onConfigChange({
      ...config,
      links: [...links, { title: t, url: normalized }],
    });
    setTitle('');
    setUrl('');
    setAdding(false);
  };

  const cancel = () => {
    setTitle('');
    setUrl('');
    setAdding(false);
  };

  const remove = (i: number) => {
    onConfigChange({
      ...config,
      links: links.filter((_, j) => j !== i),
    });
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...links];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onConfigChange({ ...config, links: next });
  };

  return (
    <div className="ql-widget">
      <div className="ql-toolbar">
        <span className="ql-label">
          {links.length} link{links.length === 1 ? '' : 's'}
        </span>
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
      <ul className="ql-list">
        {links.length === 0 && !adding && (
          <li className="ql-empty">No links yet. Click + to add one.</li>
        )}
        {links.map((l, i) => (
          <QuickLinkRow
            key={i}
            link={l}
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

function QuickLinkRow({
  link,
  dragging,
  over,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  link: QuickLink;
  dragging: boolean;
  over: boolean;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const src = faviconUrl(link.url);
  const [imgErr, setImgErr] = useState(false);
  const [draggable, setDraggable] = useState(false);

  return (
    <li
      className={`ql-item${dragging ? ' dragging' : ''}${over ? ' over' : ''}`}
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
        className="ql-grip"
        onMouseDown={() => setDraggable(true)}
        onMouseUp={() => setDraggable(false)}
        title="Drag to reorder"
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </span>
      <span className="ql-ico">
        {src && !imgErr ? (
          <img
            src={src}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setImgErr(true)}
          />
        ) : (
          <LinkIcon size={14} />
        )}
      </span>
      <a
        className="ql-link"
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {link.title || hostname(link.url)}
      </a>
      <button
        type="button"
        className="ql-del"
        onClick={onDelete}
        title="Delete link"
        aria-label="Delete link"
      >
        <X size={12} />
      </button>
    </li>
  );
}
