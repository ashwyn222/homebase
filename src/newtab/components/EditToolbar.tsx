import { Check } from 'lucide-react';
import { useDashboard } from '../store/dashboard';

export function EditToolbar() {
  const editing = useDashboard((s) => s.editing);
  const setEditing = useDashboard((s) => s.setEditing);

  if (!editing) return null;

  return (
    <div className="edit-toolbar" role="toolbar" aria-label="Edit dashboard">
      <div className="edit-hint">
        <span className="edit-dot" />
        <span>Editing — drag widgets to move, corners to resize.</span>
      </div>
      <button
        type="button"
        className="toolbar-btn primary"
        onClick={() => setEditing(false)}
      >
        <Check size={14} /> Done
      </button>
    </div>
  );
}
