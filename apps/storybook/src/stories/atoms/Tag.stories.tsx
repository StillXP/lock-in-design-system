import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Tag } from '@lockin/react';
import { iconNames } from '@lockin/icons';
import { specMeta } from '../../blocks/data';

const tones = ['neutral', 'brand', 'info', 'success', 'warning', 'danger'] as const;
const variants = ['subtle', 'solid', 'outline'] as const;

const meta = {
  title: 'Atoms/Tag',
  ...specMeta('tag'),
  component: Tag,
  args: { children: 'Final', tone: 'success' },
  argTypes: { icon: { control: 'select', options: [undefined, ...iconNames] } },
} satisfies Meta<typeof Tag>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithIcon: Story = { args: { tone: 'danger', variant: 'solid', icon: 'alert-circle', children: 'Live' } };
/** Removable filter chip: the remove button gets "Remove <label>". */
export const Removable: Story = { args: { tone: 'neutral', children: 'Under 12', onRemove: fn() } };
export const Small: Story = { args: { size: 'sm' } };

export const AllTones: Story = {
  render: (args) => (
    <div className="fd-section">
      {variants.map((variant) => (
        <div key={variant} className="fd-row" style={{ alignItems: 'center' }}>
          <span className="fd-mono fd-muted" style={{ width: '5rem' }}>{variant}</span>
          {tones.map((tone) => (
            <Tag key={tone} {...args} tone={tone} variant={variant}>
              {tone}
            </Tag>
          ))}
        </div>
      ))}
    </div>
  ),
};
