import { StyleSheet, Text, View } from 'react-native';
import { GameButton } from './GameButton';
import type { LessonContent } from '@/game/worldTypes';
import { colors } from '@/theme';

export function LessonCard({ lesson, reviewing, onContinue }: { lesson: LessonContent; reviewing: boolean; onContinue: () => void }) {
  return <View style={styles.card}>
    <Text style={styles.eyebrow}>✦  {reviewing ? 'REVIEW LESSON' : 'LEARN A NEW SPELL'}</Text>
    <Text style={styles.title} accessibilityRole="header">{lesson.title}</Text>
    <Text style={styles.body}>{lesson.explanation}</Text>
    <View style={styles.example}>
      <Text style={styles.label}>PYTHON EXAMPLE</Text>
      <Text selectable style={styles.code}>{lesson.codeExample}</Text>
      <View style={styles.output}>
        <Text style={styles.label}>OUTPUT</Text>
        <Text selectable style={styles.outputText}>{lesson.expectedOutput}</Text>
      </View>
    </View>
    <Text style={styles.label}>WHY IT WORKS</Text>
    <Text style={styles.why}>{lesson.whyItWorks}</Text>
    <View style={styles.rule}><Text style={styles.ruleLabel}>REMEMBER</Text><Text style={styles.ruleText}>{lesson.importantRule}</Text></View>
    <GameButton label={reviewing ? 'Back to Challenge' : 'Continue to Challenge'} onPress={onContinue} />
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#24213F', borderColor: '#7E6BB4', borderWidth: 1, borderRadius: 21, padding: 18, marginTop: 14, marginBottom: 16 },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 25, fontWeight: '900', marginTop: 9 },
  body: { color: colors.text, fontSize: 15, lineHeight: 23, marginTop: 11 },
  example: { backgroundColor: '#10142C', borderColor: '#494268', borderWidth: 1, borderRadius: 14, padding: 14, marginVertical: 16 },
  label: { color: colors.violet, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  code: { color: '#B6F0D4', fontFamily: 'monospace', fontSize: 14, lineHeight: 22, marginTop: 8 },
  output: { borderTopWidth: 1, borderColor: '#393551', marginTop: 13, paddingTop: 11 },
  outputText: { color: colors.gold, fontFamily: 'monospace', fontSize: 15, lineHeight: 22, marginTop: 6 },
  why: { color: colors.text, fontSize: 14, lineHeight: 21, marginTop: 6 },
  rule: { backgroundColor: '#343047', borderRadius: 12, padding: 12, marginVertical: 16 },
  ruleLabel: { color: colors.gold, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  ruleText: { color: colors.text, fontSize: 13, lineHeight: 20, marginTop: 5 },
});
