import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';
import { describe, FieldError, FieldHint, FieldLabel } from './Field';
import { Icon, type IconName } from './Icon';

export interface InputFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  size?: 'sm' | 'md' | 'lg';
  iconStart?: IconName;
  suffix?: string;
  required?: boolean;
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
