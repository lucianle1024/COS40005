# Case 2 Test 2 Dataset Manifest

- **Scenario ID:** `case_02_test2`
- **Source:** [OTRF Security-Datasets](https://github.com/OTRF/Security-Datasets/blob/master/datasets/atomic/windows/lateral_movement/host/purplesharp_ad_playbook_I.zip) (`purplesharp_ad_playbook_I`)
- **License:** Apache 2.0 / Open Source
- **Log Feeds:** Microsoft-Windows-Sysmon/Operational, Microsoft-Windows-Security-Auditing, Microsoft-Windows-PowerShell/Operational, Windows PowerShell (legacy), Microsoft-Windows-WMI-Activity/Operational, System
- **Hosts:** `WORKSTATION5.theshire.local` (`172.18.39.5`), `MORDORDC.theshire.local` (`172.18.38.5`), `WORKSTATION6.theshire.local` (`172.18.39.6`), `WORKSTATION7.theshire.local` (`172.18.39.7`)
- **Compromised User:** `THESHIRE\pgustavo`
- **Raw Dataset File:** `purplesharp_ad_playbook_I_2020-10-22042947.json` (25,993 events)
- **Evidence File:** `case_02_test2_evidence.json` (295 curated events)
- **Truth File:** `case_02_test2_truth.json`
- **Data Time Range:** `2020-10-22T08:29:48.785Z` → `2020-10-22T08:30:42.832Z` (UTC–4 local `2020-10-22 04:29:46` → `2020-10-22 04:30:40`)

---

## Data Range Selection Rationale

The raw dataset spans approximately **54 seconds** (`2020-10-22T08:29:48.785Z` to `2020-10-22T08:30:42.832Z`). The entire dataset falls within a single contiguous PurpleSharp Active Directory attack window; no outer boundary trimming was required.

The curated evidence file (`case_02_test2_evidence.json`) reduces 25,993 raw events to **295 events** (`2020-10-22T08:29:49.785Z` → `2020-10-22T08:30:41.610Z`) using a deterministic selection strategy (`seed=42`) that preserves all attack-critical telemetry alongside representative background noise:

| Priority | Event IDs | Description | Selection Rule |
|---|---|---|---|
| **High** | 1, 4688 | Process creation (Sysmon & Security) | Keep **all 24** Sysmon EventID 1 and **all 24** Security EventID 4688 events (includes `PurpleSharp.exe` and remote `wsmprovhost.exe` → `powershell.exe` trees) |
| **High** | 4625 | Failed logon attempts | Keep **all 7** failed logons (`0xc000006d`) on `WORKSTATION5` (`T1110.003` password spray) |
| **High** | 4769 | Kerberos service ticket requests | Keep **all 17** events on `MORDORDC` — includes all 5 RC4-HMAC (`0x17`) Kerberoasting requests (`T1558.003`) |
| **High** | 5140, 5145 | Network share access (`\\*\IPC$`) | Keep **all 3** EventID 5140 and **all 3** EventID 5145 events across `MORDORDC`, `WORKSTATION6`, and `WORKSTATION7` (`T1135`) |
| **High** | 3 | Network connections (Sysmon) | Keep **all 22** `PurpleSharp.exe` outbound connections (LDAP `389`, SMB `445`, WinRM `5985`) plus 15 background connections (37 total) |
| **High** | 4624 | Successful logons | Keep **all 19** `pgustavo` logons plus 8 background logons (27 total) |
| **High** | 11 | File creation (Sysmon) | Keep `PurpleSharp.exe` (`theshire.local.sch`) and sample 10 `wsmprovhost.exe` / `powershell.exe` file creations (11 total) |
| **High** | 400, 4103, 4104, 800 | PowerShell execution & remoting | Keep `ServerRemoteHost`/`ConsoleHost` engine starts (`400`: 6), sample remote `WORKSTATION6`/`WORKSTATION7` module/script-block logs (`4103`: 7, `4104`: 5), and pipeline details (`800`: 8) |
| **Noise** | 7, 10, 12, 13, 18, 23, 4634, 4656, 4658, 4663, 4672, 4703, 5156, 5158 | Background & WFP activity | Deterministic sample (5–13 each, including 10 `PurpleSharp.exe` WFP 5156/5158 events) to preserve realistic noise |

---

## Incident Triage Briefing (Participant Context)

- **Incident Name:** Suspicious Active Directory Enumeration, Kerberoasting, and Remote Execution Alert
- **Origin Host:** `WORKSTATION5.theshire.local` (`172.18.39.5`)
- **Affected User:** `THESHIRE\pgustavo`
- **Initial Trigger Alert:** Endpoint and domain telemetry flagged a burst of failed logons (`4625`) on `WORKSTATION5`, followed by RC4-HMAC (`0x17`) Kerberos TGS requests (`4769`) against multiple service accounts on `MORDORDC`, SMB `IPC$` share enumeration (`5140`/`5145`), and WinRM (`5985`) remote PowerShell sessions across `MORDORDC`, `WORKSTATION6`, and `WORKSTATION7`.
- **Investigation Objective:**
  1. Identify the binary and command line responsible for the multi-stage Active Directory activity on `WORKSTATION5`.
  2. Reconstruct the attack timeline across password spraying, Kerberoasting, network share discovery, and WinRM lateral movement.
  3. Determine all targeted user accounts, service accounts (SPNs), and remote hosts (`MORDORDC`, `WORKSTATION6`, `WORKSTATION7`).
  4. Extract all verified Indicators of Compromise (IOCs: process hashes, file paths, IP addresses, ports, accounts).
  5. Map the observed behaviors to MITRE ATT&CK techniques (`T1110.003`, `T1558.003`, `T1135`, `T1021.006`).
  6. Formulate containment, credential rotation, and detection engineering recommendations.
