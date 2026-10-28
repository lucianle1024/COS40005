import { describe, expect, it } from 'vitest';
import { loadDemoCase } from '../api/demo-provider';
import { loadDraft, saveDraft } from './local-drafts';
import { createDraft } from '../state/investigation';

describe('browser-only drafts', () => {
  it('rejects array values that coerce to valid enum strings', async () => {
    const data = await loadDemoCase('case-01');
    const draft = createDraft(data, 'combined');
    for (const malformed of [
      { ...draft, classification: ['benign'] },
      { ...draft, status: ['finalised'] },
      { ...draft, reviews: { A01: { decision: ['accept'], revision: '' } } },
    ]) {
      const storage = { getItem: () => JSON.stringify(malformed) } as unknown as Storage;
      expect(loadDraft(data, 'combined', storage)).toMatchObject({ ok: false });
    }
  });
  it('saves and reopens the current case draft', async () => {
    const data = await loadDemoCase('case-01');
    const draft = createDraft(data, 'combined');
    draft.reasoning = 'My reasoning';
    expect(saveDraft(data, 'combined', draft).ok).toBe(true);
    expect(loadDraft(data, 'combined')).toMatchObject({
      ok: true,
      value: { reasoning: 'My reasoning' },
    });
  });
  it('separates case versions and workflow modes', async () => {
    const data = await loadDemoCase('case-01');
    const draft = createDraft(data, 'combined');
    draft.reasoning = 'Combined only';
    saveDraft(data, 'combined', draft);
    expect(loadDraft(data, 'human')).toEqual({ ok: true, value: null });
    expect(loadDraft({ ...data, version: '0.2' }, 'combined')).toEqual({ ok: true, value: null });
    expect(loadDraft({ ...data, id: 'case-02' }, 'combined')).toEqual({ ok: true, value: null });
  });
  it('returns a failed write without changing the current draft', async () => {
    const data = await loadDemoCase('case-01');
    const draft = createDraft(data, 'combined');
    draft.reasoning = 'Keep this';
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException('Quota full');
      },
    } as unknown as Storage;
    expect(saveDraft(data, 'combined', draft, storage)).toMatchObject({ ok: false });
    expect(draft.reasoning).toBe('Keep this');
  });
  it('reports blocked storage reads instead of treating them as no saved draft', async () => {
    const data = await loadDemoCase('case-01');
    const storage = {
      getItem: () => {
        throw new DOMException('Blocked');
      },
    } as unknown as Storage;
    expect(loadDraft(data, 'combined', storage)).toMatchObject({ ok: false });
  });
  it('rejects corrupt, foreign or invalid saved content', async () => {
    const data = await loadDemoCase('case-01');
    const draft = createDraft(data, 'combined');
    for (const content of [
      '{broken',
      JSON.stringify({ ...draft, caseId: 'other' }),
      JSON.stringify({ ...draft, evidenceIds: ['E99'] }),
      JSON.stringify({ ...draft, reviews: { A99: { decision: 'accept', revision: '' } } }),
      JSON.stringify({ ...draft, status: 'finalised', finalisedAt: 'yesterday' }),
    ]) {
      const storage = { getItem: () => content } as unknown as Storage;
      expect(loadDraft(data, 'combined', storage)).toMatchObject({ ok: false });
    }
  });
  it('refuses mismatched or AI-only saves', async () => {
    const data = await loadDemoCase('case-01');
    expect(saveDraft(data, 'human', createDraft(data, 'combined')).ok).toBe(false);
    expect(saveDraft(data, 'ai', createDraft(data, 'ai')).ok).toBe(false);
  });
});
