import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkAll, checkTemplate, templateInfo } from '../scripts/check-figma.mjs';
import { loadSpecs } from '../scripts/validate.mjs';

const repo = join(fileURLToPath(import.meta.url), '..', '..', '..', '..');
const button = () => structuredClone(loadSpecs().find((s) => s.spec.slug === 'button').spec);
const template = () => readFileSync(join(repo, 'packages/react/figma/Button.figma.ts'), 'utf8');
const row = (spec, name) => spec.figma.props.find((r) => r.figma === name);

test('the Code Connect templates match the specs', () => {
  assert.deepEqual(checkAll(), []);
});

test('reads the component and node id from a template header', () => {
  assert.deepEqual(templateInfo(template()), { component: 'Button', nodeId: '5:422' });
});

test('reports a property the template reads that the spec has no row for', () => {
  const spec = button();
  spec.figma.props = spec.figma.props.filter((r) => r.figma !== 'size');
  assert.match(checkTemplate(template(), spec).join('\n'), /getEnum\('size'\) but Button's figma.props has no row for "size"/);
});

test('reports a property read with the wrong Figma type', () => {
  const spec = button();
  row(spec, 'size').figmaType = 'TEXT';
  assert.match(checkTemplate(template(), spec).join('\n'), /getEnum\('size'\) reads a VARIANT property but the spec row says TEXT/);
});

test('reports a variant value the template does not map', () => {
  const spec = button();
  row(spec, 'variant').figmaValues.push('ghost');
  assert.match(checkTemplate(template(), spec).join('\n'), /getEnum\('variant'\) does not map ghost/);
});

test('reports a variant value the spec does not list', () => {
  const spec = button();
  row(spec, 'size').figmaValues = ['sm', 'md'];
  assert.match(checkTemplate(template(), spec).join('\n'), /getEnum\('size'\) maps lg, which the spec does not list/);
});
