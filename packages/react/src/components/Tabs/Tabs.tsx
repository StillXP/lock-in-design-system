import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { useControllableState } from '../../utils/useControllableState';
import { Icon, type IconName } from '../Icon/Icon';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  icon?: IconName;
  /** Small count shown after the label, e.g. number of matches. */
  badge?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  /** Tabs and their panels. */
  items: TabItem[];
  /** Controlled selected tab id. */
  value?: string;
  /** Uncontrolled initial tab (defaults to first enabled). */
  defaultValue?: string;
  /** Selection handler. */
  onValueChange?: (id: string) => void;
  /** Accessible name for the tab list (required if there's no visible heading). */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /**
   * automatic: arrow keys move focus AND select (default, best for fast-rendering panels).
   * manual: arrow keys move focus; Enter/Space selects (use when panels are expensive to render).
   */
  activation?: 'automatic' | 'manual';
  /** Underline indicator or segmented control look. */
  variant?: 'line' | 'contained';
  /** Stretch tabs to fill the width (good for 2–4 tabs on mobile). */
  fitted?: boolean;
  /** Extra class on the tab list wrapper. */
  className?: string;
}

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  activation = 'automatic',
  variant = 'line',
  fitted = false,
  className,
  ...aria
}: TabsProps) {
  const baseId = useId();
  const firstEnabled = items.find((i) => !i.disabled)?.id ?? '';
  const [selected, setSelected] = useControllableState(value, defaultValue ?? firstEnabled, onValueChange);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const enabled = items.filter((i) => !i.disabled);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, id: string) => {
    const idx = enabled.findIndex((i) => i.id === id);
    let next: TabItem | undefined;
    if (e.key === 'ArrowRight') next = enabled[(idx + 1) % enabled.length];
    else if (e.key === 'ArrowLeft') next = enabled[(idx - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    if (!next) return;
    e.preventDefault();
    tabRefs.current[next.id]?.focus();
    if (activation === 'automatic') setSelected(next.id);
  };

  return (
    <div className={cx('ds-tabs', `ds-tabs--${variant}`, fitted && 'ds-tabs--fitted', className)}>
      <div role="tablist" className="ds-tabs__list" aria-orientation="horizontal" {...aria}>
        {items.map((item) => {
          const isSelected = item.id === selected;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[item.id] = el;
              }}
              id={`${baseId}-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              className="ds-tabs__tab ds-focus-ring"
              onClick={() => setSelected(item.id)}
              onKeyDown={(e) => onKeyDown(e, item.id)}
            >
              {item.icon && <Icon name={item.icon} size="sm" />}
              <span>{item.label}</span>
              {item.badge !== undefined && <span className="ds-tabs__badge">{item.badge}</span>}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`${baseId}-panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== selected}
          tabIndex={0}
          className="ds-tabs__panel ds-focus-ring"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
