import type { Meta, StoryObj } from '@storybook/react-vite';
import { tokensUnder } from '../../blocks/data';
import { Section, TokenTable } from '../../blocks/foundations';

const meta: Meta = {
  title: 'Foundations/Spacing & sizing',
  parameters: {
    docs: {
      description: {
        component:
          'Ten spacing steps from 4px to 128px (base unit 16px = `space.md`), every one divisible by 4. Use them for padding, gaps and margins. Size tokens fix control heights, icon sizes and the 44px minimum touch target.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Space: Story = {
  render: () => (
    <Section title="Space">
      <TokenTable
        tokens={tokensUnder('space')}
        preview={(t) => <div className="fd-bar" style={{ width: `var(${t.cssVar})` }} />}
      />
    </Section>
  ),
};

export const Size: Story = {
  render: () => (
    <>
      <Section title="Control heights" intro="Buttons, inputs, selects (sm / md / lg).">
        <TokenTable
          tokens={tokensUnder('size.control')}
          preview={(t) => <div className="fd-box" style={{ height: `var(${t.cssVar})`, width: '8rem' }} />}
        />
      </Section>
      <Section title="Touch target" intro="Minimum hit area on coarse pointers (WCAG 2.5.5 / IBM).">
        <TokenTable
          tokens={tokensUnder('size.touchTarget')}
          preview={(t) => <div className="fd-box" style={{ height: `var(${t.cssVar})`, width: `var(${t.cssVar})` }} />}
        />
      </Section>
      <Section title="Icon sizes">
        <TokenTable
          tokens={tokensUnder('size.icon')}
          preview={(t) => <div className="fd-box" style={{ height: `var(${t.cssVar})`, width: `var(${t.cssVar})` }} />}
        />
      </Section>
    </>
  ),
};

export const Breakpoints: Story = {
  render: () => (
    <Section title="Breakpoints" intro="Mobile-first min-width breakpoints. CSS custom properties cannot be used inside @media, so copy the value.">
      <TokenTable tokens={tokensUnder('breakpoint')} />
    </Section>
  ),
};
