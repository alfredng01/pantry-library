import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

interface EditableCellProps {
  value: string | number;
  type?: 'text' | 'number';
  onCommit: (value: string | number) => void;
}

export function EditableCell({ value, type = 'text', onCommit }: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  function startEditing() {
    setDraft(String(value));
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  }

  function commit() {
    if (type === 'number') {
      const parsed = Number(draft);
      onCommit(Number.isFinite(parsed) ? parsed : value);
    } else {
      onCommit(draft);
    }
    setEditing(false);
  }

  function cancel() {
    setEditing(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') cancel();
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type === 'number' ? 'number' : 'text'}
        value={draft}
        autoFocus
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          font: 'inherit',
          padding: '2px 4px',
          border: '1px solid var(--mantine-primary-color-filled, #4dabf7)',
          borderRadius: 4,
        }}
      />
    );
  }

  return (
    <div onDoubleClick={startEditing} style={{ cursor: 'text', minHeight: '1.4em' }}>
      {value === '' || value === null ? ' ' : value}
    </div>
  );
}
