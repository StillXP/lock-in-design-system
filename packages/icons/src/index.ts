/**
 * Lock In icon set. Platform-agnostic SVG path data on a 24×24 grid, drawn as
 * 2px round-capped strokes. Rendered by <Icon> in @lockin/react (inline SVG)
 * and @lockin/react-native (react-native-svg).
 */
export interface IconDefinition {
  /** One or more SVG path `d` strings, stroked with currentColor. */
  paths: readonly string[];
  category: 'action' | 'navigation' | 'status' | 'object' | 'domain';
  keywords: readonly string[];
}

const CIRCLE = 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z';

export const icons = {
  check: { paths: ['M5 12l5 5L20 7'], category: 'action', keywords: ['done', 'confirm', 'tick'] },
  close: { paths: ['M6 6l12 12', 'M18 6L6 18'], category: 'action', keywords: ['x', 'dismiss', 'cancel', 'remove'] },
  plus: { paths: ['M12 5v14', 'M5 12h14'], category: 'action', keywords: ['add', 'create', 'new'] },
  minus: { paths: ['M5 12h14'], category: 'action', keywords: ['subtract', 'remove', 'indeterminate'] },
  search: { paths: ['M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0z', 'M20 20l-4-4'], category: 'action', keywords: ['find', 'magnifier', 'lookup'] },
  edit: { paths: ['M4 20h4L19 9l-4-4L4 16v4z', 'M14 6l4 4'], category: 'action', keywords: ['pencil', 'modify', 'write'] },
  trash: { paths: ['M4 7h16', 'M10 11v6', 'M14 11v6', 'M5 7l1 13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-13', 'M9 7V4h6v3'], category: 'action', keywords: ['delete', 'remove', 'bin'] },
  filter: { paths: ['M4 5h16l-6 8v6l-4-2v-4z'], category: 'action', keywords: ['funnel', 'refine'] },
  sliders: { paths: ['M4 6h9', 'M17 6h3', 'M4 12h3', 'M11 12h9', 'M4 18h11', 'M19 18h1', 'M15 4v4', 'M9 10v4', 'M17 16v4'], category: 'action', keywords: ['settings', 'preferences', 'adjust', 'controls'] },
  'external-link': { paths: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'], category: 'navigation', keywords: ['open', 'new tab', 'outbound'] },
  'chevron-down': { paths: ['M6 9l6 6 6-6'], category: 'navigation', keywords: ['expand', 'open', 'caret'] },
  'chevron-up': { paths: ['M18 15l-6-6-6 6'], category: 'navigation', keywords: ['collapse', 'caret'] },
  'chevron-left': { paths: ['M15 18l-6-6 6-6'], category: 'navigation', keywords: ['back', 'previous'] },
  'chevron-right': { paths: ['M9 18l6-6-6-6'], category: 'navigation', keywords: ['forward', 'next'] },
  'arrow-up': { paths: ['M12 19V5', 'M5 12l7-7 7 7'], category: 'navigation', keywords: ['ascending', 'sort'] },
  'arrow-down': { paths: ['M12 5v14', 'M19 12l-7 7-7-7'], category: 'navigation', keywords: ['descending', 'sort'] },
  'chevrons-up-down': { paths: ['M8 9l4-4 4 4', 'M16 15l-4 4-4-4'], category: 'navigation', keywords: ['sort', 'unsorted', 'select'] },
  menu: { paths: ['M4 6h16', 'M4 12h16', 'M4 18h16'], category: 'navigation', keywords: ['hamburger', 'navigation'] },
  'more-horizontal': { paths: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'], category: 'navigation', keywords: ['overflow', 'ellipsis', 'actions'] },
  home: { paths: ['M3 11l9-8 9 8', 'M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5'], category: 'navigation', keywords: ['house', 'dashboard', 'start'] },
  info: { paths: [CIRCLE, 'M12 16v-4', 'M12 8h.01'], category: 'status', keywords: ['information', 'help', 'about'] },
  'check-circle': { paths: [CIRCLE, 'M8 12l3 3 5-6'], category: 'status', keywords: ['success', 'complete', 'valid'] },
  'alert-circle': { paths: [CIRCLE, 'M12 8v4', 'M12 16h.01'], category: 'status', keywords: ['error', 'danger', 'invalid'] },
  'alert-triangle': { paths: ['M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z', 'M12 9v4', 'M12 17h.01'], category: 'status', keywords: ['warning', 'caution'] },
  eye: { paths: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z', 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'], category: 'object', keywords: ['show', 'visible', 'view'] },
  'eye-off': { paths: ['M3 3l18 18', 'M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4', 'M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6', 'M9.9 9.9a3 3 0 0 0 4.2 4.2'], category: 'object', keywords: ['hide', 'hidden', 'password'] },
  user: { paths: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z'], category: 'object', keywords: ['person', 'account', 'profile', 'player'] },
  calendar: { paths: ['M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z', 'M16 3v4', 'M8 3v4', 'M4 10h16'], category: 'object', keywords: ['date', 'schedule', 'fixture', 'event'] },
  star: { paths: ['M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z'], category: 'object', keywords: ['favorite', 'rating', 'bookmark'] },
  'bar-chart': { paths: ['M4 20h16', 'M7 16v-5', 'M12 16V6', 'M17 16v-8'], category: 'domain', keywords: ['dashboard', 'analytics', 'stats', 'graph'] },
  trophy: { paths: ['M8 21h8', 'M12 17v4', 'M7 4h10v5a5 5 0 0 1-10 0V4z', 'M7 6H4v1a3 3 0 0 0 3 3', 'M17 6h3v1a3 3 0 0 1-3 3'], category: 'domain', keywords: ['tournament', 'winner', 'award', 'sports'] },
  gamepad: { paths: ['M6 11h4', 'M8 9v4', 'M15 12h.01', 'M18 10h.01', 'M17.3 5H6.7a4 4 0 0 0-4 3.6l-.7 6.2A3 3 0 0 0 5 18c1 0 1.9-.5 2.4-1.3L9 14h6l1.6 2.7c.5.8 1.4 1.3 2.4 1.3a3 3 0 0 0 3-3.2l-.7-6.2a4 4 0 0 0-4-3.6z'], category: 'domain', keywords: ['game', 'controller', 'play'] },
  cart: { paths: ['M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6', 'M10 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0z', 'M18 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0z'], category: 'domain', keywords: ['shop', 'store', 'basket', 'checkout'] },
} as const satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof icons;
export const iconNames = Object.keys(icons) as IconName[];
