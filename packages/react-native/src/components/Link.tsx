import { Linking, Text, type TextProps } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';

export interface LinkProps extends Omit<TextProps, 'children'> {
  href: string;
  children: string;
  variant?: 'inline' | 'standalone' | 'subtle';
  /** Opens the system browser; adds an icon and an accessibility hint. */
  external?: boolean;
  externalLabel?: string;
  /** In-app navigation (e.g. router.push). Overrides opening href. */
  onPress?: () => void;
}

/** Nest inline links inside a <Text> so they flow with the paragraph. */
export function Link({
  href,
  children,
  variant = 'inline',
  external = false,
  externalLabel = 'Opens in your browser',
  onPress,
  style,
  ...rest
}: LinkProps) {
  const { t } = useTheme();
  const color = variant === 'subtle' ? t.color.text.secondary : t.color.text.link;
  return (
    <Text
      accessibilityRole="link"
      accessibilityHint={external ? externalLabel : undefined}
      onPress={onPress ?? (() => Linking.openURL(href))}
      suppressHighlighting={false}
      style={[
        variant === 'standalone' ? textStyle(t.typography.label.lg) : null,
        { color, textDecorationLine: variant === 'standalone' ? 'none' : 'underline' },
        style,
      ]}
      {...rest}
    >
      {children}
      {external && (
        <>
          {' '}
          <Icon name="external-link" size="sm" tint={color} />
        </>
      )}
      {!external && variant === 'standalone' && (
        <>
          {' '}
          <Icon name="chevron-right" size="sm" tint={color} />
        </>
      )}
    </Text>
  );
}
