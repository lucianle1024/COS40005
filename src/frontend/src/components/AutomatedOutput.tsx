import type { InvestigationCase } from '../api/generated';
import { SourceLinks } from './SourceLinks';
export function AutomatedOutput({
  data,
  onInspect,
}: {
  data: InvestigationCase;
  onInspect: (id: string) => void;
}) {
  const output = data.automatedAssessment;
  return (
    <section className="panel automated-panel" aria-labelledby="automated-title">
      <div className="panel-heading">
        <div>
          <span className="step-number">02</span>
          <h2 id="automated-title">Automated output</h2>
        </div>
        <span className="badge badge-neutral">Read only</span>
      </div>
      <div className="panel-body">
        <p className="panel-intro">Fixed output for the AI-only workflow demonstration.</p>
        <article className="automated-result">
          <span className={`badge badge-${output.classification}`}>{output.classification}</span>
          <h3>Case assessment</h3>
          <p>{output.rationale}</p>
          <SourceLinks ids={output.evidenceIds} records={data.evidence} onInspect={onInspect} />
          <h3 className="limitations-heading">Limits of this output</h3>
          <ul>
            {output.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <div className="read-only-note">
          <strong>No analyst edits in this mode.</strong>
          <p>
            The eventual AI-only pipeline and its timing/scoring belong to backend integration. This
            screen does not run or evaluate a model.
          </p>
        </div>
      </div>
    </section>
  );
}
