import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Modal as RNModal, Pressable, ScrollView, Text, View } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';

/** Respect the OS "reduce motion" setting (WCAG 2.3.3). */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}

export interface SheetProps {
  /** Whether the modal is shown. The parent owns this state. */
  open: boolean;
  /** Called on Escape, close button, backdrop click (or Android back). */
  onClose: () => void;
  /** Heading and accessible name. */
  title: string;
  /** Body content (scrolls if long). */
  children: ReactNode;
  /** Action buttons; primary last. */
  footer?: ReactNode;
  /** Close when the backdrop is pressed. */
  closeOnBackdropPress?: boolean;
  /** 'sheet' docks to the bottom (phones); 'center' floats (tablets / confirmations). */
  placement?: 'sheet' | 'center';
  /** Supporting text, linked via aria-describedby. */
  description?: string;
  /** Hide the X button (ensure another way to close). */
  hideCloseButton?: boolean;
  /** Accessible name of the X button. */
  closeLabel?: string;
  /** Width of a centered sheet (sm 384, md 512, lg 768); fullscreen fills the screen. Docked sheets are always full width. */
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
}

const CENTER_WIDTH = { sm: 384, md: 512, lg: 768 } as const;

/** Shared overlay used by Modal, Select and Dropdown. */
export function Sheet({ open, onClose, title, description, children, footer, closeOnBackdropPress = true, placement = 'sheet', hideCloseButton = false, closeLabel = 'Close', size }: SheetProps) {
  const { t } = useTheme();
  const reducedMotion = useReducedMotion();
  const isSheet = placement === 'sheet';
  const fullscreen = size === 'fullscreen';
  const centerWidth = !isSheet && size && !fullscreen ? CENTER_WIDTH[size] : undefined;

  return (
    <RNModal
      visible={open}
      transparent
      animationType={reducedMotion ? 'none' : isSheet ? 'slide' : 'fade'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, justifyContent: isSheet || fullscreen ? 'flex-end' : 'center', padding: isSheet || fullscreen ? 0 : t.space.lg }}>
        <Pressable
          accessible={false}
          onPress={closeOnBackdropPress ? onClose : undefined}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.color.background.overlay }}
        />
        <View
          accessibilityViewIsModal
          style={{
            maxHeight: fullscreen ? '100%' : '85%',
            height: fullscreen ? '100%' : undefined,
            width: centerWidth ? '100%' : undefined,
            maxWidth: centerWidth,
            alignSelf: centerWidth ? 'center' : undefined,
            backgroundColor: t.color.surface.raised,
            borderTopLeftRadius: fullscreen ? 0 : t.radius.xl,
            borderTopRightRadius: fullscreen ? 0 : t.radius.xl,
            borderBottomLeftRadius: isSheet || fullscreen ? 0 : t.radius.xl,
            borderBottomRightRadius: isSheet || fullscreen ? 0 : t.radius.xl,
            paddingTop: t.space.lg,
            paddingBottom: isSheet || fullscreen ? t.space.xl : t.space.lg,
            ...t.shadow.xl,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: t.space.md, paddingHorizontal: t.space.lg, marginBottom: t.space.md }}>
            <View style={{ flex: 1, gap: t.space['2xs'] }}>
              <Text accessibilityRole="header" style={[textStyle(t.typography.heading.sm), { color: t.color.text.primary }]}>
                {title}
              </Text>
              {description ? <Text style={[textStyle(t.typography.body.md), { color: t.color.text.secondary }]}>{description}</Text> : null}
            </View>
            {!hideCloseButton && (
              <Pressable accessibilityRole="button" accessibilityLabel={closeLabel} onPress={onClose} hitSlop={12}>
                <Icon name="close" color="secondary" />
              </Pressable>
            )}
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: t.space.lg }}>{children}</ScrollView>
          {footer ? (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                gap: t.space.sm,
                paddingHorizontal: t.space.lg,
                paddingTop: t.space.md,
                marginTop: t.space.md,
                borderTopWidth: t.border.width.thin,
                borderTopColor: t.color.border.subtle,
              }}
            >
              {footer}
            </View>
          ) : null}
        </View>
      </View>
    </RNModal>
  );
}
