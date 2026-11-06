// Script steps for .github/workflows/proposals.yml. No AI: these only move data between issues and files.
//
//   node proposals/ci.mjs from-issue   env ISSUE_BODY, ISSUE_URL
//     Writes the proposal the hub embedded in the issue to proposals/<slug>.json.
//   node proposals/ci.mjs set-status   env ISSUE_URL, STATUS, ACTOR
//     Mirrors a status:* label into intake.status (and intake.decision for accepted / declined).
//   node proposals/ci.mjs check-release env ISSUE_URL, FIGMA_ACCESS_TOKEN (optional)
//     The release gate: ready=false and the gaps when a component isn't in Figma as well as in code.
//
// Results go to $GITHUB_OUTPUT (or stdout) as key=value lines.
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { figmaReleaseGaps, loadProposals, nextProposalId, proposalFromIssueBody, releaseGaps, validateProposal } from '@stillxp/specs/proposals';

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

const findByIssue = (dir, issueUrl) => {
  const number = String(issueUrl).match(/\/issues\/(\d+)$/)?.[1];
  return loadProposals(dir).find(({ proposal: p }) => p.intake.issue === issueUrl || (number && p.intake.issue?.endsWith(`/issues/${number}`)));
};

/**
 * The release gate. A component proposal is ready when the repo has its Figma mapping and Code Connect template
 * (releaseGaps) and, given a Figma token, the library page has the component with its Docs and Props frames.
 */
export async function checkRelease({ dir, repoRoot, issueUrl, figmaToken, fetchImpl }) {
  const entry = findByIssue(dir, issueUrl);
  if (!entry) return { found: 'false', ready: 'true' };
  const { slug, proposal } = entry;
  const gaps = releaseGaps(proposal, slug, repoRoot);
  let figma = proposal.intake.kind === 'component' ? 'skipped' : 'n/a';
  if (!gaps.length && proposal.intake.kind === 'component' && figmaToken) {
    const spec = JSON.parse(readFileSync(join(repoRoot, 'packages/specs/components', `${proposal.spec?.slug ?? slug}.json`), 'utf8'));
    try {
      gaps.push(...(await figmaReleaseGaps(spec, figmaToken, fetchImpl)));
      figma = 'checked';
    } catch (err) {
      gaps.push(`couldn't read the Figma library to check the component page (${err.message})`);
    }
  }
  const ready = gaps.length ? 'false' : 'true';
  return { found: 'true', slug, id: proposal.intake.id, from: proposal.intake.status, ready, figma, gaps: gaps.map((g) => `- ${g}`).join('\n') };
}

/** Sets intake.status on the proposal linked to an issue. */
export function setStatus({ dir, issueUrl, status, actor }) {
  if (!STATUSES.includes(status)) return { found: 'false', error: `unknown status ${status}` };
  const entry = findByIssue(dir, issueUrl);
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
  // Multi-line values use GitHub's heredoc output syntax so later steps get them intact.
  const lines = Object.entries(result).map(([k, v]) => {
    const value = String(v ?? '');
    return value.includes('\n') ? `${k}<<LIP_EOF\n${value}\nLIP_EOF` : `${k}=${value}`;
  });
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
  else if (command === 'check-release') result = await checkRelease({ dir, repoRoot: join(dir, '..'), issueUrl: env.ISSUE_URL, figmaToken: env.FIGMA_ACCESS_TOKEN });
  else {
    console.error('usage: node proposals/ci.mjs from-issue | set-status | check-release');
    process.exit(2);
  }
  output(result);
  if (result.found === 'invalid') process.exit(1);
}
