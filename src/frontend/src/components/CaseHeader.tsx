import type { InvestigationCase } from '../api/generated';
import type { WorkflowMode } from '../state/investigation';
import { ModeSelector } from './ModeSelector';
import { Icon } from './Icons';
export function CaseHeader({
  data,
  mode,
  onModeChange,
  onBrief,
  onAbout,
  connected = false,
}: {
  data: InvestigationCase;
  mode: WorkflowMode;
  onModeChange: (mode: WorkflowMode) => void;
  onBrief: () => void;
  onAbout: () => void;
  connected?: boolean;
}) {
  return (
    <header className="command-bar">
      <div className="case-identity">
        <span className="brand-symbol">
          <Icon name="case" size={17} />
        </span>
        <span className="project-label">COS40005</span>
        <span className="case-key mono">{data.id.toUpperCase()}</span>
        <h1 title={data.title}>{data.title}</h1>
        <span className="case-context">
          {data.category} / v{data.version}
        </span>
      </div>
      {connected ? (
        <span>{{ human: 'Human only', ai: 'AI only', combined: 'Human + AI' }[mode]}</span>
      ) : (
        <ModeSelector mode={mode} onChange={onModeChange} />
      )}
      <div className="command-actions">
        <button type="button" className="command-button" onClick={onBrief}>
          Case brief
        </button>
        <button type="button" className="command-button" onClick={onAbout}>
          {connected ? 'About this case' : 'About this demo'}
        </button>
      </div>
    </header>
  );
}
