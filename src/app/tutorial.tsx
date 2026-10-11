import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { GameButton } from '@/components/GameButton';
import { GameScreen } from '@/components/GameScreen';
import { useGame } from '@/game/GameContext';
import { colors } from '@/theme';

const TOTAL_STEPS = 3;

function BookArt() {
  return (
    <View style={styles.artFrame} accessible={false}>
      <Text style={styles.artStarLeft}>✦</Text>
      <Text style={styles.artStarRight}>✧</Text>
      <View style={styles.artHalo} />
      <View style={styles.flameOuter}>
        <View style={styles.flameInner} />
      </View>
      <View style={styles.book}>
        <View style={styles.bookPage}><Text style={styles.bookRune}>{'{ }'}</Text></View>
        <View style={styles.bookSpine} />
        <View style={styles.bookPage}><Text style={styles.bookRune}>✦</Text></View>
      </View>
      <Text style={styles.artCaption}>THE CODEX OF PYTHON</Text>
    </View>
  );
}

function LessonLine({ symbol, title, description }: { symbol: string; title: string; description: string }) {
  return (
    <View style={styles.lessonLine}>
      <View style={styles.lessonIcon}><Text style={styles.lessonIconText}>{symbol}</Text></View>
      <View style={styles.lessonCopy}>
        <Text style={styles.lessonTitle}>{title}</Text>
        <Text style={styles.lessonDescription}>{description}</Text>
      </View>
    </View>
  );
}

