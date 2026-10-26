# Agent guide — Lock In Design System

This repo *is* the design system. Instructions for AI agents working **in** it, and for agents **using** it in other projects.

## Using Lock In from another project

Connect the `lockin` MCP server (see `docs/mcp-server.md`), then:

1. `search_design_system` / `list_components` → find the component.
2. `get_component` → follow its `props`, `accessibility` and `usage` (do/dont/related/example) exactly.
3. Custom styling uses semantic tokens only (`get_tokens` with prefixes like `color.text`, `space`, `typography`). No hex values, no base palette tokens.
4. `check_contrast` for any new color pairing.

Read `llms.txt` for the condensed version.

## Working in this repo

| Task | Where | Verify with |
| --- | --- | --- |
| Tokens | `packages/tokens/src/**` (DTCG JSON; semantic colors need `light` + `dark` referencing base) | `npm run build -w @lockin/tokens` (includes contrast check) |
| Figma variables | `packages/tokens/scripts/figma-export.mjs`; rules in `docs/figma-sync.md` | `npm run figma -w @lockin/tokens` |
| Component spec | `packages/specs/components/<slug>.json` | `npm run validate -w @lockin/specs && npm run check:code -w @lockin/specs` |
| Web component | `packages/react/src/components/<Name>/` | `npm run build -w @lockin/react` |
| Native component | `packages/react-native/src/components/<Name>.tsx` | `npm run typecheck -w @lockin/react-native` |
| Stories | `apps/storybook/src/stories/{atoms,molecules,organisms}/` (components), `foundations/` | `npm run typecheck -w @lockin/storybook && npm test -w @lockin/storybook` (runs every story with axe) |
| Hub server | `apps/server/src/` | `npm run typecheck -w @lockin/server && npm test -w @lockin/server` |
| Docs | `docs/*.md` | — |

Rules:
- Keep web and native props in sync and update the spec in the same change. Update the component's stories too.
- `npm run check:code -w @lockin/specs` compares each spec with the real React and React Native prop types (names, required, string values, defaults, platforms) and runs in CI. A component prop that the spec doesn't list, or a spec prop the component doesn't have, fails the build.
- `npm run check:figma -w @lockin/specs` compares each Code Connect template in `packages/react/figma/` with its spec's `figma.props` (property names, Figma types, variant values) and runs in CI. Change a Figma property in the spec and its template together.
- Every spec prop needs a row in `figma.props` (validation fails otherwise), and the "Props / <Name>" frame on the component's Figma page must match it. Adding a prop means a new row, with status `code-only` if Figma has no equivalent. See "Figma props mapping" in `docs/components.md`.
- Every component spec has a `level` (`atom`, `molecule` or `organism`; see `docs/components.md`). Its stories are titled `<Atoms|Molecules|Organisms>/<Name>` and filed in the matching `stories/` folder. A server test enforces this.
- Never lower a contrast pair; if the checker fails, fix the token mapping, not the check.
- Component CSS may only reference `--ds-*` variables.
- Bump the spec `version` when editing specs by hand (major: removed/changed props; minor: additions; patch: other).
- Run `npm run build` and the server tests before finishing.
- Follow the Git workflow below.
- `TODO.md` is the project backlog. Check its "Now" section at the start of a session, add follow-ups you find along the way, and delete items once done.

## Git workflow

- Never commit or push to `main`. Start every change on a branch named `type/short-description` (`feat/`, `fix/`, `docs/`, `chore/`). A hook in `.claude/hooks/guard-main.mjs` blocks commits and pushes on `main` and force pushes.
- Commit messages and PR titles use Conventional Commits: `type(scope): summary`, with `!` after the type for breaking changes. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. CI rejects PR titles that don't match.
- One logical change per commit; put the why in the body.
- Land changes with a pull request (`gh pr create`), squash-merged, then delete the branch. The PR title becomes the commit on `main`, and the PR template lists what to check.
- CI (`.github/workflows/ci.yml`) runs `npm run check`, `npm run build` (includes the story and axe tests) and the server tests on every PR. Don't merge a red PR.
- Only commit, push or merge when the user asks.
