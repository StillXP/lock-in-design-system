export type ProposalKind = 'component' | 'variant' | 'token' | 'icon' | 'pattern' | 'change';
export type ProposalStatus = 'proposed' | 'triage' | 'accepted' | 'in-design' | 'in-code' | 'released' | 'declined';

export interface ProposalIntake {
  id: string;
  title: string;
  kind: ProposalKind;
  status: ProposalStatus;
  submitted: { by: string; date: string; from: string };
  problem: string;
  evidence: Array<{ product: string; where: string; link?: string; note?: string }>;
  closestExisting: Array<{ name: string; whyNotExtend: string }>;
  standIn?: { description?: string; figma?: string; code?: string };
  figmaApi?: Array<{ property: string; type: 'VARIANT' | 'BOOLEAN' | 'TEXT' | 'INSTANCE_SWAP'; values?: string[]; default?: string | boolean; mapsTo?: string }>;
  contrast?: Array<{ foreground: string; background: string; ratio: number; passes: string }>;
  openQuestions: string[];
  resolved?: Array<{ question: string; answer: string; by: string; date: string }>;
  prototype?: string;
  issue?: string;
  decision?: { outcome: 'accepted' | 'declined' | 'merged-into'; date: string; by: string; note?: string };
}

export interface Proposal {
  $schema?: string;
  intake: ProposalIntake;
  spec?: Record<string, unknown>;
}

export declare const proposalSchema: Record<string, unknown>;
export declare const PROPOSAL_ID: RegExp;
export declare function validateProposal(proposal: unknown, file?: string, tokens?: Map<string, unknown>): string[];
export declare function releaseGaps(proposal: Proposal, slug: string, repoRoot: string): string[];
export declare function figmaReleaseGaps(
  spec: { name: string; figma?: { fileKey: string; nodeId: string } },
  token: string,
  fetchImpl?: typeof fetch,
): Promise<string[]>;
export declare function loadProposals(dir: string): Array<{ file: string; slug: string; proposal: Proposal }>;
export declare function nextProposalId(proposals: Proposal[]): string;
export declare function duplicateIds(entries: Array<{ slug: string; proposal: Proposal }>): string[];
export declare function proposalIssueBody(proposal: Proposal, slug: string): string;
export declare function renderPrototype(paths: { repoRoot: string; proposalsDir?: string }, slug: string): string | null;
export declare function proposalFromIssueBody(body: string | null | undefined): { slug: string; proposal: Proposal } | null;
