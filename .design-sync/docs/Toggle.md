A switch that turns a single setting on or off with immediate effect (dark mode, notifications, sound). Uses the ARIA switch pattern on web and the platform Switch on native.

Atomic level: atom.

## Variants

- `label end`: Switch then label (default).
- `label start`: Label then switch, spaced apart. Use when: Settings screens / lists.

## Example

```jsx
<Toggle label="Sound effects" defaultChecked onCheckedChange={setSound} />
<Toggle label="Dark mode" labelPosition="start" checked={dark} onCheckedChange={(on) => setColorMode(on ? 'dark' : 'light')} />
```

## Do

- Apply the change immediately when toggled.
- Keep labels short and stable; don't change the label text when toggled.

## Don't

- Don't use inside a form that needs a Submit button; use Checkbox.
- Don't use for choices that aren't on/off (e.g. 'Grid / List'); use Tabs or RadioGroup.

## Related components

- `Checkbox`: Form selections submitted later.
- `RadioGroup`: More than two states.

## Accessibility

- Role: `switch (<button role=switch aria-checked>) / native Switch with accessibilityRole="switch"`.
- Keyboard: Tab / Shift+Tab Move focus.; Space / Enter Toggle..
- Focus: Focus ring around the track.
- State is shown by thumb position and glyph, not only color (1.4.1).
