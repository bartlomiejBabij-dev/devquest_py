import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AvatarArt } from '@/components/AvatarArt';
import { GameScreen } from '@/components/GameScreen';
import { HomeNavigationCard } from '@/components/HomeNavigationCard';
import { HydrationPlaceholder } from '@/components/Skeleton';
import { XpProgress } from '@/components/XpProgress';
import { useGame } from '@/game/GameContext';
import { isHydrating } from '@/game/hydration';
import { getPlayerStatistics } from '@/game/profile';
import { useScreenNavigation } from '@/navigation/useScreenNavigation';
import { colors } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useScreenNavigation();
  const { dispatch, onboardingReady, needsOnboarding, profile, profileStatus, progression, progressionStatus } = useGame();
  useEffect(() => {
    if (onboardingReady && needsOnboarding) router.replace('/tutorial');
  }, [onboardingReady, needsOnboarding, router]);
  if (needsOnboarding) return null;
  const pending = isHydrating(profileStatus, progressionStatus);
  const stats = progressionStatus === 'ready' ? getPlayerStatistics(progression) : null;

  return <GameScreen>
    <View style={styles.header}>
      <Text style={styles.eyebrow}>✦  A PYTHON RPG  ✦</Text>
      <Text style={styles.logo}>DEV<Text style={styles.logoAccent}>QUEST</Text></Text>
      <Text style={styles.subtitle}>Your Code Is Your Weapon</Text>
    </View>
    {pending ? <HydrationPlaceholder pending compact label="Loading your adventurer…" /> : <View style={styles.heroCard}>
      <View style={styles.heroRow}><AvatarArt avatarId={profile.avatarId} /><View style={styles.heroCopy}><Text style={styles.tag}>YOUR ADVENTURER</Text><Text style={styles.heroName}>{profile.nickname}</Text><Text style={styles.heroClass}>Python · Forest of Variables</Text></View></View>
      {stats ? <XpProgress totalXp={stats.totalXp} /> : <Text style={styles.subtitle}>Saved statistics are unavailable.</Text>}
    </View>}

    <Pressable accessibilityRole="button" accessibilityLabel="Explore World Map" accessibilityHint="Open the Forest of Variables and choose a mission" onPress={() => navigation.open('/world-map')}
      style={({ pressed }) => [styles.mapButton, pressed && styles.pressed]}>
      <Text accessible={false} style={styles.mapIcon}>✦</Text><View style={styles.mapCopy}><Text style={styles.mapTitle}>Explore World Map</Text><Text style={styles.mapSubtitle}>Your next Python spell awaits</Text></View><Text accessible={false} style={styles.mapArrow}>›</Text>
    </Pressable>

    <Text style={styles.sectionLabel}>PREPARE FOR THE JOURNEY</Text>
    <HomeNavigationCard kind="tutorial" title="Learn Python" subtitle="New to coding? Start with the basics." action="Open Tutorial"
      onPress={() => navigation.open({ pathname: '/tutorial', params: { from: 'home' } })} />
    <HomeNavigationCard kind="spellbook" title="Python Spellbook" subtitle="Explore Python concepts and examples. Add personal notes during missions." action="Browse Spellbook"
      onPress={() => navigation.open('/spellbook')} />
    <HomeNavigationCard kind="profile" title="My Profile" subtitle="Your avatar, nickname, and adventure milestones." action="View Character Sheet"
      onPress={() => navigation.open('/profile')} />

    <Pressable accessibilityRole="button" accessibilityLabel="Play the original Bug Goblin battle" onPress={() => navigation.run(() => { dispatch({ type: 'reset' }); router.navigate('/battle'); })}
      style={({ pressed }) => [styles.practice, pressed && styles.pressed]}>
      <View style={styles.mapCopy}><Text style={styles.practiceTitle}>Bug Goblin Practice</Text><Text style={styles.practiceSubtitle}>The original three-spell encounter</Text></View><Text accessible={false} style={styles.mapArrow}>›</Text>
    </Pressable>
    <Text style={styles.footer}>LEARN A LITTLE. CAST SOMETHING GREAT.</Text>
  </GameScreen>;
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 4, paddingBottom: 20 },
  eyebrow: { color: colors.violet, fontSize: 10, fontWeight: '800', letterSpacing: 3 },
  logo: { marginTop: 7, color: colors.text, fontSize: 36, fontWeight: '900', letterSpacing: 1.2 },
  logoAccent: { color: colors.gold },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 3, letterSpacing: 0.3 },
  heroCard: { backgroundColor: colors.panel, borderRadius: 21, borderWidth: 1, borderColor: colors.border, padding: 17, gap: 17 },
  heroRow: { flexDirection: 'row', gap: 13, alignItems: 'center' },
  heroCopy: { flex: 1, gap: 6 },
  tag: { color: colors.violet, fontSize: 9, fontWeight: '900', letterSpacing: 1.6 },
  heroName: { color: colors.text, fontSize: 19, fontWeight: '900' },
  heroClass: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  mapButton: { minHeight: 76, borderRadius: 17, borderWidth: 1.5, borderColor: colors.green, backgroundColor: '#20443E', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, marginTop: 15 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.85 },
  mapIcon: { color: colors.green, fontSize: 27 },
  mapCopy: { flex: 1, gap: 5 },
  mapTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  mapSubtitle: { color: '#B6DECC', fontSize: 12 },
  mapArrow: { color: colors.gold, fontSize: 27 },
  sectionLabel: { color: colors.violet, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginTop: 25, marginBottom: 12 },
  practice: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 70, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 15, backgroundColor: '#161B32', marginTop: 5 },
  practiceTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  practiceSubtitle: { color: colors.muted, fontSize: 11 },
  footer: { color: '#9A94B0', fontSize: 9, textAlign: 'center', fontWeight: '800', letterSpacing: 1, marginTop: 22 },
});
