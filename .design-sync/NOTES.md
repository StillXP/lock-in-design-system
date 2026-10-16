# design-sync notes

Shape: storybook (`apps/storybook/.storybook`), package `@lockin/react`, global `window.LockIn`.
Rebuild + verify: `node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules --entry packages/react/dist/index.js --out ./ds-bundle` (add `--remote <anchor>` once `_ds_sync.json` is fetched from the project). Stage `.ds-sync/` from the skill first on a fresh clone; the reference Storybook is `npx storybook build -c .storybook -o <repo>/.design-sync/sb-reference` run from `apps/storybook`.

## Fixes applied

- [GENERAL] Every preview rendered an empty root: `import.meta.glob is not a function`. `apps/storybook/src/blocks/data.ts` loads the spec JSON with Vite's `import.meta.glob` and every story imports it. Fix: `.design-sync/overrides/story-imports.mjs` (fork, declared in `cfg.libOverrides`) expands eager globs into static JSON imports at compile time. Only handles a single `*` in the last path segment with `{ eager: true, import: 'default' }` options.
- [GENERAL] `.storybook/preview.tsx` decorators can't run outside Vite either, so `cfg.provider` is set to `DsRoot`, exported by `.design-sync/provider.mjs` via `cfg.extraEntries` (`../../.design-sync/provider.mjs`, package-relative). `DsRoot` = `<div class="ds-root">` plus a `<style>` embedding `apps/storybook/src/blocks/blocks.css` verbatim (stories use the `fd-*` helpers, e.g. `.fd-row` spaces the Sizes stories). `DsRoot` is public to designs: README and every prompt.md tell the agent to wrap in it.
- `cfg.titleMap` nulls the five foundation pages (Color, Shape&effects, Icons, Spacing&sizing, Typography); they aren't components.
- Prompt docs: `.design-sync/gen-docs.mjs` generates `.design-sync/docs/<Name>.md` from `packages/specs/components/*.json` (purpose, variants, JSX example, do/don't, related, accessibility). Wired through `cfg.docsDir` (package-relative: `../../.design-sync/docs`) and run first in `cfg.buildCmd`. Props come from the `.d.ts`.
- Conventions header: `.design-sync/conventions.md` via `cfg.readmeHeader`. Names in it were checked against the built CSS and bundle.

## Known warnings

- `[FONT_MISSING]` Inter (`--ds-font-family-sans`) and JetBrains Mono (`--ds-font-family-mono`): the tokens name them but no @font-face or font file exists anywhere in the repo, in Storybook or in the build. Both compare panels fall back to the same system fonts, so the oracle can't see it. Decided with the user to sync as is; fix = add the fonts to the design system (repo + Storybook) and re-sync.
- `[FONT_MISSING]` also lists `underline` and `line-through`: false positives from the `--ds-font-decoration-*` tokens. Ignore.

## Re-sync risks

- Specs are the doc source: editing `packages/specs/components/*.json` changes prompt.md and re-ships, so re-run `gen-docs.mjs` (buildCmd does). Adding a component whose `import.web` doesn't start `import { Name`  breaks the generator by design.
- The `import.meta.glob` fork only supports the one pattern shape above. A new Vite-only API in a story helper would blank previews again.
- `DsRoot` bundles the whole of `blocks.css`; its `.sb-lockin-canvas` rule is unused. A new `fd-*` helper used by stories ships automatically; a new non-class global rule in blocks.css would leak into previews and designs.
- Modal, Dropdown and Select stories only render closed triggers, so the open dialog, menu and listbox were never visually compared. Their behavior was not verified here.
- Story cap: compare captures 6 stories per component; the tail stories (Button 4, DataTable 3, Checkbox 2, InputField 2, RadioGroup 1, Toggle 1) were not individually graded. Raise with `--max-stories 10` if they carry distinct variants.
- Previews run React 19.3 (bundled via esbuild, no UMD); themes (`arena`, `arcade`) and dark mode are not covered by any preview or grade.
