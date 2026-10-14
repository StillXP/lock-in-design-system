import { Pressable, Text, View } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';
import { Icon, type IconName } from './Icon';

export type TagTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger';

export interface TagProps {
  children: string;
  tone?: TagTone;
  variant?: 'subtle' | 'solid' | 'outline';
  size?: 'sm' | 'md';
  icon?: IconName;
  onRemove?: () => void;
  removeLabel?: string;
}

const DEFAULT_ICON: Partial<Record<TagTone, IconName>> = {
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-circle',
  info: 'info',
};

export function Tag({ children, tone = 'neutral', variant = 'subtle', size = 'md', icon, onRemove, removeLabel }: TagProps) {
  const { t } = useTheme();
  const s = t.color.status[tone];
  const bg = variant === 'solid' ? s.solid : variant === 'outline' ? 'transparent' : s.bg;
  const fg = variant === 'solid' ? s.onSolid : s.text;
  const leading = icon ?? DEFAULT_ICON[tone];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: t.space['2xs'],
        minHeight: size === 'sm' ? 22 : 28,
        paddingHorizontal: t.space.xs,
        borderRadius: t.radius.full,
        borderWidth: t.border.width.thin,
        borderColor: variant === 'outline' ? s.border : 'transparent',
        backgroundColor: bg,
      }}
    >
      {leading && <Icon name={leading} size="sm" tint={fg} />}
      <Text style={[textStyle(size === 'sm' ? t.typography.label.sm : t.typography.label.md), { color: fg }]} numberOfLines={1}>
        {children}
      </Text>
      {onRemove && (
        <Pressable accessibilityRole="button" accessibilityLabel={removeLabel ?? `Remove ${children}`} onPress={onRemove} hitSlop={12}>
          <Icon name="close" size="sm" tint={fg} />
        </Pressable>
      )}
    </View>
  );
}
