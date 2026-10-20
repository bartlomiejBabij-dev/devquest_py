import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameButton } from './GameButton';
import { assembledCode, readFragmentIds, type BuilderAction } from '@/game/codeBuilder';
import type { CodeBuilderExercise } from '@/game/worldTypes';
import { colors } from '@/theme';

/** Controlled by the mission screen so hiding this view for a lesson cannot erase a draft. */
export function CodeBuilder({ exercise, answer, incorrect, solved = false, onEdit, onSubmit }: {
  exercise: CodeBuilderExercise; answer: string; incorrect: boolean; solved?: boolean;
  onEdit: (action: BuilderAction) => void; onSubmit: () => void;
}) {
  const selected = readFragmentIds(exercise, answer) ?? [];
  const remaining = exercise.fragments.filter(fragment => !selected.includes(fragment.id));
  return <View style={styles.builder}>
    <Text style={styles.label}>YOUR SPELL · {selected.length} / {exercise.validation.expectedFragmentIds.length} LINES</Text>
    <View style={[styles.program, solved && styles.solved]}>
      {selected.length ? <ScrollView horizontal accessibilityLabel="Assembled Python code" contentContainerStyle={styles.codeScroll}>
        <Text selectable style={styles.code}>{assembledCode(exercise, answer)}</Text>
      </ScrollView> : <Text style={styles.help}>Tap fragments below in the order Python should run them.</Text>}
    </View>
    {solved ? null : <>
      <View style={styles.actions}>
        {(['undo', 'reset'] as const).map(type => <Pressable key={type} accessibilityRole="button"
          accessibilityState={{ disabled: !selected.length }} disabled={!selected.length} onPress={() => onEdit({ type })}
          style={({ pressed }) => [styles.action, !selected.length && styles.disabled, pressed && styles.pressed]}>
          <Text style={styles.actionText}>{type === 'undo' ? 'Undo Last' : 'Reset'}</Text>
        </Pressable>)}
      </View>
      <Text style={styles.label}>AVAILABLE FRAGMENTS · TAP TO ADD</Text>
      <Text style={styles.help}>Spaces are part of the code. Indented lines belong inside the loop. Swipe code sideways if needed.</Text>
      {remaining.map(fragment => <ScrollView key={fragment.id} horizontal contentContainerStyle={styles.fragmentScroll}>
        <Pressable accessibilityRole="button"
        accessibilityLabel={`Add ${fragment.code.startsWith('    ') ? 'indented line: ' : 'line: '}${fragment.code.trim()}`}
        accessibilityHint="Appends this fragment to your spell. Cast Spell checks the completed arrangement."
        onPress={() => onEdit({ type: 'add', id: fragment.id })}
        style={({ pressed }) => [styles.fragment, pressed && styles.pressed]}>
          <Text style={styles.code}>{fragment.code}</Text>
        </Pressable>
      </ScrollView>)}
      {!remaining.length ? <Text style={styles.help}>All fragments placed. Check their order, then cast your spell.</Text> : null}
      <View accessibilityLiveRegion="polite">
        {incorrect ? <Text style={styles.feedback}>Not quite. Your spell is still here. {exercise.hint} Use Undo Last or Reset to rebuild.</Text> : null}
      </View>
      <GameButton label="Cast Spell" onPress={onSubmit} disabled={selected.length !== exercise.validation.expectedFragmentIds.length} />
    </>}
  </View>;
}

const styles = StyleSheet.create({
  builder: { gap: 10, marginTop: 15 },
  label: { color: colors.violet, fontSize: 10, fontWeight: '900', lineHeight: 16, letterSpacing: 0.5 },
  program: { minHeight: 72, padding: 12, borderRadius: 13, borderWidth: 1, borderColor: '#6D6294', backgroundColor: '#10142C' },
  solved: { borderColor: colors.green },
  codeScroll: { flexGrow: 1, alignItems: 'center', paddingVertical: 4 },
  code: { color: '#B6F0D4', fontFamily: 'monospace', fontSize: 13, lineHeight: 22 },
  help: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  fragmentScroll: { flexGrow: 1 },
  fragment: { flexGrow: 1, minHeight: 56, justifyContent: 'center', padding: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#647C9A', backgroundColor: '#203547' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  action: { flex: 1, minWidth: 100, minHeight: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#75659B', borderRadius: 10, padding: 8 },
  actionText: { color: colors.gold, fontWeight: '800', fontSize: 13 },
  disabled: { opacity: 0.45 },
  pressed: { backgroundColor: '#514267', borderColor: colors.gold },
  feedback: { color: '#FFD0A3', fontSize: 13, lineHeight: 20 },
});
