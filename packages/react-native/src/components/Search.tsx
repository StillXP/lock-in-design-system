import { useRef, type ComponentRef } from 'react';
import { ActivityIndicator, Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';
import { useControllableState } from '../useControllableState';
import { Icon } from './Icon';

export interface SearchProps extends Omit<TextInputProps, 'value' | 'defaultValue' | 'style'> {
  /** Accessible label (visually hidden unless showLabel). Make it specific: 'Search players'. */
  label?: string;
  /** Controlled query. */
  value?: string;
  /** Uncontrolled initial query. */
  defaultValue?: string;
  /** Called on every change (debounce in your code for remote search). */
  onValueChange?: (value: string) => void;
  /** Called on Enter / submit. */
  onSearch?: (value: string) => void;
  /** Called when cleared via button or Escape. */
  onClear?: () => void;
  /** Control height. */
  size?: 'sm' | 'md' | 'lg';
  /** Swap the search icon for a spinner. */
  loading?: boolean;
  /** Disables the search field. */
  disabled?: boolean;
}

export function Search({
  label = 'Search',
  value,
  defaultValue = '',
  onValueChange,
  onSearch,
  onClear,
  size = 'md',
  loading = false,
  disabled,
  placeholder = 'Search…',
  ...rest
}: SearchProps) {
  const { t } = useTheme();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [query, setQuery] = useControllableState(value, defaultValue, onValueChange);

  return (
    <View
      accessibilityRole="search"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space.xs,
        minHeight: Math.max(t.size.control[size], t.size.touchTarget.min),
        paddingHorizontal: t.space.md,
        borderRadius: t.radius.full,
        borderWidth: t.border.width.thin,
        borderColor: t.color.border.strong,
        backgroundColor: disabled ? t.color.intent.disabled.bg : t.color.surface.default,
      }}
    >
      {loading ? <ActivityIndicator size="small" color={t.color.icon.secondary} /> : <Icon name="search" color="secondary" />}
      <TextInput
        ref={inputRef}
        accessibilityLabel={label}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => onSearch?.(query)}
        returnKeyType="search"
        autoCorrect={false}
        editable={!disabled}
        placeholder={placeholder}
        placeholderTextColor={t.color.text.placeholder}
        style={[textStyle(t.typography.body.md), { flex: 1, color: t.color.text.primary, paddingVertical: 0 }]}
        {...rest}
      />
      {query && !disabled ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={12}
          onPress={() => {
            setQuery('');
            onClear?.();
            inputRef.current?.focus();
          }}
        >
          <Icon name="close" color="secondary" />
        </Pressable>
      ) : null}
    </View>
  );
}
