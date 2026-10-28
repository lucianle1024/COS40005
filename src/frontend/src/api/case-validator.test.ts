import { describe, expect, it } from 'vitest';
import fixture from '../fixtures/phishing-case.json';
import { validateCase } from './case-validator';

describe('case validation', () => {
  it('rejects impossible UTC dates and times while accepting real leap days', () => {
    for (const timestamp of [
      '2026-99-99T99:99:99Z',
      '2026-02-31T09:12:04Z',
      '2025-02-29T09:12:04Z',
      '2026-10-26T24:00:00Z',
    ]) {
      const input = structuredClone(fixture);
      input.evidence[0].timestamp = timestamp;
      expect(() => validateCase(input)).toThrow(/timestamp/i);
    }
    const input = structuredClone(fixture);
    input.evidence[0].timestamp = '2024-02-29T09:12:04Z';
    expect(validateCase(input).evidence[0].timestamp).toBe('2024-02-29T09:12:04Z');
  });
  it('rejects malformed or unlabelled case data', () => {
    expect(() => validateCase({ ...fixture, provenance: 'production' })).toThrow(/invalid/i);
    expect(() => validateCase({ ...fixture, evidence: [{ id: 'E01' }] })).toThrow(/invalid/i);
  });
  it('rejects duplicate evidence and advice IDs', () => {
    expect(() =>
      validateCase({ ...fixture, evidence: [fixture.evidence[0], fixture.evidence[0]] }),
    ).toThrow(/duplicate/i);
    expect(() =>
      validateCase({ ...fixture, advice: [fixture.advice[0], fixture.advice[0]] }),
    ).toThrow(/duplicate/i);
  });
  it('allows empty evidence so the workspace can render a real empty state', () => {
    expect(validateCase({ ...fixture, evidence: [], advice: [] }).evidence).toEqual([]);
  });
  it('preserves unresolved references for visible inspection, without fabricating records', () => {
    const result = validateCase({
      ...fixture,
      advice: [{ ...fixture.advice[0], evidenceIds: ['E99'] }],
    });
    expect(result.advice[0].evidenceIds).toEqual(['E99']);
    expect(result.evidence.some((record: { id: string }) => record.id === 'E99')).toBe(false);
  });
});
