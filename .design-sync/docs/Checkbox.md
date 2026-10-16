Lets users select zero or more independent options, or confirm a single statement (accept terms). Changes take effect on form submit.

Atomic level: atom.

## Variants

- `default`: Checkbox with visible label.
- `with description`: Adds helper text below the label.
- `hidden label`: Used in data tables for row selection.

## Example

```jsx
<Checkbox label="Send me match reminders" description="We'll email you 1 hour before kickoff." defaultChecked />
<Checkbox label="I accept the rules" required error={errors.rules} />
```

## Do

- Use for multiple independent choices.
- Write labels as positive statements ('Send me match reminders').
- Use indeterminate for a parent that controls a list.

## Don't

- Don't use a checkbox for settings that apply instantly — use Toggle.
- Don't use for mutually exclusive options — use RadioGroup.
- Don't rely on the checkbox alone to indicate errors; show a message.

## Related components

- `Toggle`: Instant on/off settings.
- `RadioGroup`: Single choice from a set.
- `DataTable`: Row selection uses Checkbox with hideLabel.

## Accessibility

- Role: `checkbox (native <input type=checkbox>) / accessibilityRole="checkbox"`.
- Keyboard: Tab / Shift+Tab Move focus.; Space Toggle checked..
- Focus: Focus ring drawn on the visual box when the hidden native input has :focus-visible.
- Group related checkboxes in a <fieldset> with a <legend> describing the question.
