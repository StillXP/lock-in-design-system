import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';
import { Button, type ButtonSize, type ButtonVariant } from './Button';
import { Icon, type IconName } from './Icon';
import { Sheet } from './Sheet';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: IconName;
  onSelect?: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
}

export interface DropdownProps {
  /** Trigger text, or the aria-label when triggerIcon is set. */
  label: string;
  /** Menu actions. */
  items: DropdownItem[];
  /** Render an icon-only trigger (e.g. more-horizontal). */
  triggerIcon?: IconName;
  /** Trigger button variant. */
  triggerVariant?: ButtonVariant;
  /** Trigger button size. */
  triggerSize?: ButtonSize;
  /** Disable the trigger. */
  disabled?: boolean;
}

/** Menu button that opens an action sheet. */
export function Dropdown({ label, items, triggerIcon, triggerVariant = 'secondary', triggerSize = 'md', disabled }: DropdownProps) {
  const { t } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={triggerVariant}
        size={triggerSize}
        iconOnly={Boolean(triggerIcon)}
        iconStart={triggerIcon}
        iconEnd={triggerIcon ? undefined : 'chevron-down'}
        accessibilityLabel={label}
        accessibilityHint="Opens a menu"
        accessibilityState={{ expanded: open, disabled: Boolean(disabled) }}
        disabled={disabled}
        onPress={() => setOpen(true)}
      >
        {label}
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <View accessibilityRole="menu" style={{ gap: t.space['2xs'] }}>
          {items.map((item) => {
            const color = item.disabled ? t.color.text.disabled : item.tone === 'danger' ? t.color.text.danger : t.color.text.primary;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="menuitem"
                accessibilityState={{ disabled: Boolean(item.disabled) }}
                disabled={item.disabled}
                onPress={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: t.space.sm,
                  minHeight: t.size.touchTarget.min,
                  paddingHorizontal: t.space.sm,
                  borderRadius: t.radius.sm,
                  backgroundColor: pressed ? t.color.intent.secondary.bgHover : 'transparent',
                })}
              >
                {item.icon && <Icon name={item.icon} tint={color} />}
                <Text style={[textStyle(t.typography.body.md), { color }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    </>
  );
}
