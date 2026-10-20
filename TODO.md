# TODO

Things we come across while working that are worth handling later. Add new ones at the top of the right section; delete an item once it's done (git history is the record of finished work).

## Now

What we're working on this session. Keep it to 1 to 3 items; move things in from the sections below and back out if they stall.

- [ ] Add a Figma Changelog entry (v0.4.0): Button and Modal size default md, Button `state=loading`, plus the Props / <Name> frames on every component page. Publish the library from Figma by hand afterwards.
- [ ] Toggle `labelPosition` defaults to `end` on web but `start` on native. The spec now says so; decide whether native should default to `end` (a visible layout change) or the difference is intended.
- [ ] Native Modal: `size` is only a width for a centered alertdialog and `fullscreen`; a dialog is always a bottom sheet. Test the new native `size`, `hideCloseButton`, `closeLabel`, Search `showLabel` and InputField `showOptional` on a device; the repo has no native stories or tests for them.
- [ ] Fonts on React Native. Web now ships Inter and JetBrains Mono, but the native tokens still use the system font (`ds.native: System`). Decide whether to load them with `expo-font`; the font files are in `packages/tokens/src/fonts/`.

- [ ] Finish the Chromatic trial: run it once on `main` to set the baseline, then decide whether to require the Chromatic checks in branch protection.

## Design system


- [ ] Select's open listbox is drawn by the browser/OS, so it can't be snapshotted. Decide whether that is acceptable or whether Select needs a custom listbox.

## Claude Design sync (`.design-sync/`)

- [ ] Re-sync after any component, spec, token or story change: see the command at the top of `.design-sync/NOTES.md`.
- [ ] Raise the story cap (`--max-stories 10`) if the tail stories carry distinct variants. Ungraded today: Button 4, DataTable 3, Checkbox 2, InputField 2, RadioGroup 1, Toggle 1.
- [ ] Optional: make `apps/storybook/src/blocks/data.ts` work without Vite's `import.meta.glob`. That would remove the need for the story-imports fork in `.design-sync/overrides/`.

## Docs and repo

- [ ] Once CI has run green on a PR, turn on branch protection for `main` (require a PR and the `verify` and `pr-title` checks, block force pushes and deletion, auto-delete head branches, squash-merge only). Also enable secret scanning and push protection.
- [ ] Versioning and releases, before the first npm publish: semver tags (`v0.2.0`), GitHub Releases, and Changesets or release-please to turn Conventional Commits into version bumps and `CHANGELOG.md`. Decide whether packages are versioned together or independently.
- [ ] Add `.github/dependabot.yml` and `CODEOWNERS`.

## Roadmap (from README)

- [ ] Figma: token sync is in step with code except the Arcade theme modes (deliberately skipped for now). Re-run the diff after token changes: `npm run figma -w @lockin/tokens`, rules in `docs/figma-sync.md`.
- [ ] Figma: Code Connect mappings.
- [ ] Publish packages to a registry.
- [ ] Visual regression for the Storybook stories.
