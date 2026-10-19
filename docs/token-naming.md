# Token naming

> Why Lock In's tokens are named the way they are, what each name promises, and how to name a new token.

## About this page

The repo keeps no decision records for token names. This page reconstructs the reasons from three places: the goals the system was built for, the `$description` text in the token sources and the other docs, and what the build does with the names. Each section says which of those its reason rests on. Where the sources show a pattern but record no reason, the page says so under [Open questions](#open-questions) instead of guessing.

## What the names have to serve

The goals come from the README and the project brief:

- People and AI agents use the same system, so a name has to be searchable, quotable and unambiguous.
- Web and mobile share it, so a name has to survive translation into CSS, JS, React Native, JSON and Figma.
- Accessibility is checked by a program, so the names have to let a contrast pairing be written down.
- Each project re-skins through themes, so a name can't describe how a color looks if a theme can change that.

## 1. One dotted path is the name everywhere

A token's name is its path through the source JSON. Every output spells that path the same way, adjusted only to the surface's own casing:

| Surface | `color.text.primary` appears as | `color.text.linkHover` appears as |
| --- | --- | --- |
| Source JSON | `color` > `text` > `primary` (nested groups) | `color` > `text` > `linkHover` |
| CSS | `--ds-color-text-primary` | `--ds-color-text-link-hover` |
| JS and TS | `tokens.light.color.text.primary`, `cssVars.color.text.primary` | `tokens.light.color.text.linkHover` |
| React Native | `t.color.text.primary` | `t.color.text.linkHover` |
| Flat JSON, REST, MCP | `name: "color.text.primary"` plus `cssVar` | `name: "color.text.linkHover"`, `cssVar: "--ds-color-text-link-hover"` |
| Figma | `text/primary` in the Color collection | `text/linkHover`, with code syntax `var(--ds-color-text-link-hover)` |

The reason is mechanical translation. CSS follows two fixed rules, dots become dashes and camelCase becomes kebab-case, which is one function in the build (`cssVarName`), so nobody needs a lookup table to move between a design, a stylesheet and a prompt to an agent. An agent that reads `get_token("color.text.linkHover")` can write `var(--ds-color-text-link-hover)` without looking anything up, and the flat JSON gives the exact `cssVar` anyway.

CSS custom properties are normally written in kebab-case, which is why the CSS names split camelCase parts (`linkHover` becomes `link-hover`). Earlier versions kept the camelCase in CSS (`--ds-color-text-linkHover`). The build now fails if two token paths would collapse into the same variable.

The cost is that a CSS name is no longer a letter-for-letter match for the token name. A search for `linkHover` in a stylesheet finds nothing. Search for `link-hover`, or read the `cssVar` field in the flat JSON. Dynamic code that builds a variable name from a token part has to convert it the same way; `Icon` does this for its `color` prop.

Rests on: the build code and the flat JSON output.

## 2. Three layers, and the name tells you which

| Layer | Name pattern | What the name describes |
| --- | --- | --- |
| Base | `color.<hue>.<step>`, for example `color.blue.600` | What the value is |
| Brand alias | `color.brand.<step>` | Which hue the current theme uses as its brand |
| Semantic | `color.<group>.<part>`, for example `color.text.primary` | What the value is for |

Only the base layer is allowed to say "blue". The base palette's own description says "Raw values only. Never use these directly in components", and the repo rule is semantic tokens only. A name that describes appearance goes wrong when a theme changes the appearance: `intent.primary.bg` is correct in the blue theme and the orange one, `blue.600` is not. The brand alias is the hinge. Themes repoint it at another hue, and every semantic token that references `brand` follows without a rename.

The flat JSON carries a `layer` field, and Figma hides the Primitives collection, so tooling can enforce the split. Nothing in the build stops a component from using a base variable, though. The rule holds today because no component stylesheet uses one.

Rests on: the `$description` text in `base/color.json` and `base/brand.json`, and `AGENTS.md`.

## 3. Palette names

The palette has eight hues (`red`, `orange`, `yellow`, `green`, `blue`, `indigo`, `violet`, `neutral`) with ten steps each (`50`, `100` to `900`). Higher is darker. For `neutral`, 50 is white and 900 is black.

The numeric steps and the hex values for the colors I compared (red and orange) match Tailwind's default palette, so the numbering will look familiar. The sources record no reason for `neutral` over `gray`. A likely one is that this ramp runs from pure white to pure black, which a gray ramp usually doesn't.

Rests on: `tokens.md` and the token sources; the `neutral` reason is inferred.

## 4. Semantic groups are named for their job

| Group | Job |
| --- | --- |
| `background` | Page and region backgrounds |
| `surface` | Containers that sit on a background: cards, modals, menus |
| `text`, `icon` | Foreground colors |
| `border` | Dividers, container outlines, form control boundaries |
| `focus` | The keyboard focus ring |
| `intent` | Interactive emphasis for actions: buttons, toggles, selected controls |
| `status` | Feedback for messages, tags and validation |
| `dataviz` | Categorical chart series |

Two pairs need a word of explanation.

`background` and `surface` are separate because a surface always sits on a background. A card is a surface on the page background. The descriptions in the source draw that line.

`intent` and `status` are separate because they answer different questions. `intent` ranks how loudly an action asks for attention. `status` reports how something went. `danger` appears in both on purpose. `intent.danger.bg` is the fill of a delete button, and `status.danger.*` styles an error message or tag. The two can change independently. The "Choosing a color" steps in `tokens.md` give the rule of thumb: text goes in `text`, a boundary in `border`, something you click in `intent`, and something reporting status in `status` plus an icon or label.

Rests on: the `$description` text in `semantic/color.json` and the decision steps in `tokens.md`.

## 5. Leaf names follow a pattern

For `intent` and `status` the path is `<group>.<variant>.<part>`:

| Part | Meaning |
| --- | --- |
| `bg` | A background fill. On `status` it is the soft tint (`green.50` in light mode) |
| `bgHover`, `bgActive` | The same fill in an interaction state |
| `border` | An outline for the variant |
| `text` | Text that goes with the variant |
| `solid` | The full-strength fill for a tone, as in a solid tag |
| `onSolid` | Text or icons that sit on `solid` |

Three habits sit underneath this:

- State is a suffix on the part (`bgHover`) instead of another level of nesting.
- A foreground that sits on a fill is written `on<Fill>`: `text.onBrand`, `icon.onBrand`, `status.<tone>.onSolid`.
- The words `primary`, `secondary` and `tertiary` rank emphasis in the same way everywhere they appear: `intent.*`, `text.*` and `icon.*`. Component props reuse them, so `variant="primary"` on a Button means `color.intent.primary.*`.

Status tones are a closed set (`neutral`, `brand`, `info`, `success`, `warning`, `danger`), and the Tag `tone` prop uses the same six words. The sources give no description of `bg` against `solid`; the table above reads it from the values.

Rests on: the token structure and the component props; the `bg` and `solid` readings are inferred from the values.

## 6. Mode lives in the value, not in the name

There is no `-dark` token and no `dark` segment in any name. Each semantic color holds `{ light, dark }` values, and the build emits both. A component refers to one name, and the mode decides what it resolves to. In Figma the same idea is a variable mode.

This keeps component code and specs free of mode logic, and it means a new mode never renames anything.

Rests on: `architecture.md`, the README, and how the build resolves modes.

## 7. Themes add no names

A theme file is a brand hue plus overrides, and every override key is an existing token path. A theme name never appears inside a token name. `theming.md` states the rule: themes remap semantic tokens to other base tokens, never introduce raw values and never change components, which keeps every project recognizably Lock In and keeps the contrast guarantees intact.

Project-only CSS variables use the project's own prefix (`--arena-bracket-line`) and are defined in terms of `--ds-*` variables, so project names never collide with system names.

Rests on: `theming.md`.

## 8. Scales use three kinds of names

| Kind | Used for | Examples |
| --- | --- | --- |
| Numbers | A computed ramp or an ordered series | Palette `50` to `900`, `dataviz.1` to `8` (use in order) |
| Size words | "One step bigger" | `space.2xs` to `5xl`, `size.control.sm/md/lg`, `radius.sm` to `xl`, `shadow.sm` to `xl`, `breakpoint.sm` to `2xl` |
| Role words | A value with no natural order | `zIndex.dropdown/sticky/overlay/modal/toast/tooltip`, `motion.easing.standard/enter/exit`, `font.lineHeight.tight/snug/normal/relaxed` |

Two things hold across all three kinds. Names don't carry the value, so `space.md` can change from 16px without a rename. And a scale is anchored somewhere you can point at: the spacing scale says "Base unit is md (16px)" and gives each step as a multiple of that base.

The split between the three kinds is my reading of the pattern. The sources don't state it.

Rests on: `base/spacing.json` for the anchor, and the pattern across the tokens for the rest.

## 9. Typography has two tiers and role-named families

`font.*` holds the primitives (`family`, `size`, `weight`, `lineHeight`, `letterSpacing`, `decoration`, `underlineOffset`, `transform`). `typography.*` holds the composite styles built from them: `display`, `heading.xl` to `xs`, `body.lg/md/sm`, `label.lg/md/sm`, `caption`, `overline` and `code`. The docs tell everyone to prefer the composites.

Families are named for their role (`sans`, `display`, `mono`), not for the typeface. The source describes `display` as "Swap per project theme for personality", which only works if the name doesn't say Inter. Native values carry a `ds.native: System` extension instead of a separate name.

Rests on: the `$description` text in `base/typography.json` and `tokens.md`.

## 10. The `ds` prefix

System custom properties start with `--ds-` and system utility classes with `.ds-` (`.ds-text-heading-md`). The prefix keeps the system's names apart from a project's own. The repo rule is that component CSS may only reference `--ds-*` variables.

Rests on: `theming.md` and `AGENTS.md`.

## 11. Names have to be writable as contrast pairs

`contrast-pairs.json` lists foreground and background pairs by token name, and the build fails if any pair drops below WCAG AA in any mode or theme (486 checks today). Several names read as the answer to a contrast question: `text.inverse` on `background.inverse`, `intent.primary.text` on the three `intent.primary` fills, `text.onBrand` on a brand fill. A pairing you can name is a pairing you can test.

Rests on: `contrast-pairs.json` and the build.

## 12. Format and Figma

Sources use the [DTCG](https://www.designtokens.org/) format (`$value`, `$type`, `$description`), where nested groups are the names. That is why a name is a path in section 1. The README notes the DTCG structure is already shaped for Figma.

The Figma rules in `figma-sync.md`:

- Color variables drop the `color.` prefix and use slashes (`color.text.primary` becomes `text/primary`). Other tokens keep the full path (`space.md` becomes `space/md`). The prefix is redundant because the collection is already called Color.
- Every variable gets the web code syntax `var(--ds-...)`, so Dev Mode shows the same CSS name as the stylesheet.
- Themes become modes named `<Theme> Light` and `<Theme> Dark`.

Rests on: `figma-sync.md`; the reason for dropping the prefix is inferred.

## Trade-offs and rough edges

- A CSS variable name is not a letter-for-letter match for its token name (`linkHover` is `link-hover` in CSS), so text search across the two needs the conversion in mind.
- Names get long: `--ds-color-intent-primary-bg-hover`.
- Two spellings mean the same thing: `onBrand` for foregrounds on a brand fill and `onSolid` for foregrounds on a status fill.
- The base layer is reachable. The rule against using it is a convention, not a build check.
- `intent.danger` and `status.danger` look alike and do different jobs, so the decision steps in `tokens.md` matter.

## How to name a new token

1. Decide whether it is a raw value or a purpose. A raw value goes in the base layer and is named for what it is. A purpose goes in the semantic layer and is named for what it does.
2. Pick the group by its job, using the steps in [Tokens](./tokens.md#choosing-a-color).
3. Reuse the existing vocabulary: `bg`, `text`, `border`, `icon`, a `Hover` or `Active` suffix, `on<Fill>`, and the six status tones. Write multiword parts in camelCase; the CSS build turns them into kebab-case.
4. Keep modes, themes, platforms and literal values out of the name.
5. For a scale, reuse the kind of name that scale already uses (numbers, size words or role words).
6. Give a semantic color both `light` and `dark` values that reference base tokens, add any new text or UI pairing to `contrast-pairs.json`, and run `npm run build -w @lockin/tokens`.
7. Regenerate the Figma payload (`npm run figma -w @lockin/tokens`) and apply it, following [Figma token sync](./figma-sync.md).

## Open questions

These are patterns the sources show without a recorded reason. Fill them in if you remember the reason.

- Why state is a suffix (`bgHover`) instead of a nested level (`bg.hover`).
- Why the palette uses `neutral` instead of `gray`.
- Why `onBrand` and `onSolid` are spelled differently.
