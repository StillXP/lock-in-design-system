# Architecture

> How Lock In is put together: the packages and what depends on what, how tokens become platform code, how the hub server is structured, and what happens when someone edits the system.

Each diagram links to a full-size interactive version. Sources live in `docs/diagrams/` (`.html` is the source of truth; `.svg` is exported from it).

## Packages

![Dependency graph: web and mobile apps consume the React and React Native packages, agents and people use the hub server, and everything converges on tokens (4 dependents) and icons (3).](./diagrams/package-map.svg)

[Open full size](./diagrams/package-map.html)

- Tokens is the foundation. Four packages depend on it, so a token change flows everywhere at once.
- Icons is shared path data, rendered as inline SVG on web and with `react-native-svg` on mobile.
- Component specs describe every component's contract, and the hub serves them to agents.
- Your apps only ever import `@lockin/react` or `@lockin/react-native` (plus the token CSS on web).

## Token pipeline

![Token build: base palette, semantic tokens and project themes are resolved, pass 486 WCAG contrast checks, then emit CSS variables, JS/TS, React Native values and a JSON index.](./diagrams/token-pipeline.svg)

[Open full size](./diagrams/token-pipeline.html)

- Sources are DTCG JSON in `packages/tokens/src/`. Semantic colors carry `{ light, dark }` references into the base palette; themes swap the brand hue and override specific tokens.
- The resolver (`lib/resolve.mjs`) follows alias chains per mode and theme.
- The contrast gate fails the build if any pair in `contrast-pairs.json` drops below WCAG AA, in either mode, for any theme.
- Every output comes from the same resolved values, so web, native and AI agents always agree. Details: [Tokens](./tokens.md).

## Hub server

![Hub architecture: browsers, scripts and remote agents authenticate with an API key and reach the REST API or MCP server; local agents connect to MCP over stdio. Both share one store backed by git-tracked files and SQLite.](./diagrams/hub-architecture.svg)

[Open full size](./diagrams/hub-architecture.html)

- REST and MCP call the same store, so validation, versioning and contrast enforcement are identical for people and agents.
- Auth maps a bearer API key to a role (viewer / editor / admin). The local stdio MCP server skips key auth because it runs as you on your machine; its role comes from `DS_STDIO_ROLE`.
- Content (tokens, specs, docs) stays in plain files tracked by git. Operational data (API key hashes, change log, releases) lives in SQLite. Details: [MCP server & API](./mcp-server.md).

## Edit lifecycle

![Sequence: an agent calls update_token; the store writes the source file and checks contrast; on success it rebuilds outputs, logs the change and returns the token; on failure it restores the file and returns the failing pairs.](./diagrams/edit-lifecycle.svg)

[Open full size](./diagrams/edit-lifecycle.html)

- The store writes the change, then re-resolves every token and re-runs every contrast check.
- On pass: outputs are rebuilt and the change is logged with who, why and a structural diff. Component edits also get an automatic semver bump.
- On fail: the original file is restored byte-for-byte and the caller gets a `422` listing exactly which pairs failed, so an agent can correct itself.
- Logged changes stay "unreleased" until an admin cuts a release, which snapshots the system and writes `CHANGELOG.md`.

## Agent tooling

![Two MCP servers: an AI agent reaches the lockin MCP over local stdio, which reads specs, tokens and docs from git-tracked files, and the Storybook MCP over HTTP while Storybook runs, which serves stories and runs the story tests. The build gate runs the same tests.](./diagrams/agent-mcp-servers.svg)

[Open full size](./diagrams/agent-mcp-servers.html)

- The lockin MCP says what a component should be (specs, tokens, contrast). The Storybook MCP says whether the rendered result passes.
- The Storybook MCP lives inside the Storybook dev server (`npm run storybook`, `http://127.0.0.1:6006/mcp`), so it only exists while that is running. It is registered in `.mcp.json`.
- Story tests run every story in headless Chromium with axe. `npm run build` runs the same tests, so what an agent checks locally is what the release gate enforces.
