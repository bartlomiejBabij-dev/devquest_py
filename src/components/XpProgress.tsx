import { StyleSheet, Text, View } from 'react-native';
import { getPlayerLevel } from '@/game/profile';
import { colors } from '@/theme';

export function XpProgress({ totalXp }: { totalXp: number }) {
  const level = getPlayerLevel(totalXp);
  return <View style={styles.container}>
    <View style={styles.labels}><Text style={styles.label}>LEVEL {level.level}</Text><Text style={styles.total}>{totalXp} TOTAL XP</Text></View>
    <View style={styles.track} accessibilityRole="progressbar" accessibilityLabel={`XP toward level ${level.level + 1}`} accessibilityValue={{ min: 0, max: level.xpPerLevel, now: level.xpInLevel }}>
      <View style={[styles.fill, { width: `${level.percent}%` }]} />
    </View>
    <Text style={styles.caption}>{level.xpInLevel} / {level.xpPerLevel} XP to level {level.level + 1}</Text>
  </View>;
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', gap: 8 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' },
  label: { color: colors.violet, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  total: { color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 0.6 },
  track: { height: 9, borderRadius: 5, overflow: 'hidden', backgroundColor: '#0C1127' },
  fill: { height: '100%', backgroundColor: colors.gold },
  caption: { color: colors.muted, fontSize: 11 },
});
