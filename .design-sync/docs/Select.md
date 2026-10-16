Form control for choosing one value from a list. Web uses the native <select> (platform pickers on mobile browsers); native opens an accessible bottom-sheet list.

## Variants

- `default`: Single list.
- `grouped`: Options organized under group labels (e.g. teams by division).

## Example

```jsx
<Select
  label="Division"
  placeholder="Choose a division"
  options={[
    { value: 'u12', label: 'Under 12' },
    { value: 'u14', label: 'Under 14' },
    { value: 'open', label: 'Open' },
  ]}
  required
/>
```

## Do

- Use for 6+ options or when space is tight.
- Order options logically; put the most common first if there's no natural order.
- Use a placeholder when there is no sensible default.

## Don't

- Don't use for actions — use Dropdown.
- Don't use for 2–5 options when space allows — use RadioGroup.
- Don't auto-submit on change.

## Related components

- `Dropdown`: Menu of actions.
- `RadioGroup`: Few, visible options.
- `Search`: Very long lists may need type-ahead search.

## Accessibility

- Role: `combobox/listbox (native <select>) / button that opens a radio list on native`.
- Keyboard: Tab Focus.; Space / Enter / Alt+Arrow Down Open the list.; Arrow Up / Down Change selection.; Type a character Jump to matching option.; Escape Close without changing..
- Focus: Focus ring on the control.
- Never navigate or submit on change (3.2.2).
