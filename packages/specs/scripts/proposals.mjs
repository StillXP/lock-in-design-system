// Lock In proposals (LIP): intake requests for new components, variants, tokens, icons, patterns or changes.
// Shared by proposals/validate.mjs (CLI, CI) and the hub (REST + MCP submit_proposal).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { validateSpec } from './validate.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const proposalSchema = JSON.parse(readFileSync(join(root, 'schema', 'proposal.schema.json'), 'utf8'));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateIntake = ajv.compile(proposalSchema);

export const PROPOSAL_ID = /^LIP-(\d{3,})$/;

/**
 * Errors for one proposal: the intake schema, and for component proposals the draft spec
 * (component schema + token names via validateSpec). Pass `tokens` to reuse a loaded token map.
 */
export function validateProposal(proposal, file, tokens) {
  const errors = [];
  if (!validateIntake(proposal)) for (const e of validateIntake.errors) errors.push(`${e.instancePath || '/'} ${e.message}`);
  if (proposal?.intake?.kind === 'component') {
    if (!proposal.spec) errors.push('component proposals need a draft spec');
    else {
      if (proposal.spec.status !== 'experimental') errors.push('draft spec status must be "experimental"');
      errors.push(...validateSpec(proposal.spec, file, tokens).map((e) => `spec: ${e}`));
    }
  }
  return errors;
}

// ---------- release gate: design and code parity ----------
// A component proposal can't be released until it exists in the Figma library as well as in code. The repo
// half is checked here (spec `figma` node, a Props table row for every prop, a Code Connect template); the
// Figma half (component page with its Docs and Props frames) by figmaReleaseGaps when a token is available.

/**
 * What a component proposal still needs before it can be released, as readable sentences. Empty means ready.
 * Other kinds return []: they don't add a library component.
 */
export function releaseGaps(proposal, slug, repoRoot) {
  if (proposal?.intake?.kind !== 'component') return [];
  const specSlug = proposal.spec?.slug ?? slug;
  const specFile = join(repoRoot, 'packages', 'specs', 'components', `${specSlug}.json`);
  if (!existsSync(specFile)) return [`no shipped spec: packages/specs/components/${specSlug}.json is missing`];
  const spec = JSON.parse(readFileSync(specFile, 'utf8'));
  const name = spec.name;
  const gaps = [];
  if (!spec.figma?.fileKey || !spec.figma?.nodeId) {
    gaps.push(`the ${name} spec has no \`figma\` fileKey and nodeId (build the library component, docs/build-proposal.md section 2)`);
  }
  if (!spec.figma?.props?.length) {
    gaps.push(`the ${name} spec has no \`figma.props\` table mapping its props to Figma properties`);
  }
  const figmaDir = join(repoRoot, 'packages', 'react', 'figma');
  const templates = existsSync(figmaDir) ? readdirSync(figmaDir).filter((f) => f.endsWith('.figma.ts')) : [];
  const main = templates
    .map((f) => readFileSync(join(figmaDir, f), 'utf8'))
    .find((text) => text.match(/^\/\/ component=(.+)$/m)?.[1].trim() === name && (!spec.figma?.nodeId || text.includes(`node-id=${spec.figma.nodeId.replace(':', '-')}`)));
  if (!main) gaps.push(`no Code Connect template for ${name}: add packages/react/figma/${name}.figma.ts pointing at the spec's figma.nodeId`);
  return gaps;
}

/**
 * The Figma half of the release gate, read through the REST API: the spec's node exists, and the page holding it
 * has "Docs / <Name>" and "Props / <Name>" frames like every other component page. Needs a Figma access token.
 */
export async function figmaReleaseGaps(spec, token, fetchImpl = fetch) {
  if (!spec?.figma?.fileKey || !spec.figma.nodeId) return [];
  const get = async (path) => {
    const res = await fetchImpl(`https://api.figma.com/v1/files/${spec.figma.fileKey}${path}`, { headers: { 'X-Figma-Token': token } });
    if (!res.ok) throw new Error(`Figma API ${res.status} for ${path}`);
    return res.json();
  };
  const gaps = [];
  const nodes = await get(`/nodes?ids=${encodeURIComponent(spec.figma.nodeId)}&depth=1`);
  if (!nodes.nodes?.[spec.figma.nodeId]) return [`Figma node ${spec.figma.nodeId} (the spec's figma.nodeId) doesn't exist in the library file`];
  const file = await get('?depth=2');
  const page = file.document.children.find((p) => p.children?.some((n) => n.id === spec.figma.nodeId));
  if (!page) return [`Figma node ${spec.figma.nodeId} isn't a top-level node on a page; put the component set on its own "${spec.name}" page`];
  const byName = new Map(page.children.map((n) => [n.name, n]));
  for (const frame of [`Docs / ${spec.name}`, `Props / ${spec.name}`]) {
    if (!byName.has(frame)) gaps.push(`the "${page.name}" page in Figma has no "${frame}" frame (clone a sibling page's frame, docs/build-proposal.md section 2)`);
  }
  // The Props frame's "Prop table" has one row per mapping, named "<code prop[ / prop]> → <Figma property>".
  const propsFrame = byName.get(`Props / ${spec.name}`);
  if (propsFrame) {
    const { nodes: frameNodes } = await get(`/nodes?ids=${encodeURIComponent(propsFrame.id)}&depth=2`);
    const table = frameNodes?.[propsFrame.id]?.document?.children?.find((n) => n.name === 'Prop table');
    if (!table) gaps.push(`"Props / ${spec.name}" in Figma has no "Prop table" frame`);
    else {
      // Some spec props are combined names ("value / defaultValue"), so keep the whole left side as well as its parts.
      const mapped = new Set(
        table.children.flatMap((row) => {
          const code = row.name.split(' → ')[0].trim();
          return [code, ...code.split(' / ').map((s) => s.trim())];
        }),
      );
      const missing = (spec.props ?? []).map((p) => p.name).filter((name) => !mapped.has(name));
      if (missing.length) gaps.push(`the Figma Prop table for ${spec.name} has no row for ${missing.join(', ')}`);
    }
  }
  return gaps;
}

