# Lock In Design System

A cross-platform design system for personal projects (tournament apps, web games, dashboards, web stores), built for both people and AI agents, on web and mobile.

- Tokens: an 8-hue × 10-step base palette, semantic colors with light and dark values, typography, a 10-step spacing scale (4 to 128px, base 16), radius, shadow and motion. Output for CSS, JS/TS, React Native and JSON.
- 14 components, each for React (web) and React Native (iOS/Android) with the same props, organized by atomic level. Atoms: Button, Icon, Link, Checkbox, Toggle, Tag. Molecules: InputField, Search, Select, RadioGroup, Dropdown, Tabs. Organisms: DataTable, Modal.
- AI-readable specs: one JSON file per component covering name, import, status, version, purpose, props, states, tokens, accessibility, variants and usage (do / don't / related / example).
- Accessibility: WCAG 2.1 AA / IBM requirements. 486 contrast checks run on every token build and on every edit through the hub.
- Hub server: REST API, MCP server (HTTP and stdio), web UI, API-key auth with roles, versioning, change tracking, releases and public read access.

## Quick start

```bash
npm install
npm run build            # tokens → icons → specs → react → react-native (+ contrast & spec validation)
npm run dev              # hub at http://127.0.0.1:4400 — prints your admin API key on first run
npm run storybook        # Storybook at http://127.0.0.1:6006 — every component, token group and icon
npm test -w @lockin/server
```

Requires Node ≥ 22.13.

## Repo map

| Path | What |
| --- | --- |
| `packages/tokens` | Token sources (`src/`) and build (`dist/`: CSS, JS, native, JSON) |
| `packages/icons` | Icon path data shared by web and native |
| `packages/specs` | Component specs + JSON Schema + validator |
| `packages/react` | Web components |
| `packages/react-native` | Mobile components |
| `apps/server` | Hub: REST + MCP + web UI + auth + versioning |
| `apps/storybook` | Storybook: foundations (color, type, spacing, effects), icons, then component stories by level (atoms, molecules, organisms) with spec-driven docs and axe checks |
| `docs/` | Guides (also served by the hub) |
| `llms.txt`, `AGENTS.md` | Entry points for AI agents |

## Diagrams

Open in a browser (self-contained HTML, in `docs/diagrams/`):

- [How the packages fit together](docs/diagrams/package-map.html): dependency graph
- [From token JSON to every platform](docs/diagrams/token-pipeline.html): token build and contrast gate
- [Inside the hub server](docs/diagrams/hub-architecture.html): REST, MCP, auth, storage
- [What happens when an agent edits a token](docs/diagrams/edit-lifecycle.html): sequence with rollback

## Docs

- [Architecture](docs/architecture.md): diagrams of packages, token pipeline, hub, edit lifecycle
- [Getting started](docs/getting-started.md)
- [Tokens](docs/tokens.md)
- [Token naming](docs/token-naming.md): why the names look the way they do, and how to name a new token
- [Components](docs/components.md)
- [Accessibility](docs/accessibility.md)
- [Theming & customization](docs/theming.md)
- [MCP server & API](docs/mcp-server.md)
- [Contributing](docs/contributing.md)

## Roadmap

- Figma: token sync (Variables) and Code Connect mappings. Specs and DTCG tokens are already structured for it.
- Publish packages to a registry.
- Visual regression and automated axe test runs in CI for the Storybook stories. The a11y panel already checks each story interactively.
