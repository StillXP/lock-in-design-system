import { forwardRef, type SVGProps } from 'react';
import { icons, type IconName } from '@lockin/icons';
import { cx } from '../../utils/cx';

export type { IconName };
export type IconSize = 'sm' | 'md' | 'lg' | 'xl';
export type IconColor =
  | 'currentColor'
  | 'primary'
  | 'secondary'
  | 'disabled'
  | 'inverse'
  | 'onBrand'
  | 'brand'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'color' | 'ref'> {
  /** Icon from @lockin/icons. */
  name: IconName;
  /** Token size (sm 16, md 20, lg 24, xl 32) or a pixel number. */
  size?: IconSize | number;
  /** Semantic icon color token. Defaults to inheriting the text color. */
  color?: IconColor;
  /**
   * Accessible name. Provide it only when the icon conveys meaning on its own
   * (no adjacent text). Omit it for decorative icons — they are hidden from
   * assistive tech.
   */
  label?: string;
}

const SIZE_VAR: Record<IconSize, string> = {
  sm: 'var(--ds-size-icon-sm)',
  md: 'var(--ds-size-icon-md)',
  lg: 'var(--ds-size-icon-lg)',
  xl: 'var(--ds-size-icon-xl)',
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 'md', color = 'currentColor', label, className, style, ...rest },
  ref,
) {
  const def = icons[name];
  const dimension = typeof size === 'number' ? `${size}px` : SIZE_VAR[size];
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cx('ds-icon', className)}
      style={{
        width: dimension,
        height: dimension,
        color: color === 'currentColor' ? undefined : `var(--ds-color-icon-${color})`,
        ...style,
      }}
      {...rest}
    >
      {def?.paths.map((d) => <path key={d} d={d} />)}
    </svg>
  );
});
