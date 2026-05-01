import { useEffect, useState } from 'react';
import type { WidgetContext } from './types';
import { useDashboard } from '../store/dashboard';

interface ClockConfig {
  format24?: boolean;
  showSeconds?: boolean;
  showDate?: boolean;
}

function partOfDay(h: number): string {
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

export function ClockWidget({ config }: WidgetContext<ClockConfig>) {
  const [now, setNow] = useState(() => new Date());
  const userName = useDashboard((s) => s.userName);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const is24 = !!config.format24;
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const hh = is24
    ? hours.toString().padStart(2, '0')
    : (hours % 12 || 12).toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const seconds = config.showSeconds
    ? ':' + now.getSeconds().toString().padStart(2, '0')
    : '';
  const timeStr = `${hh}:${mm}${seconds}`;
  const ampm = is24 ? '' : hours >= 12 ? 'PM' : 'AM';

  const greeting = userName.trim()
    ? `${partOfDay(now.getHours())}, ${userName.trim()}`
    : partOfDay(now.getHours());

  const date = now.toLocaleDateString([], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="clock-widget">
      <div className="clock-greeting">{greeting}</div>
      <div className="clock-time">
        <span className="clock-hm">{timeStr}</span>
        {ampm && <span className="clock-ampm">{ampm}</span>}
      </div>
      {config.showDate !== false && <div className="clock-date">{date}</div>}
    </div>
  );
}

export function ClockConfigPanel({
  config,
  onConfigChange,
}: WidgetContext<ClockConfig>) {
  return (
    <div className="config-panel">
      <label className="config-row">
        <input
          type="checkbox"
          checked={!!config.format24}
          onChange={(e) => onConfigChange({ ...config, format24: e.target.checked })}
        />
        <span>24-hour time</span>
      </label>
      <label className="config-row">
        <input
          type="checkbox"
          checked={!!config.showSeconds}
          onChange={(e) =>
            onConfigChange({ ...config, showSeconds: e.target.checked })
          }
        />
        <span>Show seconds</span>
      </label>
      <label className="config-row">
        <input
          type="checkbox"
          checked={config.showDate !== false}
          onChange={(e) => onConfigChange({ ...config, showDate: e.target.checked })}
        />
        <span>Show date</span>
      </label>
    </div>
  );
}
