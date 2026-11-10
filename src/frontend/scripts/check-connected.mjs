import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.SOC_TEST_FRONTEND ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch({
  executablePath: process.env.SOC_TEST_CHROME || undefined,
});
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 650 } });
  const first = await context.newPage();
  await first.goto(baseUrl);
  await first.getByRole('link', { name: 'Human only', exact: true }).click();
  await first.getByText('350 records', { exact: true }).waitFor();

  const records = first.getByRole('region', { name: 'Evidence records' });
  const layout = await records.evaluate((list) => {
    list.scrollTop = list.scrollHeight;
    const inspector = document.getElementById('record-inspector').getBoundingClientRect();
    const panel = document.querySelector('.evidence-panel').getBoundingClientRect();
    return {
      scrolls: list.scrollTop > 0,
      inspectorAccessible: inspector.top < panel.bottom && inspector.bottom <= panel.bottom + 1,
    };
  });
  assert.deepEqual(layout, { scrolls: true, inspectorAccessible: true });
  await first.getByRole('button', { name: 'Next', exact: true }).click();
  await first.getByText('Page 2 of 7', { exact: true }).waitFor();

  const search = first.getByRole('searchbox', { name: 'Search evidence' });
  await search.fill('NO-MATCH-SCRUM-91');
  await first.getByText('No records match your filters.', { exact: true }).waitFor();
  await first.getByRole('combobox', { name: 'Record type' }).selectOption('Email');
  await first.getByRole('button', { name: 'Clear filters' }).click();
  await first.getByText('Page 1 of 7', { exact: true }).waitFor();
  await search.fill('EVENT-39');
  await first.getByRole('button', { name: /^EVENT-39 Windows Event/ }).click();
  await first
    .getByRole('button', { name: 'Cite EVENT-39 as supporting evidence', exact: true })
    .click();
  const original = first.getByRole('region', { name: 'Original record' });
  await original.getByRole('heading', { name: 'Windows Event 7' }).waitFor();
  assert.match(
    await original.getByRole('region', { name: 'Raw text for EVENT-39' }).textContent(),
    /\b7\b/,
  );
  const reasoning = first.getByRole('textbox', { name: 'Your reasoning' });
  await reasoning.fill('Initial Case 1 draft');
  await first.getByRole('button', { name: 'Save draft' }).click();
  await first.getByText('Saved on server', { exact: true }).waitFor();

  // Keep the intercepted request pending to exercise the client's timeout.
  await first.route('**/sessions/*/draft', () => {});
  await reasoning.fill('Keep this text after a failed save');
  await first.getByRole('button', { name: 'Save draft' }).click();
  await first.getByRole('alert').filter({ hasText: 'session request timed out' }).waitFor();
  assert.equal(await reasoning.inputValue(), 'Keep this text after a failed save');
  await first.unroute('**/sessions/*/draft');

  const attempt = await first.evaluate(() => Object.entries(sessionStorage));
  const second = await context.newPage();
  await second.addInitScript((entries) => {
    for (const [key, value] of entries) sessionStorage.setItem(key, value);
  }, attempt);
  await second.goto(first.url());
  const otherReasoning = second.getByRole('textbox', { name: 'Your reasoning' });
  await otherReasoning.fill('Submitted from the other tab');
  await second.getByRole('button', { name: 'Finalise findings' }).click();
  await second.getByRole('button', { name: 'Confirm finalisation' }).click();
  await second.getByText('Finalised on server', { exact: true }).waitFor();

  await first.getByRole('button', { name: 'Save draft' }).click();
  await first
    .getByRole('alert')
    .filter({ hasText: 'The session has changed on the server' })
    .waitFor();
  assert.equal(await reasoning.inputValue(), 'Keep this text after a failed save');
  assert.equal(await reasoning.isEnabled(), true);

  await second.reload();
  await second.getByText('Finalised on server', { exact: true }).waitFor();
  assert.equal(await otherReasoning.inputValue(), 'Submitted from the other tab');
  assert.equal(await otherReasoning.isEnabled(), false);

  await first.getByRole('button', { name: 'Case brief' }).click();
  await first
    .getByRole('dialog')
    .getByText(/saved to the session API in SQLite/)
    .waitFor();
  const retry = await context.newPage();
  let unavailable = true;
  let release;
  const blocked = new Promise((resolve) => {
    release = resolve;
  });
  await retry.route('**/sessions/case-01', async (route) => {
    if (!unavailable) return route.continue();
    await blocked;
    return route.abort();
  });
  await retry.goto(baseUrl + '/?case=case_01&mode=A');
  await retry.getByRole('heading', { name: 'Opening the workspace' }).waitFor();
  release();
  await retry.getByRole('heading', { name: 'Case unavailable' }).waitFor();
  unavailable = false;
  await retry.getByRole('button', { name: 'Try again' }).click();
  await retry.getByText('350 records', { exact: true }).waitFor();
  const combined = await context.newPage();
  await combined.goto(baseUrl);
  await combined.route('**/sessions/*/advice', (route) => route.abort());
  await combined.getByRole('link', { name: 'Human + AI', exact: true }).click();
  await combined.getByRole('heading', { name: 'Case unavailable' }).waitFor();
  await combined.unroute('**/sessions/*/advice');
  await combined.getByRole('button', { name: 'Try again' }).click();

  const advice = combined.getByRole('region', { name: 'AI advice' });
  await advice.getByText(/Fixed-rule advice/).waitFor();
  const claims = advice.getByRole('article');
  assert.equal(await claims.count(), 2);
  for (const claim of await claims.all()) {
    for (const source of await claim
      .getByRole('button', { name: /^Inspect source EVENT-/ })
      .all()) {
      const id = (await source.getAttribute('aria-label')).replace('Inspect source ', '');
      await source.click();
      await combined.getByRole('region', { name: 'Raw text for ' + id, exact: true }).waitFor();
    }
  }
  const registry = advice.getByRole('article', { name: 'Review the registry references' });
  await registry.getByRole('button', { name: 'Reject', exact: true }).click();
  assert.equal(await registry.getByRole('button', { name: 'Add to findings' }).count(), 0);
  await registry.getByRole('button', { name: 'Accept', exact: true }).click();
  assert.equal(await combined.getByRole('textbox', { name: 'Your reasoning' }).inputValue(), '');
  await registry.getByRole('button', { name: 'Revise', exact: true }).click();
  await firewall
    .getByRole('textbox', { name: 'Your revision for registry' })
    .fill('Checked registry evidence.');
  await registry.getByRole('button', { name: 'Add to findings' }).click();
  await combined.getByRole('button', { name: 'Save draft' }).click();
  await combined.locator('.save-status').getByText('Saved on server', { exact: true }).waitFor();
  assert.equal(
    await firewall
      .getByRole('button', { name: 'Revise', exact: true })
      .getAttribute('aria-pressed'),
    'true',
  );
  await combined.getByRole('button', { name: 'Finalise findings' }).click();
  await combined.getByRole('button', { name: 'Confirm finalisation' }).click();
  await combined.getByText('Final report locked', { exact: true }).waitFor();
  await combined.reload();
  assert.equal(
    await combined.getByRole('textbox', { name: 'Your reasoning' }).inputValue(),
    'Checked registry evidence.',
  );
  assert.equal(
    await registry.getByRole('button', { name: 'Accept', exact: true }).isEnabled(),
    false,
  );

  console.log(
    'Connected browser flow passed, including Mode C advice, evidence links, retry, review, saving, two-tab conflict and reload.',
  );
} finally {
  await browser.close();
}
