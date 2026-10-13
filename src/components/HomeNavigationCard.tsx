import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

export function HomeNavigationCard({ title, subtitle, action, kind, onPress }: { title: string; subtitle: string; action: string; kind: 'tutorial' | 'spellbook' | 'profile'; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityHint={subtitle} onPress={onPress}
    style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
    <View pointerEvents="none" style={styles.iconFrame}>
      {kind === 'profile' ? <><View style={styles.head} /><View style={styles.shoulders} /></>
        : <View style={styles.book}><View style={styles.page} /><View style={styles.page} /><Text style={styles.bookRune}>{kind === 'tutorial' ? 'A' : '✦'}</Text></View>}
    </View>
    <View pointerEvents="none" style={styles.copy}><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text><Text style={styles.action}>{action}</Text></View>
    <Text accessible={false} pointerEvents="none" style={styles.chevron}>›</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { minHeight: 104, flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, backgroundColor: '#25213F', borderRadius: 19, borderWidth: 1, borderColor: '#695688', marginBottom: 12 },
  pressed: { backgroundColor: '#3B3155', borderColor: colors.gold, transform: [{ scale: 0.985 }] },
  iconFrame: { width: 46, height: 50, borderRadius: 13, backgroundColor: '#3C3057', alignItems: 'center', justifyContent: 'center' },
  book: { width: 34, height: 29, flexDirection: 'row', gap: 2 },
  page: { flex: 1, backgroundColor: colors.gold, borderRadius: 3, borderBottomWidth: 3, borderBottomColor: '#AD854B' },
  bookRune: { position: 'absolute', right: 2, top: 3, color: '#473052', fontSize: 15, fontWeight: '900' },
  head: { width: 15, height: 15, borderRadius: 8, backgroundColor: colors.gold, marginBottom: 3 },
  shoulders: { width: 28, height: 15, borderTopLeftRadius: 14, borderTopRightRadius: 14, backgroundColor: colors.gold },
  copy: { flex: 1, gap: 5 },
  title: { color: colors.text, fontSize: 17, fontWeight: '900' },
  subtitle: { color: '#C4BED5', fontSize: 12, lineHeight: 18 },
  action: { color: colors.gold, fontSize: 11, fontWeight: '800', marginTop: 3 },
  chevron: { color: colors.gold, fontSize: 29 },
});
