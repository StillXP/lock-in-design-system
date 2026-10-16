Compact label for status, category or metadata (Live, Final, Sold out, Division A). Optionally removable for active filters.

## Variants

- `subtle`: Tinted background. Use when: Default for status in tables and cards.
- `solid`: Strong fill. Use when: High-attention status ('LIVE').
- `outline`: Border only. Use when: Low-emphasis categories.

## Example

```jsx
<Tag tone="success">Final</Tag>
<Tag tone="danger" variant="solid" icon="alert-circle">Live</Tag>
<Tag onRemove={() => removeFilter('u12')}>Under 12</Tag>
```

## Do

- Keep text short.
- Use status tones consistently (success=complete, warning=attention, danger=problem).
- Use removable tags to show active filters.

## Don't

- Don't make tags clickable links or buttons — use Button or Link.
- Don't rely on tone color alone to convey meaning.

## Related components

- `Search`: Active filters next to search.
- `DataTable`: Status column.

## Accessibility

- Role: `Static text (no role); remove control is a button`.
- Keyboard: Tab Focus the remove button (removable tags only).; Enter / Space Remove..
- Focus: Only the remove button receives focus.
- All tone/variant combinations pass 4.5:1 in both modes (verified by check:contrast).
