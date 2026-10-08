import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { colors } from '@/theme';

interface Props { label: string; onPress: () => void; disabled?: boolean; style?: ViewStyle }

export function GameButton({ label, onPress, disabled, style }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.button, style, disabled && styles.disabled, pressed && !disabled && styles.pressed]}>
      <Text style={styles.label}>{label}</Text><Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 58, borderRadius: 16, backgroundColor: colors.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, borderWidth: 2, borderColor: '#FFE4AB', shadowColor: colors.gold, shadowOpacity: 0.26, shadowRadius: 16, elevation: 6 },
  label: { color: '#29203C', fontSize: 17, fontWeight: '900', letterSpacing: 0.4 },
  arrow: { color: '#29203C', fontSize: 29, lineHeight: 31, position: 'absolute', right: 19, top: 11 },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.9 }, disabled: { opacity: 0.55 },
});
