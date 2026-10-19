import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkSpec, createPrograms } from '../scripts/check-code.mjs';
import { loadSpecs } from '../scripts/validate.mjs';

const programs = createPrograms();
const button = () => structuredClone(loadSpecs().find((s) => s.spec.slug === 'button').spec);
const run = (mutate) => { const spec = button(); mutate(spec); return checkSpec(spec, programs); };
const prop = (spec, name) => spec.props.find((p) => p.name === name);

test('the unchanged Button spec matches the code', () => {
  assert.deepEqual(checkSpec(button(), programs), []);
});

test('reports a prop the component declares but the spec does not list', () => {
  const errors = run((s) => { s.props = s.props.filter((p) => p.name !== 'loadingLabel'); });
  assert.match(errors.join('\n'), /web: code declares "loadingLabel" but the spec does not list it/);
  assert.match(errors.join('\n'), /native: code declares "loadingLabel"/);
});

test('reports a spec prop the component does not have', () => {
  const errors = run((s) => { s.props.push({ name: 'pulse', type: 'boolean', required: false, description: 'x' }); });
  assert.match(errors.join('\n'), /web: spec lists "pulse" but ButtonProps has no such prop/);
});

test('reports a prop listed for the wrong platform', () => {
  const errors = run((s) => { prop(s, 'loadingLabel').platforms = ['web']; });
  assert.match(errors.join('\n'), /native: code declares "loadingLabel" but the spec only lists it for the other platform/);
});

test('reports changed string-literal values', () => {
  const errors = run((s) => { prop(s, 'size').type = "'sm' | 'md'"; });
  assert.match(errors.join('\n'), /"size" values differ. Spec: md, sm. Code: lg, md, sm/);
});

test('reports a changed default', () => {
  const errors = run((s) => { prop(s, 'size').default = 'sm'; });
  assert.match(errors.join('\n'), /"size" defaults to "md" in code but "sm" in the spec/);
});

test('reports a default the spec leaves out', () => {
  const errors = run((s) => { delete prop(s, 'variant').default; });
  assert.match(errors.join('\n'), /"variant" defaults to "primary" in code but the spec lists no default/);
});

test('reports required vs optional drift', () => {
  const errors = run((s) => { prop(s, 'loading').required = true; });
  assert.match(errors.join('\n'), /"loading" is optional in code but the spec says required: true/);
});
