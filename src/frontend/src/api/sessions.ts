import { validateAdvice } from './case-validator';
import { apiBaseUrl } from './health';
import type { AdviceItem, InvestigationCase } from './generated';
import { createDraft } from '../state/investigation';
import type { InvestigationDraft, WorkflowMode } from '../state/investigation';

type Mode = 'A' | 'B' | 'C';
type CaseInput = {
  id: string;
  version: string;
  title: string;
  evidence: { id: string; text: string }[];
};
type Findings = {
  classification: InvestigationDraft['classification'];
  reasoning: string;
  evidence_ids: string[];
};
type Assessment = {
  label: InvestigationDraft['classification'];
  rationale: string;
  supporting_evidence: string[];
  prototype: string;
};
type AdviceResponse = Omit<AdviceItem, 'evidenceIds'> & { evidence_ids: string[] };
type Session = {
  id: string;
  mode: Mode;
  status: InvestigationDraft['status'] | 'active';
  started_at: string;
  completed_at: string | null;
  findings: Findings | Assessment | null;
};

const workflow: Record<Mode, WorkflowMode> = { A: 'human', B: 'ai', C: 'combined' };

async function request<T>(path: string, body?: object): Promise<T> {
  const signal = AbortSignal.timeout(10000);
  try {
    const response = await fetch(apiBaseUrl + path, {
      cache: 'no-store',
      signal,
      ...(body && {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      if (response.status === 409) {
        throw new Error(
          'The session has changed on the server. Your unsaved edits are still here. Copy them before reloading to see the server version.',
        );
      }
      throw new Error(
        typeof error?.detail === 'string'
          ? error.detail
          : 'Session API returned HTTP ' + response.status,
      );
    }
    return (await response.json()) as T;
  } catch (error) {
    if (signal.aborted)
      throw new Error('The session request timed out. Check the connection and try again.');
    throw error;
  }
}

function restoreDraft(data: InvestigationCase, session: Session): InvestigationDraft {
  const draft = createDraft(data, workflow[session.mode]);
  const findings = session.findings;
  if (findings && 'reasoning' in findings) {
    draft.classification = findings.classification;
    draft.reasoning = findings.reasoning;
    draft.evidenceIds = findings.evidence_ids;
  }
  if (session.status === 'finalised') {
    draft.status = 'finalised';
    draft.finalisedAt = session.completed_at ?? undefined;
  }
  return draft;
}

export async function openCaseOne(mode: Mode) {
  const input = await request<CaseInput>('/sessions/case-01');
  const key = 'cos40005.case-one.attempt:' + input.version + ':' + mode;
  let attemptKey = sessionStorage.getItem(key);
  if (!attemptKey) {
    attemptKey = crypto.randomUUID();
    sessionStorage.setItem(key, attemptKey);
  }
  let session = await request<Session>('/sessions', {
    case_id: input.id,
    case_version: input.version,
    mode,
    attempt_key: attemptKey,
  });
  if (mode === 'B' && session.status === 'active') {
    try {
      session = await request<Session>('/sessions/' + session.id + '/complete-ai', {});
    } catch (error) {
      session = await request<Session>('/sessions/' + session.id);
      if (session.status !== 'finalised') throw error;
    }
  }
  const path = '/sessions/' + session.id;
  const advice =
    mode === 'C'
      ? validateAdvice(
          (await request<AdviceResponse[]>(path + '/advice')).map(({ evidence_ids, ...claim }) => ({
            ...claim,
            evidenceIds: evidence_ids,
          })),
        )
      : [];
  const assessment = session.findings && 'label' in session.findings ? session.findings : null;
  const data: InvestigationCase = {
    id: input.id,
    version: input.version,
    title: input.title,
    category: 'Windows security events',
    provenance: 'synthetic',
    summary: 'Review the Windows records for signs of PowerShell activity and firewall changes.',
    evidence: input.evidence.map((record) => {
      const event = JSON.parse(record.text) as {
        EventID: number;
        SourceName?: string;
        '@timestamp'?: string;
        TimeCreated?: string;
      };
      return {
        id: record.id,
        title: 'Windows Event ' + event.EventID,
        kind: 'Endpoint',
        timestamp: event['@timestamp'] ?? event.TimeCreated ?? '',
        source: event.SourceName ?? 'Windows event log',
        content: record.text,
        indicators: [],
      };
    }),
    advice,
    automatedAssessment: {
      classification: assessment?.label ?? 'undetermined',
      rationale: assessment?.rationale ?? 'No automated assessment is available for this mode.',
      evidenceIds: assessment?.supporting_evidence ?? [],
      limitations: [
        'The Case 1 assessment uses fixed rules. Its confidence value is a rule score, not a calibrated probability.',
        ...(assessment?.prototype === 'fixed-rule-v1'
          ? [
              'This saved assessment uses the original rules. Verify its explanation against the evidence.',
            ]
          : []),
      ],
    },
  };
  return {
    data,
    draft: restoreDraft(data, session),
    hasFindings: session.findings !== null,
    startedAt: session.started_at,
    async save(draft: InvestigationDraft): Promise<InvestigationDraft> {
      const final = draft.status === 'finalised';
      const result = await request<Session>(path + (final ? '/finalise' : '/draft'), {
        classification: draft.classification,
        reasoning: draft.reasoning,
        evidence_ids: draft.evidenceIds,
      });
      return { ...restoreDraft(data, result), reviews: draft.reviews };
    },
  };
}

export type ConnectedCaseLoader = () => ReturnType<typeof openCaseOne>;
