import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, userEvent, within } from 'storybook/test';
import { Dropdown } from '@lockin/react';
import { specMeta } from '../../blocks/data';

const meta = {
  title: 'Molecules/Dropdown',
  ...specMeta('dropdown'),
  component: Dropdown,
  args: {
    label: 'Match actions',
    items: [
      { id: 'edit', label: 'Edit score', icon: 'edit', onSelect: fn() },
      { id: 'reschedule', label: 'Reschedule', icon: 'calendar', onSelect: fn() },
      { id: 'forfeit', label: 'Record forfeit', disabled: true },
      { id: 'delete', label: 'Delete match', icon: 'trash', tone: 'danger', onSelect: fn() },
    ],
  },
  // Leave room for the menu to open.
  decorators: [(Story) => <div style={{ minHeight: '16rem' }}><Story /></div>],
} satisfies Meta<typeof Dropdown>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { triggerVariant: 'secondary' } };

/** Icon-only overflow menu: the label becomes the trigger's accessible name. */
export const Overflow: Story = {
  args: { triggerIcon: 'more-horizontal', triggerVariant: 'tertiary', align: 'end' },
  render: (args) => (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Dropdown {...args} />
    </div>
  ),
};

export const Disabled: Story = { args: { triggerVariant: 'secondary', disabled: true } };

/** Open menu, so the panel, icons, disabled and danger items are visible to visual regression. */
export const Open: Story = {
  args: { triggerVariant: 'secondary' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Match actions' }));
  },
};

export const OpenAligned: Story = {
  args: { triggerIcon: 'more-horizontal', triggerVariant: 'tertiary', align: 'end' },
  render: Overflow.render,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Match actions' }));
  },
};
