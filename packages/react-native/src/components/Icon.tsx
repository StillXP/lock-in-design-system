import Svg, { Path } from 'react-native-svg';
import { icons, type IconName } from '@lockin/icons';
import { useTheme } from '../theme/ThemeProvider';

export type { IconName };
export type IconColor =
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

export interface IconProps {
  /** Icon id. List with GET /api/icons or the MCP tool list_icons. */
  name: IconName;
  /** 16/20/24/32px, or a pixel number. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Semantic icon color. Defaults to color.icon.primary (RN has no currentColor inheritance). */
  color?: IconColor | 'currentColor';
  /** Raw color override — used by components to match their text color. */
  tint?: string;
  /** Accessible name for informative icons. Omit for decorative icons. */
  label?: string;
}

export function Icon({ name, size = 'md', color = 'currentColor', tint, label }: IconProps) {
  const { t } = useTheme();
  const px = typeof size === 'number' ? size : t.size.icon[size];
  const stroke = tint ?? (color === 'currentColor' ? t.color.icon.primary : t.color.icon[color]);
  return (
    <Svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={Boolean(label)}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
    >
      {icons[name].paths.map((d) => (
        <Path key={d} d={d} />
      ))}
    </Svg>
  );
}
