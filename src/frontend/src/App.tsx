import { useState } from 'react';
import { loadDemoCase } from './api/demo-provider';
import { useInvestigation } from './hooks/useInvestigation';
import type { CaseLoader } from './hooks/useInvestigation';
import { CaseHeader } from './components/CaseHeader';
import { EvidencePanel } from './components/EvidencePanel';
import { AdvicePanel } from './components/AdvicePanel';
import { FindingsPanel } from './components/FindingsPanel';
import { FindingsActions } from './components/FindingsActions';
import { AutomatedOutput } from './components/AutomatedOutput';
import { Modal } from './components/Modal';
import { Icon } from './components/Icons';

export interface AppProps {
  loadCase?: CaseLoader;
}
const defaultLoader = () => loadDemoCase('case-01');
export default function App({ loadCase = defaultLoader }: AppProps) {
  const {
    data,
    draft,
    loading,
    loadFailed,
    activeId,
    dirty,
    saveStatus,
    notice,
    pendingMode,
    finalConfirmation,
    newDraftConfirmation,
    edit,
    persist,
    requestMode,
    openRecord,
    handleReview,
    add,
    requestFinalisation,
    confirmFinalisation,
    retry,
    cancelModeChange,
    saveAndSwitch,
    discardAndSwitch,
    requestNewDraft,
    cancelNewDraft,
    createBlankDraft,
    cancelFinalisation,
  } = useInvestigation(loadCase);
  const [about, setAbout] = useState(false);
  const [brief, setBrief] = useState(false);
  function inspect(id: string) {
    openRecord(id);
    window.requestAnimationFrame(() =>
      document.getElementById('record-inspector')?.focus({ preventScroll: false }),
    );
  }

  return (
    <>
      <a className="skip-link" href="#workspace">
        Skip to investigation
      </a>
      <div className="app-topbar">
        {data && draft && !loading && !loadFailed ? (
          <CaseHeader
            data={data}
            mode={draft.mode}
            onModeChange={requestMode}
            onBrief={() => setBrief(true)}
            onAbout={() => setAbout(true)}
          />
        ) : (
          <div className="loading-brand">
            <Icon name="case" size={18} /> COS40005 investigation workspace
          </div>
        )}
      </div>
      <main id="workspace" className="app-shell" tabIndex={-1}>
        {loading ? (
          <div className="page-state">
            <Icon name="record" size={28} />
            <h1>Opening the workspace</h1>
            <p role="status">Loading synthetic case records...</p>
          </div>
        ) : loadFailed ? (
          <div className="page-state">
            <h1>Case unavailable</h1>
            <p role="alert">
              Could not load the demonstration case. No substitute data has been shown.
            </p>
            <button type="button" className="primary-button" onClick={retry}>
              Try again
            </button>
          </div>
        ) : data && draft ? (
          <>
            <div className="workspace-toolbar">
              <div>
                <span className="badge badge-neutral">Frontend demo</span>
                <p>
                  {draft.mode === 'combined'
                    ? 'Inspect evidence, review advice, make your decision.'
                    : draft.mode === 'human'
                      ? 'Investigate independently using the source records.'
                      : 'Inspect the fixed automated assessment without analyst edits.'}
                </p>
              </div>
              <span className="connection-state">
                <span className="small-dot" />
                Demo: activity recording unavailable
              </span>
              {draft.mode === 'ai' && (
                <span className="save-status" role="status">
                  Read-only demo output
                </span>
              )}
            </div>
            {notice && (
              <div
                className={`notice notice-${notice.kind}`}
                role={notice.kind === 'error' ? 'alert' : undefined}
                aria-live={notice.kind === 'info' ? 'polite' : undefined}
              >
                {notice.text}
              </div>
            )}
            <div className={`workbench mode-${draft.mode}`}>
              <EvidencePanel
                records={data.evidence}
                activeId={activeId}
                onOpen={openRecord}
                selectedEvidenceIds={draft.evidenceIds}
                onSelectionChange={(ids) => edit({ ...draft, evidenceIds: ids })}
                readOnly={draft.mode === 'ai' || draft.status === 'finalised'}
              />
              <section className="decision-pane" aria-label="Investigation decisions">
                <div className="decision-scroll">
                  {draft.mode === 'combined' && (
                    <AdvicePanel
                      data={data}
                      draft={draft}
                      onInspect={inspect}
                      onReview={handleReview}
                      onAdd={add}
                    />
                  )}
                  {draft.mode === 'ai' ? (
                    <AutomatedOutput data={data} onInspect={inspect} />
                  ) : (
                    <FindingsPanel
                      saveStatus={saveStatus}
                      dirty={dirty}
                      data={data}
                      draft={draft}
                      onChange={edit}
                    />
                  )}
                </div>
                {draft.mode !== 'ai' && (
                  <FindingsActions
                    locked={draft.status === 'finalised'}
                    onSave={() => persist()}
                    onFinalise={requestFinalisation}
                    onNewDraft={requestNewDraft}
                  />
                )}
              </section>
            </div>
            <footer className="workspace-footer">
              <span>
                <Icon name="shield" size={14} />
                Synthetic records. Inert indicators. No live investigation.
              </span>
              <span>Mode switching is for demonstration, not experimental trials.</span>
            </footer>
          </>
        ) : null}
      </main>
      {data && (
        <Modal open={brief} onOpenChange={setBrief} title="Case brief" description={data.summary}>
          <dl className="brief-details">
            <div>
              <dt>Case</dt>
              <dd>{data.title}</dd>
            </div>
            <div>
              <dt>Incident type</dt>
              <dd>{data.category}</dd>
            </div>
            <div>
              <dt>Version</dt>
              <dd>{data.version}</dd>
            </div>
            <div>
              <dt>Data</dt>
              <dd>Synthetic records for the frontend demonstration</dd>
            </div>
          </dl>
          <p className="brief-note">
            Inspect the original records and explain what the evidence supports. Advice is fixed
            demonstration text. Drafts stay in this browser; no activity or findings are sent to a
            server.
          </p>
        </Modal>
      )}
      <Modal
        open={about}
        onOpenChange={setAbout}
        title="About this frontend demo"
        description="A COS40005 interface increment for team review."
      >
        <div className="about-copy">
          <p>
            Explore one synthetic case in human-only, AI-only and human plus AI modes. All AI advice
            is fixed demonstration text.
          </p>
          <p>
            Drafts are stored only in this browser. Clearing site data removes them. This frontend
            does not connect to an AI service, collect participant telemetry or submit reports.
          </p>
          <p>
            Phi's backend will provide actual case loading, persistence, mode enforcement and model
            integration after the team agrees the contract.
          </p>
        </div>
        <div className="modal-actions">
          <button type="button" className="primary-button" onClick={() => setAbout(false)}>
            Back to workspace
          </button>
        </div>
      </Modal>
      <Modal
        open={pendingMode !== null}
        onOpenChange={(open) => {
          if (!open) cancelModeChange();
        }}
        title="Unsaved changes"
        description="Your current draft has unsaved changes. Each workflow mode has its own saved browser draft."
      >
        {notice?.kind === 'error' && (
          <p className="notice notice-error" role="alert">
            {notice.text}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="text-button" onClick={cancelModeChange}>
            Keep working
          </button>
          <button type="button" className="secondary-button" onClick={discardAndSwitch}>
            Discard and switch
          </button>
          <button type="button" className="primary-button" onClick={saveAndSwitch}>
            Save and switch
          </button>
        </div>
      </Modal>
      <Modal
        open={finalConfirmation}
        onOpenChange={(open) => {
          if (!open) cancelFinalisation();
        }}
        title="Finalise your findings?"
        description="This saves a read-only copy in this browser. Nothing is submitted to a server. Review your reasoning and supporting records before confirming."
      >
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={cancelFinalisation}>
            Keep editing
          </button>
          <button type="button" className="primary-button" onClick={confirmFinalisation}>
            Confirm finalisation
          </button>
        </div>
      </Modal>
      <Modal
        open={newDraftConfirmation}
        onOpenChange={(open) => {
          if (!open) cancelNewDraft();
        }}
        title="Start a new draft?"
        description="This opens a blank draft. Your finalised copy stays saved until you save again, which replaces the local copy."
      >
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={cancelNewDraft}>
            Keep finalised copy
          </button>
          <button type="button" className="primary-button" onClick={createBlankDraft}>
            Create blank draft
          </button>
        </div>
      </Modal>
    </>
  );
}
