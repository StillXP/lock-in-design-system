import { Pressable, Text, View } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';
import { useControllableState } from '../useControllableState';
import { describe, FieldError, FieldHint } from './Field';
import { Icon } from './Icon';

export interface CheckboxProps {
  /** Visible label. Required even when hidden. */
  label: string;
  /** Visually hide the label (e.g. table row selection) while keeping it for screen readers. */
  hideLabel?: boolean;
  /** Supporting text, linked via aria-describedby. */
  description?: string;
  /** Error message; sets aria-invalid. */
  error?: string;
  /** Controlled checked state. */
  checked?: boolean;
  /** Uncontrolled initial state. */
  defaultChecked?: boolean;
  /** Change handler. */
  onCheckedChange?: (checked: boolean) => void;
  /** Mixed state for a parent 'select all' checkbox. */
  indeterminate?: boolean;
  /** Disable the checkbox. */
  disabled?: boolean;
}

export function Checkbox({
  label,
  hideLabel = false,
  description,
  error,
  checked,
  defaultChecked = false,
  onCheckedChange,
  indeterminate = false,
  disabled = false,
}: CheckboxProps) {
  const { t } = useTheme();
  const [isChecked, setChecked] = useControllableState(checked, defaultChecked, onCheckedChange);
  const filled = isChecked || indeterminate;
  const boxColor = disabled ? t.color.intent.disabled.bg : filled ? t.color.intent.primary.bg : t.color.surface.default;
  const borderColor = disabled ? t.color.border.default : error ? t.color.border.danger : filled ? t.color.intent.primary.bg : t.color.border.strong;

  return (
    <View style={{ gap: t.space['2xs'] }}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={label}
        accessibilityHint={describe(description, error)}
        accessibilityState={{ checked: indeterminate ? 'mixed' : isChecked, disabled }}
        disabled={disabled}
        onPress={() => setChecked(!isChecked)}
        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: t.space.xs, minHeight: t.size.touchTarget.min, paddingVertical: t.space.xs }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            marginTop: 2,
            borderRadius: t.radius.sm,
            borderWidth: t.border.width.thick,
            borderColor,
            backgroundColor: boxColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {filled && <Icon name={indeterminate ? 'minus' : 'check'} size={14} tint={disabled ? t.color.text.disabled : t.color.text.onBrand} />}
        </View>
        {!hideLabel && (
          <Text style={[textStyle(t.typography.body.md), { color: disabled ? t.color.text.disabled : t.color.text.primary, flexShrink: 1 }]}>
            {label}
          </Text>
        )}
      </Pressable>
      {!hideLabel && <FieldHint>{description}</FieldHint>}
      <FieldError>{error}</FieldError>
    </View>
  );
}
