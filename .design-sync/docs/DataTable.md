Displays structured rows for scanning and comparison (standings, orders, leaderboards) with sorting, row selection, density, sticky headers and a stacked card layout on small screens.

## Variants

- `default`: Standard table.
- `compact`: Dense rows. Use when: Dashboards and admin tools with lots of data.
- `stack`: Rows become label/value cards on small screens. Use when: Mobile-first views with few columns.

## Example

```jsx
const columns: DataTableColumn<Team>[] = [
  { key: 'rank', header: '#', align: 'end', sortable: true, width: '3rem' },
  { key: 'name', header: 'Team', isRowHeader: true, sortable: true },
  { key: 'played', header: 'P', align: 'end' },
  { key: 'points', header: 'Pts', align: 'end', sortable: true },
  { key: 'status', header: 'Status', cell: (t) => <Tag tone={t.qualified ? 'success' : 'neutral'}>{t.qualified ? 'Qualified' : 'Active'}</Tag> },
];
<DataTable caption="Group A standings" columns={columns} rows={teams} getRowId={(t) => t.id} defaultSort={{ key: 'points', direction: 'descending' }} mobileLayout="stack" />
```

## Do

- Right-align numeric columns (align: 'end').
- Use isRowHeader for the column that identifies the row.
- Keep column headers short; put units in the header ('Pts', 'Price (USD)').

## Don't

- Don't use tables for layout.
- Don't put more than one interactive control per cell where avoidable.
- Don't truncate important data without a way to see it in full.

## Related components

- `Search`: Filter rows.
- `Tag`: Status cells.
- `Dropdown`: Row actions.
- `Checkbox`: Row selection.

## Accessibility

- Role: `table (native <table> with <caption>, <th scope>) inside a focusable, labelled scroll region`.
- Keyboard: Tab Focus the scroll region (arrow keys scroll it), then sort buttons and row checkboxes in order.; Enter / Space on a header Toggle sort ascending/descending.; Space on a row checkbox Toggle row selection..
- Focus: Visible ring on the scroll region, sort buttons and checkboxes.
- Don't make whole rows clickable; put a Link in the row header cell instead.
- Native: rendered as a list of rows with accessibilityRole="header" for the header; announce each row as a single summary label.
