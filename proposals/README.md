# Proposals (LIP)

Intake for changes to Lock In: new components, variants, tokens, icons and patterns, or changes to existing ones. Each proposal is one JSON file here plus one GitHub issue. The file is the source of truth and the issue is where the discussion happens.

## Lifecycle

`proposed → triage → accepted → in-design → in-code → released`, or `declined`.

The `intake.status` field and the issue's `status:*` label always match. Only the design system owner moves a proposal past `triage`.

## What a proposal contains

`proposal.schema.json` defines the format.

- **`intake`:** id (`LIP-NNN`, never reused), kind, problem, evidence of reuse (with Figma and code links), closest existing component and why it can't be extended, stand-in, proposed Figma properties, contrast results, open questions, and links to the prototype and the issue.
- **`spec`** (component proposals): a draft that already passes `packages/specs/schema/component.schema.json` and the token check, with `status: "experimental"`. Accepting the proposal means finishing this draft and moving it to `packages/specs/components/`.

## Commands

```bash
npm run validate:proposals                  # schema + token checks for every proposal (part of npm run check)
node proposals/build-page.mjs <slug> [out]  # prototype page: inlines arena tokens, base field CSS and the proposal
```

`page/<slug>.html` holds the prototype page. The header, evidence, spec tables and questions are generated from the JSON. Only the "Try it" renderer is written per component. Copy an existing page to start a new one.

## Filing one

- **With an agent:** run `/ds-propose <name>` in Claude Code from any product repo. It checks for duplicates (`list_components`, `search_design_system`, the files here), drafts the spec from the stand-in, runs `check_contrast`, validates, builds and publishes the prototype, and opens the issue with the `proposal`, `status:proposed` and `kind:*` labels.
- **By hand:** open an issue with the "Lock In proposal" template. A maintainer or agent turns it into a file.

## Triage checklist

1. Is it reused, or likely to be, in more than one product or flow? If not, it stays a product pattern.
2. Could an existing component take a variant or prop instead?
3. Is the accessibility pattern settled (APG, WCAG list, keyboard)?
4. Are the open questions answered? Record the decision in `intake.decision`.
