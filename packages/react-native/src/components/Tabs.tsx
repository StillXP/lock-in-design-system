import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';
import { useControllableState } from '../useControllableState';
import { Icon, type IconName } from './Icon';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  icon?: IconName;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  variant?: 'line' | 'contained';
  fitted?: boolean;
  accessibilityLabel?: string;
}

export function Tabs({ items, value, defaultValue, onValueChange, variant = 'line', fitted = false, accessibilityLabel }: TabsProps) {
  const { t } = useTheme();
  const first = items.find((i) => !i.disabled)?.id ?? '';
  const [selected, setSelected] = useControllableState(value, defaultValue ?? first, onValueChange);
  const contained = variant === 'contained';
  const active = items.find((i) => i.id === selected);

  const tabs = items.map((item, index) => {
    const isSelected = item.id === selected;
    const color = item.disabled ? t.color.text.disabled : isSelected ? (contained ? t.color.text.primary : t.color.text.brand) : t.color.text.secondary;
    return (
      <Pressable
        key={item.id}
        accessibilityRole="tab"
        accessibilityLabel={item.badge !== undefined ? `${item.label}, ${item.badge}` : item.label}
        accessibilityState={{ selected: isSelected, disabled: Boolean(item.disabled) }}
        accessibilityHint={`Tab ${index + 1} of ${items.length}`}
        disabled={item.disabled}
        onPress={() => setSelected(item.id)}
        style={{
          flex: fitted ? 1 : undefined,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: t.space.xs,
          minHeight: contained ? t.size.touchTarget.min : t.size.control.lg,
          paddingHorizontal: t.space.md,
          borderRadius: contained ? t.radius.md : 0,
          borderBottomWidth: contained ? 0 : 3,
          borderBottomColor: !contained && isSelected ? t.color.border.selected : 'transparent',
          backgroundColor: contained && isSelected ? t.color.surface.default : 'transparent',
          ...(contained && isSelected ? t.shadow.sm : null),
        }}
      >
        {item.icon && <Icon name={item.icon} size="sm" tint={color} />}
        <Text style={[textStyle(t.typography.label.lg), { color, fontWeight: isSelected ? '600' : '500' }]}>{item.label}</Text>
        {item.badge !== undefined && (
          <View style={{ minWidth: 20, paddingHorizontal: t.space['2xs'], borderRadius: t.radius.full, backgroundColor: t.color.status.neutral.bg }}>
            <Text style={[textStyle(t.typography.label.sm), { color: t.color.status.neutral.text, textAlign: 'center' }]}>{item.badge}</Text>
          </View>
        )}
      </Pressable>
    );
  });

  const listStyle = contained
    ? { flexDirection: 'row' as const, padding: t.space['2xs'], borderRadius: t.radius.lg, backgroundColor: t.color.background.subtle }
    : { flexDirection: 'row' as const, borderBottomWidth: t.border.width.thin, borderBottomColor: t.color.border.subtle };

  return (
    <View>
      {fitted ? (
        <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} style={listStyle}>
          {tabs}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} contentContainerStyle={listStyle}>
          {tabs}
        </ScrollView>
      )}
      <View style={{ paddingVertical: t.space.md }}>{active?.content}</View>
    </View>
  );
}
