import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { loadDemoCase } from './api/demo-provider';
import type { InvestigationCase } from './api/generated';

async function open(loadCase?: () => Promise<InvestigationCase>) {
  const user = userEvent.setup();
  const view = render(<App loadCase={loadCase} />);
  await screen.findByRole('heading', { name: 'A suspicious invoice' });
  return { user, ...view };
}
describe('investigation workspace', () => {
  it('shows an explicit message for a desktop case without evidence', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    try {
      const data = await loadDemoCase('case-01');
      await open(async () => ({ ...data, evidence: [], advice: [] }));
      expect(screen.getByText('No evidence records are available for this case.')).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Show record list' })).not.toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it('keeps all four evidence records available in the navigator', async () => {
    const { user } = await open();
    expect(screen.getByRole('button', { name: /^E02 Proxy/ })).toBeVisible();
    await user.click(screen.getByRole('button', { name: /^E02 Proxy/ }));
    expect(screen.getByRole('region', { name: 'Original record' })).toHaveTextContent(
      'Proxy activity',
    );
  });
  it('renders raw log markup literally instead of interpreting it as HTML', async () => {
    const data = await loadDemoCase('case-01');
    data.evidence[0].content =
      'From: Accounts <billing@invoice-check.example>\n<img src=x onerror="alert(1)">';
    await open(async () => data);
    const record = screen.getByRole('region', { name: 'Original record' });
    expect(record).toHaveTextContent('<billing@invoice-check.example>');
    expect(record).toHaveTextContent('<img src=x onerror="alert(1)">');
    expect(record.querySelector('img')).toBeNull();
  });
  it('opens the case brief without changing the analyst draft', async () => {
    const { user } = await open();
    await user.type(screen.getByRole('textbox', { name: 'Your reasoning' }), 'Keep my draft.');
    await user.click(screen.getByRole('button', { name: 'Case brief' }));
    expect(screen.getByRole('dialog', { name: 'Case brief' })).toHaveTextContent(
      'Synthetic records',
    );
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Case brief' })).toHaveFocus();
    expect(screen.getByRole('textbox', { name: 'Your reasoning' })).toHaveValue('Keep my draft.');
  });
  it('keeps citation actions in the list and original record synchronized', async () => {
    const { user } = await open();
    const inspector = screen.getByRole('region', { name: 'Original record' });
    await user.click(
      within(inspector).getByRole('button', { name: 'Cite E01 as supporting evidence' }),
    );
    expect(screen.getAllByRole('button', { name: 'Cited E01: remove citation' })).toHaveLength(2);
    await user.click(screen.getAllByRole('button', { name: 'Cited E01: remove citation' })[0]);
    expect(screen.getAllByRole('button', { name: 'Cite E01 as supporting evidence' })).toHaveLength(
      2,
    );
    expect(screen.getByText('Supporting records')).toHaveTextContent('(0)');
  });
  it('keeps the active raw record available while filtering the navigator', async () => {
    const { user } = await open();
    expect(screen.getByRole('region', { name: 'Original record' })).toHaveTextContent(
      'Authentication-Results',
    );
    await user.type(screen.getByRole('searchbox', { name: 'Search evidence' }), 'powershell');
    expect(screen.getByRole('button', { name: /^E03 Endpoint/ })).toBeVisible();
  });
  it('shows saving feedback inside findings and explains the explicit advice transfer', async () => {
    const { user } = await open();
    const findings = screen.getByRole('region', { name: 'Your findings' });
    expect(within(findings).getByRole('status')).toHaveTextContent('Not saved');
    const card = screen.getByRole('article', { name: 'Investigate the invoice message' });
    await user.click(within(card).getByRole('button', { name: 'Accept' }));
    expect(within(card).getByText(/This records your response only/)).toBeVisible();
    expect(within(findings).getByRole('textbox', { name: 'Your reasoning' })).toHaveValue('');
    await user.click(within(card).getByRole('button', { name: 'Add to findings' }));
    expect(screen.getByText(/A01 added to Your findings/)).toBeVisible();
    expect(within(findings).getByRole('combobox', { name: 'Your assessment' })).toHaveValue(
      'undetermined',
    );
    expect(within(findings).getByRole('status')).toHaveTextContent('Unsaved changes');
  });
  it('returns keyboard focus to the opener after closing a dialog', async () => {
    const { user } = await open();
    const opener = screen.getByRole('button', { name: 'About this demo' });
    await user.click(opener);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(opener).toHaveFocus());
  });
  it('gives record buttons an accessible name containing their visible record details', async () => {
    await open();
    expect(
      screen.getByRole('button', { name: 'E01 Message headers Email / 09:12:04 UTC' }),
    ).toBeVisible();
  });
  it('opens synthetic evidence without treating viewing as citation', async () => {
    await open();
    expect(screen.getByText(/Demo: activity recording unavailable/)).toBeVisible();
    expect(
      screen.getAllByRole('button', {
        name: /^(Cite E01 as supporting evidence|Cited E01: remove citation)$/,
      })[0],
    ).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('region', { name: 'Original record' })).toHaveTextContent(
      'Authentication-Results',
    );
  });
  it('searches record content and clears filters to restore the evidence list', async () => {
    const { user } = await open();
    await user.type(screen.getByRole('searchbox', { name: 'Search evidence' }), 'powershell');
    expect(screen.getByRole('button', { name: /^E03 Endpoint process event/ })).toBeVisible();
    expect(screen.queryByRole('button', { name: /^E01 Message headers/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByRole('button', { name: /^E01 Message headers/ })).toBeVisible();
  });
  it('shows a useful no-match state and supports type filtering', async () => {
    const { user } = await open();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Record type' }), 'Endpoint');
    expect(screen.queryByRole('button', { name: /^E02 Proxy activity/ })).not.toBeInTheDocument();
    await user.type(screen.getByRole('searchbox', { name: 'Search evidence' }), 'not-a-record');
    expect(screen.getByText('No records match your filters.')).toBeVisible();
  });
  it('opens an AI source in the original record inspector', async () => {
    const { user } = await open();
    await user.click(screen.getByRole('button', { name: 'Inspect source E03' }));
    expect(screen.getByRole('region', { name: 'Original record' })).toHaveTextContent(
      'parent_process=outlook.exe',
    );
  });
  it('flags missing sources without creating a fake record link', async () => {
    const data = await loadDemoCase('case-01');
    data.advice[0].evidenceIds = ['E99'];
    await open(async () => data);
    expect(screen.getByText('E99 unavailable')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Inspect source E99' })).not.toBeInTheDocument();
  });
  it('hides AI advice in human-only mode', async () => {
    const { user } = await open();
    await user.click(screen.getByRole('button', { name: 'Human only' }));
    expect(screen.queryByRole('heading', { name: 'AI advice' })).not.toBeInTheDocument();
    expect(screen.queryByText('Investigate the invoice message')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Your reasoning' })).toBeEnabled();
  });
  it('makes AI-only fixed output read-only and does not show analyst review controls', async () => {
    const { user } = await open();
    await user.click(screen.getByRole('button', { name: 'AI only' }));
    expect(screen.getByRole('heading', { name: 'Automated output' })).toBeVisible();
    expect(screen.getByText(/no model was executed/i)).toBeVisible();
    expect(screen.queryByRole('textbox', { name: 'Your reasoning' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Accept' })).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('button', {
        name: /^(Cite E01 as supporting evidence|Cited E01: remove citation)$/,
      })[0],
    ).toBeDisabled();
  });
  it('keeps review decisions separate from findings and the original advice', async () => {
    const { user } = await open();
    const card = screen.getByRole('article', { name: 'Investigate the invoice message' });
    await user.click(within(card).getByRole('button', { name: 'Accept' }));
    expect(within(card).getByRole('button', { name: 'Accept' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('textbox', { name: 'Your reasoning' })).toHaveValue('');
    expect(
      screen.getAllByRole('button', {
        name: /^(Cite E01 as supporting evidence|Cited E01: remove citation)$/,
      })[0],
    ).toHaveAttribute('aria-pressed', 'false');
    await user.click(within(card).getByRole('button', { name: 'Revise' }));
    await user.type(
      within(card).getByRole('textbox', { name: 'Your revision for A01' }),
      'Needs more context.',
    );
    expect(within(card).getByText(/The message failed email authentication/)).toBeVisible();
    await user.click(within(card).getByRole('button', { name: 'Add to findings' }));
    expect(screen.getByRole('textbox', { name: 'Your reasoning' })).toHaveValue(
      'Needs more context.',
    );
    expect(
      screen.getAllByRole('button', {
        name: /^(Cite E01 as supporting evidence|Cited E01: remove citation)$/,
      })[0],
    ).toHaveAttribute('aria-pressed', 'true');
  });
  it('saves and reopens a browser draft with selected supporting records', async () => {
    const { user, unmount } = await open();
    await user.type(
      screen.getByRole('textbox', { name: 'Your reasoning' }),
      'Check the source record.',
    );
    await user.click(
      screen.getAllByRole('button', {
        name: /^(Cite E01 as supporting evidence|Cited E01: remove citation)$/,
      })[0],
    );
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(screen.getByRole('status')).toHaveTextContent('Saved in this browser');
    unmount();
    await open();
    expect(screen.getByRole('textbox', { name: 'Your reasoning' })).toHaveValue(
      'Check the source record.',
    );
    expect(
      screen.getAllByRole('button', {
        name: /^(Cite E01 as supporting evidence|Cited E01: remove citation)$/,
      })[0],
    ).toHaveAttribute('aria-pressed', 'true');
  });
  it('warns about unsaved mode changes and allows keeping current work', async () => {
    const { user } = await open();
    await user.type(screen.getByRole('textbox', { name: 'Your reasoning' }), 'Keep me.');
    await user.click(screen.getByRole('button', { name: 'Human only' }));
    const dialog = screen.getByRole('dialog', { name: 'Unsaved changes' });
    await user.click(within(dialog).getByRole('button', { name: 'Keep working' }));
    expect(screen.getByRole('textbox', { name: 'Your reasoning' })).toHaveValue('Keep me.');
    expect(screen.getByRole('button', { name: 'Human + AI' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
  it('saves before switching and keeps human and combined drafts separate', async () => {
    const { user } = await open();
    await user.type(screen.getByRole('textbox', { name: 'Your reasoning' }), 'Combined draft.');
    await user.click(screen.getByRole('button', { name: 'Human only' }));
    await user.click(screen.getByRole('button', { name: 'Save and switch' }));
    expect(screen.getByRole('textbox', { name: 'Your reasoning' })).toHaveValue('');
    await user.click(screen.getByRole('button', { name: 'Human + AI' }));
    expect(screen.getByRole('textbox', { name: 'Your reasoning' })).toHaveValue('Combined draft.');
  });
  it('keeps input and reports failure when browser storage cannot save', async () => {
    const { user } = await open();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota full');
    });
    await user.type(screen.getByRole('textbox', { name: 'Your reasoning' }), 'Do not lose this.');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save');
    expect(screen.getByRole('textbox', { name: 'Your reasoning' })).toHaveValue(
      'Do not lose this.',
    );
    expect(screen.getByRole('status')).not.toHaveTextContent('Saved in this browser');
  });
  it('requires complete findings and explicit confirmation before finalisation', async () => {
    const { user } = await open();
    await user.click(screen.getByRole('button', { name: 'Finalise findings' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Add your reasoning');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.type(
      screen.getByRole('textbox', { name: 'Your reasoning' }),
      'Suspicious, but not confirmed compromise.',
    );
    await user.click(
      screen.getAllByRole('button', {
        name: /^(Cite E01 as supporting evidence|Cited E01: remove citation)$/,
      })[0],
    );
    await user.click(screen.getByRole('button', { name: 'Finalise findings' }));
    await user.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByRole('textbox', { name: 'Your reasoning' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Finalise findings' }));
    await user.click(screen.getByRole('button', { name: 'Confirm finalisation' }));
    expect(screen.getByRole('textbox', { name: 'Your reasoning' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Finalised in this browser');
  });
  it('distinguishes empty evidence from failed loading and can retry a load', async () => {
    let attempts = 0;
    const data = await loadDemoCase('case-01');
    const { user } = { user: userEvent.setup() };
    render(
      <App
        loadCase={async () => {
          if (attempts++ === 0) throw new Error('Offline');
          return { ...data, evidence: [], advice: [] };
        }}
      />,
    );
    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByText('No evidence records are available for this case.');
    expect(screen.queryByText(/Could not load/)).not.toBeInTheDocument();
  });
  it('renders a loading state while waiting for a case', async () => {
    let resolve!: (value: InvestigationCase) => void;
    const promise = new Promise<InvestigationCase>((done) => {
      resolve = done;
    });
    render(<App loadCase={() => promise} />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    await act(async () => resolve(await loadDemoCase('case-01')));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'A suspicious invoice' })).toBeVisible(),
    );
  });
});
