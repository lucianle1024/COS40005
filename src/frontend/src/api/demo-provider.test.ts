import { describe, expect, it } from 'vitest';
import { loadDemoCase } from './demo-provider';

describe('demo case contract', () => {
  it('loads the synthetic case with stable evidence and source references', async () => {
    const result = await loadDemoCase('case-01');
    expect(result.provenance).toBe('synthetic');
    expect(result.evidence.map((record: { id: string }) => record.id)).toEqual([
      'E01',
      'E02',
      'E03',
      'E04',
    ]);
    expect(result.advice[0].evidenceIds).toEqual(['E01', 'E02']);
  });
  it('rejects unknown cases rather than pretending a case loaded', async () => {
    await expect(loadDemoCase('missing')).rejects.toThrow(/not found/i);
  });
  it('returns independent case objects so a caller cannot mutate later sessions', async () => {
    const first = await loadDemoCase('case-01');
    first.evidence[0].content = 'changed';
    expect((await loadDemoCase('case-01')).evidence[0].content).toContain('Authentication-Results');
  });
});
