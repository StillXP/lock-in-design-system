import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Radio, RadioGroup } from '@lockin/react';
import { specMeta } from '../../blocks/data';

const options = [
  { value: 'bo1', label: 'Best of 1' },
  { value: 'bo3', label: 'Best of 3', description: 'Recommended for group stages.' },
  { value: 'bo5', label: 'Best of 5' },
];

const meta = {
  title: 'Molecules/RadioGroup',
  ...specMeta('radio-button'),
  component: RadioGroup,
  args: { legend: 'Match format', defaultValue: 'bo3', options, onValueChange: fn() },
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Horizontal: Story = {
  args: { orientation: 'horizontal', options: options.map(({ value, label }) => ({ value, label })) },
};
export const WithDescription: Story = { args: { description: 'Applies to every round until the final.' } };
export const Error: Story = { args: { defaultValue: undefined, required: true, error: 'Choose a match format.' } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledOption: Story = {
  args: { options: [...options, { value: 'bo7', label: 'Best of 7', disabled: true, description: 'Finals only.' }] },
};

/** Compose with <Radio> children for custom content. */
export const Composed: Story = {
  args: { options: undefined, legend: 'Seeding', defaultValue: 'rank' },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="rank" label="By ranking" />
      <Radio value="random" label="Random draw" />
      <Radio value="manual" label="Manual" description="Drag teams into the bracket yourself." />
    </RadioGroup>
  ),
};
