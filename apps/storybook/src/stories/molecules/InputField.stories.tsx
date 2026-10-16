import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { InputField } from '@lockin/react';
import { iconNames } from '@lockin/icons';
import { specMeta } from '../../blocks/data';

const meta = {
  title: 'Molecules/InputField',
  ...specMeta('input-field'),
  component: InputField,
  args: { label: 'Team name', onChange: fn() },
  argTypes: { iconStart: { control: 'select', options: [undefined, ...iconNames] } },
} satisfies Meta<typeof InputField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: '3–24 characters', required: true } };
export const Error: Story = { args: { required: true, defaultValue: 'R', error: 'Use at least 3 characters.' } };
export const WithIcon: Story = { args: { label: 'Email', type: 'email', autoComplete: 'email', iconStart: 'user' } };
export const WithSuffix: Story = { args: { label: 'Entry fee', type: 'number', suffix: 'USD', showOptional: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'Team Rockets' } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: 'TR-2026-0042', label: 'Registration code' } };

export const Sizes: Story = {
  render: (args) => (
    <div className="fd-section">
      <InputField {...args} size="sm" label="Small" />
      <InputField {...args} size="md" label="Medium" />
      <InputField {...args} size="lg" label="Large" />
    </div>
  ),
};
