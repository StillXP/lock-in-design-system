import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const fromRoot = (path: string) => fileURLToPath(new URL(`../../../${path}`, import.meta.url));

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  core: { disableTelemetry: true },
  typescript: {
    // Prop tables come from the TypeScript source of @lockin/react.
    reactDocgen: 'react-docgen',
  },
  async viteFinal(config) {
    // Stories render the component *source* so edits hot-reload without rebuilding the package.
    config.resolve ??= {};
    config.resolve.alias = [
      ...(Array.isArray(config.resolve.alias) ? config.resolve.alias : []),
      { find: /^@lockin\/react$/, replacement: fromRoot('packages/react/src/index.ts') },
      { find: /^@lockin\/icons$/, replacement: fromRoot('packages/icons/src/index.ts') },
    ];
    return config;
  },
};

export default config;
