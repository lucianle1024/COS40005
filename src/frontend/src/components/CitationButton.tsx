import { Icon } from './Icons';

export function CitationButton({
  id,
  cited,
  disabled,
  onToggle,
}: {
  id: string;
  cited: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={`citation-button ${cited ? 'is-cited' : ''}`}
      aria-label={cited ? `Cited ${id}: remove citation` : `Cite ${id} as supporting evidence`}
      aria-pressed={cited}
      disabled={disabled}
      onClick={onToggle}
    >
      <Icon name={cited ? 'check' : 'record'} size={14} />
      {cited ? 'Cited' : 'Cite'}
    </button>
  );
}
