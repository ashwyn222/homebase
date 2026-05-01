import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface Props {
  title: string;
  anchor: HTMLElement | null;
  onClose: () => void;
  children: React.ReactNode;
}

export function WidgetConfigPopover({ title, anchor, onClose, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    setTimeout(() => document.addEventListener('mousedown', onClick), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [onClose]);

  useEffect(() => {
    if (!ref.current || !anchor) return;
    const rect = anchor.getBoundingClientRect();
    const el = ref.current;
    const desiredLeft = rect.left + window.scrollX;
    const desiredTop = rect.bottom + window.scrollY + 8;
    const maxLeft = window.innerWidth - el.offsetWidth - 16;
    el.style.left = `${Math.max(16, Math.min(desiredLeft, maxLeft))}px`;
    el.style.top = `${desiredTop}px`;
  }, [anchor]);

  return (
    <div className="popover" ref={ref} role="dialog" aria-label={title}>
      <div className="popover-head">
        <span className="popover-title">{title}</span>
        <button type="button" className="icon-btn" onClick={onClose}>
          <X size={14} />
        </button>
      </div>
      <div className="popover-body">{children}</div>
    </div>
  );
}
