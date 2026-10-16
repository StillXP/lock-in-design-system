# TODO

Things we come across while working that are worth handling later. Add new ones at the top of the right section; delete an item once it's done.

## Design system

- [ ] **Ship the fonts.** Tokens name Inter (`--ds-font-family-sans`) and JetBrains Mono (`--ds-font-family-mono`), but no font files or `@font-face` exist in the repo, Storybook or the build, so everything renders in system fallback fonts. Add the font files and `@font-face` to `@lockin/tokens`, rebuild Storybook, then re-run the Claude Design sync. (Found during the first design-sync, 2026-10-16.)
- [ ] Cover open states in stories. Modal, Dropdown and Select stories only render the closed trigger, so the open dialog, menu and listbox are never visually checked (in Storybook or the sync).
- [ ] Add dark mode and the `arena` / `arcade` themes to the Storybook previews, so they can be compared and synced too.

## Claude Design sync (`.design-sync/`)

- [ ] Commit `.design-sync/` (config, notes, conventions, docs generator, provider, overrides) and the `.gitignore` change. Not committed yet.
- [ ] Re-sync after any component, spec, token or story change: see the command at the top of `.design-sync/NOTES.md`.
- [ ] Raise the story cap (`--max-stories 10`) if the tail stories carry distinct variants. Ungraded today: Button 4, DataTable 3, Checkbox 2, InputField 2, RadioGroup 1, Toggle 1.
- [ ] Optional: make `apps/storybook/src/blocks/data.ts` work without Vite's `import.meta.glob`. That would remove the need for the story-imports fork in `.design-sync/overrides/`.

## Docs and repo

- [ ] Review and commit the humanized `docs/*.md` edits (8 files, not committed yet).
- [ ] Reconnect the Figma MCP server (it disconnected during this session) before any Figma work.

## Roadmap (from README)

- [ ] Figma: token sync (Variables) and Code Connect mappings.
- [ ] Publish packages to a registry.
- [ ] Visual regression and automated axe runs in CI for the Storybook stories.
