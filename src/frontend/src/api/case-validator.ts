import Ajv from 'ajv';
import schema from '../../contracts/workbench.schema.json';
import type { AdviceItem, InvestigationCase } from './generated';

const validator = new Ajv({ allErrors: true });
const check = validator.compile<InvestigationCase>(schema);
const checkAdvice = validator.compile<AdviceItem[]>({
  type: 'array',
  items: { $ref: '#/definitions/AdviceItem' },
  definitions: schema.definitions,
});

export function validateAdvice(input: unknown): AdviceItem[] {
  if (!checkAdvice(input) || new Set(input.map((item) => item.id)).size !== input.length) {
    throw new Error('Invalid advice from the session API.');
  }
  return input;
}

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
