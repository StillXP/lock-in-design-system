Radio buttons let users pick exactly one option from a small, visible set (2–6). RadioGroup provides the required fieldset/legend grouping; Radio is the individual option.

## Variants

- `vertical`: Stacked options (default, easiest to scan).
- `horizontal`: Inline options. Use when: 2–3 short options like 'Home / Away'.

## Example

```jsx
<RadioGroup
  legend="Match format"
  defaultValue="bo3"
  options={[
    { value: 'bo1', label: 'Best of 1' },
    { value: 'bo3', label: 'Best of 3' },
    { value: 'bo5', label: 'Best of 5' },
  ]}
/>
```

## Do

- Use when all options should be visible and there are 2–6 of them.
- Pre-select a sensible default when one exists.
- Order options logically (frequency, size, alphabet).

## Don't

- Don't use for more than ~6 options — use Select.
- Don't use a single radio button; use Checkbox.
- Don't trigger navigation or actions on change.

## Related components

- `Select`: Many options or limited space.
- `Checkbox`: Multiple selections.
- `Tabs`: Switching views rather than choosing a value.

## Accessibility

- Role: `radiogroup (native <fieldset> of <input type=radio>) / accessibilityRole="radiogroup" + "radio"`.
- Keyboard: Tab Move focus into the group (to the selected option, or the first).; Arrow Up / Arrow Left Select previous option.; Arrow Down / Arrow Right Select next option.; Space Select the focused option..
- Focus: Focus ring on the circle. The group is a single tab stop.