export default function TutorialScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { completeOnboarding } = useGame();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [hasRunCode, setHasRunCode] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [fade] = useState(() => new Animated.Value(1));
  const finishingRef = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      fade.setValue(1);
      return;
    }
    fade.setValue(0);
    const animation = Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [fade, reduceMotion, step]);

  async function finish() {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setIsFinishing(true);
    setSaveError(false);
    try {
      await completeOnboarding();
      if (from === 'home' && router.canGoBack()) router.back();
      else router.replace('/');
    } catch {
      setSaveError(true);
      finishingRef.current = false;
      setIsFinishing(false);
    }
  }

  return (
    <GameScreen>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.eyebrow}>✦  PYTHON PATH</Text>
            <Text style={styles.stepCount}>LESSON {step + 1} OF {TOTAL_STEPS}</Text>
          </View>
          {step < TOTAL_STEPS - 1 ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Skip introduction" disabled={isFinishing} onPress={finish}
              style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}>
              <Text style={styles.skipText}>SKIP  ›</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.progressRow} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: TOTAL_STEPS, now: step + 1 }}>
          {Array.from({ length: TOTAL_STEPS }, (_, index) => (
            <View key={index} style={[styles.progressSegment, index <= step && styles.progressSegmentActive]} />
          ))}
        </View>

        <Animated.View style={[styles.page, { opacity: fade }]}>
          {step === 0 ? (
            <>
              <BookArt />
              <Text style={styles.heading}>Welcome to{'\n'}<Text style={styles.headingAccent}>DevQuest</Text></Text>
              <Text style={styles.lead}>Your adventure starts with a little code and a lot of curiosity.</Text>
              <View style={styles.callout}>
                <Text style={styles.calloutLabel}>WHAT IS PYTHON?</Text>
                <Text style={styles.calloutText}>Python is a programming language used for automation, applications, and AI projects.</Text>
              </View>
            </>
          ) : step === 1 ? (
            <>
              <View style={styles.lessonSigil}><Text style={styles.lessonSigilText}>⌘</Text></View>
              <Text style={styles.heading}>Code Is{'\n'}<Text style={styles.headingAccent}>Your Magic</Text></Text>
              <Text style={styles.lead}>In Python, <Text style={styles.inlineCode}>print()</Text> shows a message on the screen. Put your message between the quotation marks.</Text>
              <View style={styles.codeCard}>
                <View style={styles.codeHeader}><Text style={styles.codeLabel}>YOUR FIRST SPELL</Text><Text style={styles.codePython}>PYTHON</Text></View>
                <Text selectable style={styles.codeText}>{'print('}<Text style={styles.codeString}>{'"Hello, adventurer!"'}</Text>{')'}</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Run the Python example" onPress={() => setHasRunCode(true)}
                style={({ pressed }) => [styles.runButton, pressed && styles.pressed]}>
                <Text style={styles.runIcon}>▶</Text><Text style={styles.runText}>{hasRunCode ? 'RUN AGAIN' : 'RUN CODE'}</Text>
              </Pressable>
              {hasRunCode ? (
                <View style={styles.outputCard} accessibilityLiveRegion="polite">
                  <Text style={styles.outputLabel}>OUTPUT</Text>
                  <Text style={styles.outputText}>Hello, adventurer!</Text>
                  <Text style={styles.outputHint}>Your first Python spell worked. ✦</Text>
                </View>
              ) : (
                <Text style={styles.prompt}>Tap Run Code to see what <Text style={styles.inlineCode}>print()</Text> does.</Text>
              )}
            </>
          ) : (
            <>
              <View style={styles.adventureSigil}><Text style={styles.adventureSigilText}>✦</Text></View>
              <Text style={styles.heading}>Begin Your{'\n'}<Text style={styles.headingAccent}>Adventure</Text></Text>
              <Text style={styles.lead}>Every new spell makes you a stronger Python Pyromancer.</Text>
              <View style={styles.lessonCard}>
                <LessonLine symbol="{ }" title="Solve Python exercises" description="Learn one small idea at a time." />
                <LessonLine symbol="✦" title="Cast spells with code" description="Use what you learn in battle." />
                <LessonLine symbol="★" title="Earn XP" description="Grow as you complete missions." />
                <LessonLine symbol="♛" title="Defeat monsters" description="Your knowledge is your weapon." />
                <LessonLine symbol="↗" title="Unlock new chapters" description="Follow the path through the forest." />
              </View>
            </>
          )}
        </Animated.View>

        <View style={styles.bottom}>
          {saveError ? <Text accessibilityRole="alert" style={styles.error}>Could not save your place. Please try again.</Text> : null}
          {step === 0 ? <GameButton label="Next: Your First Spell" onPress={() => setStep(1)} /> : null}
          {step === 1 ? <GameButton label="Next: Your Adventure" onPress={() => setStep(2)} /> : null}
          {step === 2 ? <GameButton label={isFinishing ? 'Saving…' : 'Start Adventure'} onPress={finish} disabled={isFinishing} /> : null}
          {step > 0 ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Previous lesson" onPress={() => setStep(step - 1)}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
              <Text style={styles.backText}>‹  PREVIOUS LESSON</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 5, paddingBottom: 7 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48 },
  eyebrow: { color: colors.violet, fontSize: 11, fontWeight: '900', letterSpacing: 2.4 },
  stepCount: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 5 },
  skipButton: { minWidth: 70, minHeight: 44, justifyContent: 'center', alignItems: 'flex-end' },
  skipText: { color: colors.gold, fontSize: 12, fontWeight: '900', letterSpacing: 1.1 },
  progressRow: { flexDirection: 'row', gap: 7, marginTop: 12, marginBottom: 17 },
  progressSegment: { flex: 1, height: 5, borderRadius: 4, backgroundColor: '#363655' },
  progressSegmentActive: { backgroundColor: colors.gold },
  page: { flexGrow: 1, alignItems: 'center' },
  artFrame: { width: '100%', maxWidth: 350, height: 218, alignItems: 'center', justifyContent: 'center', borderRadius: 25, backgroundColor: '#1A1C3C', borderWidth: 1, borderColor: '#4A4373', overflow: 'hidden', marginBottom: 23 },
  artHalo: { position: 'absolute', width: 172, height: 172, borderRadius: 86, backgroundColor: '#3E345B', borderWidth: 1, borderColor: '#80689A' },
  artStarLeft: { position: 'absolute', left: 34, top: 37, color: colors.gold, fontSize: 23 },
  artStarRight: { position: 'absolute', right: 35, top: 59, color: colors.violet, fontSize: 26 },
  flameOuter: { width: 44, height: 58, backgroundColor: '#FFD17A', borderTopLeftRadius: 33, borderTopRightRadius: 33, borderBottomLeftRadius: 30, borderBottomRightRadius: 7, transform: [{ rotate: '28deg' }], marginTop: -27, marginBottom: -10, alignItems: 'center', justifyContent: 'flex-end' },
  flameInner: { width: 17, height: 29, backgroundColor: '#FF9D6C', borderTopLeftRadius: 14, borderTopRightRadius: 14, borderBottomLeftRadius: 13, borderBottomRightRadius: 3, marginBottom: 7 },
  book: { width: 137, height: 76, flexDirection: 'row', alignItems: 'stretch', transform: [{ rotate: '-6deg' }], shadowColor: colors.gold, shadowOpacity: 0.45, shadowRadius: 15, elevation: 7 },
  bookPage: { flex: 1, backgroundColor: '#EDDDAE', borderWidth: 5, borderColor: '#B78348', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  bookSpine: { width: 8, backgroundColor: '#9C613D', marginHorizontal: -3, zIndex: 1 },
  bookRune: { color: '#54456F', fontSize: 24, fontWeight: '900' },
  artCaption: { position: 'absolute', bottom: 13, color: '#C4AE83', fontSize: 8, fontWeight: '900', letterSpacing: 2.2 },
  heading: { color: colors.text, fontSize: 35, lineHeight: 39, fontWeight: '900', textAlign: 'center' },
  headingAccent: { color: colors.gold },
  lead: { color: colors.muted, fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 14, maxWidth: 345 },
  callout: { width: '100%', marginTop: 24, backgroundColor: '#262544', borderWidth: 1, borderColor: '#6A5B89', borderRadius: 18, padding: 19 },
  calloutLabel: { color: colors.green, fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  calloutText: { color: colors.text, fontSize: 15, lineHeight: 22, marginTop: 10 },
  lessonSigil: { width: 80, height: 80, borderRadius: 23, backgroundColor: '#3D3262', borderWidth: 2, borderColor: colors.violet, alignItems: 'center', justifyContent: 'center', marginTop: 22, marginBottom: 20 },
  lessonSigilText: { color: colors.gold, fontSize: 49, fontWeight: '900' },
  inlineCode: { color: colors.gold, fontWeight: '800' },
  codeCard: { width: '100%', backgroundColor: '#10172A', borderWidth: 1, borderColor: '#597F78', borderRadius: 17, overflow: 'hidden', marginTop: 25 },
  codeHeader: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1E3840', paddingHorizontal: 15, paddingVertical: 10 },
  codeLabel: { color: colors.green, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  codePython: { color: '#93A7A8', fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  codeText: { color: colors.violet, fontSize: 18, lineHeight: 26, fontWeight: '800', paddingHorizontal: 14, paddingVertical: 18 },
  codeString: { color: colors.gold },
  runButton: { minHeight: 48, minWidth: 143, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 12, backgroundColor: '#275F51', borderWidth: 1, borderColor: colors.green, marginTop: 14, paddingHorizontal: 18 },
  runIcon: { color: colors.green, fontSize: 15 },
  runText: { color: colors.text, fontSize: 12, fontWeight: '900', letterSpacing: 1.1 },
  outputCard: { width: '100%', backgroundColor: '#1B3740', borderWidth: 1, borderColor: '#5CA38D', borderRadius: 16, padding: 16, marginTop: 17 },
  outputLabel: { color: colors.green, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  outputText: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 8 },
  outputHint: { color: '#B6DBCC', fontSize: 11, marginTop: 7 },
  prompt: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 19 },
  adventureSigil: { width: 83, height: 83, borderRadius: 24, backgroundColor: '#4A354E', borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginTop: 18, marginBottom: 20 },
  adventureSigilText: { color: colors.gold, fontSize: 50 },
  lessonCard: { width: '100%', backgroundColor: '#222542', borderWidth: 1, borderColor: '#5A5577', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginTop: 24 },
  lessonLine: { flexDirection: 'row', alignItems: 'center', minHeight: 65, gap: 12, borderBottomWidth: 1, borderColor: '#3C405E', paddingVertical: 9 },
  lessonIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#414365', alignItems: 'center', justifyContent: 'center' },
  lessonIconText: { color: colors.gold, fontSize: 15, fontWeight: '900' },
  lessonCopy: { flex: 1 },
  lessonTitle: { color: colors.text, fontSize: 13, fontWeight: '900' },
  lessonDescription: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 2 },
  bottom: { width: '100%', paddingTop: 26, marginTop: 'auto' },
  backButton: { minHeight: 45, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  backText: { color: colors.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  error: { color: colors.red, fontSize: 12, textAlign: 'center', marginBottom: 10 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
});
