import type { HTMLAttributes } from 'react';
import { cx } from './cx';

/** Hides content visually while keeping it available to screen readers. */
export function VisuallyHidden({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx('ds-visually-hidden', className)} {...rest} />;
}
