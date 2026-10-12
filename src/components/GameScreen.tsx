import { type ReactNode, useEffect, useRef } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

export function GameScreen({ children, header, compact = false, scrollToEndOnKeyboard = false }: { children: ReactNode; header?: ReactNode; compact?: boolean; scrollToEndOnKeyboard?: boolean }) {
  const scrollRef = useRef<ScrollView>(null);
  const keyboardOpen = useRef(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!scrollToEndOnKeyboard) return;
    const showListener = Keyboard.addListener('keyboardDidShow', () => {
      keyboardOpen.current = true;
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
      scrollTimer.current = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    });
    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      keyboardOpen.current = false;
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    });
    return () => {
      showListener.remove();
      hideListener.remove();
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, [scrollToEndOnKeyboard]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {header ? <View style={styles.header}><View style={styles.headerContent}>{header}</View></View> : null}
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView ref={scrollRef} contentContainerStyle={[styles.scroll, compact && styles.compactScroll]} keyboardShouldPersistTaps="always" keyboardDismissMode="none" showsVerticalScrollIndicator={false}
          onLayout={() => { if (keyboardOpen.current) requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true })); }}>
          <View style={styles.content}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerContent: { width: '100%', maxWidth: 500, alignSelf: 'center' },
  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingVertical: 18 },
  compactScroll: { paddingHorizontal: 16, paddingVertical: 8 },
  content: { width: '100%', maxWidth: 500, alignSelf: 'center', flexGrow: 1 },
});
