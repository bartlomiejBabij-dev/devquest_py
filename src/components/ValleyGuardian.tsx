import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

/** Compact original rune sentinel; successful spells use the mission's shared animation. */
export function ValleyGuardian({ solvedCount }: { solvedCount: number }) {
  return <View style={styles.arena} accessibilityLabel={`Valley guardian. ${solvedCount} of 5 trials solved.`}>
    <View style={styles.guardian} accessible={false}>
      <View style={styles.crest} />
      <View style={styles.face}><View style={styles.eye} /><View style={styles.eye} /></View>
      <Text style={styles.rune}>◇</Text>
    </View>
    <View style={styles.copy}>
      <Text style={styles.title}>THE RUNE GUARDIAN</Text>
      <Text style={styles.body}>{solvedCount === 5 ? 'The gate opens. You have earned my trust.' : 'Show me how your code chooses its path.'}</Text>
      <Text style={styles.progress}>{solvedCount} / 5 TRIALS SOLVED</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  arena: { flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: '#251E3E', borderColor: '#75639A', borderWidth: 1, borderRadius: 20, padding: 14, marginBottom: 12 },
  guardian: { width: 60, height: 76, backgroundColor: '#49405F', borderWidth: 2, borderColor: colors.gold, borderBottomLeftRadius: 23, borderBottomRightRadius: 23, alignItems: 'center' },
  crest: { width: 16, height: 10, backgroundColor: colors.gold, marginTop: -6 },
  face: { flexDirection: 'row', gap: 12, marginTop: 15 },
  eye: { width: 10, height: 5, backgroundColor: colors.green },
  rune: { color: colors.gold, fontSize: 28, lineHeight: 32 },
  copy: { flex: 1 },
  title: { color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  body: { color: colors.text, fontSize: 13, lineHeight: 19, marginTop: 5 },
  progress: { color: colors.violet, fontSize: 10, fontWeight: '800', marginTop: 7 },
});
