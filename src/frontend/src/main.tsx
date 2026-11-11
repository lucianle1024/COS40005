import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { openCaseOne } from './api/sessions';
import './styles.css';
const params = new URLSearchParams(window.location.search);
const modeParam = params.get('mode');
const mode = modeParam === 'B' || modeParam === 'C' ? modeParam : 'A';
const selectedCase = params.get('case');
const loadConnectedCase = selectedCase === 'case_01' ? () => openCaseOne(mode) : undefined;

function CaseSelection() {
  return (
    <main className="case-selection">
      <p className="case-selection-unit">COS40005</p>
      <h1>Choose an investigation</h1>
      <section className="panel case-option" aria-labelledby="case-one-title">
        <span className="badge badge-neutral">Case 1</span>
        <h2 id="case-one-title">Endpoint Script Execution Alert</h2>
        <p>Investigate 350 Windows event records. Select a mode to open your session.</p>
        <nav className="case-navigation-modes" aria-label="Case 1 modes">
          <a className="primary-button" href="?case=case_01&mode=A">
            Human only
          </a>
          <a className="secondary-button" href="?case=case_01&mode=B">
            AI only
          </a>
          <a className="secondary-button" href="?case=case_01&mode=C">
            Human + AI
          </a>
        </nav>
      </section>
      <section className="panel case-option" aria-labelledby="demo-title">
        <h2 id="demo-title">Phishing demo</h2>
        <p>Try the workbench with four synthetic records and browser-local findings.</p>
        <a className="secondary-button" href="?case=demo">
          Open phishing demo
        </a>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {selectedCase === 'demo' || loadConnectedCase ? (
      <App loadConnectedCase={loadConnectedCase} />
    ) : (
      <CaseSelection />
    )}
  </StrictMode>,
);
