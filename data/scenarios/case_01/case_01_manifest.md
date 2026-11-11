# Case 1 Dataset Manifest

- **Scenario ID:** `case_01`
- **Source:** [OTRF Security-Datasets](https://github.com/OTRF/Security-Datasets) (`empire_launcher_vbs`)
- **License:** Apache 2.0 / Open Source
- **Log Feeds:** Microsoft-Windows-Sysmon/Operational, Microsoft-Windows-Security-Auditing, Microsoft-Windows-PowerShell/Operational
- **Target Host:** `WORKSTATION5.theshire.local`
- **Compromised User:** `THESHIRE\pgustavo`
- **Row Count:** ~350 bounded events

---

## Incident Triage Briefing (Participant Context)

- **Incident Name:** Endpoint Script Execution Alert
- **Target Host:** `WORKSTATION5.theshire.local`
- **Affected User:** `THESHIRE\pgustavo`
- **Initial Trigger Alert:** Host EDR generated an alert for unsigned Windows Script Host (`wscript.exe`) execution from the user Desktop launching an in-memory PowerShell instance.
- **Investigation Objective:**
  1. Determine the root cause and initial execution vector.
  2. Map the process lineage and child processes spawned by the stager.
  3. Extract all verified Indicators of Compromise (IOCs: file paths, hashes, accounts, process command lines).
  4. Identify associated MITRE ATT&CK tactics and techniques.
  5. Formulate standard incident response containment and remediation recommendations.