/** Every proposals/*.json file in `dir`, sorted by id. */
export function loadProposals(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ file: join(dir, f), slug: basename(f, '.json'), proposal: JSON.parse(readFileSync(join(dir, f), 'utf8')) }))
    .sort((a, b) => String(a.proposal.intake?.id).localeCompare(String(b.proposal.intake?.id)));
}

/** Next unused LIP number. Ids are never reused, so this is one past the highest ever seen. */
export function nextProposalId(proposals) {
  const max = proposals.reduce((m, p) => Math.max(m, Number(p.intake?.id?.match(PROPOSAL_ID)?.[1] ?? 0)), 0);
  return `LIP-${String(max + 1).padStart(3, '0')}`;
}

// ---------- GitHub issue body ----------
// The hub opens an issue for each proposal it files and embeds the proposal file in the body, so the
// Proposals workflow can turn the issue into a PR without the hub needing write access to the repo.

const EMBED_START = '<!-- lip:proposal';
const EMBED_RE = /<!-- lip:proposal slug=([a-z][a-z0-9-]*) -->\s*```json\n([\s\S]*?)\n```/;

/** Markdown issue body for a proposal, with the proposal file embedded (collapsed) at the end. */
export function proposalIssueBody(proposal, slug) {
  const i = proposal.intake;
  const list = (items) => items.map((x) => `- ${x}`).join('\n') || '- (none)';
  return [
    `**Proposal file:** \`proposals/${slug}.json\` (the Proposals workflow opens a PR with it)`,
    `**Kind:** ${i.kind}   **From:** ${i.submitted.from}   **Submitted:** ${i.submitted.date} by ${i.submitted.by}`,
    i.prototype ? `**Prototype:** ${i.prototype}` : '',
    `### Problem\n${i.problem}`,
    `### Evidence\n${list(i.evidence.map((e) => `**${e.product}**: ${e.link ? `[${e.where}](${e.link})` : e.where}${e.note ? ` · ${e.note}` : ''}`))}`,
    `### Closest existing\n${list(i.closestExisting.map((c) => `**${c.name}**: ${c.whyNotExtend}`))}`,
    `### Open questions\n${list(i.openQuestions)}`,
    `<details><summary>Proposal file (for the workflow, don't edit)</summary>\n\n${EMBED_START} slug=${slug} -->\n\`\`\`json\n${JSON.stringify(proposal, null, 2)}\n\`\`\`\n</details>`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** The proposal embedded by proposalIssueBody, or null when the issue has none (e.g. filed with the form). */
export function proposalFromIssueBody(body) {
  const m = String(body ?? '').match(EMBED_RE);
  if (!m) return null;
  return { slug: m[1], proposal: JSON.parse(m[2]) };
}

// ---------- prototype page ----------
// proposals/page/<slug>.html is a template; the built page inlines the arena theme tokens, Lock In's base
// field CSS and the proposal JSON, so it renders the real system with no build server. Used by
// proposals/build-page.mjs (static file for any host) and the hub (GET /proposals/:slug/prototype).

/** The built prototype page for a proposal, or null when it has no page template. */
export function renderPrototype({ repoRoot, proposalsDir = join(repoRoot, 'proposals') }, slug) {
  if (!/^[a-z][a-z0-9-]*$/.test(slug)) return null;
  const template = join(proposalsDir, 'page', `${slug}.html`);
  const file = join(proposalsDir, `${slug}.json`);
  if (!existsSync(template) || !existsSync(file)) return null;
  const proposal = JSON.parse(readFileSync(file, 'utf8'));
  const tokens = readFileSync(join(repoRoot, 'packages/tokens/dist/css/themes/arena.css'), 'utf8')
    .replace(/@font-face\s*{[^}]*}\s*/g, ''); // fonts load from Google Fonts in the page
  const base = readFileSync(join(repoRoot, 'packages/react/src/styles/base.css'), 'utf8');
  return readFileSync(template, 'utf8')
    .replace('/*__TOKENS__*/', () => tokens)
    .replace('/*__BASE__*/', () => base)
    .replace('/*__PROPOSAL__*/', () => JSON.stringify(proposal).replace(/</g, '\\u003c'));
}

/** Duplicate ids across a set of proposals: "LIP-002 is used by a.json and b.json". */
export function duplicateIds(entries) {
  const seen = new Map();
  const errors = [];
  for (const { slug, proposal } of entries) {
    const id = proposal.intake?.id;
    if (!id) continue;
    if (seen.has(id)) errors.push(`${id} is used by ${seen.get(id)}.json and ${slug}.json`);
    else seen.set(id, slug);
  }
  return errors;
}
