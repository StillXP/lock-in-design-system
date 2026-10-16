Single-line text entry with label, hint, and error wiring built in. Supports text, email, number, password (with show/hide), tel, url.

Atomic level: molecule.

## Variants

- `default`: Plain text input.
- `with icon`: Leading icon for scannability (email, user).
- `with suffix`: Unit or currency label.
- `password`: Masked with a show/hide toggle.

## Example

```jsx
<InputField label="Team name" required hint="3–24 characters" error={errors.team} />
<InputField label="Email" type="email" autoComplete="email" iconStart="user" />
<InputField label="Entry fee" type="number" suffix="USD" showOptional />
```

## Do

- Always provide a visible label.
- Use the right type and autoComplete so mobile shows the right keyboard and autofill.
- Size the field to the expected input length.

## Don't

- Don't use placeholder text as the label.
- Don't show errors before the user has had a chance to type.
- Don't disable paste in password fields.

## Related components

- `Search`: Search-specific input with clear button and landmark.
- `Select`: Choosing from predefined values.

## Accessibility

- Role: `textbox (native <input>) / TextInput`.
- Keyboard: Tab / Shift+Tab Move focus.; Enter Submits the surrounding form..
- Focus: Focus ring on the whole control (focus-within).
- Validate on blur or submit, not on every keystroke.
- On submit with errors, move focus to the first invalid field or an error summary.
