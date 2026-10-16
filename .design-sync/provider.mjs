// design-sync preview wrapper. .storybook/preview.tsx wraps every story in
// <div class="ds-root"> (base.css sets font, color and background on .ds-root), and the
// stories lean on the fd-* helper classes from blocks.css. That decorator module can't run outside Vite
// (import.meta.glob), so previews use this equivalent root and embed blocks.css verbatim.
import { createElement } from 'react';
import blocksCss from '../apps/storybook/src/blocks/blocks.css' with { type: 'text' };
export const DsRoot = ({ children }) =>
  createElement('div', { className: 'ds-root' }, createElement('style', null, blocksCss), children);
