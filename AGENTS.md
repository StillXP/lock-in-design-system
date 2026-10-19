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
| Component spec | `packages/specs/components/<slug>.json` | `npm run validate -w @lockin/specs` |
| Web component | `packages/react/src/components/<Name>/` | `npm run build -w @lockin/react` |
| Native component | `packages/react-native/src/components/<Name>.tsx` | `npm run typecheck -w @lockin/react-native` |
| Stories | `apps/storybook/src/stories/{atoms,molecules,organisms}/` (components), `foundations/` | `npm run typecheck -w @lockin/storybook && npm test -w @lockin/storybook` (runs every story with axe) |
| Hub server | `apps/server/src/` | `npm run typecheck -w @lockin/server && npm test -w @lockin/server` |
| Docs | `docs/*.md` | — |

Rules:
- Keep web and native props in sync and update the spec in the same change. Update the component's stories too.
- Every component spec has a `level` (`atom`, `molecule` or `organism`; see `docs/components.md`). Its stories are titled `<Atoms|Molecules|Organisms>/<Name>` and filed in the matching `stories/` folder. A server test enforces this.
- Never lower a contrast pair; if the checker fails, fix the token mapping, not the check.
- Component CSS may only reference `--ds-*` variables.
- Bump the spec `version` when editing specs by hand (major: removed/changed props; minor: additions; patch: other).
- Run `npm run build` and the server tests before finishing.
- `TODO.md` is the project backlog. Check its "Now" section at the start of a session, add follow-ups you find along the way, and delete items once done.
