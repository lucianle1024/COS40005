import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useInvestigation } from './useInvestigation';
import type { CaseLoader } from './useInvestigation';
import type { InvestigationCase } from '../api/generated';
import { loadDemoCase } from '../api/demo-provider';
import { loadDraft } from '../storage/local-drafts';

const loader = () => loadDemoCase('case-01');
async function open() {
  const view = renderHook(() => useInvestigation(loader));
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  return view;
}

describe('investigation coordination', () => {
  it('ignores an older case load that completes after a replacement loader', async () => {
    let resolveFirst!: (value: InvestigationCase) => void;
    const first: CaseLoader = () =>
      new Promise((resolve) => {
        resolveFirst = resolve;
      });
    const secondCase = { ...(await loader()), id: 'case-new' };
    const second: CaseLoader = async () => secondCase;
    const { result, rerender } = renderHook(({ loadCase }) => useInvestigation(loadCase), {
      initialProps: { loadCase: first },
    });
    rerender({ loadCase: second });
    await waitFor(() => expect(result.current.data?.id).toBe('case-new'));
    await act(async () => resolveFirst(await loader()));
    expect(result.current.data?.id).toBe('case-new');
    expect(result.current.draft?.caseId).toBe('case-new');
  });

  it('keeps the pending mode and input when save-and-switch fails', async () => {
    const { result } = await open();
    act(() => result.current.edit({ ...result.current.draft!, reasoning: 'Keep this work.' }));
    act(() => result.current.requestMode('human'));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Blocked');
    });
    act(() => result.current.saveAndSwitch());
    expect(result.current.draft?.mode).toBe('combined');
    expect(result.current.pendingMode).toBe('human');
    expect(result.current.draft?.reasoning).toBe('Keep this work.');
    expect(result.current.dirty).toBe(true);
    expect(result.current.notice).toMatchObject({ kind: 'error' });
  });

  it('keeps findings editable when confirmed finalisation cannot be saved', async () => {
    const { result } = await open();
    act(() =>
      result.current.edit({
        ...result.current.draft!,
        reasoning: 'Evidence needs review.',
        evidenceIds: ['E01'],
      }),
    );
    act(() => result.current.requestFinalisation());
    expect(result.current.finalConfirmation).toBe(true);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Blocked');
    });
    act(() => result.current.confirmFinalisation());
    expect(result.current.draft?.status).toBe('draft');
    expect(result.current.finalConfirmation).toBe(false);
    expect(result.current.dirty).toBe(true);
    expect(result.current.saveStatus).toBe('Unsaved changes');
    expect(result.current.notice).toMatchObject({ kind: 'error' });
  });

  it('preserves the finalised saved copy until a new draft is explicitly saved', async () => {
    const { result } = await open();
    act(() =>
      result.current.edit({
        ...result.current.draft!,
        reasoning: 'Reviewed source record.',
        evidenceIds: ['E01'],
      }),
    );
    act(() => result.current.requestFinalisation());
    act(() => result.current.confirmFinalisation());
    expect(result.current.draft?.status).toBe('finalised');
    act(() => result.current.requestNewDraft());
    act(() => result.current.cancelNewDraft());
    expect(result.current.draft?.status).toBe('finalised');
    act(() => result.current.requestNewDraft());
    act(() => result.current.createBlankDraft());
    expect(result.current.draft).toMatchObject({ status: 'draft', reasoning: '', evidenceIds: [] });
    expect(result.current.dirty).toBe(true);
    expect(loadDraft(result.current.data!, 'combined')).toMatchObject({
      ok: true,
      value: { status: 'finalised' },
    });
    act(() => {
      result.current.persist();
    });
    expect(loadDraft(result.current.data!, 'combined')).toMatchObject({
      ok: true,
      value: { status: 'draft' },
    });
  });
});
