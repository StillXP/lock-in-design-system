import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { proposalIssueBody } from '@stillxp/specs/proposals';
import { checkRelease, fromIssue, setStatus } from './ci.mjs';

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

// ---------- release gate ----------
const repoRoot = join(here, '..');
const textareaIssue = 'https://github.com/StillXP/lock-in-design-system/issues/21';
const textareaSpec = () => JSON.parse(readFileSync(join(repoRoot, 'packages/specs/components/textarea.json'), 'utf8'));

/** A repo with only a Textarea spec (optionally changed) and, if asked, its Code Connect template. */
const fakeRepo = ({ spec = textareaSpec(), template = true } = {}) => {
  const root = mkdtempSync(join(tmpdir(), 'lip-repo-'));
  mkdirSync(join(root, 'packages/specs/components'), { recursive: true });
  writeFileSync(join(root, 'packages/specs/components/textarea.json'), JSON.stringify(spec));
  mkdirSync(join(root, 'packages/react/figma'), { recursive: true });
  if (template) cpSync(join(repoRoot, 'packages/react/figma/Textarea.figma.ts'), join(root, 'packages/react/figma/Textarea.figma.ts'));
  return root;
};

/** Fake Figma REST API for the Textarea page: component set, Docs and Props frames, a Prop table row per prop. */
const fakeFigma = ({ frames = ['Docs / Textarea', 'Props / Textarea'], rows } = {}) => {
  const spec = textareaSpec();
  const tableRows = (rows ?? spec.props.map((p) => p.name)).map((name) => ({ name: `${name} → x` }));
  const page = { id: '177:35', name: 'Textarea', children: [{ id: spec.figma.nodeId, name: 'Textarea' }, ...frames.map((name, i) => ({ id: `9:${i}`, name }))] };
  return async (url) => {
    const u = new URL(url);
    let body;
    if (u.pathname.endsWith('/nodes')) {
      const id = u.searchParams.get('ids');
      body = { nodes: { [id]: { document: id.startsWith('9:') ? { id, children: [{ name: 'Prop table', children: tableRows }] } : { id } } } };
    } else body = { document: { children: [page] } };
    return { ok: true, json: async () => body };
  };
};

test('check-release passes a component that is in Figma and in code', async () => {
  const r = await checkRelease({ dir, repoRoot, issueUrl: textareaIssue });
  assert.equal(r.ready, 'true');
  assert.equal(r.figma, 'skipped');
  const checked = await checkRelease({ dir, repoRoot, issueUrl: textareaIssue, figmaToken: 't', fetchImpl: fakeFigma() });
  assert.equal(checked.ready, 'true', checked.gaps);
  assert.equal(checked.figma, 'checked');
});

test('check-release blocks a component with no Figma node, Props table or Code Connect', async () => {
  const spec = textareaSpec();
  delete spec.figma;
  const root = fakeRepo({ spec, template: false });
  try {
    const r = await checkRelease({ dir, repoRoot: root, issueUrl: textareaIssue, figmaToken: 't', fetchImpl: fakeFigma() });
    assert.equal(r.ready, 'false');
    assert.equal(r.from, 'released');
    assert.match(r.gaps, /no `figma` fileKey and nodeId/);
    assert.match(r.gaps, /no `figma.props` table/);
    assert.match(r.gaps, /no Code Connect template for Textarea/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('check-release reads the Figma page for the Docs and Props frames and a row per prop', async () => {
  const noProps = await checkRelease({ dir, repoRoot, issueUrl: textareaIssue, figmaToken: 't', fetchImpl: fakeFigma({ frames: ['Docs / Textarea'] }) });
  assert.equal(noProps.ready, 'false');
  assert.match(noProps.gaps, /no "Props \/ Textarea" frame/);
  const missingRow = await checkRelease({ dir, repoRoot, issueUrl: textareaIssue, figmaToken: 't', fetchImpl: fakeFigma({ rows: ['label', 'hideLabel'] }) });
  assert.equal(missingRow.ready, 'false');
  assert.match(missingRow.gaps, /Prop table for Textarea has no row for hint/);
  const down = await checkRelease({ dir, repoRoot, issueUrl: textareaIssue, figmaToken: 't', fetchImpl: async () => ({ ok: false, status: 403 }) });
  assert.equal(down.ready, 'false');
  assert.match(down.gaps, /couldn't read the Figma library/);
});

test('check-release lets kinds without a library component through', async () => {
  const p = read('textarea');
  p.intake.kind = 'token';
  delete p.spec;
  writeFileSync(join(dir, 'textarea.json'), JSON.stringify(p));
  const r = await checkRelease({ dir, repoRoot: fakeRepo({ template: false }), issueUrl: textareaIssue });
  assert.equal(r.ready, 'true');
  assert.equal(r.figma, 'n/a');
});
