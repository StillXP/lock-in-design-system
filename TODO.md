# TODO

Things we come across while working that are worth handling later. Add new ones at the top of the right section; delete an item once it's done (git history is the record of finished work).

## Now

What we're working on this session. Keep it to 1 to 3 items; move things in from the sections below and back out if they stall.

- [ ] Add a Figma Changelog entry (v0.4.0): Button and Modal size default md, Button `state=loading`, plus the Props / <Name> frames on every component page. Publish the library from Figma by hand afterwards.
- [ ] Toggle `labelPosition` defaults to `end` on web but `start` on native. The spec now says so; decide whether native should default to `end` (a visible layout change) or the difference is intended.
- [ ] Native Modal: `size` is only a width for a centered alertdialog and `fullscreen`; a dialog is always a bottom sheet. Test the new native `size`, `hideCloseButton`, `closeLabel`, Search `showLabel` and InputField `showOptional` on a device; the repo has no native stories or tests for them.
- [ ] Fonts on React Native. Web now ships Inter and JetBrains Mono, but the native tokens still use the system font (`ds.native: System`). Decide whether to load them with `expo-font`; the font files are in `packages/tokens/src/fonts/`.

- [ ] Chromatic: the first `main` build is accepted as the baseline. Decide how to gate PRs: `--exit-zero-on-changes` means the CI job never fails on visual diffs, so requiring it in branch protection only checks that the upload worked; to block merges on visual changes, require Chromatic's own UI Tests status check instead. Also check the snapshot count against the plan quota (Dependabot PRs trigger builds too).

## Design system

- [ ] DTCG 2025.10, step 1: light/dark (and themes) still live inside `$value` as `{ light, dark }`. Move them to one semantic set per mode plus a DTCG Resolver document, then update `lib/resolve.mjs`, the theme overrides, the Figma export and the hub's `update_token`. Values are already 2025.10 objects (colors, dimensions, durations, shadows).
- [ ] DTCG 2025.10, step 3: `font.letterSpacing.*` and `font.underlineOffset.*` use `em`, which DTCG dimensions don't allow (the engine whitelists those paths); `font.decoration` and `font.transform` use `$type: "string"`; extension keys use `ds.` instead of reverse-domain names (`com.stillxp.native`).
- [ ] Component token layer (`button.primary.bg` → semantic), after DTCG step 1 so component tokens are written once against the final mode structure.

- [ ] Proposal prototype links: `textarea.json` and `stepper.json` point `intake.prototype` at claude.ai Artifacts, which are private by default. Once the hub has a public origin, switch them to `<hub>/proposals/<slug>/prototype` (the hub already serves and links those pages).
- [ ] Proposals backlog: LIP-001 Textarea is released. Next, file the other gaps found in VolleyXP's Bracket Creator (Stepper, ProgressBar, FileUpload, DatePicker, Card, DescriptionList, Callout, upload/arrow icons, dashed-border, progress-track and layout tokens). Full list: "Lock In gaps / Bracket Creator" frame in the VolleyXP Figma file.
- [ ] Select's open listbox is drawn by the browser/OS, so it can't be snapshotted. Decide whether that is acceptable or whether Select needs a custom listbox.

## Claude Design sync (`.design-sync/`)

- [ ] Re-sync after any component, spec, token or story change: see the command at the top of `.design-sync/NOTES.md`.
- [ ] Raise the story cap (`--max-stories 10`) if the tail stories carry distinct variants. Ungraded today: Button 4, DataTable 3, Checkbox 2, InputField 2, RadioGroup 1, Toggle 1.
- [ ] Optional: make `apps/storybook/src/blocks/data.ts` work without Vite's `import.meta.glob`. That would remove the need for the story-imports fork in `.design-sync/overrides/`.

## Docs and repo

- [ ] Security follow-ups from the review: the remaining `zod` advisory (GHSA-mrhx-c7xc-m3w5) sits in `@figma/code-connect`'s nested copy, so re-run `npm audit` after each code-connect bump. Serve `/storybook` from a separate origin (it needs `unsafe-inline`/`unsafe-eval` and shares `localStorage` with the hub's API key). Remove the empty `{}` file `fileForNewToken` leaves behind when a new token fails validation. Pin the GitHub Actions in `ci.yml` to commit SHAs.
- [ ] Versioning and releases, before the first npm publish: semver tags (`v0.2.0`), GitHub Releases, and Changesets or release-please to turn Conventional Commits into version bumps and `CHANGELOG.md`. Decide whether packages are versioned together or independently.

## Roadmap (from README)

- [ ] Figma: token sync is in step with code except the Arcade theme modes (deliberately skipped for now). Re-run the diff after token changes: `npm run figma -w @stillxp/tokens`, rules in `docs/figma-sync.md`.
- [ ] Publish packages to a registry.
