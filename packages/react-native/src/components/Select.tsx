import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';
import { useControllableState } from '../useControllableState';
import { describe, FieldError, FieldHint, FieldLabel } from './Field';
import { Icon } from './Icon';
import { Sheet } from './Sheet';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps {
  label: string;
  hideLabel?: boolean;
  options: Array<SelectOption | SelectOptionGroup>;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  hint?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  disabled?: boolean;
}

/** Trigger + bottom sheet of radio options. */
export function Select({
  label,
  hideLabel = false,
  options,
  placeholder = 'Select…',
  value,
  defaultValue = '',
  onValueChange,
  hint,
  error,
  size = 'md',
  required,
  disabled,
}: SelectProps) {
  const { t } = useTheme();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useControllableState(value, defaultValue, onValueChange);
  const flat = options.flatMap((o) => ('options' in o ? o.options : [o]));
  const selected = flat.find((o) => o.value === current);

  const renderOption = (o: SelectOption) => {
    const isSelected = o.value === current;
    return (
      <Pressable
        key={o.value}
        accessibilityRole="radio"
        accessibilityState={{ checked: isSelected, disabled: Boolean(o.disabled) }}
        disabled={o.disabled}
        onPress={() => {
          setCurrent(o.value);
          setOpen(false);
        }}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: t.size.touchTarget.min,
          paddingHorizontal: t.space.sm,
          borderRadius: t.radius.sm,
          backgroundColor: isSelected ? t.color.surface.selected : pressed ? t.color.intent.secondary.bgHover : 'transparent',
        })}
      >
        <Text style={[textStyle(t.typography.body.md), { color: o.disabled ? t.color.text.disabled : t.color.text.primary }]}>{o.label}</Text>
        {isSelected && <Icon name="check" color="brand" />}
      </Pressable>
    );
  };

  return (
    <View style={{ gap: t.space['2xs'] }}>
      <FieldLabel label={label} required={required} hidden={hideLabel} />
      <FieldHint>{hint}</FieldHint>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}${required ? ', required' : ''}, ${selected?.label ?? 'none selected'}`}
        accessibilityHint={describe('Opens a list of options', error)}
        accessibilityState={{ disabled: Boolean(disabled), expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: Math.max(t.size.control[size], t.size.touchTarget.min),
          paddingHorizontal: t.space.sm,
          borderRadius: t.radius.md,
          borderWidth: error ? t.border.width.thick : t.border.width.thin,
          borderColor: error ? t.color.border.danger : t.color.border.strong,
          backgroundColor: disabled ? t.color.intent.disabled.bg : t.color.surface.default,
        }}
      >
        <Text style={[textStyle(t.typography.body.md), { color: selected ? t.color.text.primary : t.color.text.placeholder }]}>
          {selected?.label ?? placeholder}
        </Text>
        <Icon name="chevron-down" color="secondary" />
      </Pressable>
      <FieldError>{error}</FieldError>
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <View accessibilityRole="radiogroup" style={{ gap: t.space['2xs'] }}>
          {options.map((o) =>
            'options' in o ? (
              <View key={o.label} style={{ gap: t.space['2xs'], marginTop: t.space.sm }}>
                <Text accessibilityRole="header" style={[textStyle(t.typography.overline), { color: t.color.text.secondary, textTransform: 'uppercase' }]}>
                  {o.label}
                </Text>
                {o.options.map(renderOption)}
              </View>
            ) : (
              renderOption(o)
            ),
          )}
        </View>
      </Sheet>
    </View>
  );
}
