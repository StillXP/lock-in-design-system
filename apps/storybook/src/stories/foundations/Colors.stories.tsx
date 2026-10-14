import type { Meta, StoryObj } from '@storybook/react-vite';
import { contrast, token, tokensUnder } from '../../blocks/data';
import { ColorSwatch, Section } from '../../blocks/foundations';

const meta: Meta = {
  title: 'Foundations/Color',
  parameters: {
    docs: {
      description: {
        component:
          'Base palette (8 hues × 10 steps) and the semantic colors built on it. Use **semantic** tokens in product UI; the base palette is the raw material. Switch **Mode** and **Theme** in the toolbar: chips use live CSS variables.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const hues = ['neutral', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'brand'];
const steps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

/** Pick the neutral end with the higher contrast for the step label. */
function labelColor(hex: string) {
  const dark = token('color.neutral.900').value as string;
  const light = token('color.neutral.50').value as string;
  return contrast(hex, dark) >= contrast(hex, light) ? 'var(--ds-color-neutral-900)' : 'var(--ds-color-neutral-50)';
}

export const BasePalette: Story = {
  render: () => (
    <Section
      title="Base palette"
      intro="10 steps per hue, 50 (lightest) → 900 (darkest). Neutral runs from white to black. `brand` aliases blue by default; the Arena and Arcade themes re-point it."
    >
      <div className="fd-palette" role="table" aria-label="Base palette">
        <div role="row" style={{ display: 'contents' }}>
          <span role="columnheader" className="fd-palette__step">Hue</span>
          {steps.map((s) => (
            <span role="columnheader" key={s} className="fd-palette__step">{s}</span>
          ))}
        </div>
        {hues.map((hue) => (
          <div role="row" key={hue} style={{ display: 'contents' }}>
            <span role="rowheader" className="fd-palette__label">{hue}</span>
            {steps.map((s) => {
              const t = token(`color.${hue}.${s}`);
              const hex = t.value as string;
              return (
                <span
                  role="cell"
                  key={s}
                  className="fd-chip"
                  style={{ background: `var(${t.cssVar})`, color: labelColor(hex) }}
                  title={`${t.name} ${hex}`}
                >
                  {hex}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </Section>
  ),
};

const bg = token('color.background.default');

export const Backgrounds: Story = {
  render: () => (
    <>
      <Section title="Background" intro="Page-level fills.">
        <div className="fd-swatches">{tokensUnder('color.background').map((t) => <ColorSwatch key={t.name} token={t} />)}</div>
      </Section>
      <Section title="Surface" intro="Cards, panels, menus and modals that sit on a background.">
        <div className="fd-swatches">{tokensUnder('color.surface').map((t) => <ColorSwatch key={t.name} token={t} />)}</div>
      </Section>
    </>
  ),
};

export const Text: Story = {
  render: () => (
    <Section title="Text" intro="Contrast shown against color.background.default in each mode (4.5:1 minimum for body text).">
      <div className="fd-swatches">
        {tokensUnder('color.text').map((t) => (
          <ColorSwatch key={t.name} token={t} on={t.name.includes('inverse') || t.name.includes('onBrand') ? undefined : bg} />
        ))}
      </div>
    </Section>
  ),
};

export const IconsAndBorders: Story = {
  name: 'Icons & borders',
  render: () => (
    <>
      <Section title="Icon" intro="Non-text contrast: 3:1 minimum against the background.">
        <div className="fd-swatches">{tokensUnder('color.icon').map((t) => <ColorSwatch key={t.name} token={t} />)}</div>
      </Section>
      <Section title="Border">
        <div className="fd-swatches">{tokensUnder('color.border').map((t) => <ColorSwatch key={t.name} token={t} />)}</div>
      </Section>
      <Section title="Focus">
        <div className="fd-swatches">{tokensUnder('color.focus').map((t) => <ColorSwatch key={t.name} token={t} />)}</div>
      </Section>
    </>
  ),
};

export const Intent: Story = {
  render: () => {
    const groups = ['primary', 'secondary', 'tertiary', 'danger', 'disabled'];
    return (
      <>
        {groups.map((g) => (
          <Section key={g} title={`Intent · ${g}`} intro="Interactive fills and their foreground (buttons, toggles, selected states).">
            <div className="fd-swatches">
              {tokensUnder(`color.intent.${g}`).map((t) => (
                <ColorSwatch key={t.name} token={t} on={t.name.endsWith('.text') ? token(`color.intent.${g}.bg`) : undefined} />
              ))}
            </div>
          </Section>
        ))}
      </>
    );
  },
};

export const Status: Story = {
  render: () => {
    const groups = ['neutral', 'brand', 'info', 'success', 'warning', 'danger'];
    return (
      <>
        {groups.map((g) => (
          <Section key={g} title={`Status · ${g}`} intro="Tags, notices and validation. Never rely on color alone: pair with an icon or text.">
            <div className="fd-swatches">
              {tokensUnder(`color.status.${g}`).map((t) => {
                const on = t.name.endsWith('.text') ? `color.status.${g}.bg` : t.name.endsWith('.onSolid') ? `color.status.${g}.solid` : null;
                return <ColorSwatch key={t.name} token={t} on={on ? token(on) : undefined} />;
              })}
            </div>
          </Section>
        ))}
      </>
    );
  },
};

export const DataViz: Story = {
  name: 'Data visualization',
  render: () => (
    <Section title="Data visualization" intro="Categorical series colors, in order. Each meets 3:1 against the background in both modes.">
      <div className="fd-swatches">{tokensUnder('color.dataviz').map((t) => <ColorSwatch key={t.name} token={t} />)}</div>
    </Section>
  ),
};
