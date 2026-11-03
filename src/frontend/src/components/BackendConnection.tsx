import { useEffect, useState } from 'react';
import { checkBackendHealth } from '../api/health';

export function BackendConnection() {
  const [state, setState] = useState<'checking' | 'connected' | 'unavailable'>('checking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState('checking');
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    checkBackendHealth(controller.signal)
      .then(() => {
        if (active) setState('connected');
      })
      .catch(() => {
        if (active) setState('unavailable');
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  return (
    <div className="backend-connection" aria-label="Backend connection">
      <span className={`connection-state connection-${state}`} aria-live="polite">
        <span className="small-dot" aria-hidden="true" />
        {state === 'checking'
          ? 'Checking backend...'
          : state === 'connected'
            ? 'Backend reachable'
            : 'Backend unavailable'}
      </span>
      <button
        type="button"
        className="text-button connection-retry"
        disabled={state === 'checking'}
        onClick={() => setAttempt((value) => value + 1)}
      >
        Recheck backend
      </button>
      <span className="connection-scope">Demo: activity recording unavailable</span>
    </div>
  );
}
