import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@lockin/react';
import { token, tokensUnder } from '../../blocks/data';
import { Section, TokenTable } from '../../blocks/foundations';

const meta: Meta = {
  title: 'Foundations/Shape & effects',
  parameters: {
    docs: {
      description: {
        component: 'Radius, borders, focus ring, elevation, motion and stacking order.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Radius: Story = {
  render: () => (
    <Section title="Radius">
      <div className="fd-row">
        {tokensUnder('radius').map((t) => (
          <div key={t.name} className="fd-col">
            <div className="fd-box" style={{ borderRadius: `var(${t.cssVar})` }} />
            <span className="fd-mono">{t.name}</span>
            <span className="fd-muted">{String(t.value)}</span>
          </div>
        ))}
      </div>
    </Section>
  ),
};

export const BordersAndFocus: Story = {
  name: 'Borders & focus',
  render: () => (
    <>
      <Section title="Border width">
        <TokenTable
          tokens={tokensUnder('border.width')}
          preview={(t) => (
            <div className="fd-box" style={{ borderWidth: `var(${t.cssVar})`, borderStyle: 'solid', borderColor: 'var(--ds-color-border-strong)' }} />
          )}
        />
      </Section>
      <Section title="Focus ring" intro="Every interactive component shows this ring on :focus-visible. Tab to the button to see it.">
        <TokenTable tokens={[token('focus.width'), token('focus.offset'), ...tokensUnder('color.focus')]} />
        <div>
          <Button variant="secondary">Tab to me</Button>
        </div>
      </Section>
    </>
  ),
};

export const Elevation: Story = {
  render: () => (
    <Section title="Shadow" intro="Use sparingly: menus, popovers and modals. Cards use a border instead.">
      <div className="fd-row">
        {tokensUnder('shadow').map((t) => (
          <div key={t.name} className="fd-col">
            <div className="fd-box" style={{ boxShadow: `var(${t.cssVar})`, borderRadius: 'var(--ds-radius-md)', borderColor: 'transparent' }} />
            <span className="fd-mono">{t.name}</span>
          </div>
        ))}
      </div>
    </Section>
  ),
};

function MotionDemo() {
  const [run, setRun] = useState(false);
  return (
    <>
      <div>
        <Button variant="secondary" onClick={() => setRun((r) => !r)}>
          {run ? 'Reset' : 'Play'}
        </Button>
      </div>
      {tokensUnder('motion.duration')
        .filter((d) => d.value !== '0ms')
        .flatMap((d) =>
          tokensUnder('motion.easing').map((e) => (
            <div key={`${d.name}-${e.name}`}>
              <span className="fd-mono fd-muted">
                {d.name.split('.').pop()} · {e.name.split('.').pop()}
              </span>
              <div className="fd-track" data-run={run}>
                <span
                  className="fd-dot"
                  style={{ transitionDuration: `var(${d.cssVar})`, transitionTimingFunction: `var(${e.cssVar})` }}
                />
              </div>
            </div>
          )),
        )}
    </>
  );
}

export const Motion: Story = {
  render: () => (
    <>
      <Section title="Duration & easing">
        <TokenTable tokens={[...tokensUnder('motion.duration'), ...tokensUnder('motion.easing')]} />
      </Section>
      <Section
        title="Try it"
        intro="Tokens collapse to 0ms under prefers-reduced-motion, so the dots jump instead of sliding if your OS has reduced motion on."
      >
        <MotionDemo />
      </Section>
    </>
  ),
};

export const ZIndex: Story = {
  name: 'Z-index',
  render: () => (
    <Section title="Stacking order" intro="Use the named layer, never a raw number.">
      <TokenTable tokens={tokensUnder('zIndex')} />
    </Section>
  ),
};
