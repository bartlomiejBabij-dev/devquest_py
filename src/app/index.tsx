import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CharacterArt } from '@/components/CharacterArt';
import { GameButton } from '@/components/GameButton';
import { GameScreen } from '@/components/GameScreen';
import { useGame } from '@/game/GameContext';
import { colors } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { dispatch, onboardingReady, needsOnboarding } = useGame();
  useEffect(() => {
    if (onboardingReady && needsOnboarding) router.replace('/tutorial');
  }, [onboardingReady, needsOnboarding, router]);

  if (needsOnboarding) return null;

  return (
    <GameScreen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>✦  A PYTHON RPG  ✦</Text>
        <Text style={styles.logo}>DEV<Text style={styles.logoAccent}>QUEST</Text></Text>
        <Text style={styles.subtitle}>Your Code Is Your Weapon</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Learn Python" onPress={() => router.push({ pathname: '/tutorial', params: { from: 'home' } })}
          style={({ pressed }) => [styles.learnButton, pressed && styles.mapButtonPressed]}>
          <Text style={styles.learnButtonText}>✦  Learn Python</Text>
        </Pressable>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.cardTop}><Text style={styles.tag}>YOUR HERO</Text><Text style={styles.level}>LVL 01</Text></View>
        <CharacterArt kind="hero" />
        <Text style={styles.heroName}>Python Pyromancer</Text>
        <Text style={styles.heroClass}>Apprentice of the Arcane Syntax</Text>
        <View style={styles.xpRow}><Text style={styles.xpLabel}>EXPERIENCE</Text><Text style={styles.xpValue}>0 / 100 XP</Text></View>
        <View style={styles.xpTrack}><View style={styles.xpFill} /></View>
      </View>

      <View style={styles.intro}><Text style={styles.introIcon}>✧</Text><Text style={styles.introText}>A Bug Goblin blocks your path. Complete three tiny Python spells to defeat it and claim your first victory.</Text></View>
      <View style={styles.bottom}>
        <Pressable accessibilityRole="button" accessibilityLabel="Explore World Map" onPress={() => router.push('/world-map')}
          style={({ pressed }) => [styles.mapButton, pressed && styles.mapButtonPressed]}>
          <Text style={styles.mapButtonIcon}>✦</Text><Text style={styles.mapButtonLabel}>Explore World Map</Text><Text style={styles.mapButtonArrow}>›</Text>
        </Pressable>
        <GameButton label="Start Adventure" onPress={() => { dispatch({ type: 'reset' }); router.push('/battle'); }} />
        <Text style={styles.footer}>THREE SPELLS  ·  ONE EPIC BATTLE</Text>
      </View>
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 10, paddingBottom: 25 },
  eyebrow: { color: colors.violet, fontSize: 11, fontWeight: '800', letterSpacing: 3 },
  logo: { marginTop: 10, color: colors.text, fontSize: 40, fontWeight: '900', letterSpacing: 1.2 },
  logoAccent: { color: colors.gold }, subtitle: { color: colors.muted, fontSize: 15, marginTop: 3, letterSpacing: 0.5 },
  heroCard: { backgroundColor: colors.panel, borderRadius: 24, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 22, paddingTop: 17, paddingBottom: 21, alignItems: 'center' },
  cardTop: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' },
  tag: { color: colors.violet, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  level: { color: colors.gold, fontSize: 12, fontWeight: '900', backgroundColor: '#39314B', borderRadius: 8, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5 },
  heroName: { color: colors.text, fontSize: 23, fontWeight: '900', marginTop: 2 },
  heroClass: { color: colors.muted, fontSize: 12, marginTop: 5 },
  xpRow: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', marginTop: 22 },
  xpLabel: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.7 },
  xpValue: { color: colors.gold, fontSize: 11, fontWeight: '800' },
  xpTrack: { alignSelf: 'stretch', height: 9, borderRadius: 8, backgroundColor: '#11152C', marginTop: 8, overflow: 'hidden' },
  xpFill: { width: '2%', height: '100%', borderRadius: 8, backgroundColor: colors.gold },
  intro: { flexDirection: 'row', alignItems: 'center', marginTop: 20, backgroundColor: '#171B36', borderRadius: 16, padding: 17, gap: 12, borderWidth: 1, borderColor: '#35385C' },
  introIcon: { color: colors.gold, fontSize: 28 }, introText: { flex: 1, color: colors.muted, lineHeight: 20, fontSize: 13 },
  bottom: { marginTop: 'auto', paddingTop: 25 }, footer: { color: '#747797', textAlign: 'center', fontSize: 10, fontWeight: '800', letterSpacing: 1.8, marginTop: 15 },
  mapButton: { minHeight: 58, borderRadius: 16, borderWidth: 1.5, borderColor: colors.green, backgroundColor: '#1D393A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 12, paddingHorizontal: 22 },
  mapButtonPressed: { transform: [{ scale: 0.98 }], opacity: 0.85 },
  mapButtonIcon: { color: colors.green, fontSize: 19 },
  mapButtonLabel: { color: colors.text, fontSize: 16, fontWeight: '900' },
  mapButtonArrow: { color: colors.green, fontSize: 27, position: 'absolute', right: 18, top: 10 },
  learnButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  learnButtonText: { color: colors.gold, fontSize: 13, fontWeight: '800', letterSpacing: 0.6 },
});
