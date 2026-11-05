import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Textarea } from '@stillxp/react';
import { specMeta } from '../../blocks/data';

const description = 'Open to all skill levels. Cash payouts in advanced divisions, trophies for all.';

const meta = {
  title: 'Molecules/Textarea',
  ...specMeta('textarea'),
  component: Textarea,
  args: { label: 'Description', onChange: fn() },
  argTypes: { resize: { control: 'inline-radio', options: ['vertical', 'none'] } },
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { placeholder: 'Tell players what to expect' } };
export const WithHint: Story = { args: { hint: 'Shown on the public tournament page.', showOptional: true } };
export const WithCounter: Story = { args: { defaultValue: description, maxLength: 500, showCount: true } };
export const NearLimit: Story = { args: { defaultValue: `${description} Bring your own ball.`, maxLength: 100, showCount: true } };
export const Error: Story = { args: { required: true, error: 'Add a description so players know the format.' } };
export const AutoGrow: Story = {
  args: { label: 'Match notes', autoGrow: true, rows: 2, maxRows: 6, defaultValue: `${description}\n\nCheck-in: 7:30 AM\nFirst serve: 8:00 AM` },
};
export const Rows: Story = {
  render: (args) => (
    <div className="fd-section">
      <Textarea {...args} rows={3} label="3 rows (default)" />
      <Textarea {...args} rows={6} label="6 rows" />
    </div>
  ),
};
export const NoResize: Story = { args: { resize: 'none', defaultValue: description } };
export const Disabled: Story = { args: { disabled: true, defaultValue: description } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: description, label: 'Event rules' } };
