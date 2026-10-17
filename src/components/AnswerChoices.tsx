import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ChoiceExercise } from '@/game/worldTypes';
import { colors } from '@/theme';

export function AnswerChoices({ exercise, selectedId, incorrect, onSelect }: {
  exercise: ChoiceExercise; selectedId: string; incorrect: boolean; onSelect: (id: string) => void;
}) {
  return <View style={styles.choices}>
    <Text style={styles.label}>{exercise.type === 'missing-token' ? 'TAP THE MISSING PIECE' : exercise.type === 'output-choice' ? 'TAP THE OUTPUT' : 'TAP YOUR ANSWER'} · CAST A SPELL</Text>
    {exercise.options.map((option, index) => {
      const selected = option.id === selectedId;
      return <Pressable key={option.id} accessibilityRole="button" accessibilityLabel={`Answer ${String.fromCharCode(65 + index)}: ${option.label}`}
        accessibilityHint="Checks this answer and casts a spell if correct" accessibilityState={{ selected }}
        onPress={() => onSelect(option.id)} style={({ pressed }) => [styles.option, selected && styles.selected, selected && incorrect && styles.retry, pressed && styles.pressed]}>
        <View style={[styles.badge, selected && styles.selectedBadge]}><Text style={styles.letter}>{String.fromCharCode(65 + index)}</Text></View>
        <View style={styles.copy}>
          <Text style={[styles.answer, (exercise.type !== 'multiple-choice' || exercise.optionFormat === 'code') && styles.code]}>{option.label}</Text>
          {selected && incorrect ? <Text style={styles.feedback} accessibilityLiveRegion="polite">{option.feedback} Try another answer.</Text> : null}
        </View>
      </Pressable>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  choices: { gap: 9, marginTop: 18 },
  label: { color: colors.violet, fontSize: 10, fontWeight: '900', lineHeight: 16, letterSpacing: 0.7, marginBottom: 2 },
  option: { minHeight: 56, width: '100%', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: '#68679A', borderRadius: 13, backgroundColor: '#202540' },
  selected: { backgroundColor: '#3D3558', borderColor: colors.gold },
  retry: { borderColor: colors.orange, backgroundColor: '#3B2D40' },
  pressed: { borderColor: colors.gold, backgroundColor: '#494066', transform: [{ scale: 0.985 }] },
  badge: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#3C385C', justifyContent: 'center', alignItems: 'center' },
  selectedBadge: { backgroundColor: '#625073' },
  letter: { color: colors.gold, fontSize: 12, fontWeight: '900' },
  copy: { flex: 1 },
  answer: { color: colors.text, fontSize: 15, lineHeight: 22 },
  feedback: { color: '#FFD0A3', fontSize: 13, lineHeight: 20, marginTop: 7 },
  code: { fontFamily: 'monospace' },
});
