import { forwardRef, type AnchorHTMLAttributes, type ElementType, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { VisuallyHidden } from '../../utils/VisuallyHidden';
import { Icon } from '../Icon/Icon';

export type LinkVariant = 'inline' | 'standalone' | 'subtle';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Destination. On native, opened with Linking.openURL unless onPress is given. */
  href: string;
  /** inline = within body copy; standalone = on its own line with a chevron; subtle = low-emphasis (footers, meta). */
  variant?: LinkVariant;
  /** Opens in a new tab, adds rel="noopener noreferrer", an icon, and an SR hint. */
  external?: boolean;
  /** Text announced for external links. */
  externalLabel?: string;
  /** Render with a router link component, e.g. Next.js Link. Must forward href and render an <a>. */
  as?: ElementType;
  /** Link text. Must describe the destination ('View bracket', not 'Click here'). */
  children: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { variant = 'inline', external = false, externalLabel = '(opens in a new tab)', as: Component = 'a', className, children, ...rest },
  ref,
) {
  const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <Component
      ref={ref}
      className={cx('ds-link', 'ds-focus-ring', `ds-link--${variant}`, className)}
      {...externalProps}
      {...rest}
    >
      {children}
      {external && (
        <>
          <Icon name="external-link" size="sm" className="ds-link__icon" />
          <VisuallyHidden>{externalLabel}</VisuallyHidden>
        </>
      )}
      {!external && variant === 'standalone' && <Icon name="chevron-right" size="sm" className="ds-link__icon" />}
    </Component>
  );
});
