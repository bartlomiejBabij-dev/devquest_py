import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme';

interface Props {
  label: string;
  accessibilityLabel?: string;
  onPress: () => void;
  icon?: 'back' | 'close';
  disabled?: boolean;
}

export function NavigationButton({ label, accessibilityLabel = label, onPress, icon = 'back', disabled = false }: Props) {
  return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={accessibilityLabel}
    accessibilityState={{ disabled }} style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && !disabled && styles.pressed]}>
    <Text accessible={false} style={styles.icon}>{icon === 'close' ? '×' : '‹'}</Text>
    <Text style={styles.label}>{label}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { minHeight: 48, minWidth: 88, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#8E78B6', backgroundColor: '#302947', flexShrink: 0 },
  icon: { color: colors.gold, fontSize: 25, lineHeight: 27, fontWeight: '700' },
  label: { color: colors.text, fontSize: 13, fontWeight: '800' },
  pressed: { backgroundColor: '#51416D', borderColor: colors.gold, transform: [{ scale: 0.97 }] },
  disabled: { opacity: 0.6 },
});
