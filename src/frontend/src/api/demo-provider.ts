import fixture from '../fixtures/phishing-case.json';
import type { InvestigationCase } from './generated';
import { validateCase } from './case-validator';

export async function loadDemoCase(caseId: string): Promise<InvestigationCase> {
  if (caseId !== fixture.id) throw new Error('Demo case not found.');
  return validateCase(fixture);
}
