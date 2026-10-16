Triggers an action in the current view (submit, save, open a modal). For navigation to another page or URL, use Link.

## Variants

- `primary`: Filled brand color. Highest emphasis. Use when: The single main action of a view: 'Create tournament', 'Checkout'.
- `secondary`: Outlined neutral. Use when: Alternative actions next to a primary: 'Cancel', 'Export'.
- `tertiary`: Text-only (ghost) brand color. Use when: Low-emphasis actions in toolbars, cards, tables.
- `danger`: Filled red. Use when: Destructive, irreversible actions: 'Delete team'. Usually confirm with a Modal.

## Example

```jsx
<Button variant="primary" iconStart="plus" onClick={createMatch}>New match</Button>
<Button variant="secondary" onClick={close}>Cancel</Button>
<Button iconOnly iconStart="trash" variant="tertiary" aria-label="Delete player" />
```

## Do

- Start labels with a verb and keep them short (1–3 words).
- Use one primary button per view or section.
- Place the primary action last (right) in button groups and modals.
- Use loading for async actions instead of disabling.

## Don't

- Don't use a Button to navigate to a URL — use Link.
- Don't put more than one primary or danger button side by side.
- Don't use icon-only buttons for uncommon actions; add a label.
- Don't disable submit buttons to signal validation errors; show field errors instead.

## Related components

- `Link`: Use for navigation.
- `Dropdown`: Group overflow actions behind a menu button.
- `Modal`: Confirm destructive actions.

## Accessibility

- Role: `button (native <button> element) / accessibilityRole="button"`.
- Keyboard: Tab / Shift+Tab Move focus to / from the button.; Enter Activate.; Space Activate..
- Focus: Visible 2px ring in color.focus.ring with 2px offset on :focus-visible only. Never remove it.
- Do not use a <div> or <a> with onClick as a button.
- If an icon-only button has a visible tooltip, the tooltip text must match the aria-label (2.5.3).
