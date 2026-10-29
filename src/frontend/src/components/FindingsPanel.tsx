import type { InvestigationCase } from '../api/generated';
import type { InvestigationDraft } from '../state/investigation';
import { Icon } from './Icons';
interface Props {
  saveStatus: string;
  dirty: boolean;
  data: InvestigationCase;
  draft: InvestigationDraft;
  onChange: (draft: InvestigationDraft) => void;
}
export function FindingsPanel({ saveStatus, dirty, data, draft, onChange }: Props) {
  const locked = draft.status === 'finalised';
  return (
    <section className="panel findings-panel" aria-labelledby="findings-title">
      <div className="panel-heading">
        <div>
          <span className="step-number">{draft.mode === 'human' ? '02' : '03'}</span>
          <h2 id="findings-title">Your findings</h2>
        </div>
        <div className="findings-state">
          <span className={`badge ${locked ? 'badge-benign' : 'badge-neutral'}`}>
            {locked ? 'Finalised' : 'Draft'}
          </span>
          <span className={`save-status ${dirty ? 'is-dirty' : ''}`} role="status">
            <span className="small-dot" />
            {saveStatus}
          </span>
        </div>
      </div>
      <div className="panel-body">
        <p className="panel-intro">Make your own assessment. Explain what supports it.</p>
        <div className="findings-fields">
          <label className="form-field assessment-field">
            Your assessment
            <select
              aria-label="Your assessment"
              disabled={locked}
              value={draft.classification}
              onChange={(event) =>
                onChange({
                  ...draft,
                  classification: event.target.value as InvestigationDraft['classification'],
                })
              }
            >
              <option value="undetermined">Undetermined</option>
              <option value="benign">Benign</option>
              <option value="suspicious">Suspicious</option>
              <option value="malicious">Malicious</option>
            </select>
          </label>
          <label className="form-field reasoning-field">
            Your reasoning
            <textarea
              aria-label="Your reasoning"
              disabled={locked}
              rows={9}
              value={draft.reasoning}
              placeholder="What happened? Which records support your conclusion? What is still uncertain?"
              onChange={(event) => onChange({ ...draft, reasoning: event.target.value })}
            />
          </label>
          <div className="supporting-records">
            <span className="field-label">
              Supporting records <span className="muted">({draft.evidenceIds.length})</span>
            </span>
            {draft.evidenceIds.length ? (
              <div className="selected-sources">
                {draft.evidenceIds.map((id) => (
                  <span key={id} className="selected-source">
                    <span className="mono">{id}</span>
                    <span>
                      {data.evidence.find((record) => record.id === id)?.title ??
                        'Unavailable record'}
                    </span>
                    {!locked && (
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Remove supporting record ${id}`}
                        onClick={() =>
                          onChange({
                            ...draft,
                            evidenceIds: draft.evidenceIds.filter((source) => source !== id),
                          })
                        }
                      >
                        <Icon name="close" size={13} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="support-empty">
                Use Cite beside a record to add support. Cited records are not automatically
                verified.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
