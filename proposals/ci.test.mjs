import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { proposalIssueBody } from '@lockin/specs/proposals';
import { fromIssue, setStatus } from './ci.mjs';

const here = join(fileURLToPath(import.meta.url), '..');
let dir;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'lip-ci-'));
  cpSync(join(here, 'textarea.json'), join(dir, 'textarea.json'));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

const read = (slug) => JSON.parse(readFileSync(join(dir, `${slug}.json`), 'utf8'));
const stepper = () => {
  const p = read('textarea');
  p.intake = { ...p.intake, id: 'LIP-002', title: 'Stepper', kind: 'pattern', status: 'proposed', issue: undefined, decision: undefined, resolved: undefined };
  delete p.intake.issue;
  delete p.intake.decision;
  delete p.intake.resolved;
  delete p.spec;
  return p;
};

test('from-issue writes the embedded proposal and links the issue', () => {
  const url = 'https://github.com/o/r/issues/40';
  const r = fromIssue({ dir, body: proposalIssueBody(stepper(), 'stepper'), issueUrl: url });
  assert.equal(r.found, 'true');
  assert.equal(r.id, 'LIP-002');
  assert.equal(read('stepper').intake.issue, url);
});

test('from-issue gives a clashing id the next free one', () => {
  const p = stepper();
  p.intake.id = 'LIP-001';
  const r = fromIssue({ dir, body: proposalIssueBody(p, 'stepper'), issueUrl: 'https://github.com/o/r/issues/41' });
  assert.equal(r.reassigned, 'LIP-001');
  assert.equal(read('stepper').intake.id, 'LIP-002');
});

test('from-issue ignores form issues and existing files', () => {
  assert.equal(fromIssue({ dir, body: '### Kind\ncomponent' }).found, 'false');
  const body = proposalIssueBody(stepper(), 'stepper');
  fromIssue({ dir, body, issueUrl: 'https://github.com/o/r/issues/42' });
  assert.equal(fromIssue({ dir, body }).found, 'exists');
});

test('from-issue refuses an invalid proposal and writes nothing', () => {
  const p = stepper();
  delete p.intake.problem;
  const r = fromIssue({ dir, body: proposalIssueBody(p, 'stepper') });
  assert.equal(r.found, 'invalid');
  assert.ok(!existsSync(join(dir, 'stepper.json')));
});

test('set-status mirrors the label and records accept / decline decisions', () => {
  const url = 'https://github.com/o/r/issues/43';
  fromIssue({ dir, body: proposalIssueBody(stepper(), 'stepper'), issueUrl: url });
  const r = setStatus({ dir, issueUrl: url, status: 'declined', actor: 'StillXP' });
  assert.equal(r.changed, 'true');
  const i = read('stepper').intake;
  assert.equal(i.status, 'declined');
  assert.equal(i.decision.outcome, 'declined');
  assert.equal(i.decision.by, 'StillXP');
  assert.equal(setStatus({ dir, issueUrl: url, status: 'declined' }).changed, 'false');
  assert.equal(setStatus({ dir, issueUrl: 'https://github.com/o/r/issues/999', status: 'triage' }).found, 'false');
});
