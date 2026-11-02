// Script steps for .github/workflows/proposals.yml. No AI: these only move data between issues and files.
//
//   node proposals/ci.mjs from-issue   env ISSUE_BODY, ISSUE_URL
//     Writes the proposal the hub embedded in the issue to proposals/<slug>.json.
//   node proposals/ci.mjs set-status   env ISSUE_URL, STATUS, ACTOR
//     Mirrors a status:* label into intake.status (and intake.decision for accepted / declined).
//
// Results go to $GITHUB_OUTPUT (or stdout) as key=value lines.
import { appendFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProposals, nextProposalId, proposalFromIssueBody, validateProposal } from '@lockin/specs/proposals';

const STATUSES = ['proposed', 'triage', 'accepted', 'in-design', 'in-code', 'released', 'declined'];
const today = () => new Date().toISOString().slice(0, 10);
const write = (file, data) => writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);

/** Adds the proposal embedded in an issue body. Returns { found, ... } describing what happened. */
export function fromIssue({ dir, body, issueUrl }) {
  const embedded = proposalFromIssueBody(body);
  if (!embedded) return { found: 'false' };
  const { slug, proposal } = embedded;
  const file = join(dir, `${slug}.json`);
  if (existsSync(file)) return { found: 'exists', slug, id: proposal.intake.id };

  const others = loadProposals(dir).map((e) => e.proposal);
  let reassigned = '';
  if (others.some((p) => p.intake.id === proposal.intake.id)) {
    reassigned = proposal.intake.id;
    proposal.intake.id = nextProposalId(others);
  }
  if (issueUrl) proposal.intake.issue = issueUrl;
  const errors = validateProposal(proposal, file);
  if (errors.length) return { found: 'invalid', slug, errors: errors.join('; ') };
  write(file, proposal);
  return { found: 'true', slug, id: proposal.intake.id, title: proposal.intake.title, kind: proposal.intake.kind, reassigned };
}

/** Sets intake.status on the proposal linked to an issue. */
export function setStatus({ dir, issueUrl, status, actor }) {
  if (!STATUSES.includes(status)) return { found: 'false', error: `unknown status ${status}` };
  const number = String(issueUrl).match(/\/issues\/(\d+)$/)?.[1];
  const entry = loadProposals(dir).find(({ proposal: p }) => p.intake.issue === issueUrl || (number && p.intake.issue?.endsWith(`/issues/${number}`)));
  if (!entry) return { found: 'false' };
  const { file, slug, proposal } = entry;
  const i = proposal.intake;
  if (i.status === status) return { found: 'true', changed: 'false', slug, id: i.id };
  const from = i.status;
  i.status = status;
  if ((status === 'accepted' || status === 'declined') && i.decision?.outcome !== status) {
    i.decision = { outcome: status, date: today(), by: actor || 'unknown' };
  }
  const errors = validateProposal(proposal, file);
  if (errors.length) return { found: 'invalid', slug, errors: errors.join('; ') };
  write(file, proposal);
  return { found: 'true', changed: 'true', slug, id: i.id, title: i.title, from, status };
}

function output(result) {
  const lines = Object.entries(result).map(([k, v]) => `${k}=${String(v ?? '').replace(/\n/g, ' ')}`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
  console.log(lines.join('\n'));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dir = dirname(fileURLToPath(import.meta.url));
  const [command] = process.argv.slice(2);
  const env = process.env;
  let result;
  if (command === 'from-issue') result = fromIssue({ dir, body: env.ISSUE_BODY, issueUrl: env.ISSUE_URL });
  else if (command === 'set-status') result = setStatus({ dir, issueUrl: env.ISSUE_URL, status: env.STATUS, actor: env.ACTOR });
  else {
    console.error('usage: node proposals/ci.mjs from-issue | set-status');
    process.exit(2);
  }
  output(result);
  if (result.found === 'invalid') process.exit(1);
}
