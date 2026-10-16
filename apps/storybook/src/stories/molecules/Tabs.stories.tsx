import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Tabs } from '@lockin/react';
import { specMeta } from '../../blocks/data';

const items = [
  { id: 'overview', label: 'Overview', content: <p>16 teams · single elimination · finals on Saturday.</p> },
  { id: 'standings', label: 'Standings', icon: 'trophy' as const, content: <p>Rockets lead Group A with 9 points.</p> },
  { id: 'disputes', label: 'Disputes', badge: 3, content: <p>3 score disputes waiting for review.</p> },
  { id: 'archive', label: 'Archive', disabled: true, content: <p>Past seasons.</p> },
];

const meta = {
  title: 'Molecules/Tabs',
  ...specMeta('tabs'),
  component: Tabs,
  args: { 'aria-label': 'Tournament', items, onValueChange: fn() },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = { args: { variant: 'line' } };
export const Contained: Story = { args: { variant: 'contained' } };
export const Fitted: Story = { args: { fitted: true } };
/** Arrow keys move focus; Enter/Space selects. Use when switching tabs is expensive. */
export const ManualActivation: Story = { args: { activation: 'manual' } };
export const DefaultSelected: Story = { args: { defaultValue: 'standings' } };
