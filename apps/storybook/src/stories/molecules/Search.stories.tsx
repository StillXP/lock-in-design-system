import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Search } from '@lockin/react';
import { specMeta } from '../../blocks/data';

const meta = {
  title: 'Molecules/Search',
  ...specMeta('search'),
  component: Search,
  args: { label: 'Search players', placeholder: 'Name or team', onValueChange: fn(), onSearch: fn(), onClear: fn() },
} satisfies Meta<typeof Search>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithValue: Story = { args: { defaultValue: 'Rockets' } };
export const VisibleLabel: Story = { args: { showLabel: true } };
export const Loading: Story = { args: { defaultValue: 'Rock', loading: true } };
export const Sizes: Story = {
  render: (args) => (
    <div className="fd-section">
      <Search {...args} size="sm" label="Search (small)" />
      <Search {...args} size="md" label="Search (medium)" />
      <Search {...args} size="lg" label="Search (large)" />
    </div>
  ),
};

const players = ['Ada Rockets', 'Ben Comets', 'Cleo Rockets', 'Dev Meteors', 'Eli Comets'];

function LiveSearch() {
  const [q, setQ] = useState('');
  const results = players.filter((p) => p.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fd-section">
      <Search label="Search players" placeholder="Name or team" value={q} onValueChange={setQ} />
      <p aria-live="polite" className="fd-muted">
        {results.length} players found
      </p>
      <ul>
        {results.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

/** Filter as you type and announce the result count politely. */
export const LiveResults: Story = { render: () => <LiveSearch /> };
