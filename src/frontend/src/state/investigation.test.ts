import { describe, expect, it } from 'vitest';
import { loadDemoCase } from '../api/demo-provider';
import {
  addAdviceToDraft,
  createDraft,
  finaliseDraft,
  reviewAdvice,
  validateFindings,
} from './investigation';

describe('analyst control', () => {
  it('starts with no implied conclusion or selected supporting evidence', async () => {
    const data = await loadDemoCase('case-01');
    expect(createDraft(data, 'combined')).toMatchObject({
      classification: 'undetermined',
      reasoning: '',
      evidenceIds: [],
      reviews: {},
      status: 'draft',
    });
  });
  it('records advice review without copying text, selecting evidence or finalising', async () => {
    const data = await loadDemoCase('case-01');
    const draft = createDraft(data, 'combined');
    const reviewed = reviewAdvice(draft, 'A01', 'accept');
    expect(reviewed.reviews.A01.decision).toBe('accept');
    expect(reviewed.reasoning).toBe('');
    expect(reviewed.evidenceIds).toEqual([]);
    expect(reviewed.status).toBe('draft');
    expect(draft.reviews).toEqual({});
    expect(data.advice[0].rationale).toContain('failed email authentication');
  });
  it('adds revised text and only real source records after an explicit draft action', async () => {
    const data = await loadDemoCase('case-01');
    data.advice[0].evidenceIds.push('E99');
    let draft = createDraft(data, 'combined');
    draft = reviewAdvice(draft, 'A01', 'revise', 'Needs more evidence.');
    draft = addAdviceToDraft(draft, data, 'A01');
    expect(draft.reasoning).toBe('Needs more evidence.');
    expect(draft.evidenceIds).toEqual(['E01', 'E02']);
    expect(draft.classification).toBe('undetermined');
    expect(data.advice[0].rationale).not.toBe('Needs more evidence.');
  });
  it('does not let rejected or blank revised advice be added as findings', async () => {
    const data = await loadDemoCase('case-01');
    const draft = createDraft(data, 'combined');
    expect(() => addAdviceToDraft(reviewAdvice(draft, 'A01', 'reject'), data, 'A01')).toThrow(
      /rejected/i,
    );
    expect(() => addAdviceToDraft(reviewAdvice(draft, 'A01', 'revise'), data, 'A01')).toThrow(
      /revision/i,
    );
  });
  it('requires reasoning and real supporting evidence, without forcing a malicious conclusion', async () => {
    const data = await loadDemoCase('case-01');
    const draft = createDraft(data, 'human');
    expect(validateFindings(draft, data)).toHaveLength(2);
    draft.reasoning = 'The supplied records do not establish compromise.';
    draft.evidenceIds = ['E01'];
    expect(validateFindings(draft, data)).toEqual([]);
    draft.evidenceIds = ['E99'];
    expect(validateFindings(draft, data).length).toBeGreaterThan(0);
  });
  it('finalises only complete findings and preserves the original editable draft', async () => {
    const data = await loadDemoCase('case-01');
    const draft = createDraft(data, 'combined');
    expect(() => finaliseDraft(draft, data)).toThrow(/reasoning/i);
    draft.reasoning = 'More evidence is required.';
    draft.evidenceIds = ['E01'];
    const final = finaliseDraft(draft, data);
    expect(final.status).toBe('finalised');
    expect(final.finalisedAt).toMatch(/^\d{4}-/);
    expect(draft.status).toBe('draft');
    expect(() => reviewAdvice(final, 'A01', 'accept')).toThrow(/read.only/i);
  });
  it('prevents AI-only drafts and reviews from entering analyst findings', async () => {
    const data = await loadDemoCase('case-01');
    const draft = createDraft(data, 'ai');
    draft.reasoning = 'Edited';
    draft.evidenceIds = ['E01'];
    expect(() => finaliseDraft(draft, data)).toThrow(/ai.only/i);
    expect(() => reviewAdvice(createDraft(data, 'human'), 'A01', 'accept')).toThrow(/combined/i);
  });
});
