# Team Work Breakdown & Phased Execution Plan (5 Members)

## 1. Team Roles & Workstreams

With 5 members and distinct skill sets, we can parallelize the work perfectly. Each member owns a specific domain of the project.

### Role 1: Software Development Major (Full-Stack Engineer)
* **Focus:** App Architecture, React Frontend, and FastAPI Plumbing.
* **Research Focus:** 
  * How to implement fine-grained user telemetry in React (tracking clicks, time spent on components).
  * FastAPI asynchronous endpoints and integrating SQLite/SQLAlchemy for rapid prototyping.
  * Modern UI frameworks (Tailwind, Shadcn UI) to quickly build the "SOC Workbench" interface.
* **Task / Responsibilities:**
  * Scaffold the React/Vite project and the FastAPI backend structure.
  * Build the UI components: Evidence Telemetry Viewer, Copilot Drawer, and Report Form.
  * Implement API routing and the SQLite database schema to store logs and telemetry.
* **Independence:** Can start immediately using mock JSON data for logs and API responses to build the UI and test API endpoints.

### Role 2: AI Major #1 (AI Copilot & Prompt Engineering)
* **Focus:** LLM Orchestration and The Collaborative AI.
* **Research Focus:**
  * Prompt engineering techniques for log analysis (e.g., Chain-of-Thought reasoning for cybersecurity).
  * Tools to enforce strict JSON structured outputs from LLMs (e.g., `pydantic`, `instructor`, OpenAI Structured Outputs).
  * Context window management (how to fit large CSV/JSON log files into a model's prompt efficiently).
* **Task / Responsibilities:**
  * Integrate LLM APIs (e.g., LiteLLM, OpenAI, Ollama) into the backend.
  * Develop and refine prompt templates for log summarization and threat-hunting Q&A.
  * Ensure strict JSON structured outputs.
* **Independence:** Can start immediately by prototyping prompts in Jupyter Notebooks or testing APIs using sample log text.

### Role 3: AI Major #2 (Autonomous AI & Failure Injection)
* **Focus:** Condition B (AI-Only) and AI Traps.
* **Research Focus:**
  * "Automation Bias" and human-computer interaction (HCI) research to understand how users over-rely on AI.
  * Adversarial AI and how to deliberately induce model hallucinations or false confidence in security contexts.
  * Automated testing frameworks for LLMs.
* **Task / Responsibilities:**
  * Build the autonomous script to execute the AI-Only baseline across all cases.
  * Design the deliberate "AI traps" (hallucinated IPs, false causality) for the poisoned scenario to test human over-reliance.
  * Benchmark baseline model performance (hallucination frequency).
* **Independence:** Can work in parallel with AI Major #1, focusing on adversarial prompt engineering and the automation pipeline.

### Role 4: Cybersecurity Major (Threat Intel & Scenario Design)
* **Focus:** Log Datasets, Ground Truth, and Security Realism.
* **Research Focus:**
  * The **MITRE ATT&CK Framework** and mapping specific logs to attack techniques.
  * Understanding common log formats (Windows Sysmon, Zeek network logs).
  * Sigma rules and how modern SOCs structure their threat alerts (mentioned in your meeting notes).
  * Researching open-source incident datasets (e.g., Splunk BOTS, Mordor).
* **Task / Responsibilities:**
  * Source or synthesize realistic log datasets (Phishing, Lateral Movement).
  * Map attack behaviors to the MITRE ATT&CK framework.
  * Create the absolute "Ground Truth" keys for each case (the correct root cause and exact IOCs) against which the AI and humans will be scored.
* **Independence:** Can work entirely independently in the initial phases, generating JSON/CSV log files and threat models.

### Role 5: Data Science Major (Metrics, Telemetry & Evaluation)
* **Focus:** Experiment Logistics and Statistical Analysis.
* **Research Focus:**
  * The **NIST AI Risk Management Framework (AI RMF)**, specifically the "Measure" function.
  * Statistical significance testing for user studies (ANOVA, paired t-tests, within-subjects counterbalancing).
  * Precision, Recall, and F1-score calculations for evaluating AI data extraction (IOCs).
* **Task / Responsibilities:**
  * Define the telemetry data structure (how clicks, timers, and edits are logged).
  * Write evaluation scripts (`scikit-learn`, `pandas`) to calculate F1-scores, precision, recall, and over-reliance metrics.
  * Conduct the final statistical analysis (t-tests/ANOVA) on the experimental results and generate data visualizations.
* **Independence:** Can start immediately by writing evaluation scripts using synthetic/dummy output data to ensure the math and statistical tests are ready.

---

## 2. Phased Execution Plan

To ensure everything integrates smoothly across 5 members, follow these phases:

### Phase 1: Foundation (Weeks 1-2)
* **Software Dev:** Scaffolds the repo, sets up React and FastAPI, and defines API contracts.
* **AI #1 & AI #2:** Set up API keys, test baseline models, and draft initial triage prompts.
* **Cybersecurity:** Finalizes the logs and Ground Truth for Case 1.
* **Data Science:** Defines the schema for telemetry logging (what exactly needs to be tracked).
* **Milestone Check:** Basic end-to-end API call works, and Case 1 logs are ready.

### Phase 2: Core Development (Weeks 3-5)
* **Software Dev:** Wires the UI to the live backend APIs and builds interaction tracking.
* **AI #1:** Refines the Copilot Q&A and summary features for accuracy.
* **AI #2:** Completes the autonomous AI script and injects hallucinations for Case 3.
* **Cybersecurity:** Completes Cases 2 and 3 and validates them against the Ground Truth.
* **Data Science:** Finishes the automated evaluation scripts using dummy participant data.
* **Milestone Check:** The SOC Workbench is fully functional. A user can view logs, interact with the AI, and submit a report.

### Phase 3: Integration & Testing (Weeks 6-7)
* **Team Effort:** Test the platform to ensure the UI logs telemetry correctly to the database.
* **Cybersecurity & AI #2:** Fine-tune the "failure-injection testbed" to ensure the traps are subtle enough to test over-reliance without being too obvious.
* **Data Science:** Verifies that the evaluation scripts correctly parse the submitted reports and calculate metrics accurately.

### Phase 4: Experiment Execution & Analysis (Weeks 8+)
* **Execution:** Run the human participants through the platform (Conditions A and C).
* **AI #2:** Run the automated Condition B script.
* **Data Science:** Extracts the SQLite database, runs the final statistical analysis, and generates visualization plots for the final report.
