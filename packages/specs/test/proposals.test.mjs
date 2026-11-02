import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { proposalFromIssueBody, proposalIssueBody, validateProposal } from '../scripts/proposals.mjs';

const repo = join(fileURLToPath(import.meta.url), '..', '..', '..', '..');
const textarea = () => JSON.parse(readFileSync(join(repo, 'proposals/textarea.json'), 'utf8'));

test('the issue body embeds the proposal so the workflow can read it back unchanged', () => {
  const p = textarea();
  const parsed = proposalFromIssueBody(proposalIssueBody(p, 'textarea'));
  assert.equal(parsed.slug, 'textarea');
  assert.deepEqual(parsed.proposal, p);
  assert.deepEqual(validateProposal(parsed.proposal, join(repo, 'proposals/textarea.json')), []);
});

test('issues without an embedded proposal (filed with the form) return null', () => {
  assert.equal(proposalFromIssueBody('### Kind\ncomponent'), null);
  assert.equal(proposalFromIssueBody(undefined), null);
});
