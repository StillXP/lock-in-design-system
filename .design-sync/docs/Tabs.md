Switches between related views of the same context (Overview / Standings / Fixtures) without leaving the page.

Atomic level: molecule.

## Variants

- `line`: Underline indicator. Use when: Page-level sections.
- `contained`: Segmented control look. Use when: Switching views in a card or toolbar (List / Grid / Bracket).

## Example

```jsx
<Tabs
  aria-label="Tournament"
  items={[
    { id: 'overview', label: 'Overview', content: <Overview /> },
    { id: 'standings', label: 'Standings', content: <Standings /> },
    { id: 'disputes', label: 'Disputes', badge: 3, content: <Disputes /> },
  ]}
/>
```

## Do

- Keep labels to one or two words.
- Use when users don't need to compare content across tabs.
- Use badges for counts ('Disputes 3').

## Don't

- Don't use Tabs for sequential steps — use a stepper / wizard.
- Don't use Tabs for top-level site navigation — use links.
- Don't exceed ~6 tabs; consider a Select on mobile.

## Related components

- `Link`: Navigation between pages.
- `RadioGroup`: Choosing a value.

## Accessibility

- Role: `tablist > tab, tabpanel`.
- Keyboard: Tab Focus the selected tab, then into the panel.; Arrow Left / Right Previous / next tab (wraps).; Home / End First / last tab.; Enter / Space Select focused tab (manual activation)..
- Focus: Roving tabindex: only the selected tab is in the tab order. Panels are focusable so their content is reachable.
- Selected state uses an indicator and weight, not color alone.
