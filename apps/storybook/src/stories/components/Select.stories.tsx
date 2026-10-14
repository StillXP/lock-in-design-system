import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Select } from '@lockin/react';
import { specMeta } from '../../blocks/data';

const divisions = [
  { value: 'u12', label: 'Under 12' },
  { value: 'u14', label: 'Under 14' },
  { value: 'open', label: 'Open' },
];

const meta = {
  title: 'Components/Select',
  ...specMeta('select'),
  component: Select,
  args: { label: 'Division', placeholder: 'Choose a division', options: divisions, onChange: fn() },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: 'Based on age on 1 January.', required: true } };
export const Error: Story = { args: { required: true, error: 'Choose a division.' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'open' } };
export const Grouped: Story = {
  args: {
    label: 'Venue',
    placeholder: 'Choose a venue',
    options: [
      { label: 'North', options: [{ value: 'n1', label: 'Arena 1' }, { value: 'n2', label: 'Arena 2' }] },
      { label: 'South', options: [{ value: 's1', label: 'Field A' }, { value: 's2', label: 'Field B', disabled: true }] },
    ],
  },
};
export const Sizes: Story = {
  render: (args) => (
    <div className="fd-section">
      <Select {...args} size="sm" label="Small" />
      <Select {...args} size="md" label="Medium" />
      <Select {...args} size="lg" label="Large" />
    </div>
  ),
};
