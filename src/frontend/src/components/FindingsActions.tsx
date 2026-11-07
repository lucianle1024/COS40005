import { Icon } from './Icons';
export function FindingsActions({
  locked,
  onSave,
  onFinalise,
  onNewDraft,
  connected = false,
  busy = false,
  ready = true,
}: {
  locked: boolean;
  connected?: boolean;
  busy?: boolean;
  ready?: boolean;
  onSave: () => void;
  onFinalise: () => void;
  onNewDraft: () => void;
}) {
  return (
    <div className="findings-actions" role="group" aria-label="Findings actions">
      {locked ? (
        connected ? (
          <strong>Final report locked</strong>
        ) : (
          <button type="button" className="primary-button" onClick={onNewDraft}>
            Start a new draft
            <Icon name="arrow" size={16} />
          </button>
        )
      ) : (
        <>
          <button type="button" className="secondary-button" onClick={onSave} disabled={busy}>
            <Icon name="save" size={16} />
            Save draft
          </button>
          <button
            type="button"
            className={ready ? 'primary-button' : 'secondary-button'}
            onClick={onFinalise}
            disabled={busy}
          >
            Finalise findings
            <Icon name="arrow" size={16} />
          </button>
        </>
      )}
      <p>
        {connected
          ? busy
            ? 'Saving…'
            : 'Findings are stored with this Case 1 session.'
          : 'Browser-only demo save. Nothing is submitted to a server.'}
      </p>
    </div>
  );
}
