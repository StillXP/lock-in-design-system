import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Button, type ButtonSize, type ButtonVariant } from '../Button/Button';
import { Icon, type IconName } from '../Icon/Icon';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: IconName;
  onSelect?: () => void;
  disabled?: boolean;
  /** Destructive actions are styled red and should usually be last. */
  tone?: 'default' | 'danger';
}

export interface DropdownProps {
  /** Trigger button text. */
  label: string;
  items: DropdownItem[];
  /** Render the trigger as an icon-only button (label becomes its aria-label). */
  triggerIcon?: IconName;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
  /** Horizontal alignment of the menu relative to the trigger. */
  align?: 'start' | 'end';
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Menu button: a button that opens a list of actions (WAI-ARIA menu pattern).
 * For choosing a form value, use Select.
 */
export function Dropdown({
  label,
  items,
  triggerIcon,
  triggerVariant = 'secondary',
  triggerSize = 'md',
  align = 'start',
  disabled,
  className,
}: DropdownProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pendingFocus = useRef<'first' | 'last' | null>(null);
  const enabledIdx = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);

  const focusItem = (i: number) => itemRefs.current[i]?.focus();
  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    if (pendingFocus.current) {
      focusItem(pendingFocus.current === 'first' ? enabledIdx[0] : enabledIdx[enabledIdx.length - 1]);
      pendingFocus.current = null;
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const openWith = (focus: 'first' | 'last') => {
    pendingFocus.current = focus;
    setOpen(true);
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openWith('first');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openWith('last');
    }
  };

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = itemRefs.current.findIndex((el) => el === document.activeElement);
    const pos = enabledIdx.indexOf(current);
    const move = (to: number) => {
      e.preventDefault();
      focusItem(enabledIdx[(to + enabledIdx.length) % enabledIdx.length]);
    };
    switch (e.key) {
      case 'ArrowDown': return move(pos + 1);
      case 'ArrowUp': return move(pos - 1);
      case 'Home': return move(0);
      case 'End': return move(enabledIdx.length - 1);
      case 'Escape':
        e.preventDefault();
        return close();
      case 'Tab':
        return close(false);
      default:
        // Typeahead: jump to the next item starting with the typed character
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const ch = e.key.toLowerCase();
          const order = [...enabledIdx.slice(pos + 1), ...enabledIdx.slice(0, pos + 1)];
          const hit = order.find((i) => items[i].label.toLowerCase().startsWith(ch));
          if (hit !== undefined) focusItem(hit);
        }
    }
  };

  return (
    <div ref={rootRef} className={cx('ds-dropdown', `ds-dropdown--align-${align}`, className)}>
      <Button
        ref={triggerRef}
        id={`${id}-trigger`}
        variant={triggerVariant}
        size={triggerSize}
        iconOnly={Boolean(triggerIcon)}
        iconStart={triggerIcon}
        iconEnd={triggerIcon ? undefined : 'chevron-down'}
        aria-label={triggerIcon ? label : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openWith('first'))}
        onKeyDown={onTriggerKeyDown}
      >
        {label}
      </Button>
      {open && (
        <div
          id={`${id}-menu`}
          role="menu"
          aria-labelledby={`${id}-trigger`}
          className="ds-dropdown__menu"
          onKeyDown={onMenuKeyDown}
        >
          {items.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              aria-disabled={item.disabled || undefined}
              className={cx('ds-dropdown__item', item.tone === 'danger' && 'ds-dropdown__item--danger')}
              onClick={() => {
                if (item.disabled) return;
                item.onSelect?.();
                close();
              }}
            >
              {item.icon && <Icon name={item.icon} size="sm" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
