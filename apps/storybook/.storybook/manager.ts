import { tokens } from '@lockin/tokens';
import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

const brand = tokens.light.color.intent.primary.bg;

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Lock In Design System',
    colorPrimary: brand,
    colorSecondary: brand,
  }),
});
