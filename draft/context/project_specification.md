# Evaluating Human-AI Collaboration for Cybersecurity Incident Investigation

## 1. Project Goal & Research Questions
This project investigates the operational effectiveness and safety of integrating Large Language Models (LLMs) into Security Operations Center (SOC) workflows. Rather than treating AI solely as a summarization tool, the goal is to evaluate whether AI assistance measurably improves analyst performance without introducing unacceptable risks.

### Primary Research Questions
* **Performance & Efficiency:** Can AI assistance decrease investigation duration (Time-to-Triage/Resolve) and improve threat detection accuracy?
* **Safety & Reliability:** Does AI introduce critical failure modes such as hallucinations, incorrect root-cause reasoning, or omitted evidence?
* **Human Oversight & Trust:** Does AI assistance induce human analyst over-reliance (automation bias), causing analysts to unthinkingly trust faulty recommendations?

---

## 2. Experimental Conditions & Core Requirements
The project requires a comparative empirical evaluation across three operational setups using measurable security-analysis metrics:

1. **Condition A: Human Only**
   * The analyst inspects raw log evidence and drafts an incident report manually without AI access.
2. **Condition B: AI Only**
   * The AI system autonomously ingests log data and outputs a complete triage/investigation report without human intervention.
3. **Condition C: Human + AI Collaboration**
   * The human analyst actively investigates using an interactive AI Copilot to query data, summarize events, and validate hypotheses.

---

## 3. Implementation Blueprint

### 3.1 SOC Investigation Workbench (React Frontend)
* **Evidence Telemetry Viewer:** Interactive tables with search/filter capabilities across multiple log types (Windows Event Logs/Sysmon, Zeek network logs, authentication trails).
* **AI Copilot Drawer/Pane:**
  * One-click event summarization and attack timeline generation.
  * Natural language Q&A interface for threat hunting across current case evidence.
  * MITRE ATT&CK technique mapping.
  * Remediation & containment recommendations.
* **Structured Incident Report Form:** Dedicated input fields for Root Cause, MITRE Technique IDs, Extracted Indicators of Compromise (IOCs), and Remediation Plan.

### 3.2 Evaluation & Research Instrumentation
* **Fine-Grained Telemetry:** Background timer tracking Time-to-Triage and Time-to-Submission; full recording of prompts sent and query frequencies.
* **Over-Reliance Tracking:** Explicit inline `[Accept]`, `[Modify]`, and `[Reject]` action toggles next to each AI hypothesis and IOC to measure verification behavior.
* **Failure-Injection Testbed:** Dedicated test cases injected with deliberate AI traps (hallucinated IP addresses, false causality attribution) to test whether analysts catch or blindly adopt model errors.

---

## 4. Project Scope Boundaries

### In-Scope
* **Scenarios:** 2–3 bounded, pre-packaged incident datasets (100–500 rows each in JSON/CSV):
  * *Case 1:* Phishing + Obfuscated PowerShell Execution.
  * *Case 2:* Credential Access & Lateral Movement (e.g., Kerberoasting/RDP).
  * *Case 3 (Poisoned/Failure Case):* Ambiguous IT administration behavior designed to trigger hallucinations and test over-reliance.
* **Participant Cohort:** 10–18 participants evaluating cases under counterbalanced conditions (within-subjects).
* **AI-Only Baseline:** Scripted autonomous batch execution across all cases.
* **Evaluation Framework:** Post-experiment statistical evaluation aligned with the NIST AI Risk Management Framework (AI RMF - Measure Function).

### Out-of-Scope
* Full enterprise SIEM infrastructure (no live Splunk, Elastic, or CrowdStrike connectors).
* Live malware detonation environments or dynamic packet captures (PCAP).
* Real-time automated system remediation (no automated firewall rule push or machine isolation).
* Enterprise user authentication systems (use basic session IDs like `analyst_01`).

---

## 5. Technology Stack

| Layer / Domain | Tool / Library | Role in Project |
| :--- | :--- | :--- |
| **Frontend UI** | **React** (Tailwind CSS / Shadcn UI) | Multi-panel SOC workbench, log filter table, Copilot drawer, and report forms. |
| **Backend API** | **FastAPI** | REST API serving scenario logs, proxying LLM requests, and logging telemetry. |
| **Structured Output** | `pydantic` / `instructor` | Guarantees strict JSON output schemas from LLMs for automated IOC evaluation. |
| **LLM Orchestration** | `litellm` (or native SDKs: `openai`, `google-genai`) | Unified client routing to GPT-4o, Claude 3.5, Gemini, or local models. |
| **Local LLM Engine** *(Optional)* | `ollama` | Local host for open-weight models (e.g., Llama 3) for private/on-premise testing. |
| **Security Data Processing** | `pandas` | Cleans, filters, and standardizes tabular log feeds (CSV/JSON/Sysmon). |
| **Threat Intelligence** | `mitreattack-python` | Verifies and maps threat techniques against the official MITRE ATT&CK framework. |
| **Telemetry & Experiment Store** | SQLite / `jsonl` | Audits run times, condition modes, prompts, and accepted/rejected suggestions. |
| **Metrics & Scoring** | `scikit-learn` | Calculates precision, recall, and F1-scores for extracted IOCs against ground-truth keys. |
| **Statistical Analysis** | `scipy` / `statsmodels` | Computes statistical significance (t-tests/ANOVA) across the three workflow conditions. |
| **Visualization** | `seaborn` / `matplotlib` | Generates comparative box plots, error-rate graphs, and completion-time distributions. |

