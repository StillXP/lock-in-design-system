import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Toggle } from '@lockin/react';
import { specMeta } from '../../blocks/data';

const meta = {
  title: 'Atoms/Toggle',
  ...specMeta('toggle'),
  component: Toggle,
  args: { label: 'Sound effects', onCheckedChange: fn() },
} satisfies Meta<typeof Toggle>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const On: Story = { args: { defaultChecked: true } };
export const WithDescription: Story = { args: { description: 'Play a sound when a match starts.', defaultChecked: true } };
export const Small: Story = { args: { size: 'sm' } };
export const LabelStart: Story = { args: { labelPosition: 'start', label: 'Dark mode' } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };

function ControlledToggle() {
  const [on, setOn] = useState(false);
  return (
    <div className="fd-section">
      <Toggle label="Live scores" checked={on} onCheckedChange={setOn} />
      <p className="fd-muted">Live scores are {on ? 'on' : 'off'}.</p>
    </div>
  );
}

/** Controlled: the switch applies immediately, no save button. */
export const Controlled: Story = { render: () => <ControlledToggle /> };
