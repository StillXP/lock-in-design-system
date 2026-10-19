# Tokens

> Color, typography, spacing and effect tokens: base vs. semantic layers, light/dark modes, and how to use them on each platform.

Tokens are named design decisions. Source files live in `packages/tokens/src/` in [DTCG](https://www.designtokens.org/) format (`$value`, `$type`, `$description`). One build turns them into CSS, JS/TS, React Native and JSON. For why the names look the way they do, see [Token naming](./token-naming.md).

![Token pipeline: base, semantic and theme JSON are resolved, pass the WCAG contrast gate, then emit CSS, JS/TS, React Native and JSON outputs.](./diagrams/token-pipeline.svg)

[Open full size](./diagrams/token-pipeline.html)

## Layers

```
base (raw values)          semantic (purpose)                    components
color.blue.600   ─────►    color.intent.primary.bg   ─────►     Button (primary)
color.neutral.900 ────►    color.text.primary        ─────►     every text
```

- Base: the raw palette and scales. Never use base colors directly in UI.
- Semantic: what a value is for. Every semantic color has a `light` and `dark` value, both referencing the base palette. This is the layer you use.
- Brand alias: `color.brand.*` points at one base hue (blue by default). Themes swap it.

## Color

### Base palette

Eight hues with ten steps each: `50, 100, 200, 300, 400, 500, 600, 700, 800, 900`.

| Hue | Notes |
| --- | --- |
| `red`, `orange`, `yellow`, `green`, `blue`, `indigo`, `violet` | 50 = lightest tint, 900 = darkest shade |
| `neutral` | 50 = white `#FFFFFF` to 900 = black `#000000` |

### Semantic palette

| Group | Tokens | Use for |
| --- | --- | --- |
| `color.background.*` | `default`, `subtle`, `muted`, `inverse`, `overlay` | Page and region backgrounds, modal scrim |
| `color.surface.*` | `default`, `raised`, `sunken`, `selected` | Cards, menus, modals, wells, selected rows |
| `color.text.*` | `primary`, `secondary`, `tertiary`, `placeholder`, `disabled`, `inverse`, `onBrand`, `link`, `linkHover`, `brand`, `danger`, `success`, `warning`, `info` | All text |
| `color.icon.*` | `primary`, `secondary`, `disabled`, `inverse`, `onBrand`, `brand`, `danger`, `success`, `warning`, `info` | Icons (≥ 3:1 contrast) |
| `color.border.*` | `subtle`, `default`, `strong`, `selected`, `danger`, `success`, `warning`, `info` | Dividers (subtle), containers (default), form controls (strong) |
| `color.focus.*` | `ring`, `ringOffset` | Keyboard focus indicator |
| `color.intent.*` | `primary`, `secondary`, `tertiary`, `danger` × `bg`, `bgHover`, `bgActive`, `text` (`secondary` also has `border`); `disabled` has `bg` and `text` | Interactive elements by emphasis |
| `color.status.*` | `neutral`, `brand`, `info`, `success`, `warning`, `danger` × `bg`, `border`, `text`, `solid`, `onSolid` | Messages, tags, validation |
| `color.dataviz.*` | `1` to `8` | Chart series, in order |

Contrast is enforced. `packages/tokens/src/contrast-pairs.json` lists every foreground/background pairing the system promises. `npm run check:contrast` checks all of them in light and dark for every theme (currently 486 checks). The hub server refuses token edits that break any pair.

### Choosing a color

1. Text uses `color.text.*`; icons use `color.icon.*`.
2. The boundary of an input or control uses `color.border.strong` (3:1); a decorative divider uses `color.border.subtle`.
3. Something you click uses `color.intent.*`.
4. Status uses `color.status.*` plus an icon or text label.

## Typography

| Token group | Values |
| --- | --- |
| `font.family` | `sans` (UI/body), `display` (headings), `mono` (code, scores, timers) |
| `font.size` | `xs` 12 · `sm` 14 · `md` 16 · `lg` 18 · `xl` 20 · `2xl` 24 · `3xl` 30 · `4xl` 36 · `5xl` 48 · `6xl` 60 (px; emitted as rem on web) |
| `font.weight` | `light` 300 · `regular` 400 · `medium` 500 · `semibold` 600 · `bold` 700 |
| `font.lineHeight` | `none` 1 · `tight` 1.2 · `snug` 1.35 · `normal` 1.5 · `relaxed` 1.7 |
| `font.letterSpacing` | `tight` −0.02em · `normal` 0 · `wide` 0.02em · `wider` 0.06em |
| `font.decoration` | `none` · `underline` · `lineThrough` |
| `font.underlineOffset` | `default` 0.15em |
| `font.transform` | `none` · `uppercase` · `capitalize` |

Composite styles (`typography.*`) bundle family, size, weight, line height and letter spacing. Prefer these:

`display` · `heading.xl/lg/md/sm/xs` · `body.lg/md/sm` · `label.lg/md/sm` · `caption` · `overline` · `code`

```css
h1 { font: var(--ds-typography-heading-xl); letter-spacing: var(--ds-typography-heading-xl-letter-spacing); }
```

```html
<h2 class="ds-text-heading-md">Group A</h2>   <!-- with @lockin/tokens/css/typography -->
```

```tsx
// React Native
<Text style={[textStyle(t.typography.heading.md), { color: t.color.text.primary }]}>Group A</Text>
```

Rules: body text uses `body.md` (16px) or larger; never set form input text below 16px (iOS zooms); keep line height ≥ 1.5 for paragraphs.

### Fonts

The web token sheets load the fonts the family tokens name, so there is nothing extra to import:

- Inter, for `font.family.sans` and `font.family.display`.
- JetBrains Mono, for `font.family.mono`.

Both ship as variable fonts inside `@lockin/tokens`, so every token weight (300 to 700) comes from one file per subset. The `@font-face` rules cover the Latin and Latin Extended subsets, use `font-display: swap`, and are inlined at the top of `tokens.css` and every theme sheet. Browsers download a file only when the page uses characters from its subset.

The files are served from `@lockin/tokens/fonts/*` (`dist/fonts/`); a token sheet reaches them with `../fonts/<file>`, so your bundler or server needs to handle `url()` assets in CSS (Vite, Next.js and webpack do, and the hub serves them at `/assets/fonts/`). Both fonts use the SIL Open Font License 1.1, and the license texts sit next to the files.

To add or replace a font, put the `.woff2` and its license in `packages/tokens/src/fonts/`, add its `@font-face` rule to `fonts.css` with `url('./<file>')`, and run `npm run build -w @lockin/tokens`. A project theme that swaps `font.family.display` for another face has to ship that face's `@font-face` itself.

React Native uses the platform system font (`ds.native: System`) and does not load these files.

## Spacing

Base unit is 16px (`space.md`). Ten steps, all divisible by 4:

| Token | px | × base | Typical use |
| --- | --- | --- | --- |
| `space.2xs` | 4 | 0.25 | Icon ↔ text gap |
| `space.xs` | 8 | 0.5 | Gaps in compact controls |
| `space.sm` | 12 | 0.75 | Control padding, list gaps |
| `space.md` | 16 | 1 | Default padding / gap |
| `space.lg` | 24 | 1.5 | Card padding, field groups |
| `space.xl` | 32 | 2 | Mobile section padding |
| `space.2xl` | 48 | 3 | Between page sections |
| `space.3xl` | 64 | 4 | Desktop section padding |
| `space.4xl` | 96 | 6 | Hero spacing |
| `space.5xl` | 128 | 8 | Largest layout spacing |

## Other tokens

- `size.control.sm/md/lg` (32/40/48), `size.touchTarget.min` (44), `size.icon.sm/md/lg/xl` (16/20/24/32)
- `radius.none/sm/md/lg/xl/full`
- `border.width.thin/thick`, `focus.width`, `focus.offset`
- `shadow.sm/md/lg/xl` (web: `box-shadow`; native: `shadowColor/Offset/Opacity/Radius` + `elevation`)
- `motion.duration.instant/fast/normal/slow`, `motion.easing.standard/enter/exit`. Durations collapse to 0ms under `prefers-reduced-motion`
- `zIndex.dropdown/sticky/overlay/modal/toast/tooltip`
- `breakpoint.sm/md/lg/xl/2xl` (640/768/1024/1280/1536, mobile-first)

## Outputs by platform

| Import | Contents |
| --- | --- |
| `@lockin/tokens/css` | `--ds-*` custom properties; light on `:root`, dark via `[data-theme="dark"]` or `prefers-color-scheme`. Includes the `@font-face` rules for Inter and JetBrains Mono |
| `@lockin/tokens/css/themes/<name>` | Complete sheet for a project theme (use instead of `css`), with the same font rules |
| `@lockin/tokens/fonts/*` | The font files (`.woff2`) and their licenses |
| `@lockin/tokens` | `tokens.light`, `tokens.dark`, `themes`, `cssVars` (typed) |
| `@lockin/tokens/native` | `nativeTokens.light/dark`, `nativeThemes` (numbers, RN shadows) |
| `@lockin/tokens/json/tokens.flat.json` | Flat list for tooling and AI: `name`, `cssVar`, `type`, `layer`, `value` (light/dark), `aliasOf`, `description` |

CSS variable names are the token path with dots replaced by dashes and camelCase turned into kebab-case: `color.text.primary` → `--ds-color-text-primary`, `color.text.linkHover` → `--ds-color-text-link-hover`. Every other surface (JS, React Native, JSON, REST, MCP) keeps the camelCase token name, and the flat JSON lists the exact `cssVar` for each token.

## Do / don't

- Use `color: var(--ds-color-text-secondary)`, not `color: #4B5260`.
- Use `color.intent.danger.bg` for a delete button, not `color.red.600`.
- Use `gap: var(--ds-space-sm)`, not `gap: 13px`.
- Add a new semantic token when a need repeats instead of making one-off overrides in components.
