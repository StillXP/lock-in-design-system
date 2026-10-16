Renders a glyph from the @lockin/icons set (24×24 stroke icons). Decorative by default; becomes an image with a name when given a label.

## Variants

- `decorative`: Paired with visible text that already conveys the meaning. Use when: Icons in buttons with labels, list bullets.
- `informative`: Stands alone and must be named. Use when: A status icon in a table cell with no text.

## Example

```jsx
<Icon name="trophy" color="brand" />
<Icon name="alert-circle" color="danger" label="Error" />
```

## Do

- Pair icons with text whenever possible.
- Use status icons (check-circle, alert-triangle, alert-circle, info) alongside status colors.
- Use currentColor so icons follow text color and theme changes.

## Don't

- Don't make an Icon clickable — use Button iconOnly.
- Don't label an icon that sits next to text saying the same thing (double announcement).
- Don't hard-code hex colors on icons.

## Related components

- `Button`: Interactive icons (iconOnly).
- `Tag`: Status label with an icon.

## Accessibility

- Role: `img when labelled, otherwise hidden (aria-hidden)`.
- Focus: Icons are never focusable themselves; wrap in Button or Link for interaction.
- Informative icons need ≥3:1 contrast against their background; all color.icon.* tokens meet this on default backgrounds.
- In Windows High Contrast mode icons inherit CanvasText.
