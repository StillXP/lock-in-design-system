# Changelog

## Unreleased

- Hub component pages show a **Live example**: the component's Storybook stories embedded from the static build (`/storybook`), switchable per story and synced with the hub's color mode and theme. New `GET /api/components/:name/stories`. Root `npm run build` now also builds Storybook.
- Specs gain an optional `figma` field (`fileKey`, `nodeId`); all 14 now link their Figma library node (each spec 0.1.0 → 0.2.0). The Live example has **Code** and **Design** tabs; Design is Figma's view-only embed, loaded on first open.
- Hub sidebar lists each component and doc under its section while that section is open.

## 0.1.0 — 2026-10-13

Initial scaffold: tokens (base + semantic, light/dark, 2 project themes), 14 components for web and React Native, AI-readable specs, docs, and the hub server (REST, MCP, web UI, auth, versioning, feedback).
