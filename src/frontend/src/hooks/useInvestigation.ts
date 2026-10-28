import { useEffect, useState } from 'react';
import type { InvestigationCase } from '../api/generated';
import { loadDraft, saveDraft } from '../storage/local-drafts';
import {
  addAdviceToDraft,
  createDraft,
  finaliseDraft,
  reviewAdvice,
  validateFindings,
} from '../state/investigation';
import type { InvestigationDraft, ReviewDecision, WorkflowMode } from '../state/investigation';

export type CaseLoader = () => Promise<InvestigationCase>;
type Notice = { kind: 'error' | 'info'; text: string } | null;

export function useInvestigation(loadCase: CaseLoader) {
  const [data, setData] = useState<InvestigationCase | null>(null);
  const [draft, setDraft] = useState<InvestigationDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [activeId, setActiveId] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Not saved');
  const [notice, setNotice] = useState<Notice>(null);
  const [pendingMode, setPendingMode] = useState<WorkflowMode | null>(null);
  const [finalConfirmation, setFinalConfirmation] = useState(false);
  const [newDraftConfirmation, setNewDraftConfirmation] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadFailed(false);
    loadCase()
      .then((result) => {
        if (cancelled) return;
        const saved = loadDraft(result, 'combined');
        setData(result);
        setDraft(saved.ok && saved.value ? saved.value : createDraft(result, 'combined'));
        setActiveId(result.evidence[0]?.id ?? '');
        setDirty(false);
        setSaveStatus(
          saved.ok && saved.value
            ? saved.value.status === 'finalised'
              ? 'Finalised in this browser'
              : 'Saved in this browser'
            : 'Not saved',
        );
        setNotice(saved.ok ? null : { kind: 'error', text: saved.error });
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadCase, attempt]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function edit(next: InvestigationDraft) {
    if (!draft || draft.mode === 'ai' || draft.status === 'finalised') return;
    setDraft(next);
    setDirty(true);
    setSaveStatus('Unsaved changes');
    setNotice(null);
  }
  function persist(next = draft): boolean {
    if (!data || !next) return false;
    const result = saveDraft(data, next.mode, next);
    if (!result.ok) {
      setNotice({ kind: 'error', text: result.error });
      return false;
    }
    setDraft(result.value);
    setDirty(false);
    setNotice(null);
    setSaveStatus(
      next.status === 'finalised' ? 'Finalised in this browser' : 'Saved in this browser',
    );
    return true;
  }
  function switchMode(mode: WorkflowMode) {
    if (!data) return;
    const saved = loadDraft(data, mode);
    setDraft(saved.ok && saved.value ? saved.value : createDraft(data, mode));
    setDirty(false);
    setPendingMode(null);
    setSaveStatus(
      mode === 'ai'
        ? 'Read-only demo output'
        : saved.ok && saved.value
          ? saved.value.status === 'finalised'
            ? 'Finalised in this browser'
            : 'Saved in this browser'
          : 'Not saved',
    );
    setNotice(saved.ok ? null : { kind: 'error', text: saved.error });
  }
  function requestMode(mode: WorkflowMode) {
    if (!draft || mode === draft.mode) return;
    if (dirty) setPendingMode(mode);
    else switchMode(mode);
  }
  function handleReview(id: string, decision: ReviewDecision, revision = '') {
    if (!draft) return;
    try {
      edit(reviewAdvice(draft, id, decision, revision));
    } catch (error) {
      setNotice({ kind: 'error', text: (error as Error).message });
    }
  }
  function add(id: string) {
    if (!draft || !data) return;
    try {
      edit(addAdviceToDraft(draft, data, id));
      setNotice({
        kind: 'info',
        text:
          id +
          ' added to Your findings. Text and available source IDs were copied. Your assessment is unchanged; review the citations yourself.',
      });
    } catch (error) {
      setNotice({ kind: 'error', text: (error as Error).message });
    }
  }
  function requestFinalisation() {
    if (!draft || !data) return;
    const errors = validateFindings(draft, data);
    if (errors.length) {
      setNotice({ kind: 'error', text: errors.join(' ') });
      return;
    }
    setNotice(null);
    setFinalConfirmation(true);
  }
  function confirmFinalisation() {
    if (!draft || !data) return;
    try {
      persist(finaliseDraft(draft, data));
    } catch (error) {
      setNotice({ kind: 'error', text: (error as Error).message });
    }
    setFinalConfirmation(false);
  }

  function saveAndSwitch() {
    if (pendingMode && persist()) switchMode(pendingMode);
  }
  function discardAndSwitch() {
    if (pendingMode) switchMode(pendingMode);
  }
  function createBlankDraft() {
    if (data && draft) {
      setDraft(createDraft(data, draft.mode));
      setDirty(true);
      setSaveStatus('Unsaved changes');
      setNotice(null);
    }
    setNewDraftConfirmation(false);
  }
  return {
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
    handleReview,
    add,
    requestFinalisation,
    confirmFinalisation,
    saveAndSwitch,
    discardAndSwitch,
    createBlankDraft,
    openRecord: (id: string) => setActiveId(id),
    retry: () => setAttempt((value) => value + 1),
    cancelModeChange: () => setPendingMode(null),
    cancelFinalisation: () => setFinalConfirmation(false),
    requestNewDraft: () => setNewDraftConfirmation(true),
    cancelNewDraft: () => setNewDraftConfirmation(false),
  };
}
