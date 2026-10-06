Based on your teacher's notes, your first task should focus on project planning, preliminary research, defining the project scope and requirements, and preparing questions for a one-hour client meeting.

Since your group has five members with different specialisations, you can divide the work according to each member's strengths while making sure everyone understands the overall project.

# **1\. First task: What your group needs to accomplish**

1\. Plan the project

Create an initial project plan, identify milestones, divide responsibilities, and establish a timeline.

Deliverable: Project plan

2\. Conduct preliminary research

Investigate AI-assisted cybersecurity, incident investigation, human-AI collaboration, hallucinations, and existing tools.

Deliverable: Research summary

3\. Define scope and requirements

Determine what the prototype will do, what data it needs, which features are essential, and how success will be measured.

Deliverable: Scope and requirements

4\. Prepare for the client meeting

Prepare questions to clarify the client's expectations, available resources, technical constraints, and definition of success.

Deliverable: Meeting agenda and questions

# **2\. Divide the work among your five members**

Your group has two AI students (including you), one Data Science student, one Cybersecurity student, and one Software Development student.

Here is a proposed division of responsibilities.

| Member | Primary responsibility | Main tasks |
| ----- | ----- | ----- |
| AI student 1 | AI research and evaluation | Research LLMs, prompt engineering, hallucinations, and human-AI collaboration |
| AI student 2 | AI prototype and architecture | Investigate suitable AI models, APIs, RAG, and possible AI-assisted features |
| Data Science student | Dataset and evaluation | Research security datasets, ground truth, experimental design, and performance metrics |
| Cybersecurity student | Security investigation | Research incident response, log analysis, IOCs, MITRE ATT\&CK, and realistic scenarios |
| Software Development student | System design | Research architecture, frontend/backend options, APIs, data processing, and integration |

Important: These are primary responsibilities, not isolated tasks. For example, the cybersecurity student should help the AI students understand what constitutes a correct security finding, while the Data Science student should help everyone understand how the experiment will be evaluated.

You can also nominate one person to coordinate meetings, track deadlines, and combine everyone's research into a single document.

# **3\. Preliminary research plan**

Your research should answer five main questions.

## **01**

How is AI currently used in cybersecurity?

Investigate AI-assisted security operations, SOC workflows, log analysis, and incident response.

## **02**

Which AI techniques could support the project?

Compare LLM APIs, local models, prompt engineering, and retrieval-augmented generation (RAG).

## **03**

What security investigation tasks should be tested?

Consider alert triage, evidence summarisation, IOC extraction, attack timelines, and MITRE ATT\&CK mapping.

## **04**

How can the AI's performance be evaluated?

Research accuracy, investigation time, missed evidence, hallucinations, and human over-reliance.

## **05**

What tools and datasets are available?

Identify realistic security datasets, existing investigation tools, technical requirements, and data privacy constraints.

### **Suggested starting references**

* NIST AI Risk Management Framework — AI risks, reliability, and human oversight.  
* MITRE ATT\&CK — describing attacker behaviours and mapping investigation findings.  
* NIST SP 800-61 Rev. 3 — incident response processes.  
* OWASP Top 10 for LLM Applications — risks associated with LLM-based systems.

You should also look for academic papers that experimentally evaluate AI assistance in security operations, rather than relying exclusively on articles describing AI tools.

# **4\. Initial project scope and requirements**

Before the client meeting, prepare a proposed scope. Treat it as a draft, not a final commitment.

## **Proposed scope**

Project objective: Develop and evaluate a human-in-the-loop AI-assisted cybersecurity investigation prototype.

| Area | Initial proposal |
| ----- | ----- |
| Input | Simulated or publicly available security logs and incident evidence |
| AI functions | Summarisation, suspicious behaviour identification, IOC extraction, and investigation assistance |
| Human involvement | Analyst reviews, verifies, and accepts or rejects AI findings |
| Evaluation | Compare human-only, AI-only, and human-plus-AI workflows |
| Metrics | Completion time, correctness, missed evidence, hallucinations, and recommendation quality |
| Output | Investigation findings, evidence summaries, timelines, and evaluation results |
| Safety | Avoid sending sensitive organisational data to public AI services without authorisation |

