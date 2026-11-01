import { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';
import { describe, FieldError, FieldHint, FieldLabel } from './Field';

export interface TextareaProps extends Omit<TextInputProps, 'style' | 'multiline' | 'numberOfLines' | 'maxLength'> {
  /** Visible label. Placeholders are not labels. */
  label: string;
  /** Visually hide the label (keeps the accessible name). */
  hideLabel?: boolean;
  /** Guidance about what to write. */
  hint?: string;
  /** Error message; sets the invalid state. Say how to fix it. */
  error?: string;
  /** Visible lines before scrolling (the minimum height when autoGrow is on). */
  rows?: number;
  /** Grow with the content up to maxRows, then scroll. */
  autoGrow?: boolean;
  /** Upper limit for autoGrow. */
  maxRows?: number;
  /** Hard character limit. Pair with showCount so people can see it. */
  maxLength?: number;
  /** Show a "86 / 500" counter under the field. Needs maxLength. */
  showCount?: boolean;
  /** Marks required with * and aria-required. */
  required?: boolean;
  /** Show "(optional)" next to the label instead of marking required fields. */
  showOptional?: boolean;
  /** Disables the field. */
  disabled?: boolean;
}

const NEAR = 0.9;

export function Textarea({
  label,
  hideLabel = false,
  hint,
  error,
  rows = 3,
  autoGrow = false,
  maxRows = 8,
  maxLength,
  showCount = false,
  required,
  showOptional = false,
  disabled,
  value,
  defaultValue,
  onChangeText,
  ...rest
}: TextareaProps) {
  const { t } = useTheme();
  const [focused, setFocused] = useState(false);
  const [uncontrolledLength, setUncontrolledLength] = useState((defaultValue ?? '').length);
  const length = value !== undefined ? value.length : uncontrolledLength;
  const near = maxLength !== undefined && length >= maxLength * NEAR;
  const atLimit = maxLength !== undefined && length >= maxLength;

  const lineHeight = t.typography.body.md.lineHeight;
  const padding = t.space.sm;
  const minHeight = rows * lineHeight + padding * 2;
  const maxHeight = maxRows * lineHeight + padding * 2;
  const [contentHeight, setContentHeight] = useState(minHeight);
  const height = autoGrow ? Math.min(Math.max(contentHeight, minHeight), maxHeight) : minHeight;

  // Announce once when crossing into "near" and once at the limit.
  const [announcement, setAnnouncement] = useState('');
  const lastBucket = useRef<'near' | 'limit' | null>(null);
  useEffect(() => {
    if (maxLength === undefined) return;
    const bucket = atLimit ? 'limit' : near ? 'near' : null;
    if (bucket && bucket !== lastBucket.current) {
      setAnnouncement(bucket === 'limit' ? 'Character limit reached' : `${maxLength - length} characters left`);
    }
    lastBucket.current = bucket;
  }, [atLimit, near, length, maxLength]);

  const counted = showCount && maxLength !== undefined;
  const countText = counted ? `${length} of ${maxLength} characters` : undefined;

  return (
    <View style={{ gap: t.space['2xs'] }}>
      <FieldLabel label={label} required={required} optional={showOptional} hidden={hideLabel} />
      <FieldHint>{hint}</FieldHint>
      <View
        style={{
          minHeight: height,
          height,
          paddingHorizontal: t.space.sm,
          paddingVertical: padding,
          borderRadius: t.radius.md,
          borderWidth: error || focused ? t.border.width.thick : t.border.width.thin,
          borderColor: error ? t.color.border.danger : focused ? t.color.border.selected : t.color.border.strong,
          backgroundColor: disabled ? t.color.intent.disabled.bg : t.color.surface.default,
        }}
      >
        <TextInput
          multiline
          numberOfLines={rows}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          scrollEnabled={!autoGrow || contentHeight + padding * 2 > maxHeight}
          accessibilityLabel={required ? `${label}, required` : showOptional ? `${label}, optional` : label}
          accessibilityHint={describe(hint, [error, countText].filter(Boolean).join('. ') || undefined)}
          accessibilityState={{ disabled: Boolean(disabled) }}
          editable={!disabled}
          textAlignVertical="top"
          placeholderTextColor={t.color.text.placeholder}
          onChangeText={(text) => {
            if (value === undefined) setUncontrolledLength(text.length);
            onChangeText?.(text);
          }}
          onContentSizeChange={(e) => {
            setContentHeight(e.nativeEvent.contentSize.height + padding * 2);
            rest.onContentSizeChange?.(e);
          }}
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
      </View>
      {(error || counted) && (
        <View style={{ flexDirection: 'row', gap: t.space.sm, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <FieldError>{error}</FieldError>
          </View>
          {counted ? (
            <Text
              importantForAccessibility="no"
              style={[textStyle(t.typography.body.sm), { color: near ? t.color.text.warning : t.color.text.secondary, fontVariant: ['tabular-nums'] }]}
            >
              {length} / {maxLength}
            </Text>
          ) : null}
        </View>
      )}
      {maxLength !== undefined ? (
        <Text accessibilityLiveRegion="polite" style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}>
          {announcement}
        </Text>
      ) : null}
    </View>
  );
}
