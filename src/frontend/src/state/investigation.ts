import type { InvestigationCase } from '../api/generated';
export type WorkflowMode = 'human' | 'ai' | 'combined';
export type ReviewDecision = 'accept' | 'revise' | 'reject';
export interface InvestigationDraft {
  schemaVersion: 1;
  caseId: string;
  caseVersion: string;
  mode: WorkflowMode;
  classification: 'undetermined' | 'benign' | 'suspicious' | 'malicious';
  reasoning: string;
  evidenceIds: string[];
  reviews: Record<string, { decision: ReviewDecision; revision: string }>;
  status: 'draft' | 'finalised';
  finalisedAt?: string;
}
export function createDraft(data: InvestigationCase, mode: WorkflowMode): InvestigationDraft {
  return {
    schemaVersion: 1,
    caseId: data.id,
    caseVersion: data.version,
    mode,
    classification: 'undetermined',
    reasoning: '',
    evidenceIds: [],
    reviews: {},
    status: 'draft',
  };
}

function assertEditable(draft: InvestigationDraft) {
  if (draft.status === 'finalised')
    throw new Error('Finalised findings are read-only. Start a new draft to edit.');
  if (draft.mode === 'ai') throw new Error('AI-only output is read-only.');
}

export function reviewAdvice(
  draft: InvestigationDraft,
  id: string,
  decision: ReviewDecision,
  revision = '',
): InvestigationDraft {
  assertEditable(draft);
  if (draft.mode !== 'combined') throw new Error('Review is available in combined mode only.');
  return { ...draft, reviews: { ...draft.reviews, [id]: { decision, revision } } };
}

export function addAdviceToDraft(
  draft: InvestigationDraft,
  data: InvestigationCase,
  id: string,
): InvestigationDraft {
  assertEditable(draft);
  if (draft.mode !== 'combined') throw new Error('AI advice is available in combined mode only.');
  const advice = data.advice.find((item) => item.id === id);
  if (!advice) throw new Error('Advice item not found.');
  const review = draft.reviews[id];
  if (review?.decision === 'reject')
    throw new Error('Rejected advice cannot be added to findings.');
  const text = review?.decision === 'revise' ? review.revision.trim() : advice.rationale;
  if (!text.trim()) throw new Error('Write your revision before adding it to findings.');
  const existingIds = new Set(data.evidence.map((item) => item.id));
  return {
    ...draft,
    reasoning: [draft.reasoning, text].filter(Boolean).join('\n\n'),
    evidenceIds: [
      ...new Set([
        ...draft.evidenceIds,
        ...advice.evidenceIds.filter((source) => existingIds.has(source)),
      ]),
    ],
  };
}

export function validateFindings(draft: InvestigationDraft, data: InvestigationCase): string[] {
  const errors: string[] = [];
  if (draft.mode === 'ai') errors.push('AI-only output cannot be finalised as analyst findings.');
  if (!draft.reasoning.trim()) errors.push('Add your reasoning before finalising.');
  if (draft.evidenceIds.length === 0) errors.push('Select at least one supporting record.');
  if (draft.evidenceIds.some((id) => !data.evidence.some((record) => record.id === id)))
    errors.push('A supporting record is unavailable. Review your selections.');
  return errors;
}

export function finaliseDraft(
  draft: InvestigationDraft,
  data: InvestigationCase,
): InvestigationDraft {
  assertEditable(draft);
  const errors = validateFindings(draft, data);
  if (errors.length) throw new Error(errors.join(' '));
  return { ...structuredClone(draft), status: 'finalised', finalisedAt: new Date().toISOString() };
}
