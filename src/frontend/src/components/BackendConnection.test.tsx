import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BackendConnection } from './BackendConnection';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('backend connection', () => {
  it('checks the health response and keeps telemetry status separate', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'ok' }) });
    vi.stubGlobal('fetch', fetcher);
    render(<BackendConnection />);
    expect(screen.getByText('Checking backend...')).toBeVisible();
    expect(await screen.findByText('Backend reachable')).toBeVisible();
    expect(fetcher).toHaveBeenCalledWith('http://127.0.0.1:8000/health', {
      signal: expect.any(AbortSignal),
      cache: 'no-store',
    });
    expect(screen.getByText('Demo: activity recording unavailable')).toBeVisible();
  });

  it.each([
    { ok: false, status: 503, json: async () => ({ status: 'ok' }) },
    { ok: true, json: async () => ({ status: 'failed' }) },
    {
      ok: true,
      json: async () => {
        throw new SyntaxError('Not JSON');
      },
    },
  ])('reports unsuccessful or unexpected responses', async (response) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
    render(<BackendConnection />);
    expect(await screen.findByText('Backend unavailable')).toBeVisible();
  });

  it('recovers from a network failure when rechecked', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Offline'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'ok' }) });
    vi.stubGlobal('fetch', fetcher);
    const user = userEvent.setup();
    render(<BackendConnection />);
    await screen.findByText('Backend unavailable');
    await user.click(screen.getByRole('button', { name: 'Recheck backend' }));
    expect(await screen.findByText('Backend reachable')).toBeVisible();
  });

  it('stops waiting after five seconds and cancels requests on unmount', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn(
      (_url: string, { signal }: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        }),
    );
    vi.stubGlobal('fetch', fetcher);
    const view = render(<BackendConnection />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(screen.getByText('Backend unavailable')).toBeVisible();
    view.unmount();
    const second = render(<BackendConnection />);
    const signal = fetcher.mock.calls[1][1].signal;
    second.unmount();
    expect(signal.aborted).toBe(true);
  });
});
