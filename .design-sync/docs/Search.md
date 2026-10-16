Search input wrapped in a search landmark with a leading icon, clear button, Escape-to-clear, and an optional loading spinner.

Atomic level: molecule.

## Variants

- `instant`: Filter as you type with onValueChange. Use when: Local lists, small datasets.
- `submit`: Search on Enter with onSearch. Use when: Remote / expensive queries.

## Example

```jsx
<Search label="Search players" placeholder="Name or team" onValueChange={setQuery} />
<p aria-live="polite">{results.length} players found</p>
```

## Do

- Give the label a specific scope ('Search products').
- Announce result counts with a live region.
- Debounce remote searches (~250ms).

## Don't

- Don't use Search for non-search text entry — use InputField.
- Don't move focus away from the input as results update.

## Related components

- `InputField`: General text entry.
- `DataTable`: Filter table rows.
- `Tag`: Show active filters as removable tags.

## Accessibility

- Role: `search landmark (<form role=search>) containing a searchbox (<input type=search>)`.
- Keyboard: Enter Run onSearch.; Escape Clear the query (keeps focus in the field).; Tab Moves to the clear button when visible..
- Focus: Focus ring on the control; focus returns to the input after clearing.
