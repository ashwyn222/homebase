import { useEffect, useRef, useState } from 'react';
import type { WidgetContext } from './types';

interface NotesConfig {
  text?: string;
}

export function NotesWidget({ config, onConfigChange }: WidgetContext<NotesConfig>) {
  const [value, setValue] = useState(config.text ?? '');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(config.text ?? '');
  }, [config.text]);

  const onChange = (v: string) => {
    setValue(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onConfigChange({ ...config, text: v });
    }, 400);
  };

  return (
    <textarea
      className="notes-area"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Jot something down..."
      spellCheck={false}
    />
  );
}