## **Requirements to investigate**

* Functional requirements: What must the prototype actually do?  
* Data requirements: What evidence and datasets can be used?  
* Technical requirements: Which AI model, programming language, APIs, and interface are suitable?  
* Evaluation requirements: How many scenarios and participants are realistic?  
* Security requirements: How will data privacy, access control, and AI-generated errors be handled?  
* Project constraints: What are the available time, budget, computing resources, and assessment expectations?

# **5\. Questions to ask the client in the one-hour meeting**

This is particularly important because the answers could change your entire implementation plan.

I'd prepare around 15–20 questions, but prioritise the most important ones in case the discussion runs over time.

## **A. Project expectations — 10 minutes**

1. What is the main problem you want this project to solve?  
2. Who is the intended user: a SOC analyst, incident responder, security researcher, or another role?  
3. What would you consider a successful project outcome?  
4. Are there particular investigation tasks or cybersecurity problems you want us to focus on?  
5. Is the primary expectation a working prototype, an experimental evaluation, or both?

## **B. Scope and functionality — 10 minutes**

6. Which investigation tasks should the prototype support?  
7. Which types of security evidence should it process — SIEM alerts, authentication logs, endpoint logs, network logs, or other data?  
8. Should the system only analyse evidence, or should it also recommend response actions?  
9. Do you expect the prototype to produce structured outputs such as IOCs, timelines, severity assessments, or MITRE ATT\&CK mappings?  
10. Are there any features or areas that are explicitly outside the project's scope?

## **C. Data and resources — 10 minutes**

11. Can the client provide datasets, sample logs, incident reports, or investigation scenarios?

search for public and free open-sourced datasets

12. If real data is unavailable, are we permitted to use public datasets or simulated incidents?  
13. Is there an existing security platform or tool that the prototype should integrate with?  
14. Are there restrictions on using external AI APIs, cloud services, or particular AI models?  
15. What data privacy, confidentiality, and security requirements must we follow?

## **D. Evaluation and research — 10 minutes**

16. How should we define a correct investigation result?  
17. Is comparing human-only, AI-only, and human-plus-AI workflows feasible for this project?  
18. Which outcomes matter most to the client: speed, accuracy, completeness, reliability, or another measure?  
19. Are there existing benchmarks, evaluation datasets, or ground-truth incident reports we should use?

## **E. Constraints and expectations — 10 minutes**

20. What are the key milestones, deadlines, and expected deliverables?  
21. Are there technical constraints, such as a required programming language, deployment environment, or model?  
22. What level of prototype maturity is expected for the final demonstration?  
23. How frequently would the client like to review our progress?  
- every 3 weeks  
- 

## **F. Final clarification — 10 minutes**

Use the final part of the meeting to:

* Clarify any unanswered questions.  
* Confirm the agreed project scope and priorities.  
* Summarise the client's expectations in your own words.  
* Confirm the next steps and any information the client will provide.

A useful question to ask near the end

“If we can only deliver a small number of features within the project timeframe, which features and evaluation outcomes would be most important to you?”

# **6\. Suggested one-hour meeting agenda**

### **Client meeting**

60 minutes

Introduction and objectives

5 min

Client's problem and expectations

10 min

Scope and proposed functionality

15 min

Data, tools, and constraints

10 min

Evaluation and success criteria

10 min

Clarifications and next steps

10 min

# **7\. What your group should have ready after Task 1**

By the end of this first task, aim to produce these five items:

* Project plan: milestones, timeline, responsibilities, and communication arrangements.  
* Research summary: existing approaches, relevant academic papers, tools, and research gaps.  
* Scope and requirements document: proposed features, inputs, outputs, constraints, and evaluation criteria.  
* Client meeting preparation: agenda, prioritised questions, and note-taking responsibilities.  
* Initial project proposal: a short summary of the problem, proposed solution, methodology, and expected outcomes.

The client meeting should then help you turn these preliminary documents into an agreed project direction.

My suggestion for you personally: Since you're one of the two AI students, take ownership of the AI research and evaluation side, but coordinate closely with the cybersecurity member. Understanding what a correct investigation looks like is just as important as understanding how to build the AI model.

