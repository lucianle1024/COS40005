# Case 2 Dataset Manifest

- **Scenario ID:** `case_02`
- **Source:** [OTRF Security-Datasets](https://github.com/OTRF/Security-Datasets/blob/master/datasets/atomic/windows/credential_access/host/empire_mimikatz_logonpasswords.zip) (`empire_mimikatz_logonpasswords`)
- **License:** Apache 2.0 / Open Source
- **Log Feeds:** Microsoft-Windows-Sysmon/Operational, Microsoft-Windows-Security-Auditing, Microsoft-Windows-PowerShell/Operational, Windows PowerShell (legacy)
- **Target Host:** `WORKSTATION5.theshire.local`
- **Compromised User:** `THESHIRE\pgustavo`
- **Raw Dataset File:** `empire_mimikatz_logonpasswords_2020-08-07103224.json` (6,026 events)
- **Evidence File:** `case_02_evidence.json` (268 curated events)
- **Data Time Range:** `2020-08-07 10:32:22` → `2020-08-07 10:35:24` (UTC–5, local `2020-08-07 10:32` → `10:35`)

---

## Data Range Selection Rationale

The raw dataset spans approximately **3 minutes and 2 seconds** (`10:32:22` to `10:35:24` local time, `14:32:22` to `14:35:24` UTC). The entire dataset falls within a single contiguous attack window; no trimming of the outer boundary was required.

The curated evidence file (`case_02_evidence.json`) reduces 6,026 raw events to **268 events** using the following selection strategy:

| Priority | Event IDs | Description | Selection Rule |
|---|---|---|---|
| **High** | 1, 400, 17, 18 | Process creation, PS engine start, named-pipe events | Keep all (≤10 occurrences each) |
| **High** | 10 | Process memory access | Keep **all 4 lsass.exe target events** (the core credential-dump IOC); random-sample remainder to cap at 30 |
| **High** | 3 | Network connections | Sample 20 — includes all `powershell.exe → 10.10.10.5:80` C2 callbacks |
| **High** | 7 | Image loads | Sample 20 — covers key DLLs loaded by powershell.exe |
| **High** | 12, 13 | Registry add/modify | Sample 20 and 15 respectively |
| **High** | 600, 800 | PS pipeline execution details | Keep all 8 provider-start events; prioritise `OpenProcess`/`ReadProcessMemory`/`WebClient` pipeline entries, then sample to 30 total |
| **High** | 4103 | PS module logging | Prioritise `WORKSTATION5`/`pgustavo` events; sample to 30 total |
| **High** | 4624, 4688 | Logon / Security process creation | Keep all (≤10 each) |
| **Medium** | 4634, 4672 | Logoff / Special logon | Sample 10 and 5 |
| **Noise** | 5, 9, 11, 22, 4656, 4658, 4663, 4670, 4673, 4690, 4703, 5140, 5145, 5156, 5158, 5857 | Benign background activity | Light sample (1–10 each) to preserve realistic noise for analyst training |

---

## Incident Triage Briefing (Participant Context)

- **Incident Name:** Suspicious LSASS Memory Access Alert
- **Target Host:** `WORKSTATION5.theshire.local`
- **Affected User:** `THESHIRE\pgustavo`
- **Initial Trigger Alert:** Endpoint EDR flagged an anomalous process memory-read (`GrantedAccess: 0x1010`) against `lsass.exe` originating from a `powershell.exe` process running under a standard user account. Concurrent outbound HTTP connection from the same process to an internal IP (`10.10.10.5:80`) was observed.
- **Investigation Objective:**
  1. Confirm whether the `lsass.exe` memory access is consistent with credential dumping (Mimikatz / sekurlsa::logonpasswords pattern).
  2. Trace the PowerShell process lineage and determine how the payload was delivered (parent process, encoded command line).
  3. Identify the C2 server and assess scope of beacon/callback activity.
  4. Extract all verified Indicators of Compromise (IOCs: IP addresses, process hashes, accounts, command lines).
  5. Identify associated MITRE ATT&CK tactics and techniques.
  6. Formulate standard incident response containment and remediation recommendations.
