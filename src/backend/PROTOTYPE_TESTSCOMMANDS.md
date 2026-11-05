# AI Prototype Testing Guide
This guide explains how to test the deterministic AI labeling prototype.
## 1. Open the backend folder
```bash
cd src/backend
```
## 2. Create and activate a virtual environment
Linux/macOS:
```bash
python -m venv .venv
source .venv/bin/activate
```
Windows PowerShell:
```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
```
## 3. Install dependencies
```bash
python -m pip install -e ".[dev]"
```
## 4. Run the tests
```bash
python -m pytest -q
```
Expected result:
```text
2 passed
```
## 5. Start the backend
```bash
python -m uvicorn app.main:app --reload
```
The API will run at `http://127.0.0.1:8000`.
## 6. Run the prototype with sample data
Keep the backend running, then open another terminal and run:
Linux/macOS:
```bash
curl -X POST http://127.0.0.1:8000/investigate \
  -H "Content-Type: application/json" \
  -d '{"id":"case-01","version":"0.1","title":"Test case","evidence":[{"id":"E01","type":"email","text":"Unexpected invoice. SPF failed and DMARC failed."},{"id":"E02","type":"network","text":"Requested invoice-check.example."},{"id":"E03","type":"endpoint","text":"outlook.exe started powershell.exe."}]}'
```
Windows PowerShell:
```powershell
$body = @{
  id = "case-01"
  version = "0.1"
  title = "Test case"
  evidence = @(
    @{ id = "E01"; type = "email"; text = "Unexpected invoice. SPF failed and DMARC failed." }
    @{ id = "E02"; type = "network"; text = "Requested invoice-check.example." }
    @{ id = "E03"; type = "endpoint"; text = "outlook.exe started powershell.exe." }
  )
} | ConvertTo-Json
Invoke-RestMethod -Uri http://127.0.0.1:8000/investigate `
  -Method Post -ContentType "application/json" -Body $body
```
The response should include:
```json
{
  "case_id": "case-01",
  "label": "suspicious",
  "confidence": 0.88,
  "prototype": "fixed-rule-v1"
}
```
This is a deterministic prototype. It does not call a live AI model yet.
