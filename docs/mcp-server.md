# MCP server & API (the hub)

> The hub serves tokens, components and docs to people (web UI), programs (REST) and AI agents (MCP), with API-key auth, versioning and change tracking.

![Hub architecture: clients authenticate with an API key and reach the REST API or MCP server; local agents use MCP over stdio; both share one store backed by git-tracked files and SQLite.](./diagrams/hub-architecture.svg)

[Open full size](./diagrams/hub-architecture.html)

## Run it

```bash
npm install && npm run build      # once
npm run dev                       # http://127.0.0.1:4400 (watches for changes)
```

On first start the server prints a bootstrap admin key. Save it. Anyone can browse without a key (public read is on by default); to edit, open Settings in the web UI and paste the key.

| URL | What |
| --- | --- |
| `/` | Web UI: browse/search tokens, components, docs, changes (no key needed); edit with an API key |
| `/api` | REST API (index of endpoints) |
| `/mcp` | MCP over Streamable HTTP (stateless) |
| `/llms.txt` | Plain-text guide for agents (public) |
| `/storybook` | Static Storybook build (from `npm run build`); component pages embed its stories as live examples |

Environment variables:

| Variable | Default | Meaning |
| --- | --- | --- |
| `PORT` / `HOST` | `4400` / `127.0.0.1` | Bind address. Keep `127.0.0.1` unless you put it behind HTTPS. |
| `DS_DATA_DIR` | `apps/server/data` | SQLite database (keys, changes, releases) |
| `DS_PUBLIC_READ` | `true` | Anonymous callers get the read-only `viewer` role (REST, MCP, web UI). Set `false` to require a key for everything. |
| `DS_STDIO_ROLE` | `editor` | Role for the local stdio MCP server |

The server uses Node's built-in `node:sqlite` (Node ≥ 22.13). Node 22 prints an "ExperimentalWarning" for it; that's expected.

## Authentication & roles

Send a key as `Authorization: Bearer ds_…` (or `X-API-Key`). Keys are stored as SHA-256 hashes; the plaintext is shown once.

| Role | Can |
| --- | --- |
| `viewer` | Read everything (anonymous callers get this when public read is on) |
| `editor` | + edit tokens, components, docs; MCP write tools |
| `admin` | + cut releases, create/revoke API keys |

Manage keys from the web UI (Settings, admin only), the API (`/api/keys`), or the CLI:

```bash
npm run keys -w @lockin/server -- create --name "claude-agent" --role viewer
npm run keys -w @lockin/server -- list
npm run keys -w @lockin/server -- revoke --id <id>
```

Read-only agents need no key while public read is on. Give agents that edit the lowest role that works, usually `editor`.

## REST API

| Method & path | Role | Notes |
| --- | --- | --- |
| `GET /api/overview` | viewer | Version, counts, unreleased change count |
| `GET /api/search?q=&types=component,token,doc,icon` | viewer | Ranked results |
| `GET /api/tokens?prefix=&type=&theme=` | viewer | Flat resolved tokens |
| `GET /api/tokens/:name` | viewer | One token + source + `usedBy` components |
| `PUT /api/tokens/:name` | editor | `{ value, description?, type?, layer?, summary? }`; rejected (422) if contrast breaks |
| `GET /api/themes` | viewer | Theme configs |
| `GET /api/contrast?fg=&bg=&mode=&theme=` | viewer | Token names or hex |
| `GET /api/components[?full=true]` | viewer | Summaries (name, status, version, category, `level`, purpose, import) or full specs |
| `GET /api/components/:name` | viewer | Full spec (name or slug) |
| `PUT /api/components/:slug` | editor | `{ spec, bump?, summary? }`; validated, auto-versioned |
| `GET /api/components/:name/history` | viewer | Change log with diffs |
| `GET /api/components/:name/stories` | viewer | Storybook stories (`id`, `name`) for the live example, found under `<Level>/<Name>` from the spec's level; `[]` if Storybook isn't built |
| `GET /api/icons?query=` | viewer | Icon names/keywords |
| `GET /api/docs` · `GET /api/docs/:slug?format=html` | viewer | Docs |
| `PUT /api/docs/:slug` | editor | `{ content, summary? }` |
| `GET /api/changes?entityType=&entityId=&unreleased=true` | viewer | Audit trail |
| `GET /api/releases` · `GET /api/releases/:version` | viewer | Release list / full snapshot |
| `POST /api/releases` | admin | `{ bump?: major\|minor\|patch, version?, notes? }` |
| `GET/POST /api/keys` · `DELETE /api/keys/:id` | admin | Key management |

