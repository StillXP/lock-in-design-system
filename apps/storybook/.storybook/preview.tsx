import type { Decorator, Preview } from '@storybook/react-vite';
import { Controls, Description, Primary, Stories, Subtitle, Title } from '@storybook/addon-docs/blocks';
import arcadeUrl from '@lockin/tokens/css/themes/arcade?url';
import arenaUrl from '@lockin/tokens/css/themes/arena?url';
import '@lockin/tokens/css';
import '@lockin/tokens/css/typography';
import '../../../packages/react/src/styles/base.css';
import { SpecDetails } from '../src/blocks/SpecDetails';
import '../src/blocks/blocks.css';

// Component CSS straight from source (the package build concatenates the same files).
import.meta.glob('../../../packages/react/src/components/*/*.css', { eager: true });

const themeUrls: Record<string, string> = { arena: arenaUrl, arcade: arcadeUrl };

/** Light / dark / system, mirroring setColorMode() from @lockin/react. */
function applyColorMode(mode: string) {
  const root = document.documentElement;
  if (mode === 'light' || mode === 'dark') root.setAttribute('data-theme', mode);
  else root.removeAttribute('data-theme');
}

/** Project themes load after tokens.css and override the brand ramp. */
function applyTheme(theme: string) {
  let link = document.getElementById('lockin-theme') as HTMLLinkElement | null;
  const href = themeUrls[theme];
  if (!href) return link?.remove();
  if (!link) {
    link = Object.assign(document.createElement('link'), { id: 'lockin-theme', rel: 'stylesheet' });
    document.head.appendChild(link);
  }
  if (link.getAttribute('href') !== href) link.href = href;
}

const withLockIn: Decorator = (Story, { globals, parameters }) => {
  applyColorMode(globals.colorMode);
  applyTheme(globals.theme);
  return (
    <div className="ds-root sb-lockin-canvas" data-layout={parameters.layout}>
      <Story />
    </div>
  );
};

function DocsPage() {
  return (
    <>
      <Title />
      <Subtitle />
      <Description />
      <Primary />
      <Controls />
      <SpecDetails />
      <Stories />
    </>
  );
}

const preview: Preview = {
  globalTypes: {
    colorMode: {
      description: 'Color mode',
      toolbar: {
        title: 'Mode',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'system', title: 'System', icon: 'browser' },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      description: 'Project theme (brand ramp)',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'default', title: 'Default (blue)' },
          { value: 'arena', title: 'Arena (orange)' },
          { value: 'arcade', title: 'Arcade (violet)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { colorMode: 'light', theme: 'default' },
  decorators: [withLockIn],
  parameters: {
    layout: 'padded',
    // Sidebar order: foundations first, then components from smallest to largest (atomic design).
    options: { storySort: { order: ['Foundations', 'Atoms', 'Molecules', 'Organisms'] } },
    // Story canvases use the token background so light/dark is honest.
    backgrounds: { disable: true },
    controls: { expanded: true, sort: 'requiredFirst' },
    docs: { page: DocsPage, codePanel: true },
    // WCAG 2.1 AA rules from axe; 'error' fails the a11y check instead of only reporting it.
    a11y: {
      test: 'error',
      options: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } },
    },
  },
  tags: ['autodocs'],
};

export default preview;
