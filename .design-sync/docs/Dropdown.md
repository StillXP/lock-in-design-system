Menu button: a button that reveals a list of actions (Edit, Duplicate, Delete). Implements the WAI-ARIA menu button pattern on web and an action sheet on native. Not a form control — for picking a value use Select.

Atomic level: molecule.

## Variants

- `labelled`: Text trigger with chevron ('Actions'). Use when: Toolbars, page headers.
- `overflow`: Icon-only trigger (more-horizontal). Use when: Row actions in tables and cards.

## Example

```jsx
<Dropdown
  label="Match actions"
  triggerIcon="more-horizontal"
  triggerVariant="tertiary"
  align="end"
  items={[
    { id: 'edit', label: 'Edit score', icon: 'edit', onSelect: edit },
    { id: 'reschedule', label: 'Reschedule', icon: 'calendar', onSelect: reschedule },
    { id: 'delete', label: 'Delete match', icon: 'trash', tone: 'danger', onSelect: confirmDelete },
  ]}
/>
```

## Do

- Use for 3+ secondary actions that don't fit inline.
- Put destructive actions last with tone 'danger'.
- Use verbs for item labels.

## Don't

- Don't use for selecting form values — use Select.
- Don't hide the primary action of a page in a menu.
- Don't nest menus.

## Related components

- `Select`: Choose a value.
- `Button`: Primary actions should be visible buttons.
- `Modal`: Confirm destructive menu actions.

## Accessibility

- Role: `button[aria-haspopup=menu] + menu > menuitem`.
- Keyboard: Enter / Space / Arrow Down Open and focus the first item.; Arrow Up (on trigger) Open and focus the last item.; Arrow Down / Up Move between items (wraps).; Home / End First / last item.; A–Z Jump to the next item starting with that letter.; Enter / Space Activate item and close.; Escape Close and return focus to the trigger.; Tab Close and move on..
- Focus: Focus moves into the menu on open and back to the trigger on close.
