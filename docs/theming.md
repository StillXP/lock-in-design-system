# Theming & customization

> How to give each project its own personality (a sports app, a web game, a store) while keeping one consistent, accessible system.

## What you can change, and what stays fixed

| Customize per project | Keep consistent |
| --- | --- |
| Brand hue (`color.brand.*`) | Spacing scale, control sizes, touch targets |
| Specific semantic color mappings | Component structure, behavior, keyboard patterns |
| Display font (`font.family.display`) | Focus ring style, contrast minimums |
| Radius feel (via token overrides) | Token names and component props |

The rule: themes remap semantic tokens to other base tokens. They never introduce raw values and never change components. That keeps every project recognizably "Lock In" and keeps contrast guarantees intact.

## Theme files

Themes live in `packages/tokens/src/themes/<name>.json`:

```json
{
  "name": "arena",
  "description": "Energetic orange brand for sports / tournament apps.",
  "brand": "orange",
  "overrides": {
    "color.intent.primary.bg": { "light": "{color.orange.700}", "dark": "{color.orange.400}" },
    "color.text.link": { "light": "{color.orange.800}", "dark": "{color.orange.300}" }
  }
}
```

- `brand`: one of `red | orange | yellow | green | blue | indigo | violet | neutral`. All `color.brand.*` aliases point at that hue, so every brand-colored semantic token follows.
- `overrides`: maps any token path to a new value. Use it to fix contrast for lighter hues or to tune a specific role.

Included themes:

| Theme | Brand | For |
| --- | --- | --- |
| *(default)* | blue | Dashboards, tools |
| `arena` | orange | Sports, tournaments |
| `arcade` | violet | Web games |

### Creating a theme

1. Copy `arcade.json`, set `name` and `brand`.
2. `npm run build -w @lockin/tokens`.
3. If the contrast check fails, it tells you exactly which pairs. Add overrides that move those tokens to darker (light mode) or lighter (dark mode) steps. Orange and yellow brands almost always need `intent.primary.bg` at step 700 in light mode.

Or let the hub do it: `PUT /api/tokens/...` and MCP `update_token` reject anything that fails contrast.

## Using a theme

Web: import the theme sheet instead of the default tokens sheet:

```ts
import '@lockin/tokens/css/themes/arena.css';
import '@lockin/react/styles.css';
```

React Native

```tsx
<ThemeProvider theme="arena" mode="system">…</ThemeProvider>
```

JS (charts, canvas, games)

```ts
import { themes } from '@lockin/tokens';
const palette = themes.arena.dark.color.dataviz;
```

## Project-level extensions

When a project needs something the system doesn't have:

1. Compose first. Most "new components" are compositions (a match card = surface + heading + Tag + Button).
2. Use tokens in your own CSS. Custom components should only reference `--ds-*` variables.
3. Namespace project tokens. Project-only CSS variables use the project prefix (`--arena-bracket-line`), and are defined in terms of `--ds-*` variables.
4. Promote what repeats. If a pattern shows up in two projects, add it to the system instead of keeping it in a project theme.

## Don't

- Override component CSS classes (`.ds-button { … }`) per project; create a theme override or request a variant instead.
- Hard-code hex values "just for this project".
- Remove or restyle focus rings.
- Change spacing or sizing per project, since that's what makes the system feel consistent.
