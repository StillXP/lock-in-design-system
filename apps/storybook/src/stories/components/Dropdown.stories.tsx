import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Dropdown } from '@lockin/react';
import { specMeta } from '../../blocks/data';

const meta = {
  title: 'Components/Dropdown',
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
