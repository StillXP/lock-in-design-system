import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon, type IconName } from '../Icon/Icon';

export type TagTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: TagTone;
  variant?: 'subtle' | 'solid' | 'outline';
  size?: 'sm' | 'md';
  /** Leading icon. Status tones should include one so meaning isn't color-only. */
  icon?: IconName;
  /** Makes the tag removable (filters, multi-select chips). */
  onRemove?: () => void;
  /** Accessible name for the remove button. Defaults to "Remove {children}". */
  removeLabel?: string;
}

const DEFAULT_ICON: Partial<Record<TagTone, IconName>> = {
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-circle',
  info: 'info',
};

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { children, tone = 'neutral', variant = 'subtle', size = 'md', icon, onRemove, removeLabel, className, ...rest },
  ref,
) {
  const leading = icon ?? DEFAULT_ICON[tone];
  return (
    <span
      ref={ref}
      className={cx('ds-tag', `ds-tag--${tone}`, `ds-tag--${variant}`, `ds-tag--${size}`, className)}
      {...rest}
    >
      {leading && <Icon name={leading} size="sm" />}
      <span className="ds-tag__label">{children}</span>
      {onRemove && (
        <button
          type="button"
          className="ds-tag__remove ds-focus-ring"
          aria-label={removeLabel ?? `Remove ${typeof children === 'string' ? children : ''}`.trim()}
          onClick={onRemove}
        >
          <Icon name="close" size="sm" />
        </button>
      )}
    </span>
  );
});
