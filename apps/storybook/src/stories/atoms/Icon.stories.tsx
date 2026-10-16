import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@lockin/react';
import { iconNames } from '@lockin/icons';
import { specMeta } from '../../blocks/data';

const meta = {
  title: 'Atoms/Icon',
  ...specMeta('icon'),
  component: Icon,
  args: { name: 'trophy', size: 'lg', color: 'brand' },
  argTypes: { name: { control: 'select', options: iconNames } },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Decorative by default: aria-hidden, the adjacent text carries the meaning. */
export const Decorative: Story = {
  render: (args) => (
    <span className="fd-row" style={{ alignItems: 'center', gap: 'var(--ds-space-xs)' }}>
      <Icon {...args} /> Champions
    </span>
  ),
};

/** Standalone meaningful icons need a label (role="img"). */
export const Labelled: Story = { args: { name: 'alert-circle', color: 'danger', label: 'Error' } };

export const Sizes: Story = {
  render: (args) => (
    <div className="fd-row">
      {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <div key={s} className="fd-col">
          <Icon {...args} size={s} />
          <span className="fd-mono">{s}</span>
        </div>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: (args) => (
    <div className="fd-row">
      {(['primary', 'secondary', 'disabled', 'brand', 'danger', 'success', 'warning', 'info'] as const).map((c) => (
        <div key={c} className="fd-col">
          <Icon {...args} color={c} />
          <span className="fd-mono">{c}</span>
        </div>
      ))}
    </div>
  ),
};
