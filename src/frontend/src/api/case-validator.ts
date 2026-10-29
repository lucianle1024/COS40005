import Ajv from 'ajv';
import schema from '../../contracts/workbench.schema.json';
import type { InvestigationCase } from './generated';

const check = new Ajv({ allErrors: true }).compile<InvestigationCase>(schema);

export function validateCase(input: unknown): InvestigationCase {
  if (!check(input)) throw new Error('Invalid case data. Check the case schema.');
  for (const record of input.evidence) {
    const timestamp = Date.parse(record.timestamp);
    if (
      !Number.isFinite(timestamp) ||
      new Date(timestamp).toISOString() !== record.timestamp.replace('Z', '.000Z')
    ) {
      throw new Error('Invalid evidence timestamp. Use a real UTC date and time.');
    }
  }
  for (const collection of [input.evidence, input.advice]) {
    if (new Set(collection.map((item) => item.id)).size !== collection.length) {
      throw new Error('Duplicate record or advice IDs in case data.');
    }
  }
  // Missing references stay unresolved so the UI can disclose them honestly.
  return structuredClone(input);
}
