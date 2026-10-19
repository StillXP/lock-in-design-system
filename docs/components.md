# Components

> The 14 components grouped by atomic level, the conventions they share across web and native, and how their machine-readable specs work.

## Atomic levels

Components are organized by atomic design level, from smallest to largest. The level is a field on each spec (`level`), and Storybook, the hub, the MCP server and the Claude Design sync all follow it.

| Level | What it is | Rule of thumb |
| --- | --- | --- |
| Atom | A single control or element | It does one visible thing and doesn't compose other Lock In components. |
| Molecule | A few atoms working as one unit | It adds behavior the parts don't have alone: a label, hint and error around a control, a control with a menu, a group that shares selection state. |
| Organism | A self-contained section of an interface | It composes molecules and atoms and manages its own layout, focus or overlay. |

When a component could fit two levels, pick by what it composes. A control that stands alone is an atom. A control wrapped in a label, hint and error is a molecule. Anything that arranges several molecules, or takes over the screen, is an organism.

Lock In stops at organisms. Templates and pages belong to each project, because they hold that project's content and routes. Build them from organisms, molecules and atoms.

The level only organizes the system. Every component imports from `@lockin/react` (or `@lockin/react-native`) the same way, whatever its level.

### Atoms

| Component | Category | Use it to… |
| --- | --- | --- |
| Button | action | Trigger an action in the current view |
| Link | navigation | Navigate to another page or URL |
| Checkbox | form | Pick any number of options / confirm a statement |
| Toggle | form | Turn a setting on/off immediately |
| Tag | data-display | Label status or category |
| Icon | media | Show a glyph from the icon set |

### Molecules

| Component | Category | Use it to… |
| --- | --- | --- |
| InputField | form | Enter a single line of text |
| Search | form | Search or filter content |
| Select | form | Pick one value from a list |
| RadioGroup (Radio Button) | form | Pick exactly one of a few visible options |
| Dropdown | action | Open a menu of actions (menu button) |
| Tabs | navigation | Switch between related views |

### Organisms

| Component | Category | Use it to… |
| --- | --- | --- |
| DataTable | data-display | Scan and compare structured rows |
| Modal | overlay | Focused decision or short task |

Where the level shows up:

- Storybook: stories are titled `Atoms/<Name>`, `Molecules/<Name>` or `Organisms/<Name>`, filed in `apps/storybook/src/stories/atoms|molecules|organisms/`, and the sidebar lists Foundations first, then the three levels.
- Hub: the Components page groups cards by level, and each component page shows its level.
- API and MCP: `GET /api/components` and the `list_components` tool include `level`, and search matches it (try "molecule").
- Specs: `level` is required and must be `atom`, `molecule` or `organism`.

## Specs