---

## 6. Project Directory Architecture (Suggestion Only)

```text
cyber-incident-eval/
├── README.md
├── docker-compose.yml              # Optional: Orchestrates frontend, backend, and DB
│
├── frontend/                       # React Application (Vite + Tailwind CSS / Shadcn UI)
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── EvidenceViewer.jsx  # Multi-tab tabular viewer (Sysmon, Network, Auth logs)
│   │   │   ├── CopilotDrawer.jsx   # AI chat, timeline summary, and suggestions
│   │   │   ├── ActionToggle.jsx    # Accept / Modify / Reject interaction buttons
│   │   │   ├── IncidentReportForm.jsx # Root cause, IOCs, remediation form
│   │   │   └── TimerBanner.jsx     # Background investigation timer indicator
│   │   ├── views/
│   │   │   ├── OnboardingView.jsx  # Participant setup and instructions
│   │   │   ├── WorkbenchView.jsx   # Main split-panel SOC investigation layout
│   │   │   └── PostSurveyView.jsx  # Post-trial usability/workload survey
│   │   ├── services/
│   │   │   ├── api.js              # Axios/Fetch API client communicating with FastAPI
│   │   │   └── telemetry.js        # Event tracking helpers (clicks, edits, dwell time)
│   │   ├── App.jsx
│   │   └── main.jsx
│
├── backend/                        # FastAPI Application
│   ├── requirements.txt
│   ├── main.py                     # App entry point, CORS configuration, and route inclusion
│   ├── core/
│   │   ├── config.py               # Environment variables, LLM API keys, model names
│   │   └── database.py             # SQLite / SQLAlchemy connection for telemetry storage
│   ├── api/
│   │   ├── routes_scenarios.py     # Endpoints to fetch cases and raw event datasets
│   │   ├── routes_copilot.py       # Endpoints for summarization, Q&A, and recommendations
│   │   └── routes_telemetry.py     # Endpoints to submit reports and store interaction logs
│   ├── schemas/
│   │   ├── copilot.py              # Pydantic schemas for LLM structured output
│   │   ├── reports.py              # Schema for final submitted analyst incident reports
│   │   └── telemetry.py            # Schema for participant actions and timestamps
│   └── services/
│       ├── llm_service.py          # LiteLLM/OpenAI caller with structured schema enforcement
│       ├── prompt_templates.py     # System prompts for triage, Q&A, and failure injections
│       └── scenario_loader.py      # Pandas log loaders for scenario files
│
├── data/                           # Incident Telemetry & Ground Truth Keys
│   ├── scenarios/
│   │   ├── case_01_phishing/
│   │   │   ├── sysmon_events.json
│   │   │   └── zeek_network.csv
│   │   ├── case_02_lateral_movement/
│   │   │   ├── security_events.csv
│   │   │   └── auth_logs.json
│   │   └── case_03_poisoned_admin/ # Deliberate hallucination/trap scenario
│   │       └── sysmon_mixed.json
│   └── ground_truth/
│       ├── case_01_truth.json      # Verified IOCs, root cause, and ATT&CK mappings
│       ├── case_02_truth.json
│       └── case_03_truth.json
│
├── evaluation/                     # Experiment Execution & Statistical Analysis
│   ├── run_ai_only_trials.py       # Automated script to execute Condition B (AI-only)
│   ├── calculate_metrics.py        # Computes F1, precision, recall, and hallucination rates
│   ├── stats_analysis.py           # ANOVA, t-tests, and over-reliance calculations
│   └── generate_plots.py           # Seaborn/Matplotlib chart generation for research report
│
└── storage/
    └── experiment_trials.db        # SQLite database logging all trial telemetry and submissions
```

---

## 7. Target Evaluation Metrics

1. **Efficiency:** Total duration per case (minutes) and time spent verifying telemetry evidence.
2. **Quality & Detection Accuracy:** Precision, recall, and F1-score of identified IOCs against ground truth; root-cause classification accuracy.
3. **Hallucination Frequency:** Rate of hallucinated indicators (IPs, process names, accounts) generated by the AI.
4. **Over-Reliance Score:** Proportion of injected AI hallucinations/errors uncritically accepted by the human analyst into the final report.