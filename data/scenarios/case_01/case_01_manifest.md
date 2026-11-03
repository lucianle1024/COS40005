# Case 1 Dataset Manifest

- **Scenario ID:** `case_01`
- **Origin / Source:** OTRF Security-Datasets (`psh_python_webserver.zip`)
- **License:** Apache 2.0 / Open Data
- **Host Affected:** WORKSTATION5
- **Primary Telemetry:** Windows Security Auditing (Event IDs 1102, 4688, 4946, 5447, 4656, 4663)
- **Key Behavior:**
  1. Clear Windows Security Event Log (Event ID 1102)
  2. Spawn netsh via PowerShell to whitelist Python inbound TCP connections (Event ID 4688, 4946)
  3. LSA / Winlogon registry handle inspection