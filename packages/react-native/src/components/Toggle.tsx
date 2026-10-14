import { Pressable, Switch, Text, View } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';
import { useControllableState } from '../useControllableState';
import { FieldHint } from './Field';

export interface ToggleProps {
  label: string;
  hideLabel?: boolean;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  labelPosition?: 'start' | 'end';
  disabled?: boolean;
}

/** Uses the platform Switch for native look, haptics and accessibility. */
export function Toggle({
  label,
  hideLabel = false,
  description,
  checked,
  defaultChecked = false,
  onCheckedChange,
  labelPosition = 'start',
  disabled = false,
}: ToggleProps) {
  const { t } = useTheme();
  const [isOn, setIsOn] = useControllableState(checked, defaultChecked, onCheckedChange);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: isOn, disabled }}
      disabled={disabled}
      onPress={() => setIsOn(!isOn)}
      style={{
        flexDirection: labelPosition === 'start' ? 'row' : 'row-reverse',
        alignItems: 'center',
        justifyContent: labelPosition === 'start' ? 'space-between' : 'flex-end',
        gap: t.space.sm,
        minHeight: t.size.touchTarget.min,
      }}
    >
      {!hideLabel && (
        <View style={{ flexShrink: 1, gap: t.space['2xs'] }}>
          <Text style={[textStyle(t.typography.body.md), { color: disabled ? t.color.text.disabled : t.color.text.primary }]}>{label}</Text>
          <FieldHint>{description}</FieldHint>
        </View>
      )}
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Switch
          value={isOn}
          onValueChange={setIsOn}
          disabled={disabled}
          trackColor={{ false: t.color.border.strong, true: t.color.intent.primary.bg }}
          thumbColor={t.color.neutral[50]}
          ios_backgroundColor={t.color.border.strong}
        />
      </View>
    </Pressable>
  );
}
