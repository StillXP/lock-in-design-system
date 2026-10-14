import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { VisuallyHidden } from '../../utils/VisuallyHidden';
import { Icon, type IconName } from '../Icon/Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual emphasis. One primary action per view. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconStart?: IconName;
  iconEnd?: IconName;
  /** Render only the icon (iconStart). Requires aria-label. */
  iconOnly?: boolean;
  /** Shows a spinner, sets aria-busy and blocks clicks while staying focusable. */
  loading?: boolean;
  /** Text announced while loading. */
  loadingLabel?: string;
  fullWidth?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    iconStart,
    iconEnd,
    iconOnly = false,
    loading = false,
    loadingLabel = 'Loading',
    fullWidth = false,
    type = 'button',
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  if (iconOnly && !rest['aria-label'] && !rest['aria-labelledby']) {
    console.warn('[Button] iconOnly buttons need an aria-label.');
  }
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  const iconSize = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md';

  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'ds-button',
        'ds-focus-ring',
        `ds-button--${variant}`,
        `ds-button--${size}`,
        iconOnly && 'ds-button--icon-only',
        fullWidth && 'ds-button--full',
        loading && 'is-loading',
        className,
      )}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={handleClick}
      {...rest}
    >
      {loading ? (
        <span className="ds-spinner" aria-hidden="true" />
      ) : (
        iconStart && <Icon name={iconStart} size={iconSize} />
      )}
      {!iconOnly && <span className="ds-button__label">{children}</span>}
      {!iconOnly && iconEnd && !loading && <Icon name={iconEnd} size={iconSize} />}
      {loading && <VisuallyHidden>{loadingLabel}</VisuallyHidden>}
    </button>
  );
});
