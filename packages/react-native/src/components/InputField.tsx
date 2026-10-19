import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';
import { describe, FieldError, FieldHint, FieldLabel } from './Field';
import { Icon, type IconName } from './Icon';

export interface InputFieldProps extends Omit<TextInputProps, 'style'> {
  /** Visible label. Placeholders are not labels. */
  label: string;
  /** Visually hide the label. */
  hideLabel?: boolean;
  /** Format guidance shown above the input ('e.g. 12:30'). */
  hint?: string;
  /** Error message; sets aria-invalid. Say how to fix it. */
  error?: string;
  /** Input type. password adds a show/hide button; on native sets keyboardType/secureTextEntry. */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  /** Control height. */
  size?: 'sm' | 'md' | 'lg';
  /** Leading decorative icon. */
  iconStart?: IconName;
  /** Trailing unit text ('pts', 'kg', '$'). */
  suffix?: string;
  /** Marks required with * and aria-required. */
  required?: boolean;
  /** Disables the field. */
  disabled?: boolean;
}

const KEYBOARD: Record<string, TextInputProps['keyboardType']> = {
  email: 'email-address',
  number: 'numeric',
  tel: 'phone-pad',
  url: 'url',
};

export function InputField({
  label,
  hideLabel = false,
  hint,
  error,
  type = 'text',
  size = 'md',
  iconStart,
  suffix,
  required,
  disabled,
  ...rest
}: InputFieldProps) {
  const { t } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const height = Math.max(t.size.control[size], t.size.touchTarget.min);

  return (
    <View style={{ gap: t.space['2xs'] }}>
      <FieldLabel label={label} required={required} hidden={hideLabel} />
      <FieldHint>{hint}</FieldHint>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.space.xs,
          minHeight: height,
          paddingHorizontal: t.space.sm,
          borderRadius: t.radius.md,
          borderWidth: error || focused ? t.border.width.thick : t.border.width.thin,
          borderColor: error ? t.color.border.danger : focused ? t.color.border.selected : t.color.border.strong,
          backgroundColor: disabled ? t.color.intent.disabled.bg : t.color.surface.default,
        }}
      >
        {iconStart && <Icon name={iconStart} color="secondary" />}
        <TextInput
          accessibilityLabel={required ? `${label}, required` : label}
          accessibilityHint={describe(hint, error)}
          accessibilityState={{ disabled: Boolean(disabled) }}
          editable={!disabled}
          keyboardType={KEYBOARD[type]}
          autoCapitalize={type === 'text' ? 'sentences' : 'none'}
          secureTextEntry={isPassword && !revealed}
          placeholderTextColor={t.color.text.placeholder}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[textStyle(t.typography.body.md), { flex: 1, color: disabled ? t.color.text.disabled : t.color.text.primary, paddingVertical: 0 }]}
          {...rest}
        />
        {suffix ? <Text style={[textStyle(t.typography.body.sm), { color: t.color.text.secondary }]}>{suffix}</Text> : null}
        {isPassword && !disabled && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            onPress={() => setRevealed((r) => !r)}
            hitSlop={8}
          >
            <Icon name={revealed ? 'eye-off' : 'eye'} color="secondary" />
          </Pressable>
        )}
      </View>
      <FieldError>{error}</FieldError>
    </View>
  );
}
