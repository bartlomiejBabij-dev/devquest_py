import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Animated, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { GameButton } from '@/components/GameButton';
import { GameScreen } from '@/components/GameScreen';
import { useGame } from '@/game/GameContext';
import { getTotalEarnedXp } from '@/game/progression';
import { chapters, missions } from '@/game/worldContent';
import { continueMissionAttempt, getPlayableMission, startMissionAttempt, submitMissionAnswer, type MissionAttempt } from '@/game/worldMission';
import { colors } from '@/theme';

export default function WorldMissionScreen() {
  const { missionId: rawMissionId } = useLocalSearchParams<{ missionId: string }>();
  const missionId = typeof rawMissionId === 'string' ? rawMissionId : '';
  const router = useRouter();
  const { progression, dispatchProgression } = useGame();
  const currentProgress = useRef(progression);
  const [attempt, setAttempt] = useState<MissionAttempt | null>(() => startMissionAttempt(progression, missionId));
  const attemptRef = useRef(attempt);
  const submitting = useRef(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();
  const [answer, setAnswer] = useState('');
  const [incorrect, setIncorrect] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [spellPulse] = useState(() => new Animated.Value(0));
  const playable = getPlayableMission(progression, missionId);
  const knownMission = missions.find((item) => item.id === missionId);

  useEffect(() => { currentProgress.current = progression; }, [progression]);
  useEffect(() => {
    if (attemptRef.current?.missionId === missionId) return;
    const next = startMissionAttempt(currentProgress.current, missionId);
    attemptRef.current = next;
    setAttempt(next);
    setAnswer('');
    setIncorrect(false);
    setAnimationDone(false);
    submitting.current = false;
  }, [missionId]);
  useEffect(() => () => { if (revealTimer.current) clearTimeout(revealTimer.current); }, []);

  function returnToMap() {
    Keyboard.dismiss();
    router.replace('/world-map');
  }

  function submitAnswer(expectedExerciseId: string, submittedAnswer = answer) {
    const current = attemptRef.current;
    const currentExercise = playable?.exercises[current?.exerciseIndex ?? -1];
    if (!current || !currentExercise || currentExercise.id !== expectedExerciseId || current.phase !== 'answering' || submitting.current) return;
    submitting.current = true;
    const submission = submitMissionAnswer(currentProgress.current, current, submittedAnswer);
    if (submission.status !== 'correct') {
      setIncorrect(submission.status === 'incorrect');
      submitting.current = false;
      return;
    }

    attemptRef.current = submission.attempt;
    setAttempt(submission.attempt);
    currentProgress.current = submission.progress;
    setIncorrect(false);
    setAnimationDone(false);
    Keyboard.dismiss();
    if (submission.xpAwarded > 0) dispatchProgression({ type: 'completeMission', missionId });
    if (!reduceMotion) {
      spellPulse.setValue(0);
      Animated.sequence([
        Animated.timing(spellPulse, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(spellPulse, { toValue: 0.55, duration: 370, useNativeDriver: true }),
      ]).start();
    }
    revealTimer.current = setTimeout(() => setAnimationDone(true), reduceMotion ? 150 : 690);
  }

  function continueAfterSpell() {
    const current = attemptRef.current;
    if (!current || !playable || !animationDone) return;
    const next = continueMissionAttempt(current, playable.exercises.length);
    if (next === current) return;
    attemptRef.current = next;
    setAttempt(next);
    setAnswer('');
    setIncorrect(false);
    setAnimationDone(false);
    submitting.current = false;
    spellPulse.setValue(0);
  }

  function replayMission() {
    const next = startMissionAttempt(currentProgress.current, missionId);
    if (!next) return;
    attemptRef.current = next;
    setAttempt(next);
    setAnswer('');
    setIncorrect(false);
    setAnimationDone(false);
    submitting.current = false;
  }

  if (!playable || !attempt || attempt.missionId !== missionId) {
    const chapter = knownMission && chapters.find((item) => item.id === knownMission.chapterId);
    return (
      <GameScreen compact>
        <Pressable onPress={returnToMap} accessibilityRole="button" accessibilityLabel="Back to World Map" style={styles.backButton}><Text style={styles.backText}>‹  WORLD MAP</Text></Pressable>
        <View style={styles.unavailableCard}>
          <Text style={styles.overline}>THE PATH IS SEALED</Text>
          <Text style={styles.title}>{knownMission ? 'Mission locked' : 'Mission not found'}</Text>
          <Text style={styles.body}>{knownMission ? `Complete the earlier missions to enter ${chapter?.title ?? 'this chapter'}.` : 'This mission is not part of the Forest of Variables.'}</Text>
        </View>
        <GameButton label="Return to World Map" onPress={returnToMap} />
      </GameScreen>
    );
  }

  const { chapter, mission } = playable;
  const exercise = playable.exercises[attempt.exerciseIndex];
  const multiline = exercise.type === 'predict-output' && exercise.validation.acceptedAnswers.some((item) => item.includes('\n'));
  const solved = attempt.phase === 'solved';
  const result = attempt.result;
  const newlyUnlocked = result?.newlyUnlockedChapterIds.map((id) => chapters.find((item) => item.id === id)?.title).filter(Boolean) ?? [];

  return (
    <GameScreen compact scrollToEndOnKeyboard>
      <View style={styles.topRow}>
        <Pressable onPress={returnToMap} accessibilityRole="button" accessibilityLabel="Back to World Map" style={styles.backButton}><Text style={styles.backText}>‹  WORLD MAP</Text></Pressable>
        <Text style={styles.worldLabel}>FOREST OF VARIABLES</Text>
      </View>

      {attempt.phase === 'complete' && result ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultGlyph}>✦</Text>
          <Text style={styles.overline}>FIVE SPELLS CAST</Text>
          <Text style={styles.resultTitle}>MISSION COMPLETE!</Text>
          <Text style={styles.body}>{mission.title}</Text>
          <View style={styles.rewardRow}>
            <View style={styles.rewardStat}><Text style={styles.rewardValue}>+{result.xpAwarded}</Text><Text style={styles.rewardLabel}>XP EARNED</Text></View>
            <View style={styles.rewardStat}><Text style={styles.rewardValue}>{result.totalXp}</Text><Text style={styles.rewardLabel}>TOTAL WORLD XP</Text></View>
          </View>
          {result.xpAwarded === 0 ? <Text style={styles.replayNote}>Replay complete. XP was already earned.</Text> : null}
          {newlyUnlocked.length ? <Text style={styles.unlockText}>✦  New chapter unlocked: {newlyUnlocked.join(', ')}</Text> : null}
          <GameButton label="Return to World Map" onPress={returnToMap} style={styles.resultButton} />
          <Pressable onPress={replayMission} accessibilityRole="button" accessibilityLabel="Replay Mission" style={styles.replayButton}><Text style={styles.replayText}>REPLAY MISSION</Text></Pressable>
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
            <View style={styles.progressHeading}><Text style={styles.smallLabel}>SPELL {attempt.exerciseIndex + 1} / {playable.exercises.length}</Text><Text style={styles.progressCaption}>COMPLETE ALL FIVE</Text></View>
            <View style={styles.segments} accessibilityLabel={`${attempt.exerciseIndex + (solved ? 1 : 0)} of ${playable.exercises.length} spells solved`}>
              {playable.exercises.map((item, index) => <View key={item.id} style={[styles.segment, index < attempt.exerciseIndex && styles.segmentComplete, index === attempt.exerciseIndex && (solved ? styles.segmentComplete : styles.segmentCurrent)]} />)}
            </View>
            <Text style={styles.concept}>{exercise.concept.toUpperCase()}</Text>
            <Text style={styles.prompt}>{exercise.prompt}</Text>
            <View style={styles.codeBox}><Text style={styles.codeLabel}>PYTHON SPELL</Text><Text selectable style={styles.code}>{exercise.code}</Text></View>

            {solved ? (
              <View accessibilityLiveRegion="polite">
                <View style={styles.successRow}><Animated.Text style={[styles.successGlyph, { opacity: reduceMotion ? 1 : spellPulse, transform: [{ scale: reduceMotion ? 1 : spellPulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.25] }) }] }]}>✦</Animated.Text><Text style={styles.correct}>Spell cast successfully!</Text></View>
                <View style={styles.explanationCard}><Text style={styles.smallLabel}>WHAT YOU LEARNED</Text><Text style={styles.explanation}>{exercise.explanation}</Text></View>
                <GameButton label={attempt.exerciseIndex === playable.exercises.length - 1 ? 'See Mission Result' : 'Continue'} onPress={continueAfterSpell} disabled={!animationDone} style={styles.continueButton} />
              </View>
            ) : (
              <>
                <Text style={styles.inputLabel}>{exercise.type === 'choose-operator' ? 'CHOOSE AN OPERATOR' : exercise.type === 'predict-output' ? 'PREDICT THE OUTPUT' : exercise.type === 'fix-mistake' ? 'FIX THE MISTAKE' : 'FILL IN THE BLANK'}</Text>
                {exercise.type === 'choose-operator' ? (
                  <View style={styles.options}>
                    {exercise.options.map((option) => <Pressable key={option} onPress={() => { if (attemptRef.current?.phase !== 'answering') return; setAnswer(option); setIncorrect(false); }} accessibilityRole="radio" accessibilityState={{ selected: answer === option }} accessibilityLabel={`Operator ${option}`} style={[styles.option, answer === option && styles.optionSelected]}><Text style={[styles.optionText, answer === option && styles.optionTextSelected]}>{option}</Text></Pressable>)}
                  </View>
                ) : (
                  <TextInput key={exercise.id} accessibilityLabel="Mission answer" accessibilityHint={multiline ? 'Enter each printed line on a separate line' : 'Type the answer to the Python exercise'}
                    value={answer} onChangeText={(value) => { if (attemptRef.current?.phase !== 'answering') return; setAnswer(value); setIncorrect(false); }}
                    autoCapitalize="none" autoCorrect={false} spellCheck={false} multiline={multiline} numberOfLines={multiline ? 3 : 1}
                    returnKeyType={multiline ? 'default' : 'done'} onSubmitEditing={multiline ? undefined : (event) => submitAnswer(exercise.id, event.nativeEvent.text)} blurOnSubmit={false}
                    placeholder={multiline ? 'Line 1\nLine 2' : 'Type your answer'} placeholderTextColor="#888BA8" style={[styles.input, multiline && styles.multilineInput]} />
                )}
                <View accessibilityLiveRegion="polite" style={styles.feedbackBox}>
                  {incorrect ? <><Text style={styles.incorrect}>Not quite. Try another spell.</Text><Text style={styles.hint}>Hint: {exercise.hint}</Text></> :
                    <Text style={styles.hint}>Solve all five spells to complete this mission. Progress resets if you leave.</Text>}
                </View>
                <GameButton label="Cast Spell" onPress={() => submitAnswer(exercise.id)} disabled={!answer.trim()} />
              </>
            )}
          </View>
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
  progressHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  progressCaption: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  segments: { flexDirection: 'row', gap: 6, marginTop: 10, marginBottom: 20 },
  segment: { flex: 1, height: 8, borderRadius: 6, backgroundColor: '#494C70' },
  segmentCurrent: { backgroundColor: colors.violet, borderWidth: 1, borderColor: '#D7C6FF' },
  segmentComplete: { backgroundColor: colors.green },
  smallLabel: { color: colors.violet, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  concept: { color: colors.violet, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
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
  successRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 15 },
  successGlyph: { color: colors.gold, fontSize: 32 },
  correct: { color: colors.green, fontSize: 14, fontWeight: '900' },
  explanationCard: { borderRadius: 15, backgroundColor: '#233C40', borderWidth: 1, borderColor: '#477367', padding: 14, marginTop: 14 },
  explanation: { color: colors.text, fontSize: 13, lineHeight: 20, marginTop: 7 },
  continueButton: { marginTop: 19 },
  unavailableCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 22, marginVertical: 20 },
  resultCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: '#6D627B', borderRadius: 23, padding: 22, alignItems: 'center', marginTop: 32 },
  resultGlyph: { color: colors.gold, fontSize: 59, marginBottom: 7 },
  resultTitle: { color: colors.gold, fontSize: 29, fontWeight: '900', textAlign: 'center', marginTop: 7 },
  rewardRow: { alignSelf: 'stretch', flexDirection: 'row', gap: 10, marginTop: 22 },
  rewardStat: { flex: 1, backgroundColor: '#302941', borderRadius: 14, padding: 13, alignItems: 'center' },
  rewardValue: { color: colors.gold, fontSize: 24, fontWeight: '900' },
  rewardLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  replayNote: { color: colors.muted, fontSize: 12, marginTop: 15, textAlign: 'center' },
  unlockText: { color: colors.green, fontSize: 13, fontWeight: '800', textAlign: 'center', marginTop: 19 },
  resultButton: { alignSelf: 'stretch', marginTop: 25 },
  replayButton: { minHeight: 48, marginTop: 9, justifyContent: 'center', paddingHorizontal: 16 },
  replayText: { color: colors.violet, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
});
