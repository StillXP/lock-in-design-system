import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Checkbox } from '@lockin/react';
import { specMeta } from '../../blocks/data';

const meta = {
  title: 'Atoms/Checkbox',
  ...specMeta('checkbox'),
  component: Checkbox,
  args: { label: 'Send me match reminders', onChange: fn() },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const WithDescription: Story = {
  args: { description: "We'll email you 1 hour before kickoff.", defaultChecked: true },
};
/** Partially selected (e.g. "select all" with some rows selected). */
export const Indeterminate: Story = { args: { label: 'Select all players', indeterminate: true } };
export const Error: Story = { args: { label: 'I accept the rules', required: true, error: 'You must accept the rules to register.' } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
/** Label stays in the accessibility tree; use in table rows where the column header gives context. */
export const HiddenLabel: Story = { args: { label: 'Select Team Rockets', hideLabel: true } };

export const Group: Story = {
  render: () => (
    <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-sm)' }}>
      <legend className="ds-text-label-lg" style={{ marginBottom: 'var(--ds-space-xs)' }}>
        Notifications
      </legend>
      <Checkbox label="Match reminders" defaultChecked />
      <Checkbox label="Score updates" />
      <Checkbox label="Bracket changes" defaultChecked />
    </fieldset>
  ),
};
