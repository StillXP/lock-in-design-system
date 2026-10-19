import { ActivityIndicator, Pressable, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { textStyle, touchSlop, useTheme } from '../theme/ThemeProvider';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Visual emphasis. Use one primary per view. */
  variant?: ButtonVariant;
  /** Height 32/40/48px. Hit area is always ≥44px on touch. */
  size?: ButtonSize;
  /** Label text. Use a verb: 'Save score', not 'OK'. */
  children?: string;
  /** Icon before the label (or the only icon when iconOnly). */
  iconStart?: IconName;
  /** Icon after the label (e.g. chevron-down, arrow). */
  iconEnd?: IconName;
  /** Requires accessibilityLabel. */
  iconOnly?: boolean;
  /** Shows a spinner, sets aria-busy, ignores presses but stays focusable. */
  loading?: boolean;
  /** Text announced while loading. */
  loadingLabel?: string;
  /** Stretch to container width (common on mobile forms). */
  fullWidth?: boolean;
  /** Style overrides for the button container. */
  style?: StyleProp<ViewStyle>;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  iconStart,
  iconEnd,
  iconOnly = false,
  loading = false,
  loadingLabel = 'Loading',
  fullWidth = false,
  disabled,
  onPress,
  accessibilityLabel,
  style,
  ...rest
}: ButtonProps) {
  const { t } = useTheme();
  const intent = t.color.intent;
  const palette = {
    primary: { bg: intent.primary.bg, active: intent.primary.bgActive, fg: intent.primary.text, border: 'transparent' },
    secondary: { bg: intent.secondary.bg, active: intent.secondary.bgActive, fg: intent.secondary.text, border: intent.secondary.border },
    tertiary: { bg: 'transparent', active: intent.tertiary.bgActive, fg: intent.tertiary.text, border: 'transparent' },
    danger: { bg: intent.danger.bg, active: intent.danger.bgActive, fg: intent.danger.text, border: 'transparent' },
  }[variant];
  const height = t.size.control[size];
  const fg = disabled ? intent.disabled.text : palette.fg;
  const iconSize = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={iconOnly ? accessibilityLabel : accessibilityLabel ?? (loading ? `${children}, ${loadingLabel}` : undefined)}
      accessibilityState={{ disabled: Boolean(disabled), busy: loading }}
      disabled={disabled}
      onPress={loading ? undefined : onPress}
      hitSlop={touchSlop(t, height, iconOnly ? height : 999)}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: t.space.xs,
          minHeight: height,
          paddingHorizontal: iconOnly ? 0 : size === 'sm' ? t.space.sm : size === 'lg' ? t.space.lg : t.space.md,
          width: iconOnly ? height : undefined,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          borderRadius: t.radius.md,
          borderWidth: t.border.width.thin,
          borderColor: disabled ? 'transparent' : palette.border,
          backgroundColor: disabled ? intent.disabled.bg : pressed ? palette.active : palette.bg,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        iconStart && <Icon name={iconStart} size={iconSize} tint={fg} />
      )}
      {!iconOnly && children ? (
        <Text style={[textStyle(size === 'sm' ? t.typography.label.md : t.typography.label.lg), { color: fg }]}>{children}</Text>
      ) : null}
      {!iconOnly && iconEnd && !loading && <Icon name={iconEnd} size={iconSize} tint={fg} />}
    </Pressable>
  );
}
