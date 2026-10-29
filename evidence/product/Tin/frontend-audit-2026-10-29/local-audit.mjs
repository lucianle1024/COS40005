import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(process.argv[2]);
const lock = JSON.parse(await readFile(join(root, 'package-lock.json'), 'utf8'));
const packages = Object.entries(lock.packages).filter(([name]) => name !== '');
const secretPatterns = [
  /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/,
  /gh[pousr]_[A-Za-z0-9]{30,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/,
];
let filesScanned = 0;
const matchingFiles = [];
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await scan(path);
    else {
      filesScanned++;
      const text = await readFile(path, 'utf8');
      if (secretPatterns.some((pattern) => pattern.test(text))) matchingFiles.push(path);
    }
  }
}
for (const folder of ['src', 'scripts', 'contracts']) await scan(join(root, folder));
const { createServer } = await import(pathToFileURL(join(root, 'node_modules/vite/dist/node/index.js')).href);
const server = await createServer({
  configFile: false,
  root,
  server: { middlewareMode: true, watch: null },
  appType: 'custom',
});
try {
  const { loadDemoCase } = await server.ssrLoadModule('/src/api/demo-provider.ts');
  const { validateCase } = await server.ssrLoadModule('/src/api/case-validator.ts');
  const timestamps = [];
  for (const timestamp of ['2026-99-99T99:99:99Z', '2026-02-31T09:12:04Z']) {
    const data = await loadDemoCase('case-01');
    data.evidence[0].timestamp = timestamp;
    let accepted = false;
    try { validateCase(data); accepted = true; } catch {}
    const parsed = Date.parse(timestamp);
    timestamps.push({ timestamp, accepted, parsed: Number.isNaN(parsed) ? 'NaN' : new Date(parsed).toISOString() });
  }
  const result = {
    lock: {
      version: lock.lockfileVersion,
      packages: packages.length,
      missingIntegrity: packages.filter(([, value]) => !value.integrity).length,
      nonHttpsRegistryUrls: packages.filter(([, value]) => value.resolved && !value.resolved.startsWith('https://registry.npmjs.org/')).length,
    },
    secretScan: { filesScanned, matchingFiles, scope: 'Current frontend src, scripts and contracts only; not history or a CVE scan.' },
    timestamps,
  };
  const json = JSON.stringify(result, null, 2);
  if (process.argv[3]) await writeFile(process.argv[3], json + '\n');
  console.log(json);
} finally {
  await server.close();
}