The full spec for each lives in `packages/specs/components/<slug>.json` and is served at `GET /api/components/<slug>` and via the MCP tool `get_component`. The web UI renders the same files, with a Live example of each component: a Code tab (its Storybook stories, embedded and following the hub's color mode and theme) and a Design tab (Figma's view-only embed of the spec's `figma` node). Each component's Docs page in Storybook (`npm run storybook`) renders the spec too, alongside live, editable stories.

## Spec format (for humans and AI)

Every spec has the same shape (`packages/specs/schema/component.schema.json`):

```jsonc
{
  "name": "Button",
  "import": { "web": "import { Button } from '@lockin/react';", "native": "…" },
  "figma": { "fileKey": "1dgB7LeRgTrVIenTmmrlvr", "nodeId": "5:422", "props": [] }, // optional: the component set in the Figma library, and how its properties map to `props`
  "status": "beta",            // experimental | beta | stable | deprecated
  "version": "0.4.0",          // semver of this component's API
  "category": "action",        // action | navigation | form | data-display | feedback | overlay | media
  "level": "atom",             // atom | molecule | organism
  "purpose": "…",
  "props": [{ "name", "type", "default", "required", "description", "platforms"? }],
  "states": [{ "name", "description" }],
  "tokens": [{ "token": "color.intent.primary.bg", "usage": "…" }],
  "accessibility": { "role", "keyboard": [{ "keys", "action" }], "screenReader", "focus", "touchTarget", "wcag", "notes" },
  "variants": [{ "name", "description", "useWhen" }],
  "usage": { "do": [], "dont": [], "related": [{ "name", "reason" }], "example": { "web", "native" } }
}
```

`npm run validate -w @lockin/specs` checks every spec against the schema and that every referenced token exists.

`npm run check:code -w @lockin/specs` checks every spec against the components themselves. It reads the props type of each React and React Native component with the TypeScript compiler and reports:

- a prop the component declares that the spec doesn't list (props that only pass through from HTML or React Native types, plus `className`, `style` and `ref`, are exempt);
- a spec prop the component doesn't have on a platform it lists;
- required vs optional, string-literal values (`'sm' | 'md'`) and literal defaults that differ.

Types other than string-literal unions are not compared, and a default that is an expression (`role === 'dialog'`) or described in words (`"end (web) / start (native)"`) is skipped. It runs in `npm run check`, so CI fails on drift.

### Figma props mapping

`figma.props` records, for each code prop, the Figma property that models it. Each row has a `status`:

| Status | Meaning |
| --- | --- |
| `aligned` | Same name, values and default. |
| `differs` | Modelled in both, but not the same way (for example `disabled` is `state=disabled`). Needs a `note`. |
| `code-only` | Figma has nothing for it (for example `onClick`). Needs a `note` with the Figma workaround. |
| `figma-only` | A Figma property with no code prop (for example `showIconStart`). Needs a `note`. |

Validation requires every prop in `props` to appear in exactly one row, so adding a prop without mapping it fails. An `aligned` row also fails if the defaults differ. The hub shows the rows under "Figma ↔ code props" on the component page, and the same table is on the component's page in the Figma library, so keep the two in step.

## Shared conventions

Same API on both platforms. Prop names match between `@lockin/react` and `@lockin/react-native`. Where platforms genuinely differ, the spec marks the prop with `platforms`:

| Concept | Web | Native |
| --- | --- | --- |
| Press | `onClick` | `onPress` |
| Text change | `onChange` (event) | `onChangeText` / `onValueChange` |
| Accessible name | `aria-label` | `accessibilityLabel` |

When a prop differs by platform only in name, the spec lists it once with both names (`aria-label / accessibilityLabel`). Specs don't list `className` (web), `style` (native) or the standard HTML / React Native attributes a component passes through (for example `placeholder` on InputField); list one only when the component gives it its own behaviour.

Controlled or uncontrolled. Every stateful component accepts `value` + `on…Change` (controlled) or `default…` (uncontrolled): `Tabs value/defaultValue/onValueChange`, `Toggle checked/defaultChecked/onCheckedChange`, `DataTable sort/defaultSort/onSortChange`.

Labels are required. Form controls take a required `label` and a `hideLabel` escape hatch that hides it visually but keeps it for screen readers. Placeholders are never labels.

Errors. Form controls take `error` (message). It sets `aria-invalid`, links the message with `aria-describedby`, adds an icon, and turns the border red, so color is never the only signal.

Sizes. `sm` (32px), `md` (40px, default), `lg` (48px). On touch devices every control's hit area is at least 44×44px regardless of visual size.

Icons. Components take icon names (`iconStart="plus"`), not elements, so the same code works on both platforms. See `GET /api/icons`.

Forwarded refs and rest props (web). Leaf components forward refs and spread remaining native attributes (`name`, `autoComplete`, `data-*`) onto the underlying element.

## Choosing between similar components

| If you need… | Use | Not |
| --- | --- | --- |
| To run an action | Button | Link |
| To go somewhere | Link | Button |
| A list of actions behind a trigger | Dropdown | Select |
| To pick a form value from many | Select | Dropdown |
| To pick one of 2 to 6 visible options | RadioGroup | Select |
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
