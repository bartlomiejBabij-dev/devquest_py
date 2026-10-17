import { useEffect, useReducer, useRef, useState } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { Alert, Animated, Keyboard, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReducedMotion } from 'react-native-reanimated';
import { AnswerChoices } from '@/components/AnswerChoices';
import { LessonCard } from '@/components/LessonCard';
import { isChoiceExercise, getIncorrectAnswerFeedback } from '@/game/exerciseValidation';
import { getLessonForExercise } from '@/game/lessonContent';
import { getVisibleLesson, initialLessonSession, lessonSessionReducer } from '@/game/lessonSession';
import { GameButton } from '@/components/GameButton';
import { GameScreen } from '@/components/GameScreen';
import { GoblinKingEncounter } from '@/components/GoblinKingEncounter';
import { ValleyGuardian } from '@/components/ValleyGuardian';
import { worldMapForMission, resolveMapWorld } from '@/navigation/worldRoutes';
import { NavigationButton } from '@/components/NavigationButton';
import { SpellbookEntryView, type SpellbookEntryHandle } from '@/components/SpellbookEntryView';
import { getGoblinKingHp, isGoblinKingMission } from '@/game/boss';
import { useGame } from '@/game/GameContext';
import { getTotalEarnedXp, getWorldProgress, isMissionCompleted } from '@/game/progression';
import { getSpellbookEntryForExercise } from '@/game/spellbookContent';
import { chapters, forestOfVariables, missions } from '@/game/worldContent';
import { continueMissionAttempt, getPlayableMission, startMissionAttempt, submitMissionAnswer, type MissionAttempt } from '@/game/worldMission';
import { hasUnfinishedMissionProgress } from '@/navigation/navigationActions';
import { useScreenBack, useScreenNavigation } from '@/navigation/useScreenNavigation';
import { colors } from '@/theme';
import { useGameAudio } from '@/audio/AudioProvider';

