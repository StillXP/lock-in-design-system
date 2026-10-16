# Contributing

> How to add or change tokens and components, how versions and releases work, and the definition of done.

## Repo layout

```
packages/tokens        src/base, src/semantic, src/themes (JSON) → dist (CSS, JS, native, JSON)
packages/icons         src/index.ts — icon path data
packages/specs         components/*.json + schema — the AI-readable contract
packages/react         web components (TSX + CSS per component)
packages/react-native  native components (same props)
apps/server            hub: REST, MCP, web UI, auth, versioning
apps/storybook         Storybook: stories for every component, token group and icon
docs                   these guides (also served by the hub)
docs/diagrams          architecture diagrams (.html source, .svg export)
```

See [Architecture](./architecture.md) for diagrams of how these fit together.

## Changing a token

1. Edit `packages/tokens/src/...` (or use the hub / `update_token`).
2. Semantic colors must reference base tokens and provide `light` and `dark`.
3. If the token is a new text/UI pairing, add it to `src/contrast-pairs.json`.
4. `npm run build -w @lockin/tokens`. It must print "all contrast checks passed".
5. New token groups show up in Storybook automatically if they fall under an existing prefix; otherwise add them to a story in `apps/storybook/src/stories/foundations/`.

## Adding a component

1. Spec first. Write `packages/specs/components/<slug>.json` (copy a similar one). Fill every field, especially `accessibility` and `usage`. Run `npm run validate -w @lockin/specs`.
2. Web. `packages/react/src/components/<Name>/<Name>.tsx` + `<Name>.css`. Export from `src/index.ts`. Only `--ds-*` variables in CSS.
3. Native. `packages/react-native/src/components/<Name>.tsx` with the same props. Export from `src/index.ts`.
4. Stories. Add `apps/storybook/src/stories/components/<Name>.stories.tsx` (copy a similar one). Keep `title: 'Components/<Name>'` literal and spread `specMeta('<slug>')` so the Docs page renders the spec. One story per variant and per notable state.
5. Docs. Add a row to `docs/components.md`.
6. Build and typecheck. `npm run build` and `npm run check`. Open `npm run storybook` and check the story in light, dark and both themes, with the Accessibility panel clean.

## Definition of done

- [ ] Spec valid; props in spec match both implementations
- [ ] Storybook story covers each variant and state; Accessibility panel shows no violations
- [ ] Uses semantic tokens only
- [ ] Keyboard pattern matches the spec (WAI-ARIA APG)
- [ ] Visible focus, 44px touch targets, labels, error wiring
- [ ] Works in light, dark, forced-colors, reduced motion
- [ ] Tested with a screen reader on each platform (see [Accessibility](./accessibility.md))
- [ ] Change summary written (it goes into the changelog)

## Versions

- Components: semver per spec, auto-bumped by the hub (see [MCP server & API](./mcp-server.md#versioning--change-tracking)). If you edit a spec by hand, bump `version` yourself using the same rules.
- System: `design-system.json`. Cut a release from the hub (`POST /api/releases`, admin). It snapshots everything and updates `CHANGELOG.md`.
- Status lifecycle: `experimental → beta → stable → deprecated`. Deprecations stay for at least one minor release with a note in `usage.dont` pointing to the replacement.
