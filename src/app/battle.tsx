import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Keyboard, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { CharacterArt } from '@/components/CharacterArt';
import { GameButton } from '@/components/GameButton';
import { GameScreen } from '@/components/GameScreen';
import { NavigationButton } from '@/components/NavigationButton';
import { useCombatAnimations } from '@/components/useCombatAnimations';
import { useGame } from '@/game/GameContext';
import { challenges } from '@/game/challenges';
import { battleReducer, ENEMY_MAX_HP } from '@/game/battle';
import { useGameAudio } from '@/audio/AudioProvider';
import { useScreenBack, useScreenNavigation } from '@/navigation/useScreenNavigation';
import { colors } from '@/theme';

export default function BattleScreen() {
  const audio = useGameAudio();
  const audioRef = useRef(audio);
  useEffect(() => { audioRef.current = audio; }, [audio]);
  const router = useRouter();
  const navigation = useScreenNavigation();
  function goHome() { navigation.returnTo('/'); }
  useScreenBack(goHome);
  const { height, width } = useWindowDimensions();
  const compact = height < 960 || width < 360;
  const { battle, dispatch } = useGame();
  const [answer, setAnswer] = useState('');
  const submitting = useRef(false);
  const challenge = challenges[Math.min(battle.challengeIndex, challenges.length - 1)];
  const effects = useCombatAnimations(battle);
  const casting = battle.result === 'correct';

  useEffect(() => {
    submitting.current = false;
  }, [battle.challengeIndex]);

  useEffect(() => {
    if (!casting) return;
    const timer = setTimeout(() => {
      if (battle.enemyHp === 0) { audioRef.current.playEffect('victory', battle); router.replace('/victory'); }
      else {
        setAnswer('');
        dispatch({ type: 'advance' });
      }
    }, 930);
    return () => clearTimeout(timer);
  }, [casting, battle, dispatch, router]);

  function castSpell() {
    if (casting || submitting.current) return;
    submitting.current = true;
    const outcome = battleReducer(battle, { type: 'submit', answer });
    if (outcome !== battle) audio.playEffect(outcome.result === 'correct' ? 'correct' : 'incorrect', outcome);
    dispatch({ type: 'submit', answer });
    Keyboard.dismiss();
  }

  return (
    <GameScreen compact={compact} scrollToEndOnKeyboard header={
      <View style={styles.topBar}>
        <NavigationButton label="Exit Battle" accessibilityLabel="Exit battle to Home" onPress={goHome} />
        <Text style={styles.room}>THE FIRST ENCOUNTER</Text>
      </View>
    }>
      <View style={[styles.enemyCard, compact && styles.enemyCardCompact]}>
        <Text style={styles.enemyTag}>✦  WILD ENEMY  ✦</Text>
        <View style={[styles.artArea, compact && styles.artAreaCompact]}>
          <Animated.View style={effects.enemyStyle}><CharacterArt kind="goblin" compact={compact} defeated={battle.enemyHp === 0} /></Animated.View>
          <Animated.View pointerEvents="none" style={[styles.castEffect, effects.castStyle]}><Text style={styles.castGlyph}>✦</Text></Animated.View>
          <Animated.View pointerEvents="none" style={[styles.floatingDamage, effects.floatingStyle]}><Text style={styles.damageText}>−10 HP</Text></Animated.View>
        </View>
        <Text style={styles.enemyName}>Bug Goblin</Text>
        <View style={styles.hpRow}><Text style={styles.hpLabel}>ENEMY HP</Text><Text style={styles.hpValue}>{battle.enemyHp} / {ENEMY_MAX_HP}</Text></View>
        <View style={styles.hpTrack} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: ENEMY_MAX_HP, now: battle.enemyHp }}>
          <Animated.View style={[styles.hpFill, effects.hpStyle]} />
          <Animated.View pointerEvents="none" style={[styles.hpHighlight, effects.hpGlowStyle]} />
        </View>
      </View>

      <View style={[styles.playerRow, compact && styles.playerRowCompact]}>
        <View style={styles.avatar}><Text style={styles.avatarText}>✦</Text></View>
        <View style={styles.playerDetails}><Text style={styles.playerName}>Python Pyromancer</Text><Text style={styles.playerLevel}>LEVEL 1  ·  SPELLCASTER</Text></View>
        <View style={styles.progressPills} accessibilityLabel={`Mission ${challenge.id} of 3`}>
          {challenges.map((item) => <View key={item.id} style={[styles.pill, item.id <= challenge.id && styles.pillActive]} />)}
        </View>
      </View>

      <View style={[styles.missionCard, compact && styles.missionCardCompact]}>
        <Text style={styles.chapter}>SPELL {challenge.id} OF 3</Text>
        <Text style={styles.missionTitle}>{challenge.title}</Text>
        <Text style={styles.description}>{challenge.mission}</Text>
        <View style={styles.codeBox}><Text style={styles.codeLabel}>PYTHON SPELL</Text><Text selectable style={styles.code}>{challenge.code}</Text></View>
        <Text style={styles.inputLabel}>FILL IN THE BLANK</Text>
        <Animated.View style={[styles.inputShell, effects.inputStyle]}>
          <TextInput accessibilityLabel="Missing Python code" accessibilityHint="Type the code that replaces the underscores" autoCapitalize="none" autoCorrect={false} spellCheck={false}
            value={answer} onChangeText={(text) => { submitting.current = false; setAnswer(text); }} editable={!casting} onSubmitEditing={castSpell} returnKeyType="done" blurOnSubmit={false}
            placeholder="Type your answer here" placeholderTextColor="#888BA8" style={styles.input} />
        </Animated.View>
        <View style={styles.feedbackBox} accessibilityLiveRegion="polite"><Text style={[styles.feedback, casting ? styles.correct : battle.result === 'incorrect' ? styles.incorrect : null]}>{battle.feedback || 'Complete the code to cast your spell.'}</Text></View>
        <GameButton label={casting ? 'Casting…' : 'Cast Spell'} onPress={castSpell} disabled={casting} />
      </View>
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { minHeight: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  room: { color: colors.violet, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, flexShrink: 1, textAlign: 'right' },
  enemyCard: { backgroundColor: '#1B1B35', borderWidth: 1, borderColor: '#4A375B', borderRadius: 23, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 17, alignItems: 'center' },
  enemyCardCompact: { paddingTop: 9, paddingBottom: 13 },
  enemyTag: { color: colors.red, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  artArea: { height: 205, width: 220, alignItems: 'center', justifyContent: 'center' },
  artAreaCompact: { height: 142 },
  castEffect: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#BD92FF', alignItems: 'center', justifyContent: 'center' },
  castGlyph: { color: '#FFF4BE', fontSize: 67, lineHeight: 80 },
  floatingDamage: { position: 'absolute', top: 30, alignSelf: 'center', backgroundColor: '#F5C075', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 9 },
  damageText: { color: '#39243A', fontSize: 17, fontWeight: '900' },
  enemyName: { color: colors.text, fontSize: 21, fontWeight: '900', marginTop: -3 },
  hpRow: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  hpLabel: { color: colors.muted, fontSize: 10, letterSpacing: 1.5, fontWeight: '900' },
  hpValue: { color: colors.red, fontSize: 11, fontWeight: '900' },
  hpTrack: { alignSelf: 'stretch', height: 10, borderRadius: 8, backgroundColor: '#100F24', overflow: 'hidden', marginTop: 7 },
  hpFill: { height: '100%', borderRadius: 8, backgroundColor: colors.red },
  hpHighlight: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#FFE6AB' },
  playerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, gap: 10 },
  playerRowCompact: { paddingVertical: 10 },
  avatar: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#5E5191', borderWidth: 1, borderColor: colors.violet, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.gold, fontSize: 23 },
  playerDetails: { flex: 1 },
  playerName: { color: colors.text, fontSize: 13, fontWeight: '800' },
  playerLevel: { color: colors.muted, fontSize: 9, letterSpacing: 1, marginTop: 3 },
  progressPills: { flexDirection: 'row', gap: 4, paddingVertical: 10 },
  pill: { width: 13, height: 5, borderRadius: 3, backgroundColor: '#4B4969' },
  pillActive: { backgroundColor: colors.gold },
  missionCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 19, marginBottom: 12 },
  missionCardCompact: { padding: 15 },
  chapter: { color: colors.violet, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  missionTitle: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 5 },
  description: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  codeBox: { backgroundColor: '#10142C', borderRadius: 14, borderWidth: 1, borderColor: '#373C62', padding: 13, marginTop: 13 },
  codeLabel: { color: '#9EA3C8', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8 },
  code: { color: '#B6F0D4', fontFamily: 'monospace', fontSize: 14, lineHeight: 21 },
  inputLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginTop: 14, marginBottom: 7 },
  inputShell: { minHeight: 52, borderWidth: 1.5, borderRadius: 12, justifyContent: 'center' },
  input: { minHeight: 49, color: colors.text, fontFamily: 'monospace', fontSize: 16, paddingHorizontal: 14, paddingVertical: 8 },
  feedbackBox: { minHeight: 43, justifyContent: 'center' },
  feedback: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  correct: { color: colors.green, fontWeight: '800' },
  incorrect: { color: colors.orange },
});
