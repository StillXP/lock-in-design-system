# Lock In conventions

Lock In is a token-driven React library. Components are styled by the shipped stylesheet and take their look from CSS custom properties. There are no utility classes to learn and no theme prop.

## Setup

`styles.css` (tokens, typography, component styles) plus `_ds_bundle.js` give you `window.LockIn.*`. Wrap the app once in `DsRoot`: it applies the base font, text color and background (`.ds-root`). Never nest it.

```jsx
const { DsRoot, Button, InputField, Tag } = window.LockIn;

<DsRoot>
  <main style={{ padding: 'var(--ds-space-lg)', display: 'grid', gap: 'var(--ds-space-md)' }}>
    <h1 className="ds-text-heading-lg">Join tournament</h1>
    <InputField label="Team name" hint="3 to 24 characters" required />
    <Tag tone="success" icon="check">Open</Tag>
    <Button variant="primary" iconStart="plus">Register team</Button>
  </main>
</DsRoot>
```

Light is the default. Dark mode is `data-theme="dark"` on `<html>` (it also follows the OS when the attribute is absent); `setColorMode('light' | 'dark' | 'system')` sets it for you.

## Styling your own layout

Style glue (layout, spacing, your own surfaces) with the semantic `--ds-*` variables and nothing else: never hex values, never base palette steps like `--ds-color-blue-600`.

| Need | Use |
| --- | --- |
| Text | `color: var(--ds-color-text-primary)` (also `-secondary`, `-link`, `-danger`, `-success`) |
| Backgrounds | `--ds-color-background-default`, `--ds-color-surface-default` (cards), `--ds-color-surface-raised` |
| Borders | `--ds-color-border-subtle` (dividers), `--ds-color-border-strong` (form controls) |
| Interactive fills | `--ds-color-intent-primary-bg` and the other `--ds-color-intent-*` groups |
| Status | `--ds-color-status-danger-text`, `-bg`, `-border`; always pair with an icon or text |
| Spacing | `--ds-space-2xs` (4px) to `--ds-space-5xl` (128px); `--ds-space-md` is 16px |
| Shape | `--ds-radius-sm`, `-md`, `-lg`, `-full` |
| Type | `font: var(--ds-typography-heading-md)`, or classes like `ds-text-heading-md` |

Prefer a component over custom markup. Components take icon names as strings (`iconStart="plus"`), form controls require a `label` (`hideLabel` hides it visually only), and every control keeps a 44px touch target.

## Atomic levels

Components are grouped by atomic design level, and each `.prompt.md` states its level. Build from the bottom up.

- Atoms: Button, Icon, Link, Checkbox, Toggle, Tag. Single controls and elements.
- Molecules: InputField, Search, Select, RadioGroup, Dropdown, Tabs. Fields, menus and groups made of atoms.
- Organisms: DataTable, Modal. Self-contained sections made of molecules and atoms.

There are no templates or pages. Compose screens yourself from organisms, molecules and atoms.

## Where to read

- `tokens/tokens.css` and `tokens/typography.css`: every variable and the dark overrides.
- `_ds_bundle.css`: the real component styles.
- `components/<atoms|molecules|organisms>/<Name>/<Name>.prompt.md`: props, a JSX example, do and don't for each component.
