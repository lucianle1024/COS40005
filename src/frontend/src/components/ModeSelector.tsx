import type { WorkflowMode } from '../state/investigation';
const modes: { id: WorkflowMode; label: string; letter: string }[] = [
  { id: 'human', label: 'Human only', letter: 'A' },
  { id: 'ai', label: 'AI only', letter: 'B' },
  { id: 'combined', label: 'Human + AI', letter: 'C' },
];
export function ModeSelector({
  mode,
  onChange,
}: {
  mode: WorkflowMode;
  onChange: (mode: WorkflowMode) => void;
}) {
  return (
    <div className="mode-control">
      <div className="mode-selector" role="group" aria-label="Demonstration workflow">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={mode === item.id}
            onClick={() => onChange(item.id)}
          >
            <span className="mode-letter" aria-hidden="true">
              {item.letter}
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
