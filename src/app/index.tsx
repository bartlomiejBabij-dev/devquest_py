import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { CharacterArt } from '@/components/CharacterArt';
import { GameButton } from '@/components/GameButton';
import { GameScreen } from '@/components/GameScreen';
import { useGame } from '@/game/GameContext';
import { colors } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { dispatch } = useGame();
  return (
    <GameScreen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>✦  A PYTHON RPG  ✦</Text>
        <Text style={styles.logo}>DEV<Text style={styles.logoAccent}>QUEST</Text></Text>
        <Text style={styles.subtitle}>Your Code Is Your Weapon</Text>
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
      <View style={styles.bottom}><GameButton label="Start Adventure" onPress={() => { dispatch({ type: 'reset' }); router.push('/battle'); }} /><Text style={styles.footer}>THREE SPELLS  ·  ONE EPIC BATTLE</Text></View>
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
});
