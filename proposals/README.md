# Proposals (LIP)

Intake for changes to Lock In: new components, variants, tokens, icons and patterns, or changes to existing ones. Each proposal is one JSON file here plus one GitHub issue. The file is the source of truth and the issue is where the discussion happens.

## Lifecycle

`proposed → triage → accepted → in-design → in-code → released`, or `declined`.

![Proposal lifecycle: a hub or agent (submit_proposal) or the GitHub issue form files a proposal, which moves from Proposed through Triage, Accepted and In code to Released, with an optional In design route (Figma first, then code) and Declined as the other outcome. Each status label the owner adds runs the Proposals workflow, which mirrors it into proposals/<slug>.json.](../docs/diagrams/proposal-lifecycle.svg)

[Open full size](../docs/diagrams/proposal-lifecycle.html)

The `intake.status` field and the issue's `status:*` label always match. Only the design system owner moves a proposal past `triage`.

## What a proposal contains

`packages/specs/schema/proposal.schema.json` defines the format (validation lives in `@stillxp/specs/proposals`, shared by the CLI and the hub).

- **`intake`:** id (`LIP-NNN`, never reused), kind, problem, evidence of reuse (with Figma and code links), closest existing component and why it can't be extended, stand-in, proposed Figma properties, contrast results, open questions, and links to the prototype and the issue.
- **`spec`** (component proposals): a draft that already passes `packages/specs/schema/component.schema.json` and the token check, with `status: "experimental"`. Accepting the proposal means finishing this draft and moving it to `packages/specs/components/`.

## Commands

```bash
npm run validate:proposals                  # schema + token checks for every proposal (part of npm run check)
node proposals/build-page.mjs <slug> [out]  # prototype page: inlines arena tokens, base field CSS and the proposal
```

`page/<slug>.html` holds the prototype page. The header, evidence, spec tables and questions are generated from the JSON. Only the "Try it" renderer is written per component. Copy an existing page to start a new one. The hub serves the built page at `/proposals/<slug>/prototype`; `build-page.mjs` writes the same page as one static file you can host anywhere.

## Filing one

The steps are in the [propose playbook](../docs/propose.md) and, once accepted, the [build playbook](../docs/build-proposal.md). They work with any agent.

- **From any agent with the `lockin` MCP:** use the `propose_to_lockin` prompt, or follow the playbook: `list_proposals` to check for an existing one, then `submit_proposal` (or `add_proposal_evidence`). The hub assigns the id, validates, writes the file and opens the issue.
- **Claude Code shortcut:** `/ds-propose <name>` (and `/ds-build LIP-NNN` after acceptance) run the same playbooks.
- **By hand:** open an issue with the "Lock In proposal" template. A maintainer or agent turns it into a file.

## Automation (`.github/workflows/proposals.yml`)

| When | What happens |
| --- | --- |
| The hub files a proposal (`submit_proposal`) | The issue it opens embeds the proposal file. The workflow writes it to `proposals/<slug>.json` and opens a PR. If the id was taken meanwhile, it takes the next free one and renames the issue. |
| Someone files the issue form | With a CI agent: it follows the propose playbook ("From an issue form"), drafts the proposal file, validates it and opens the PR (only for the repo owner, members and collaborators, since issue text is untrusted). Without one: a comment asks someone to run the playbook with their agent. |
| `status:accepted` is added | The decision is recorded. With a CI agent: it follows the build playbook (code only) on `feat/<slug>` (spec, React, React Native, stories, docs, checks), opens a **draft** PR and moves the issue to `status:in-code`. Without one: a small PR records the decision and a comment asks someone to run the build playbook. |
| `status:triage` / `status:declined` / `status:released` is added | A small PR updates the file's status (and decision). Declined and released close the issue; released also publishes Code Connect when `FIGMA_ACCESS_TOKEN` is set. |

Secrets:
- `PROPOSALS_BOT_TOKEN` (needed): a fine-grained token with contents, pull requests and issues write access. Without it the workflow falls back to `GITHUB_TOKEN`, which can't open PRs in this repo and whose PRs wouldn't trigger CI.
- `CLAUDE_CODE_OAUTH_TOKEN` (optional): turns on the CI agent, which is Claude Code today (`claude setup-token`; runs on a Claude subscription). Leave it out to run those steps in a local agent session instead.

The CI agent is swappable. The two agent steps only pass a prompt ("follow `docs/<playbook>.md`, with these CI limits") and an allow-list of commands. To use another agent, replace those steps' `uses:`/`with:` with that agent's GitHub Action, and point `HAS_AGENT` at its secret.
- `FIGMA_ACCESS_TOKEN` (optional): Code Connect publish on release.

The script steps live in `proposals/ci.mjs` (`npm run test:proposals`).

Still manual on purpose: triage decisions, merging, the Figma library component and its publish, and adding `status:released` once it's published.

## Triage checklist

1. Is it reused, or likely to be, in more than one product or flow? If not, it stays a product pattern.
2. Could an existing component take a variant or prop instead?
3. Is the accessibility pattern settled (APG, WCAG list, keyboard)?
4. Are the open questions answered? Record the decision in `intake.decision`.
