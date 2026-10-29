import { Icon } from './Icons';
export function FindingsActions({
  locked,
  onSave,
  onFinalise,
  onNewDraft,
}: {
  locked: boolean;
  onSave: () => void;
  onFinalise: () => void;
  onNewDraft: () => void;
}) {
  return (
    <div className="findings-actions" role="group" aria-label="Findings actions">
      {locked ? (
        <button type="button" className="primary-button" onClick={onNewDraft}>
          Start a new draft
          <Icon name="arrow" size={16} />
        </button>
      ) : (
        <>
          <button type="button" className="secondary-button" onClick={onSave}>
            <Icon name="save" size={16} />
            Save draft
          </button>
          <button type="button" className="primary-button" onClick={onFinalise}>
            Finalise findings
            <Icon name="arrow" size={16} />
          </button>
        </>
      )}
      <p>Browser-only demo save. Nothing is submitted to a server.</p>
    </div>
  );
}
