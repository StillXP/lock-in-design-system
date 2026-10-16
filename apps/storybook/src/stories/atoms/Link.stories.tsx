import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from '@lockin/react';
import { specMeta } from '../../blocks/data';

const meta = {
  title: 'Atoms/Link',
  ...specMeta('link'),
  component: Link,
  args: { href: '#rules', children: 'tournament rules' },
} satisfies Meta<typeof Link>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Inline links are always underlined so they don't rely on color (WCAG 1.4.1). */
export const Inline: Story = {
  render: (args) => (
    <p>
      Read the <Link {...args} /> before registering.
    </p>
  ),
};
export const Standalone: Story = { args: { variant: 'standalone', children: 'View brackets' } };
export const Subtle: Story = { args: { variant: 'subtle', children: 'Privacy' } };

/** Opens in a new tab and announces it. */
export const External: Story = { args: { href: 'https://example.com', external: true, children: 'Official rules' } };
