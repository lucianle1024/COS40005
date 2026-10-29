import { compile } from 'json-schema-to-typescript';
import { readFile, writeFile } from 'node:fs/promises';

const schema = JSON.parse(
  await readFile(new URL('../contracts/workbench.schema.json', import.meta.url), 'utf8'),
);
const output = new URL('../src/api/generated.ts', import.meta.url);
const types = await compile(schema, 'InvestigationCase', {
  bannerComment:
    '/* Generated from contracts/workbench.schema.json. Run npm run generate:types; do not hand-edit. */',
  style: { singleQuote: true, semi: true },
});
if (process.argv.includes('--check')) {
  if ((await readFile(output, 'utf8').catch(() => '')) !== types) {
    console.error('Generated types are stale. Run npm run generate:types.');
    process.exitCode = 1;
  } else console.log('Generated types match the case schema.');
} else {
  await writeFile(output, types);
  console.log('Generated src/api/generated.ts from the local schema.');
}
