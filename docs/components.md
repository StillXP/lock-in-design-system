# Components

> The 14 components, the conventions they share across web and native, and how their machine-readable specs work.

| Component | Category | Use it to… |
| --- | --- | --- |
| Button | action | Trigger an action in the current view |
| Dropdown | action | Open a menu of actions (menu button) |
| Link | navigation | Navigate to another page or URL |
| Tabs | navigation | Switch between related views |
| Checkbox | form | Pick any number of options / confirm a statement |
| RadioGroup (Radio Button) | form | Pick exactly one of a few visible options |
| Toggle | form | Turn a setting on/off immediately |
| InputField | form | Enter a single line of text |
| Search | form | Search or filter content |
| Select | form | Pick one value from a list |
| DataTable | data-display | Scan and compare structured rows |
| Tag | data-display | Label status or category |
| Modal | overlay | Focused decision or short task |
| Icon | media | Show a glyph from the icon set |

The full spec for each lives in `packages/specs/components/<slug>.json` and is served at `GET /api/components/<slug>` and via the MCP tool `get_component`. The web UI renders the same files, with a **Live example** of each component (its Storybook stories, embedded and following the hub's color mode and theme), and so does each component's **Docs** page in Storybook (`npm run storybook`), alongside live, editable stories.

## Spec format (for humans and AI)

Every spec has the same shape (`packages/specs/schema/component.schema.json`):

```jsonc
{
  "name": "Button",
  "import": { "web": "import { Button } from '@lockin/react';", "native": "…" },
  "status": "beta",            // experimental | beta | stable | deprecated
  "version": "0.1.0",          // semver of this component's API
  "purpose": "…",
  "props": [{ "name", "type", "default", "required", "description", "platforms"? }],
  "states": [{ "name", "description" }],
  "tokens": [{ "token": "color.intent.primary.bg", "usage": "…" }],
  "accessibility": { "role", "keyboard": [{ "keys", "action" }], "screenReader", "focus", "touchTarget", "wcag", "notes" },
  "variants": [{ "name", "description", "useWhen" }],
  "usage": { "do": [], "dont": [], "related": [{ "name", "reason" }], "example": { "web", "native" } }
}
```

`npm run validate -w @lockin/specs` checks every spec against the schema **and** that every referenced token exists.

## Shared conventions

**Same API on both platforms.** Prop names match between `@lockin/react` and `@lockin/react-native`. Where platforms genuinely differ, the spec marks the prop with `platforms`:

| Concept | Web | Native |
| --- | --- | --- |
| Press | `onClick` | `onPress` |
| Text change | `onChange` (event) | `onChangeText` / `onValueChange` |
| Accessible name | `aria-label` | `accessibilityLabel` |

**Controlled or uncontrolled.** Every stateful component accepts `value` + `on…Change` (controlled) *or* `default…` (uncontrolled): `Tabs value/defaultValue/onValueChange`, `Toggle checked/defaultChecked/onCheckedChange`, `DataTable sort/defaultSort/onSortChange`.

**Labels are required.** Form controls take a required `label` and a `hideLabel` escape hatch that hides it visually but keeps it for screen readers. Placeholders are never labels.

**Errors.** Form controls take `error` (message). It sets `aria-invalid`, links the message with `aria-describedby`, adds an icon, and turns the border red — never color alone.

**Sizes.** `sm` (32px), `md` (40px, default), `lg` (48px). On touch devices every control's hit area is at least 44×44px regardless of visual size.

**Icons.** Components take icon *names* (`iconStart="plus"`), not elements, so the same code works on both platforms. See `GET /api/icons`.

**Forwarded refs and rest props (web).** Leaf components forward refs and spread remaining native attributes (`name`, `autoComplete`, `data-*`) onto the underlying element.

## Choosing between similar components

| If you need… | Use | Not |
| --- | --- | --- |
| To run an action | Button | Link |
| To go somewhere | Link | Button |
| A list of actions behind a trigger | Dropdown | Select |
| To pick a form value from many | Select | Dropdown |
| To pick one of 2–6 visible options | RadioGroup | Select |
| An instant on/off setting | Toggle | Checkbox |
| A form choice submitted later | Checkbox | Toggle |
| To switch views of the same thing | Tabs | RadioGroup |

## Composition example (web)

```tsx
import { Button, DataTable, Dropdown, Modal, Search, Tag, type DataTableColumn } from '@lockin/react';

const columns: DataTableColumn<Team>[] = [
  { key: 'name', header: 'Team', isRowHeader: true, sortable: true },
  { key: 'points', header: 'Pts', align: 'end', sortable: true },
  { key: 'status', header: 'Status', cell: (t) => <Tag tone={t.out ? 'danger' : 'success'}>{t.out ? 'Eliminated' : 'Active'}</Tag> },
  { key: 'actions', header: 'Actions', cell: (t) => (
      <Dropdown label={`Actions for ${t.name}`} triggerIcon="more-horizontal" triggerVariant="tertiary" align="end"
        items={[{ id: 'remove', label: 'Remove team', icon: 'trash', tone: 'danger', onSelect: () => confirmRemove(t) }]} />
  ) },
];

<Search label="Search teams" onValueChange={setQuery} />
<DataTable caption="Group A" columns={columns} rows={filtered} getRowId={(t) => t.id} mobileLayout="stack" />
```
