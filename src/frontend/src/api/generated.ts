/* Generated from contracts/workbench.schema.json. Run npm run generate:types; do not hand-edit. */

export type Identifier = string;
export type Classification = 'undetermined' | 'benign' | 'suspicious' | 'malicious';
export type EvidenceIds = Identifier[];

export interface InvestigationCase {
  id: Identifier;
  version: string;
  title: string;
  category: string;
  provenance: 'synthetic';
  summary: string;
  evidence: EvidenceRecord[];
  advice: AdviceItem[];
  automatedAssessment: AutomatedAssessment;
}
export interface EvidenceRecord {
  id: Identifier;
  title: string;
  kind: 'Email' | 'Network' | 'Endpoint';
  timestamp: string;
  source: string;
  content: string;
  indicators: string[];
}
export interface AdviceItem {
  id: Identifier;
  title: string;
  classification: Classification;
  rationale: string;
  evidenceIds: EvidenceIds;
}
export interface AutomatedAssessment {
  classification: Classification;
  rationale: string;
  evidenceIds: EvidenceIds;
  limitations: string[];
}
