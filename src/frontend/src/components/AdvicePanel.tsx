import type { InvestigationCase } from '../api/generated';
import type { InvestigationDraft, ReviewDecision } from '../state/investigation';
import { SourceLinks } from './SourceLinks';
import { Icon } from './Icons';
interface Props {
  data: InvestigationCase;
  draft: InvestigationDraft;
  onInspect: (id: string) => void;
  onReview: (id: string, decision: ReviewDecision, revision?: string) => void;
  onAdd: (id: string) => void;
}
export function AdvicePanel({ data, draft, onInspect, onReview, onAdd }: Props) {
  const readOnly = draft.status === 'finalised';
  return (
    <section className="panel advice-panel" aria-labelledby="advice-title">
      <div className="panel-heading">
        <div>
          <span className="step-number">02</span>
          <h2 id="advice-title">AI advice</h2>
        </div>
        <Icon name="spark" size={18} />
      </div>
      <div className="panel-body">
        <p className="panel-intro">Check each claim against its supporting records.</p>
        <div className="demo-note">
          <span className="small-dot" />
          Fixed demo advice, not a live model response.
        </div>
        {!data.advice.length && (
          <p className="empty-state">No AI advice is available for this case.</p>
        )}
        {data.advice.map((item) => {
          const review = draft.reviews[item.id];
          return (
            <article className="advice-card" key={item.id} aria-label={item.title}>
              <h3>{item.title}</h3>
              <div className="advice-meta">
                <span className="mono">{item.id}</span>
                <span className={`badge badge-${item.classification}`}>{item.classification}</span>
              </div>
              <div className="advice-evidence">
                <p className="advice-rationale">{item.rationale}</p>
                <SourceLinks ids={item.evidenceIds} records={data.evidence} onInspect={onInspect} />
              </div>
              <div className="review-section">
                <span className="field-label">Your response</span>
                <div className="review-buttons" role="group" aria-label={`Review ${item.id}`}>
                  {(['accept', 'revise', 'reject'] as const).map((decision) => (
                    <button
                      type="button"
                      key={decision}
                      aria-pressed={review?.decision === decision}
                      disabled={readOnly}
                      className={
                        review?.decision === decision ? `review-selected review-${decision}` : ''
                      }
                      onClick={() => onReview(item.id, decision, review?.revision ?? '')}
                    >
                      {decision[0].toUpperCase() + decision.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {review && review.decision !== 'reject' && (
                <p className="review-feedback">
                  {review.decision === 'accept'
                    ? 'Accepted. This records your response only.'
                    : 'Revise the advice below. The original is kept above.'}{' '}
                  Use Add to findings to copy text and available source IDs. Your assessment stays
                  unchanged.
                </p>
              )}
              {review?.decision === 'revise' && (
                <label className="revision-field">
                  Your revision for {item.id}
                  <textarea
                    rows={3}
                    disabled={readOnly}
                    value={review.revision}
                    onChange={(event) => onReview(item.id, 'revise', event.target.value)}
                    placeholder="Explain what you would change and why."
                  />
                </label>
              )}
              {review?.decision === 'reject' && (
                <p className="review-note">
                  Rejected. This advice will not be added to your findings.
                </p>
              )}
              {review && review.decision !== 'reject' && (
                <div className="add-to-findings">
                  <button
                    type="button"
                    className="text-button"
                    disabled={readOnly || (review.decision === 'revise' && !review.revision.trim())}
                    onClick={() => onAdd(item.id)}
                  >
                    Add to findings <Icon name="arrow" size={14} />
                  </button>
                  <span>
                    Copies text and available source IDs. You can remove citations in Your findings;
                    adding them does not verify the records.
                  </span>
                </div>
              )}
            </article>
          );
        })}
        <div className="advice-footnote">
          <Icon name="shield" size={16} />
          <p>
            Review is separate from your final decision. Accepting advice does not submit findings.
          </p>
        </div>
      </div>
    </section>
  );
}
