import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Animated, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { GameButton } from '@/components/GameButton';
import { GameScreen } from '@/components/GameScreen';
import { useGame } from '@/game/GameContext';
import { getTotalEarnedXp } from '@/game/progression';
import { chapters, missions } from '@/game/worldContent';
import { getPlayableMission, submitWorldMission, type MissionSubmission } from '@/game/worldMission';
import { colors } from '@/theme';

type SuccessfulSubmission = Extract<MissionSubmission, { status: 'correct' }>;

export default function WorldMissionScreen() {
  const { missionId: rawMissionId } = useLocalSearchParams<{ missionId: string }>();
  const missionId = typeof rawMissionId === 'string' ? rawMissionId : '';
  const router = useRouter();
  const { progression, dispatchProgression } = useGame();
  const currentProgress = useRef(progression);
  const submitting = useRef(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();
  const [answer, setAnswer] = useState('');
  const [incorrect, setIncorrect] = useState(false);
  const [phase, setPhase] = useState<'answer' | 'casting' | 'result'>('answer');
  const [result, setResult] = useState<SuccessfulSubmission | null>(null);
  const [spellPulse] = useState(() => new Animated.Value(0));
  const playable = getPlayableMission(progression, missionId);
  const knownMission = missions.find((item) => item.id === missionId);

  useEffect(() => { currentProgress.current = progression; }, [progression]);
  useEffect(() => () => { if (revealTimer.current) clearTimeout(revealTimer.current); }, []);

  function submitAnswer() {
    if (phase !== 'answer' || submitting.current) return;
    submitting.current = true;
    const submission = submitWorldMission(currentProgress.current, missionId, answer);
    if (submission.status !== 'correct') {
      setIncorrect(submission.status === 'incorrect');
      submitting.current = false;
      return;
    }

    currentProgress.current = submission.progress;
    setResult(submission);
    setIncorrect(false);
    setPhase('casting');
    Keyboard.dismiss();
    dispatchProgression({ type: 'completeMission', missionId });
    if (!reduceMotion) {
      Animated.sequence([
        Animated.timing(spellPulse, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(spellPulse, { toValue: 0, duration: 370, useNativeDriver: true }),
      ]).start();
    }
    revealTimer.current = setTimeout(() => setPhase('result'), reduceMotion ? 150 : 690);
  }

  if (!playable) {
    const chapter = knownMission && chapters.find((item) => item.id === knownMission.chapterId);
    return (
      <GameScreen compact>
        <Pressable onPress={() => router.replace('/world-map')} accessibilityRole="button" accessibilityLabel="Back to World Map" style={styles.backButton}><Text style={styles.backText}>‹  WORLD MAP</Text></Pressable>
        <View style={styles.unavailableCard}>
          <Text style={styles.overline}>THE PATH IS SEALED</Text>
          <Text style={styles.title}>{knownMission ? 'Mission locked' : 'Mission not found'}</Text>
          <Text style={styles.body}>{knownMission ? `Complete the earlier missions to enter ${chapter?.title ?? 'this chapter'}.` : 'This mission is not part of the Forest of Variables.'}</Text>
        </View>
        <GameButton label="Return to World Map" onPress={() => router.replace('/world-map')} />
      </GameScreen>
    );
  }

  const { chapter, exercise, mission } = playable;
  const multiline = exercise.type === 'predict-output' && exercise.validation.acceptedAnswers.some((item) => item.includes('\n'));
  const newlyUnlocked = result?.newlyUnlockedChapterIds.map((id) => chapters.find((item) => item.id === id)?.title).filter(Boolean) ?? [];

  return (
    <GameScreen compact scrollToEndOnKeyboard>
      <View style={styles.topRow}>
        <Pressable onPress={() => { Keyboard.dismiss(); router.replace('/world-map'); }} accessibilityRole="button" accessibilityLabel="Back to World Map" style={styles.backButton}><Text style={styles.backText}>‹  WORLD MAP</Text></Pressable>
        <Text style={styles.worldLabel}>FOREST OF VARIABLES</Text>
      </View>

      {phase === 'result' && result ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultGlyph}>✦</Text>
          <Text style={styles.overline}>SPELL COMPLETE</Text>
          <Text style={styles.resultTitle}>Mission completed!</Text>
          <Text style={styles.body}>{mission.title}</Text>
          <View style={styles.explanationCard}><Text style={styles.smallLabel}>WHAT YOU LEARNED</Text><Text style={styles.explanation}>{exercise.explanation}</Text></View>
          <View style={styles.rewardRow}>
            <View style={styles.rewardStat}><Text style={styles.rewardValue}>+{result.xpAwarded}</Text><Text style={styles.rewardLabel}>XP EARNED</Text></View>
            <View style={styles.rewardStat}><Text style={styles.rewardValue}>{result.totalXp}</Text><Text style={styles.rewardLabel}>TOTAL WORLD XP</Text></View>
          </View>
          {result.xpAwarded === 0 ? <Text style={styles.replayNote}>Replay complete. XP was already earned.</Text> : null}
          {newlyUnlocked.length ? <Text style={styles.unlockText}>✦  New chapter unlocked: {newlyUnlocked.join(', ')}</Text> : null}
          <GameButton label="Return to World Map" onPress={() => router.replace('/world-map')} style={styles.resultButton} />
        </View>
      ) : (
        <>
          <View style={styles.headerCard}>
            <Text style={styles.overline}>{chapter.title.toUpperCase()}  ·  PYTHON MISSION</Text>
            <Text style={styles.title}>{mission.title}</Text>
            <Text style={styles.body}>{mission.description}</Text>
            <View style={styles.rewardChip}><Text style={styles.rewardChipText}>{getTotalEarnedXp(progression)} WORLD XP  ·  {mission.xpReward} XP REWARD</Text></View>
          </View>

          <View style={styles.exerciseCard}>
            <Text style={styles.smallLabel}>{exercise.concept.toUpperCase()}</Text>
            <Text style={styles.prompt}>{exercise.prompt}</Text>
            <View style={styles.codeBox}><Text style={styles.codeLabel}>PYTHON SPELL</Text><Text selectable style={styles.code}>{exercise.code}</Text></View>
            <Text style={styles.inputLabel}>{exercise.type === 'choose-operator' ? 'CHOOSE AN OPERATOR' : exercise.type === 'predict-output' ? 'PREDICT THE OUTPUT' : exercise.type === 'fix-mistake' ? 'CORRECT THE NAME' : 'FILL IN THE BLANK'}</Text>
            {exercise.type === 'choose-operator' ? (
              <View style={styles.options}>
                {exercise.options.map((option) => <Pressable key={option} onPress={() => { setAnswer(option); setIncorrect(false); }} disabled={phase !== 'answer'} accessibilityRole="radio" accessibilityState={{ selected: answer === option }} accessibilityLabel={`Operator ${option}`} style={[styles.option, answer === option && styles.optionSelected]}><Text style={[styles.optionText, answer === option && styles.optionTextSelected]}>{option}</Text></Pressable>)}
              </View>
            ) : (
              <TextInput accessibilityLabel="Mission answer" accessibilityHint={multiline ? 'Enter each printed line on a separate line' : 'Type the answer to the Python exercise'}
                value={answer} onChangeText={(value) => { setAnswer(value); setIncorrect(false); }} editable={phase === 'answer'}
                autoCapitalize="none" autoCorrect={false} spellCheck={false} multiline={multiline} numberOfLines={multiline ? 3 : 1}
                returnKeyType={multiline ? 'default' : 'done'} onSubmitEditing={multiline ? undefined : submitAnswer} blurOnSubmit={false}
                placeholder={multiline ? 'Line 1\nLine 2' : 'Type your answer'} placeholderTextColor="#888BA8" style={[styles.input, multiline && styles.multilineInput]} />
            )}
            <View accessibilityLiveRegion="polite" style={styles.feedbackBox}>
              {incorrect ? <><Text style={styles.incorrect}>Not quite. Try another spell.</Text><Text style={styles.hint}>Hint: {exercise.hint}</Text></> :
                <Text style={phase === 'casting' ? styles.correct : styles.hint}>{phase === 'casting' ? '✦  Spell cast successfully!' : 'A correct answer completes this mission.'}</Text>}
            </View>
            <GameButton label={phase === 'casting' ? 'Casting…' : 'Cast Spell'} onPress={submitAnswer} disabled={phase !== 'answer' || !answer.trim()} />
          </View>
          {phase === 'casting' ? <Animated.View pointerEvents="none" style={[styles.spellOverlay, { opacity: spellPulse, transform: [{ scale: spellPulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.3] }) }] }]}><Text style={styles.spellGlyph}>✦</Text></Animated.View> : null}
        </>
      )}
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  topRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  backButton: { minHeight: 44, justifyContent: 'center', minWidth: 95 },
  backText: { color: colors.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  worldLabel: { color: colors.green, fontSize: 9, fontWeight: '900', letterSpacing: 1, flexShrink: 1, textAlign: 'right' },
  headerCard: { borderRadius: 21, backgroundColor: '#17332F', borderWidth: 1, borderColor: '#3F7767', padding: 20 },
  overline: { color: colors.green, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 27, fontWeight: '900', marginTop: 7 },
  body: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  rewardChip: { alignSelf: 'flex-start', borderRadius: 10, backgroundColor: '#315147', paddingHorizontal: 11, paddingVertical: 7, marginTop: 14 },
  rewardChipText: { color: colors.gold, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  exerciseCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 21, padding: 18, marginTop: 15, marginBottom: 15 },
  smallLabel: { color: colors.violet, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  prompt: { color: colors.text, fontSize: 18, fontWeight: '800', lineHeight: 25, marginTop: 10 },
  codeBox: { backgroundColor: '#10142C', borderRadius: 14, borderWidth: 1, borderColor: '#373C62', padding: 15, marginTop: 17 },
  codeLabel: { color: '#9EA3C8', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8 },
  code: { color: '#B6F0D4', fontFamily: 'monospace', fontSize: 15, lineHeight: 23 },
  inputLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginTop: 20, marginBottom: 9 },
  input: { minHeight: 54, borderWidth: 1.5, borderColor: '#68679A', borderRadius: 12, color: colors.text, fontFamily: 'monospace', fontSize: 16, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#202540' },
  multilineInput: { minHeight: 92, textAlignVertical: 'top' },
  options: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  option: { minWidth: 64, minHeight: 54, borderRadius: 12, borderWidth: 1.5, borderColor: '#68679A', backgroundColor: '#202540', justifyContent: 'center', alignItems: 'center' },
  optionSelected: { backgroundColor: '#315147', borderColor: colors.green },
  optionText: { color: colors.text, fontSize: 22, fontWeight: '800', fontFamily: 'monospace' },
  optionTextSelected: { color: colors.green },
  feedbackBox: { minHeight: 61, justifyContent: 'center' },
  incorrect: { color: colors.orange, fontSize: 13, fontWeight: '800' },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  correct: { color: colors.green, fontSize: 13, fontWeight: '900' },
  spellOverlay: { position: 'absolute', top: '35%', alignSelf: 'center', width: 120, height: 120, borderRadius: 60, backgroundColor: '#8B65C7', alignItems: 'center', justifyContent: 'center' },
  spellGlyph: { color: '#FFF4BE', fontSize: 76 },
  unavailableCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 22, marginVertical: 20 },
  resultCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: '#6D627B', borderRadius: 23, padding: 22, alignItems: 'center', marginTop: 32 },
  resultGlyph: { color: colors.gold, fontSize: 59, marginBottom: 7 },
  resultTitle: { color: colors.gold, fontSize: 29, fontWeight: '900', textAlign: 'center', marginTop: 7 },
  explanationCard: { alignSelf: 'stretch', borderRadius: 15, backgroundColor: '#233C40', borderWidth: 1, borderColor: '#477367', padding: 14, marginTop: 22 },
  explanation: { color: colors.text, fontSize: 13, lineHeight: 20, marginTop: 7 },
  rewardRow: { alignSelf: 'stretch', flexDirection: 'row', gap: 10, marginTop: 17 },
  rewardStat: { flex: 1, backgroundColor: '#302941', borderRadius: 14, padding: 13, alignItems: 'center' },
  rewardValue: { color: colors.gold, fontSize: 24, fontWeight: '900' },
  rewardLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  replayNote: { color: colors.muted, fontSize: 12, marginTop: 15, textAlign: 'center' },
  unlockText: { color: colors.green, fontSize: 13, fontWeight: '800', textAlign: 'center', marginTop: 19 },
  resultButton: { alignSelf: 'stretch', marginTop: 25 },
});
