import type { Meta, StoryObj } from '@storybook/react-vite';
import { tokensUnder, type FlatToken } from '../../blocks/data';
import { Section, TokenTable } from '../../blocks/foundations';

const meta: Meta = {
  title: 'Foundations/Typography',
  parameters: {
    docs: {
      description: {
        component:
          'Composite text styles (`typography.*`) are what components and product UI should use: on the web as `font: var(--ds-typography-…)` or the `.ds-text-…` utility classes from `@lockin/tokens/css/typography`; on native via `textStyle()`. The `font.*` primitives feed them.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<{ sample: string }>;

interface TypeValue {
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: string;
}

const utilityClass = (t: FlatToken) => `ds-text-${t.name.replace(/^typography\./, '').replace(/\./g, '-')}`;

export const TypeScale: Story = {
  name: 'Type scale',
  args: { sample: 'Grand final: Rockets vs Comets' },
  argTypes: { sample: { control: 'text', description: 'Sample text' } },
  render: ({ sample }) => (
    <Section title="Text styles" intro="Each row renders with its own utility class.">
      <table className="fd-table">
        <thead>
          <tr>
            <th scope="col">Style</th>
            <th scope="col">Sample</th>
            <th scope="col">Size / weight / line height</th>
          </tr>
        </thead>
        <tbody>
          {tokensUnder('typography').map((t) => {
            const v = t.value as TypeValue;
            return (
              <tr key={t.name}>
                <th scope="row">
                  {t.name}
                  <div className="fd-muted">.{utilityClass(t)}</div>
                </th>
                <td className={utilityClass(t)}>{sample}</td>
                <td className="fd-mono">
                  {v.fontSize} / {v.fontWeight} / {v.lineHeight}
                  {v.letterSpacing ? ` / ${v.letterSpacing}` : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Section>
  ),
};

export const Primitives: Story = {
  render: () => (
    <>
      <Section title="Font families">
        <TokenTable
          tokens={tokensUnder('font.family')}
          preview={(t) => <span style={{ fontFamily: `var(${t.cssVar})` }}>Lock In 0123456789</span>}
        />
      </Section>
      <Section title="Font sizes">
        <TokenTable tokens={tokensUnder('font.size')} preview={(t) => <span style={{ fontSize: `var(${t.cssVar})` }}>Aa</span>} />
      </Section>
      <Section title="Font weights">
        <TokenTable
          tokens={tokensUnder('font.weight')}
          preview={(t) => <span style={{ fontWeight: `var(${t.cssVar})` as never }}>Match point</span>}
        />
      </Section>
      <Section title="Line height, letter spacing, decoration, transform">
        <TokenTable
          tokens={[
            ...tokensUnder('font.lineHeight'),
            ...tokensUnder('font.letterSpacing'),
            ...tokensUnder('font.decoration'),
            ...tokensUnder('font.underlineOffset'),
            ...tokensUnder('font.transform'),
          ]}
        />
      </Section>
    </>
  ),
};
