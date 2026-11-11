# COS40005 investigation frontend

## Start locally

Start the [FastAPI backend](../backend/README.md) on port 8000. Then run these commands from the repository root using Node.js 24.22.1:

```powershell
cd src/frontend
npm ci --ignore-scripts
npm run dev
```

Open http://127.0.0.1:5173/. If the backend is on another port, set `VITE_API_BASE_URL` before starting Vite. The backend must allow the frontend origin through CORS.

## Case selection

- **Case 1** opens the connected Windows-event workbench. Human only allows investigation and findings. AI only runs the server's fixed-rule assessment. Human + AI loads fixed-rule advice with links to matching Case 1 records. Review choices stay in the open workspace. Analyst findings save to SQLite.
- **Phishing demo** opens the four-record fixture and supports all three demo modes. Its draft storage is browser-local.

## Connected findings

Opening Case 1 automatically starts the session. Refreshing the same tab resumes the attempt. On desktop, scroll the evidence list independently of the selected record, and use the pagination controls to reach more records.

Save draft stores partial findings in SQLite. Finalise findings requires written reasoning and a case citation, then saves and locks the report. A request failure or conflict leaves unsaved edits in the editor. If another tab has finalised the session, copy any unsaved text before reloading to see the server's version.

## Checks

Run `npm test` and `npm run build`. To run the connected browser check locally, use a separate backend database, start both servers, run `npx playwright install chromium`, then run `node scripts/check-connected.mjs` from the frontend folder. Set `SOC_TEST_FRONTEND` for a different frontend URL. The script creates a test attempt and finalises it.
