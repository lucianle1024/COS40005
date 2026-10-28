import type { InvestigationCase } from '../api/generated';
import type { InvestigationDraft, WorkflowMode } from '../state/investigation';
import { validateFindings } from '../state/investigation';
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function key(data: InvestigationCase, mode: WorkflowMode) {
  return `cos40005.demo.v1:${encodeURIComponent(data.id)}:${encodeURIComponent(data.version)}:${mode}`;
}
function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function valid(
  value: unknown,
  data: InvestigationCase,
  mode: WorkflowMode,
): value is InvestigationDraft {
  if (
    !object(value) ||
    mode === 'ai' ||
    value.schemaVersion !== 1 ||
    value.caseId !== data.id ||
    value.caseVersion !== data.version ||
    value.mode !== mode
  )
    return false;
  if (
    typeof value.classification !== 'string' ||
    !['undetermined', 'benign', 'suspicious', 'malicious'].includes(value.classification) ||
    typeof value.reasoning !== 'string' ||
    typeof value.status !== 'string' ||
    !['draft', 'finalised'].includes(value.status)
  )
    return false;
  if (
    !Array.isArray(value.evidenceIds) ||
    new Set(value.evidenceIds).size !== value.evidenceIds.length ||
    !value.evidenceIds.every(
      (id) => typeof id === 'string' && data.evidence.some((record) => record.id === id),
    )
  )
    return false;
  if (!object(value.reviews) || (mode !== 'combined' && Object.keys(value.reviews).length > 0))
    return false;
  if (
    !Object.entries(value.reviews).every(
      ([id, review]) =>
        data.advice.some((advice) => advice.id === id) &&
        object(review) &&
        typeof review.decision === 'string' &&
        ['accept', 'revise', 'reject'].includes(review.decision) &&
        typeof review.revision === 'string',
    )
  )
    return false;
  if (value.status === 'finalised') {
    if (
      typeof value.finalisedAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T/.test(value.finalisedAt) ||
      !Number.isFinite(Date.parse(value.finalisedAt))
    )
      return false;
    if (validateFindings(value as unknown as InvestigationDraft, data).length > 0) return false;
  } else if (value.finalisedAt !== undefined) return false;
  return true;
}

export function saveDraft(
  data: InvestigationCase,
  mode: WorkflowMode,
  draft: InvestigationDraft,
  storage?: Storage,
): Result<InvestigationDraft> {
  if (!valid(draft, data, mode))
    return { ok: false, error: 'This draft cannot be saved for the current case and mode.' };
  try {
    (storage ?? window.localStorage).setItem(key(data, mode), JSON.stringify(draft));
    return { ok: true, value: structuredClone(draft) };
  } catch {
    return {
      ok: false,
      error:
        'Could not save in this browser. Your current work is still here; check browser storage permissions or available space.',
    };
  }
}

export function loadDraft(
  data: InvestigationCase,
  mode: WorkflowMode,
  storage?: Storage,
): Result<InvestigationDraft | null> {
  if (mode === 'ai') return { ok: true, value: null };
  try {
    const text = (storage ?? window.localStorage).getItem(key(data, mode));
    if (text === null) return { ok: true, value: null };
    const parsed: unknown = JSON.parse(text);
    if (!valid(parsed, data, mode))
      return {
        ok: false,
        error:
          'The saved draft is unreadable or does not match this case version. It has not been overwritten.',
      };
    return { ok: true, value: parsed };
  } catch {
    return {
      ok: false,
      error:
        'Could not open a saved browser draft. Storage may be blocked or the saved data may be corrupt. It has not been overwritten.',
    };
  }
}
