# Agent guide — Lock In Design System

This repo *is* the design system. Instructions for AI agents working **in** it, and for agents **using** it in other projects.

## Using Lock In from another project

Connect the `lockin` MCP server (see `docs/mcp-server.md`), then:

1. `search_design_system` / `list_components` → find the component.
2. `get_component` → follow its `props`, `accessibility` and `usage` (do/dont/related/example) exactly.
3. Custom styling uses semantic tokens only (`get_tokens` with prefixes like `color.text`, `space`, `typography`). No hex values, no base palette tokens.
4. `check_contrast` for any new color pairing.
5. Nothing fits? Don't keep a private workaround: file a proposal (MCP prompt `propose_to_lockin`, or `docs/propose.md`).

Read `llms.txt` for the condensed version. Everything here works with any MCP-capable agent; nothing requires a specific AI tool.

## Agent playbooks

Multi-step procedures live in `docs/` as plain Markdown, so every agent follows the same steps. The hub also serves them (`get_doc`, `ds://docs/<slug>`) and as MCP prompts.

| Playbook | MCP prompt | When |
| --- | --- | --- |
| `docs/propose.md` | `propose_to_lockin` | A product needs something Lock In doesn't have |
| `docs/build-proposal.md` | `build_proposal` | A proposal is labelled `status:accepted` |

Tool-specific shortcuts (for example Claude Code's `/ds-propose` and `/ds-build`) must stay thin wrappers that point at these files. Change the playbook, not the wrapper.

## Working in this repo

| Task | Where | Verify with |
| --- | --- | --- |
| Tokens | `packages/tokens/src/**` (DTCG JSON; semantic colors need `light` + `dark` referencing base) | `npm run build -w @stillxp/tokens` (includes contrast check) |
| Figma variables | `packages/tokens/scripts/figma-export.mjs`; rules in `docs/figma-sync.md` | `npm run figma -w @stillxp/tokens` |
| Component spec | `packages/specs/components/<slug>.json` | `npm run validate -w @stillxp/specs && npm run check:code -w @stillxp/specs` |
| Web component | `packages/react/src/components/<Name>/` | `npm run build -w @stillxp/react` |
| Native component | `packages/react-native/src/components/<Name>.tsx` | `npm run typecheck -w @stillxp/react-native` |
| Stories | `apps/storybook/src/stories/{atoms,molecules,organisms}/` (components), `foundations/` | `npm run typecheck -w @stillxp/storybook && npm test -w @stillxp/storybook` (runs every story with axe) |
| Hub server | `apps/server/src/` | `npm run typecheck -w @stillxp/server && npm test -w @stillxp/server` |
| Docs and agent playbooks | `docs/*.md` | `npm test -w @stillxp/server` (serves them and the MCP prompts) |
| Proposals (LIP) | `proposals/<slug>.json`, `proposals/page/<slug>.html`; workflow `.github/workflows/proposals.yml` | `npm run validate:proposals && npm run test:proposals` |

Rules:
- Keep web and native props in sync and update the spec in the same change. Update the component's stories too.
- `npm run check:code -w @stillxp/specs` compares each spec with the real React and React Native prop types (names, required, string values, defaults, platforms) and runs in CI. A component prop that the spec doesn't list, or a spec prop the component doesn't have, fails the build.
- `npm run check:figma -w @stillxp/specs` compares each Code Connect template in `packages/react/figma/` with its spec's `figma.props` (property names, Figma types, variant values) and runs in CI. Change a Figma property in the spec and its template together.
- Every spec prop needs a row in `figma.props` (validation fails otherwise), and the "Props / <Name>" frame on the component's Figma page must match it. Adding a prop means a new row, with status `code-only` if Figma has no equivalent. See "Figma props mapping" in `docs/components.md`.
- Every component spec has a `level` (`atom`, `molecule` or `organism`; see `docs/components.md`). Its stories are titled `<Atoms|Molecules|Organisms>/<Name>` and filed in the matching `stories/` folder. A server test enforces this.
- A component proposal ships in Figma and in code, or not at all. `status:released` is refused until the library page (Docs and Props frames), `figma.props` and the Code Connect template exist. See "Acceptance criteria" in `docs/build-proposal.md`.
- Never lower a contrast pair; if the checker fails, fix the token mapping, not the check.
- Component CSS may only reference `--ds-*` variables.
- Bump the spec `version` when editing specs by hand (major: removed/changed props; minor: additions; patch: other).
- Run `npm run build` and the server tests before finishing.
- Follow the Git workflow below.
- `TODO.md` is the project backlog. Check its "Now" section at the start of a session, add follow-ups you find along the way, and delete items once done.

## Git workflow

- Never commit or push to `main`. Start every change on a branch named `type/short-description` (`feat/`, `fix/`, `docs/`, `chore/`). Git hooks in `.githooks/` (enabled by `npm install`) block commits on `main`, pushes to `main` and force pushes, whatever tool runs git; GitHub branch protection backs them up. Claude Code also runs `.claude/hooks/guard-main.mjs`, which catches the same commands before they run. Don't bypass them with `--no-verify`.
- Commit messages and PR titles use Conventional Commits: `type(scope): summary`, with `!` after the type for breaking changes. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. CI rejects PR titles that don't match.
- One logical change per commit; put the why in the body.
- Land changes with a pull request (`gh pr create`), squash-merged, then delete the branch. The PR title becomes the commit on `main`, and the PR template lists what to check.
- CI (`.github/workflows/ci.yml`) runs `npm run check`, `npm run build` (includes the story and axe tests) and the server tests on every PR. Don't merge a red PR.
- Only commit, push or merge when the user asks.
