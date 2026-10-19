import { Text, View } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';

/** Shared label / hint / error pieces for form components. */
export function FieldLabel({ label, required, optional, hidden }: { label: string; required?: boolean; optional?: boolean; hidden?: boolean }) {
  const { t } = useTheme();
  if (hidden) return null;
  return (
    <Text style={[textStyle(t.typography.label.md), { color: t.color.text.primary }]} importantForAccessibility="no">
      {label}
      {required ? <Text style={{ color: t.color.text.danger }}> *</Text> : null}
      {optional && !required ? <Text style={{ color: t.color.text.secondary }}> (optional)</Text> : null}
    </Text>
  );
}

export function FieldHint({ children }: { children?: string }) {
  const { t } = useTheme();
  if (!children) return null;
  return <Text style={[textStyle(t.typography.body.sm), { color: t.color.text.secondary }]}>{children}</Text>;
}

export function FieldError({ children }: { children?: string }) {
  const { t } = useTheme();
  if (!children) return null;
  return (
    <View style={{ flexDirection: 'row', gap: t.space['2xs'], alignItems: 'center' }} accessibilityLiveRegion="polite">
      <Icon name="alert-circle" size="sm" color="danger" />
      <Text style={[textStyle(t.typography.body.sm), { color: t.color.text.danger, flexShrink: 1 }]}>{children}</Text>
    </View>
  );
}

/** Builds the accessibility hint so hint + error are announced with the control. */
export function describe(hint?: string, error?: string) {
  return [error && `Error: ${error}`, hint].filter(Boolean).join('. ') || undefined;
}
