import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DataTable as GenericDataTable, Tag, type DataTableColumn, type DataTableProps } from '@lockin/react';
import { specMeta } from '../../blocks/data';

interface Team {
  id: string;
  rank: number;
  name: string;
  played: number;
  won: number;
  points: number;
  status: 'qualified' | 'playoff' | 'out';
}

const teams: Team[] = [
  { id: 'rockets', rank: 1, name: 'Rockets', played: 6, won: 5, points: 15, status: 'qualified' },
  { id: 'comets', rank: 2, name: 'Comets', played: 6, won: 4, points: 12, status: 'qualified' },
  { id: 'meteors', rank: 3, name: 'Meteors', played: 6, won: 3, points: 9, status: 'playoff' },
  { id: 'novas', rank: 4, name: 'Novas', played: 6, won: 2, points: 6, status: 'playoff' },
  { id: 'quasars', rank: 5, name: 'Quasars', played: 6, won: 1, points: 3, status: 'out' },
  { id: 'pulsars', rank: 6, name: 'Pulsars', played: 6, won: 0, points: 0, status: 'out' },
];

const statusTone = { qualified: 'success', playoff: 'warning', out: 'neutral' } as const;

const columns: DataTableColumn<Team>[] = [
  { key: 'rank', header: '#', align: 'end', sortable: true, width: '3rem' },
  { key: 'name', header: 'Team', isRowHeader: true, sortable: true },
  { key: 'played', header: 'P', align: 'end' },
  { key: 'won', header: 'W', align: 'end', sortable: true },
  { key: 'points', header: 'Pts', align: 'end', sortable: true },
  {
    key: 'status',
    header: 'Status',
    cell: (t) => (
      <Tag size="sm" tone={statusTone[t.status]}>
        {t.status}
      </Tag>
    ),
  },
];

// DataTable is generic; Storybook's component typing needs a concrete row type.
const DataTable = GenericDataTable as (props: DataTableProps<Team>) => ReturnType<typeof GenericDataTable>;

const meta = {
  title: 'Organisms/DataTable',
  ...specMeta('data-table'),
  component: DataTable,
  args: {
    caption: 'Group A standings',
    columns,
    rows: teams,
    getRowId: (t) => t.id,
    getRowLabel: (t) => t.name,
    defaultSort: { key: 'rank', direction: 'ascending' },
    onSortChange: fn(),
    onSelectionChange: fn(),
  },
  argTypes: {
    columns: { control: false },
    rows: { control: false },
    getRowId: { control: false },
    getRowLabel: { control: false },
  },
} satisfies Meta<typeof DataTable>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selectable: Story = { args: { selectable: true, defaultSelectedIds: ['rockets'] } };
export const Striped: Story = { args: { striped: true } };
export const Compact: Story = { args: { density: 'compact' } };
export const Comfortable: Story = { args: { density: 'comfortable' } };
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { rows: [], emptyState: 'No teams in this group yet.' } };

/** On narrow screens each row becomes a card of label/value pairs. Resize the viewport to see it. */
export const MobileStack: Story = {
  args: { mobileLayout: 'stack' },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};

export const StickyHeader: Story = {
  args: {
    stickyHeader: true,
    rows: [...teams, ...teams.map((t) => ({ ...t, id: `${t.id}-b`, rank: t.rank + 6, name: `${t.name} B` }))],
  },
  decorators: [(Story) => <div style={{ maxHeight: '18rem', overflow: 'auto' }}><Story /></div>],
};
