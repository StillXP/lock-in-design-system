import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { icons, iconNames, type IconName } from '@lockin/icons';
import { Icon, Search, type IconColor, type IconSize } from '@lockin/react';
import { Section } from '../../blocks/foundations';

interface GalleryArgs {
  size: IconSize;
  color: IconColor;
}

const meta: Meta<GalleryArgs> = {
  title: 'Foundations/Icons',
  parameters: {
    docs: {
      description: {
        component:
          'Every icon in `@lockin/icons`: 24×24 grid, 2px round strokes, shared by web and native. Render with `<Icon name="…" />`; see Atoms/Icon for labelling rules.',
      },
    },
  },
  args: { size: 'lg', color: 'primary' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
    color: {
      control: 'select',
      options: ['currentColor', 'primary', 'secondary', 'disabled', 'brand', 'danger', 'success', 'warning', 'info'],
    },
  },
};
export default meta;
type Story = StoryObj<GalleryArgs>;

function Gallery({ size, color }: GalleryArgs) {
  const [query, setQuery] = useState('');
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (n: IconName) => !q || n.includes(q) || icons[n].keywords.some((k) => k.includes(q));
    const byCategory = new Map<string, IconName[]>();
    for (const name of iconNames.filter(match)) {
      const c = icons[name].category;
      byCategory.set(c, [...(byCategory.get(c) ?? []), name]);
    }
    return [...byCategory];
  }, [query]);
  const count = groups.reduce((n, [, list]) => n + list.length, 0);

  return (
    <>
      <Search label="Filter icons" placeholder="Name or keyword (e.g. delete)" value={query} onValueChange={setQuery} />
      <p className="fd-muted" aria-live="polite">
        {count} of {iconNames.length} icons
      </p>
      {groups.map(([category, names]) => (
        <Section key={category} title={category[0].toUpperCase() + category.slice(1)}>
          <ul className="fd-icons" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {names.map((name) => (
              <li key={name} className="fd-icon" title={icons[name].keywords.join(', ')}>
                <Icon name={name} size={size} color={color} />
                <span className="fd-mono">{name}</span>
              </li>
            ))}
          </ul>
        </Section>
      ))}
    </>
  );
}

export const AllIcons: Story = {
  name: 'All icons',
  render: (args) => <Gallery {...args} />,
};
