# Changelog

## Unreleased

- Hub component pages show a **Live example**: the component's Storybook stories embedded from the static build (`/storybook`), switchable per story and synced with the hub's color mode and theme. New `GET /api/components/:name/stories`. Root `npm run build` now also builds Storybook.
- Specs gain an optional `figma` field (`fileKey`, `nodeId`); all 14 now link their Figma library node (each spec 0.1.0 → 0.2.0). The Live example has **Code** and **Design** tabs; Design is Figma's view-only embed, loaded on first open.
- Hub sidebar lists each component and doc under its section while that section is open.
- Components are organized by atomic design level. Specs gain a required `level` (`atom`, `molecule` or `organism`; all 14 specs 0.2.0 → 0.3.0). Atoms: Button, Icon, Link, Checkbox, Toggle, Tag. Molecules: InputField, Search, Select, RadioGroup, Dropdown, Tabs. Organisms: DataTable, Modal.
- Storybook stories are titled `Atoms/…`, `Molecules/…` and `Organisms/…` (was `Components/…`), filed under `stories/atoms|molecules|organisms/`, and the sidebar lists Foundations, then the three levels. Story ids change accordingly (`atoms-button--primary`).
- Hub: the Components page groups cards by level and component pages show it. `GET /api/components`, the `list_components` tool and search include `level`; the live-example lookup finds stories by level.
- Docs: `components.md` gains an Atomic levels section with a rule of thumb and a table per level; `contributing.md`, `llms.txt` and `AGENTS.md` follow.
- Fonts: `@lockin/tokens` now ships the fonts its family tokens name. Inter (`sans`, `display`) and JetBrains Mono (`mono`) are bundled as variable fonts (Latin and Latin Extended, SIL OFL 1.1, licenses included) in `dist/fonts/`, exported as `@lockin/tokens/fonts/*`, and their `@font-face` rules are inlined into `tokens.css` and every theme sheet, so existing imports pick them up. The hub serves them at `/assets/fonts/`. Before this, every render used the system fallback fonts. React Native still uses the system font.

## 0.1.0 — 2026-10-13

Initial scaffold: tokens (base + semantic, light/dark, 2 project themes), 14 components for web and React Native, AI-readable specs, docs, and the hub server (REST, MCP, web UI, auth, versioning, feedback).