```bash
curl -H "Authorization: Bearer $DS_KEY" http://127.0.0.1:4400/api/components/button
```

## MCP

### Connect

Local (stdio): best for Claude Code / Cursor on the same machine. The repo's `.mcp.json` registers it as `lockin`. Elsewhere:

```json
{ "mcpServers": { "lockin": { "command": "npx", "args": ["tsx", "<repo>/apps/server/src/stdio.ts"] } } }
```

Remote (HTTP): for agents on other machines (put the hub behind HTTPS first):

```bash
claude mcp add --transport http lockin https://ds.example.com/mcp --header "Authorization: Bearer ds_…"
```

### Tools

| Tool | Role | Purpose |
| --- | --- | --- |
| `search_design_system` | viewer | Find components, tokens, docs, icons |
| `list_components` / `get_component` | viewer | Specs; the list includes each component's atomic level (atom, molecule, organism) |
| `get_tokens` / `get_token` | viewer | Resolved tokens (filter by prefix/type/layer/theme) |
| `check_contrast` | viewer | WCAG ratio for tokens or hex |
| `list_icons` | viewer | Icon names |
| `list_docs` / `get_doc` | viewer | Guides |
| `get_changelog` | viewer | Changes and releases |
| `update_component` / `update_token` / `update_doc` | editor | Writes (validated, logged, versioned) |

Resources: `ds://overview`, `ds://tokens/{light|dark}`, `ds://components/{slug}`, `ds://docs/{slug}`.
Prompt: `build_with_lockin` (task, platform).

## Versioning & change tracking

![Edit lifecycle: update_token writes the source file and re-checks contrast; on pass it rebuilds outputs and logs the change, on fail it restores the file and returns the failing pairs.](./diagrams/edit-lifecycle.svg)

[Open full size](./diagrams/edit-lifecycle.html)

- Component versions (semver, in each spec) bump automatically on save:
  - major: a prop removed/renamed, a prop type changed, or an optional prop made required
  - minor: props, variants or states added
  - patch: anything else (docs, guidance, token mapping)
- Every write (token, component, doc) records who, when, why (`summary`), version from→to, and a structural diff.
- Releases (admin) bump `design-system.json`, snapshot every token and spec, mark pending changes as released, and prepend an entry to `CHANGELOG.md`.
- Source files are plain JSON/Markdown in git, so `git diff`/`git log` remain the long-term history. Commit after editing through the hub.

## Security notes

- Binds to localhost by default. To expose it, run behind a TLS reverse proxy (Caddy, nginx), because keys are bearer tokens and must not travel over plain HTTP.
- With public read on, everything readable (tokens, specs, docs, change history and releases) is visible to anyone who can reach the server. Writes, releases and key management always need a key.
- Docs markdown has raw HTML escaped when rendered; the web UI escapes all content it inserts.
- Responses set a strict Content-Security-Policy, `nosniff`, `DENY` framing and `no-referrer`. The exception is `/storybook`: Storybook needs inline scripts, and the hub frames it, so it gets a looser CSP and same-origin framing only. Like the other static assets, it's served without a key even when public read is off. The hub may also frame `embed.figma.com` / `www.figma.com` for the Design tab (view-only Figma embeds).
- The SQLite file in `DS_DATA_DIR` holds key hashes, change history and releases. It's git-ignored, so back it up separately.
