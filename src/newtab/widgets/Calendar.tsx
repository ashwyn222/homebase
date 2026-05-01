import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { WidgetContext } from './types';

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarWidget(_ctx: WidgetContext) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const today = useMemo(() => new Date(), []);

  const grid = useMemo(() => {
    const first = startOfMonth(viewDate);
    const startWeekday = first.getDay();
    const cells: Date[] = [];
    const firstCell = new Date(first);
    firstCell.setDate(first.getDate() - startWeekday);
    for (let i = 0; i < 42; i++) {
      const d = new Date(firstCell);
      d.setDate(firstCell.getDate() + i);
      cells.push(d);
    }
    return cells;
  }, [viewDate]);

  const monthLabel = viewDate.toLocaleDateString([], {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="cal-widget">
      <div className="cal-header">
        <button
          type="button"
          className="icon-btn"
          onClick={() => setViewDate((d) => addMonths(d, -1))}
          title="Previous month"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          className="cal-title"
          onClick={() => setViewDate(new Date())}
          title="Go to today"
        >
          {monthLabel}
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          title="Next month"
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="cal-dow">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="cal-grid">
        {grid.map((d, i) => {
          const isCurrentMonth = d.getMonth() === viewDate.getMonth();
          const isToday = isSameDay(d, today);
          const isSelected = selected ? isSameDay(d, selected) : false;
          return (
            <button
              type="button"
              key={i}
              className={
                'cal-cell' +
                (isCurrentMonth ? '' : ' muted') +
                (isToday ? ' today' : '') +
                (isSelected ? ' selected' : '')
              }
              onClick={() => setSelected(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