export default function WorldMissionScreen() {
  const audio = useGameAudio();
  const { missionId: rawMissionId } = useLocalSearchParams<{ missionId: string }>();
  const missionId = typeof rawMissionId === 'string' ? rawMissionId : '';
  const stackNavigation = useNavigation();
  const navigation = useScreenNavigation();
  const { progression, dispatchProgression } = useGame();
  const currentProgress = useRef(progression);
  const [attempt, setAttempt] = useState<MissionAttempt | null>(() => startMissionAttempt(progression, missionId));
  const attemptRef = useRef(attempt);
  const submitting = useRef(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spellbookViewRef = useRef<SpellbookEntryHandle>(null);
  const exitPromptOpen = useRef(false);
  const reduceMotion = useReducedMotion();
  const [answer, setAnswer] = useState('');
  const [lessonSession, dispatchLesson] = useReducer(lessonSessionReducer, initialLessonSession);
  const [incorrect, setIncorrect] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [spellbookOpen, setSpellbookOpen] = useState(false);
  const [spellPulse] = useState(() => new Animated.Value(0));
  const playable = getPlayableMission(progression, missionId);
  const knownMission = missions.find((item) => item.id === missionId);
  const bossMission = isGoblinKingMission(missionId);

  useEffect(() => { currentProgress.current = progression; }, [progression]);
  useEffect(() => {
    if (attemptRef.current?.missionId === missionId) return;
    const next = startMissionAttempt(currentProgress.current, missionId);
    attemptRef.current = next;
    setAttempt(next);
    setAnswer('');
    setIncorrect(false);
    setAnimationDone(false);
    dispatchLesson({ type: 'reset' });
    submitting.current = false;
  }, [missionId, progression]);
  useEffect(() => () => { if (revealTimer.current) clearTimeout(revealTimer.current); }, []);

  function returnToMap() {
    navigation.returnTo(worldMapForMission(missionId));
  }

  usePreventRemove(hasUnfinishedMissionProgress(attempt, answer), ({ data }) => {
    if (exitPromptOpen.current) return;
    exitPromptOpen.current = true;
    const cancel = () => { exitPromptOpen.current = false; navigation.reset(); };
    Alert.alert('Leave this mission?', 'This unfinished attempt will restart at spell 1. Your saved XP and notes will stay.', [
      { text: 'Keep Playing', style: 'cancel', onPress: cancel },
      { text: 'Leave Mission', style: 'destructive', onPress: () => { exitPromptOpen.current = false; stackNavigation.dispatch(data.action); } },
    ], { cancelable: true, onDismiss: cancel });
  });

  useScreenBack(() => {
    if (spellbookOpen) spellbookViewRef.current?.requestClose();
    else if (lessonSession.reviewing) dispatchLesson({ type: 'close' });
    else returnToMap();
  });

  function submitAnswer(expectedExerciseId: string, submittedAnswer = answer) {
    const current = attemptRef.current;
    const currentExercise = playable?.exercises[current?.exerciseIndex ?? -1];
    if (!current || !currentExercise || currentExercise.id !== expectedExerciseId || current.phase !== 'answering' || submitting.current) return;
    if (getVisibleLesson(currentExercise, current.phase, isMissionCompleted(currentProgress.current, missionId), lessonSession)) return;
    submitting.current = true;
    const submission = submitMissionAnswer(currentProgress.current, current, submittedAnswer);
    if (submission.status !== 'correct') {
      if (submission.status === 'incorrect') audio.playEffect('incorrect', submission);
      setIncorrect(submission.status === 'incorrect');
      submitting.current = false;
      return;
    }

    attemptRef.current = submission.attempt;
    audio.playEffect('correct', submission.attempt);
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
    const bossDefeated = bossMission && getGoblinKingHp(submission.attempt) === 0;
    revealTimer.current = setTimeout(() => setAnimationDone(true), reduceMotion ? 150 : bossDefeated ? 880 : 690);
  }

  function continueAfterSpell() {
    const current = attemptRef.current;
    if (!current || !playable || !animationDone) return;
    const next = continueMissionAttempt(current, playable.exercises.length);
    if (next === current) return;
    if (next.phase === 'complete') audio.playEffect(bossMission ? 'bossVictory' : 'victory', next);
    attemptRef.current = next;
    setAttempt(next);
    setAnswer('');
    setIncorrect(false);
    setAnimationDone(false);
    dispatchLesson({ type: 'close' });
    submitting.current = false;
    spellPulse.setValue(0);
  }

  function replayMission() {
    dispatchLesson({ type: 'reset' });
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
      <GameScreen compact header={<NavigationButton label="World Map" accessibilityLabel="Back to World Map" onPress={returnToMap} />}>
        <View style={styles.unavailableCard}>
          <Text style={styles.overline}>THE PATH IS SEALED</Text>
          <Text style={styles.title}>{knownMission ? 'Mission locked' : 'Mission not found'}</Text>
          <Text style={styles.body}>{knownMission ? `Complete the earlier missions to enter ${chapter?.title ?? 'this chapter'}.` : 'This mission is not part of the available worlds.'}</Text>
        </View>
        <GameButton label="Return to World Map" onPress={returnToMap} />
      </GameScreen>
    );
  }

  const { chapter, mission } = playable;
  const exercise = playable.exercises[attempt.exerciseIndex];
  const spellbookEntry = getSpellbookEntryForExercise(exercise.id);
  const lesson = getLessonForExercise(exercise);
  const lessonView = getVisibleLesson(exercise, attempt.phase, isMissionCompleted(progression, missionId), lessonSession);
  const multiline = !isChoiceExercise(exercise) && (exercise.type === 'predict-output' || exercise.validation.kind === 'python-lines') && exercise.validation.acceptedAnswers.some((item) => item.includes('\n'));
  const solved = attempt.phase === 'solved';
  const result = attempt.result;
  const newlyUnlocked = result?.newlyUnlockedChapterIds.map((id) => chapters.find((item) => item.id === id)?.title).filter(Boolean) ?? [];
  const bossHp = bossMission ? getGoblinKingHp(attempt) : null;
  const worldCompletion = bossMission ? getWorldProgress(progression, forestOfVariables.id) : null;

  return (
    <GameScreen compact scrollToEndOnKeyboard scrollResetKey={lesson ? `${missionId}:${attempt.exerciseIndex}:${lessonView ? 'lesson' : 'challenge'}` : undefined} header={
      <View style={styles.topRow}>
        <NavigationButton label="World Map" accessibilityLabel="Exit mission to World Map" onPress={returnToMap} />
        <Text style={styles.worldLabel}>{resolveMapWorld(chapter.worldId).title.toUpperCase()}</Text>
      </View>
    }>
      {attempt.phase === 'complete' && result ? (
        <View style={[styles.resultCard, bossMission && styles.bossResultCard]}>
          <Text style={styles.resultGlyph}>{bossMission ? '♛' : '✦'}</Text>
          <Text style={styles.overline}>{bossMission ? 'FIVE SPELLS CAST' : `${attempt.solvedExerciseIds.length} / ${playable.exercises.length} SPELLS CAST`}</Text>
          <Text style={[styles.resultTitle, bossMission && styles.bossResultTitle]}>{bossMission ? 'GOBLIN KING DEFEATED!' : 'MISSION COMPLETE!'}</Text>
          {bossMission ? <Text style={styles.worldClear}>WORLD 1 CLEARED!</Text> : null}
          <Text style={styles.body}>{mission.title}</Text>
          <View style={styles.rewardRow}>
            <View style={styles.rewardStat}><Text style={styles.rewardValue}>+{result.xpAwarded}</Text><Text style={styles.rewardLabel}>XP EARNED</Text></View>
            <View style={styles.rewardStat}><Text style={styles.rewardValue}>{result.totalXp}</Text><Text style={styles.rewardLabel}>TOTAL XP</Text></View>
          </View>
          {bossMission ? <Text style={styles.worldCompletion}>WORLD 1 COMPLETION  ·  {worldCompletion?.percent ?? 0}%</Text> : null}
          {result.xpAwarded === 0 ? <Text style={styles.replayNote}>Replay complete. XP was already earned.</Text> : null}
          {newlyUnlocked.length ? <Text style={styles.unlockText}>✦  New chapter unlocked: {newlyUnlocked.join(', ')}</Text> : null}
          <GameButton label="Return to World Map" onPress={returnToMap} style={styles.resultButton} />
          <Pressable onPress={replayMission} accessibilityRole="button" accessibilityLabel="Replay Mission" style={styles.replayButton}><Text style={styles.replayText}>REPLAY MISSION</Text></Pressable>
        </View>
      ) : (
        <>
          {bossMission && bossHp !== null ? <GoblinKingEncounter hp={bossHp} hitCount={attempt.solvedExerciseIds.length} showDamage={solved} reducedMotion={!!reduceMotion} /> : null}
          {mission.encounter === 'guardian' ? <ValleyGuardian solvedCount={attempt.solvedExerciseIds.length} totalCount={playable.exercises.length} /> : null}
          <View style={[styles.headerCard, bossMission && styles.bossHeaderCard, lesson && styles.learningHeader]}>
            <Text style={styles.overline}>{chapter.title.toUpperCase()}  ·  PYTHON MISSION</Text>
            <Text style={[styles.title, lesson && styles.learningTitle]}>{mission.title}</Text>
            {!lesson ? <Text style={styles.body}>{mission.description}</Text> : null}
            {!lesson ? <View style={styles.rewardChip}><Text style={styles.rewardChipText}>{getTotalEarnedXp(progression)} TOTAL XP  ·  {mission.xpReward} XP REWARD</Text></View> : null}
          </View>

          {lessonView ? <LessonCard lesson={lessonView.lesson} reviewing={!lessonView.introduction} onContinue={() => dispatchLesson({ type: 'continue', lessonId: lessonView.lesson.id })} /> : <View style={styles.exerciseCard}>
            <View style={styles.progressHeading}><Text style={styles.smallLabel}>SPELL {attempt.exerciseIndex + 1} / {playable.exercises.length}</Text><Text style={styles.progressCaption}>COMPLETE ALL {playable.exercises.length}</Text></View>
            <View style={styles.segments} accessibilityLabel={`${attempt.exerciseIndex + (solved ? 1 : 0)} of ${playable.exercises.length} spells solved`}>
              {playable.exercises.map((item, index) => <View key={item.id} style={[styles.segment, index < attempt.exerciseIndex && styles.segmentComplete, index === attempt.exerciseIndex && (solved ? styles.segmentComplete : styles.segmentCurrent)]} />)}
            </View>
            <View style={styles.conceptRow}>
              <Text style={styles.concept}>{exercise.concept.toUpperCase()}</Text>
              {spellbookEntry ? <Pressable accessibilityRole="button" accessibilityLabel="Open Spellbook for this exercise"
                onPress={() => { Keyboard.dismiss(); setSpellbookOpen(true); }} style={styles.spellbookButton}>
                <Text style={styles.spellbookButtonText}>✦  SPELLBOOK</Text>
              </Pressable> : null}
            </View>
            {lesson ? <Pressable accessibilityRole="button" accessibilityLabel="Review Lesson" onPress={() => { Keyboard.dismiss(); dispatchLesson({ type: 'review' }); }}
              style={({ pressed }) => [styles.reviewLesson, pressed && styles.reviewPressed]}><Text style={styles.reviewLessonText}>{lesson.optionalReview ? '↺  OPTIONAL RECAP' : '↺  REVIEW LESSON'}</Text></Pressable> : null}
            <Text style={styles.prompt}>{exercise.prompt}</Text>
            <View style={styles.codeBox}><Text style={styles.codeLabel}>PYTHON SPELL</Text><Text selectable style={styles.code}>{exercise.code}</Text></View>

            {solved ? (
              <View accessibilityLiveRegion="polite">
                <View style={styles.successRow}><Animated.Text style={[styles.successGlyph, { opacity: reduceMotion ? 1 : spellPulse, transform: [{ scale: reduceMotion ? 1 : spellPulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.25] }) }] }]}>✦</Animated.Text><Text style={styles.correct}>Spell cast successfully!</Text></View>
                {isChoiceExercise(exercise) ? <Text style={styles.chosenAnswer}>{exercise.options.find((option) => option.id === answer)?.label}</Text> : null}
                <View style={styles.explanationCard}><Text style={styles.smallLabel}>WHAT YOU LEARNED</Text><Text style={styles.explanation}>{exercise.explanation}</Text></View>
                <GameButton label={attempt.exerciseIndex === playable.exercises.length - 1 ? 'See Mission Result' : 'Continue'} onPress={continueAfterSpell} disabled={!animationDone} style={styles.continueButton} />
              </View>
            ) : isChoiceExercise(exercise) ? (
              <AnswerChoices exercise={exercise} selectedId={answer} incorrect={incorrect} onSelect={(optionId) => {
                if (attemptRef.current?.phase !== 'answering' || attemptRef.current.exerciseIndex !== attempt.exerciseIndex) return;
                setAnswer(optionId);
                submitAnswer(exercise.id, optionId);
              }} />
            ) : (
              <>
                <Text style={styles.inputLabel}>{exercise.type === 'choose-operator' ? 'CHOOSE AN OPERATOR' : exercise.type === 'predict-output' ? 'PREDICT THE OUTPUT' : exercise.type === 'fix-mistake' ? 'FIX THE MISTAKE' : 'FILL IN THE BLANK'}</Text>
                {exercise.type === 'choose-operator' ? (
                  <View style={styles.options}>
                    {exercise.options.map((option) => <Pressable key={option} onPress={() => { if (attemptRef.current?.phase !== 'answering') return; setAnswer(option); setIncorrect(false); }} accessibilityRole="radio" accessibilityState={{ selected: answer === option }} accessibilityLabel={`Operator ${option}`} style={[styles.option, answer === option && styles.optionSelected]}><Text style={[styles.optionText, answer === option && styles.optionTextSelected]}>{option}</Text></Pressable>)}
                  </View>
                ) : (
                  <TextInput key={exercise.id} accessibilityLabel="Mission answer" accessibilityHint={exercise.validation.kind === 'python-lines' ? 'Enter every code line. Indent block lines with spaces.' : multiline ? 'Enter each printed line on a separate line' : 'Type the answer to the Python exercise'}
                    value={answer} onChangeText={(value) => { if (attemptRef.current?.phase !== 'answering') return; setAnswer(value); setIncorrect(false); }}
                    autoCapitalize="none" autoCorrect={false} spellCheck={false} multiline={multiline} numberOfLines={multiline ? 3 : 1}
                    returnKeyType={multiline ? 'default' : 'done'} onSubmitEditing={multiline ? undefined : (event) => submitAnswer(exercise.id, event.nativeEvent.text)} blurOnSubmit={false}
                    maxLength={2000} placeholder={exercise.validation.kind === 'python-lines' ? 'Rewrite the code here…' : multiline ? 'Line 1\nLine 2' : 'Type your answer'} placeholderTextColor="#888BA8" style={[styles.input, multiline && styles.multilineInput]} />
                )}
                <View accessibilityLiveRegion="polite" style={styles.feedbackBox}>
                  {incorrect ? <><Text style={styles.incorrect}>Not quite. Try another spell.</Text><Text style={styles.hint}>{getIncorrectAnswerFeedback(exercise, answer)}</Text></> :
                    <Text style={styles.hint}>Solve all {playable.exercises.length} spells to complete this mission. Progress resets if you leave.</Text>}
                </View>
                <GameButton label="Cast Spell" onPress={() => submitAnswer(exercise.id)} disabled={!answer.trim()} />
              </>
            )}
          </View>}
        </>
      )}
      {spellbookOpen && spellbookEntry ? <Modal visible animationType={reduceMotion ? 'none' : 'slide'} presentationStyle="fullScreen" onRequestClose={() => {
        if (spellbookViewRef.current) spellbookViewRef.current.requestClose();
        else setSpellbookOpen(false);
      }}>
        <SafeAreaView style={styles.spellbookModal} edges={['top', 'bottom']}>
          <SpellbookEntryView ref={spellbookViewRef} key={exercise.id} entry={spellbookEntry} exerciseId={exercise.id} onClose={() => setSpellbookOpen(false)} />
        </SafeAreaView>
      </Modal> : null}
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  learningHeader: { paddingVertical: 12 },
  learningTitle: { fontSize: 22 },
  reviewLesson: { minHeight: 48, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: 12, marginTop: 8, borderRadius: 10, borderWidth: 1, borderColor: '#75659B', backgroundColor: '#322B4A' },
  reviewLessonText: { color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  reviewPressed: { backgroundColor: '#514267' },
  chosenAnswer: { color: colors.green, fontFamily: 'monospace', fontSize: 15, lineHeight: 22, marginTop: 8 },
  topRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  worldLabel: { color: colors.green, fontSize: 9, fontWeight: '900', letterSpacing: 1, flexShrink: 1, textAlign: 'right' },
  headerCard: { borderRadius: 21, backgroundColor: '#17332F', borderWidth: 1, borderColor: '#3F7767', padding: 20 },
  bossHeaderCard: { backgroundColor: '#2A2038', borderColor: '#765D87', paddingVertical: 12, marginTop: 10 },
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
  concept: { flex: 1, color: colors.violet, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  conceptRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  spellbookButton: { minHeight: 48, minWidth: 105, borderRadius: 11, borderWidth: 1, borderColor: colors.gold, backgroundColor: '#3B3151', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9 },
  spellbookButtonText: { color: colors.gold, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  spellbookModal: { flex: 1, backgroundColor: colors.background },
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
  bossResultCard: { borderColor: colors.gold, backgroundColor: '#282037' },
  resultGlyph: { color: colors.gold, fontSize: 59, marginBottom: 7 },
  resultTitle: { color: colors.gold, fontSize: 29, fontWeight: '900', textAlign: 'center', marginTop: 7 },
  bossResultTitle: { fontSize: 25 },
  worldClear: { color: colors.green, fontSize: 17, fontWeight: '900', letterSpacing: 1.3, marginTop: 10, textAlign: 'center' },
  worldCompletion: { color: colors.green, fontSize: 11, fontWeight: '900', letterSpacing: 0.8, marginTop: 17, textAlign: 'center' },
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
