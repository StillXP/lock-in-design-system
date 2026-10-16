import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from '@lockin/react';
import { iconNames } from '@lockin/icons';
import { specMeta } from '../../blocks/data';

const meta = {
  title: 'Atoms/Button',
  ...specMeta('button'),
  component: Button,
  args: { children: 'New match', onClick: fn() },
  argTypes: {
    iconStart: { control: 'select', options: [undefined, ...iconNames] },
    iconEnd: { control: 'select', options: [undefined, ...iconNames] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary', iconStart: 'plus' } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Cancel' } };
export const Tertiary: Story = { args: { variant: 'tertiary', children: 'View details' } };
export const Danger: Story = { args: { variant: 'danger', iconStart: 'trash', children: 'Delete team' } };

export const Sizes: Story = {
  render: (args) => (
    <div className="fd-row">
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};

export const IconOnly: Story = {
  args: { iconOnly: true, iconStart: 'trash', variant: 'tertiary', 'aria-label': 'Delete player', children: undefined },
};

export const Loading: Story = { args: { loading: true, loadingLabel: 'Saving score', children: 'Save score' } };
export const Disabled: Story = { args: { disabled: true } };
export const FullWidth: Story = { args: { fullWidth: true, children: 'Join tournament' } };

/** One primary per group, placed last. */
export const ButtonGroup: Story = {
  render: () => (
    <div className="fd-row">
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save score</Button>
    </div>
  ),
};
