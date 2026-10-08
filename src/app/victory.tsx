import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { CharacterArt } from '@/components/CharacterArt';
import { GameButton } from '@/components/GameButton';
import { GameScreen } from '@/components/GameScreen';
import { useGame } from '@/game/GameContext';
import { colors } from '@/theme';

export default function VictoryScreen() {
  const router = useRouter();
  const { dispatch } = useGame();
  const reduceMotion = useReducedMotion();
  const [entrance] = useState(() => new Animated.Value(0));
  const [sparkle] = useState(() => new Animated.Value(0));
  const [rewardReveal] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) {
      entrance.setValue(1);
      sparkle.setValue(1);
      rewardReveal.setValue(1);
      return;
    }
    Animated.spring(entrance, { toValue: 1, friction: 5, tension: 55, useNativeDriver: true }).start();
    Animated.timing(rewardReveal, { toValue: 1, duration: 420, delay: 350, useNativeDriver: true }).start();
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(sparkle, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(sparkle, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [entrance, sparkle, rewardReveal, reduceMotion]);

  return (
    <GameScreen>
      <View style={styles.center}>
        <Text style={styles.eyebrow}>✦  QUEST COMPLETE  ✦</Text>
        <Animated.View style={{ transform: [{ scale: entrance }], opacity: entrance }}>
          <View style={styles.crown}><Text style={styles.crownText}>✦</Text></View>
          <Text style={styles.title}>BOSS{'\n'}DEFEATED!</Text>
        </Animated.View>
        <Animated.View style={{ opacity: sparkle, transform: [{ scale: sparkle.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }) }] }}><Text style={styles.stars}>✧  ✦  ✧</Text></Animated.View>
        <View style={styles.enemyFrame}><CharacterArt kind="goblin" defeated /><Text style={styles.defeatLabel}>BUG GOBLIN VANQUISHED</Text></View>
        <Text style={styles.message}>Your Python spells were a success. The path ahead is clear, Pyromancer!</Text>
        <Animated.View style={[styles.reward, { opacity: rewardReveal, transform: [{ translateY: rewardReveal.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }]}><Text style={styles.rewardIcon}>✦</Text><View><Text style={styles.rewardLabel}>QUEST REWARD</Text><Text style={styles.rewardValue}>+100 XP</Text></View></Animated.View>
      </View>
      <View style={styles.bottom}><GameButton label="Play Again" onPress={() => { dispatch({ type: 'reset' }); router.replace('/battle'); }} /><Text style={styles.footer}>THE ADVENTURE BEGINS WITH CODE</Text></View>
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingTop: 24 }, eyebrow: { color: colors.violet, fontSize: 11, fontWeight: '900', letterSpacing: 2.4 },
  crown: { alignSelf: 'center', backgroundColor: '#3C3454', width: 58, height: 58, borderRadius: 19, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginTop: 20 }, crownText: { color: colors.gold, fontSize: 36 },
  title: { color: colors.gold, fontSize: 42, lineHeight: 44, fontWeight: '900', textAlign: 'center', letterSpacing: 1.5, marginTop: 15 },
  stars: { color: colors.violet, fontSize: 24, letterSpacing: 15, marginTop: 15 },
  enemyFrame: { marginTop: 12, alignItems: 'center', backgroundColor: '#1B1B35', borderWidth: 1, borderColor: '#473B5C', borderRadius: 23, paddingHorizontal: 42, paddingBottom: 17 },
  defeatLabel: { color: colors.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  message: { color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 19, maxWidth: 295 },
  reward: { flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: '#302941', borderColor: '#725D56', borderWidth: 1, borderRadius: 17, paddingVertical: 13, paddingHorizontal: 22, marginTop: 22, minWidth: 215 },
  rewardIcon: { color: colors.gold, fontSize: 37 }, rewardLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.6 }, rewardValue: { color: colors.gold, fontSize: 24, fontWeight: '900', marginTop: 2 },
  bottom: { marginTop: 'auto', paddingTop: 30 }, footer: { color: '#747797', textAlign: 'center', fontSize: 10, fontWeight: '800', letterSpacing: 1.6, marginTop: 15 },
});
