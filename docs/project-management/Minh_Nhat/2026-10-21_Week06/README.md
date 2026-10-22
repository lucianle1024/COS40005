# COS40005 - Minh Nhat - Week 06

Student: Nguyen Huyen Minh Nhat  
Team: Hanoi Group 5  
Evidence update: 21 October 2026  
Repository: https://github.com/lucianle1024/COS40005

## Files

- `ai-usage/Minh_Nhat/2026-10-21_Week06/` - Revised AI Usage Log in DOCX and PDF.
- `evidence/individual/Minh_Nhat/2026-10-21_Week06/` - Revised Individual Contribution Summary in DOCX and PDF, plus Jira screenshot.
- `evidence/process/Minh_Nhat/2026-10-21_Week06/` - 20 October client meeting notes and group feedback PDFs.
- `research/methodology/Minh_Nhat/2026-10-21_Week06/` - SCRUM-45 statistical methodology summary.
- `docs/technical/Minh_Nhat/2026-10-21_Week06/` - SCRUM-49 SQLite telemetry design summary.
- `tests/Minh_Nhat/2026-10-21_Week06/` - Seven successful local unit tests (screenshot and test notes).

## Evidence and status

- Jira: SCRUM-45 and SCRUM-49 are marked Done; 4h 02m recorded in Jira worklogs.
- Local tests: 7/7 passed on 21 October 2026. This does not demonstrate full React/FastAPI integration.
- The mentor meeting notes identify Minh Nhat's work as "Huyen". The 86/100 GREEN feedback is for the whole group.
- Team-lead approval and backend integration were still pending at the time documented by the meeting notes.
- Original executable SQL and Python test source are not included here; they remain in the local evidence package.

## Upload to GitHub

Extract this ZIP directly into the root of the existing `COS40005` Git clone. This archive has **no top-level wrapper directory** and **does not replace the repository root README.md**.

From the repository root, on the existing `main` branch:

```powershell
git checkout main
git pull --ff-only origin main
git status --short
git add -- ai-usage/Minh_Nhat/2026-10-21_Week06/ evidence/individual/Minh_Nhat/2026-10-21_Week06/ evidence/process/Minh_Nhat/2026-10-21_Week06/ research/methodology/Minh_Nhat/2026-10-21_Week06/ docs/technical/Minh_Nhat/2026-10-21_Week06/ docs/project-management/Minh_Nhat/2026-10-21_Week06/ tests/Minh_Nhat/2026-10-21_Week06/
git diff --cached --stat
git commit -m "docs: archive Minh Nhat Week 6 evidence"
git push origin main
git log -1 --oneline
```

Review staged files before committing. The Git commit dates the **evidence upload**, not all the underlying research or testing. Do not claim source-code integration or an earlier Git commit that did not occur.
