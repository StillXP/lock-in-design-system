import { Pressable, Text, View } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';
import { useControllableState } from '../useControllableState';
import { FieldError, FieldHint, FieldLabel } from './Field';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  legend: string;
  hideLegend?: boolean;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'vertical' | 'horizontal';
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function RadioGroup({
  legend,
  hideLegend = false,
  options,
  value,
  defaultValue = '',
  onValueChange,
  orientation = 'vertical',
  description,
  error,
  required,
  disabled,
}: RadioGroupProps) {
  const { t } = useTheme();
  const [current, setCurrent] = useControllableState(value, defaultValue, onValueChange);

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={legend} style={{ gap: t.space.xs }}>
      <FieldLabel label={legend} required={required} hidden={hideLegend} />
      <FieldHint>{description}</FieldHint>
      <View style={{ flexDirection: orientation === 'horizontal' ? 'row' : 'column', flexWrap: 'wrap', columnGap: t.space.lg }}>
        {options.map((o, i) => {
          const selected = o.value === current;
          const isDisabled = disabled || o.disabled;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="radio"
              accessibilityLabel={o.label}
              accessibilityHint={o.description}
              accessibilityState={{ checked: selected, disabled: Boolean(isDisabled) }}
              accessibilityValue={{ min: 1, max: options.length, now: i + 1 }}
              disabled={isDisabled}
              onPress={() => setCurrent(o.value)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.xs, minHeight: t.size.touchTarget.min }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: t.radius.full,
                  borderWidth: t.border.width.thick,
                  borderColor: isDisabled ? t.color.border.default : error ? t.color.border.danger : selected ? t.color.intent.primary.bg : t.color.border.strong,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selected && (
                  <View style={{ width: 10, height: 10, borderRadius: t.radius.full, backgroundColor: isDisabled ? t.color.text.disabled : t.color.intent.primary.bg }} />
                )}
              </View>
              <View style={{ flexShrink: 1 }}>
                <Text style={[textStyle(t.typography.body.md), { color: isDisabled ? t.color.text.disabled : t.color.text.primary }]}>{o.label}</Text>
                {o.description ? <FieldHint>{o.description}</FieldHint> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      <FieldError>{error}</FieldError>
    </View>
  );
}
