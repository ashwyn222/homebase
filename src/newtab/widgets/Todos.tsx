import { useState } from 'react';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import type { WidgetContext } from './types';

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

interface TodosConfig {
  items?: Todo[];
}

const uid = (): string =>
  `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

export function TodosWidget({ config, onConfigChange }: WidgetContext<TodosConfig>) {
  const items = config.items ?? [];
  const [draft, setDraft] = useState('');

  const update = (next: Todo[]) => onConfigChange({ ...config, items: next });

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    update([...items, { id: uid(), text, done: false }]);
    setDraft('');
  };

  const toggle = (id: string) =>
    update(items.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) => update(items.filter((t) => t.id !== id));

  const clearDone = () => update(items.filter((t) => !t.done));

  const doneCount = items.filter((t) => t.done).length;

  return (
    <div className="todos-widget">
      <form
        className="todos-input"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <input
          type="text"
          placeholder="Add a task…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="icon-btn" title="Add">
          <Plus size={14} />
        </button>
      </form>
      <ul className="todos-list">
        {items.map((t) => (
          <li key={t.id} className={t.done ? 'done' : ''}>
            <button
              type="button"
              className="icon-btn check"
              onClick={() => toggle(t.id)}
            >
              {t.done ? <CheckSquare size={14} /> : <Square size={14} />}
            </button>
            <span className="todo-text">{t.text}</span>
            <button
              type="button"
              className="icon-btn"
              onClick={() => remove(t.id)}
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="empty">Nothing to do. Enjoy the quiet.</li>
        )}
      </ul>
      {doneCount > 0 && (
        <div className="todos-footer">
          <span>
            {doneCount} of {items.length} done
          </span>
          <button type="button" className="link-btn" onClick={clearDone}>
            Clear completed
          </button>
        </div>
      )}
    </div>
  );
}
