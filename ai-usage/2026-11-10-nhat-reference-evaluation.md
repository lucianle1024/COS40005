# AI Usage Log - Dataset reference evaluation

- Date: 2026-11-10
- Tool: ChatGPT (GPT-6)
- Scope: SCRUM-104 and SCRUM-105
- Request: Review the two existing Case 1 OTRF datasets, update the scoring rubric, and test the Python evaluator without modifying the datasets or frontend/backend.
- Assistance: Compared existing ground-truth category lists, suggested a small reference-matching function and reproducible tests, and drafted documentation.
- Verification performed with AI assistance: Python `unittest` on the reference-file copies, including the original 12 scorer tests plus 5 new tests. A fresh run on my local checkout is still required before submission.
- Follow-up: I will review the logic, decide which reference categories count as scored outcomes with the dataset owner, and document my own validation. This draft is not a claim of independently completed work or a final approved rubric.
