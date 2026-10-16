# Tokens

> Color, typography, spacing and effect tokens: base vs. semantic layers, light/dark modes, and how to use them on each platform.

Tokens are named design decisions. Source files live in `packages/tokens/src/` in [DTCG](https://www.designtokens.org/) format (`$value`, `$type`, `$description`). One build turns them into CSS, JS/TS, React Native and JSON.

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
| `color.intent.*` | `primary`, `secondary`, `tertiary`, `danger`, `disabled` × `bg`, `bgHover`, `bgActive`, `text`, `border` | Interactive elements by emphasis |
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
| `@lockin/tokens/css` | `--ds-*` custom properties; light on `:root`, dark via `[data-theme="dark"]` or `prefers-color-scheme` |
| `@lockin/tokens/css/themes/<name>` | Complete sheet for a project theme (use instead of `css`) |
| `@lockin/tokens` | `tokens.light`, `tokens.dark`, `themes`, `cssVars` (typed) |
| `@lockin/tokens/native` | `nativeTokens.light/dark`, `nativeThemes` (numbers, RN shadows) |
| `@lockin/tokens/json/tokens.flat.json` | Flat list for tooling and AI: `name`, `cssVar`, `type`, `layer`, `value` (light/dark), `aliasOf`, `description` |

CSS variable names are the token path with dots replaced by dashes: `color.text.primary` → `--ds-color-text-primary`.

## Do / don't

- Use `color: var(--ds-color-text-secondary)`, not `color: #4B5260`.
- Use `color.intent.danger.bg` for a delete button, not `color.red.600`.
- Use `gap: var(--ds-space-sm)`, not `gap: 13px`.
- Add a new semantic token when a need repeats instead of making one-off overrides in components.
