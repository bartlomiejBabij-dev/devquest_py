import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { DECISION_KEEPER_DAMAGE, DECISION_KEEPER_MAX_HP } from '@/game/boss';
import { colors } from '@/theme';

/** Original stone-and-rune guardian drawn with local shapes. All state comes from the attempt. */
export function DecisionKeeperEncounter({ hp, hitCount, showDamage, reducedMotion }: {
  hp: number; hitCount: number; showDamage: boolean; reducedMotion: boolean;
}) {
  const [health] = useState(() => new Animated.Value(hp));
  const [impact] = useState(() => new Animated.Value(0));
  const [fall] = useState(() => new Animated.Value(hp === 0 ? 1 : 0));
  useEffect(() => {
    if (reducedMotion || hitCount === 0) {
      health.setValue(hp); impact.setValue(0); fall.setValue(hp === 0 ? 1 : 0);
      return;
    }
    impact.setValue(0);
    const animation = Animated.parallel([
      Animated.timing(health, { toValue: hp, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(impact, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.timing(fall, { toValue: hp === 0 ? 1 : 0, duration: 780, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [fall, health, hitCount, hp, impact, reducedMotion]);
  return <View style={styles.arena}>
    <View style={styles.heading}>
      <View style={styles.nameBlock}><Text style={styles.eyebrow}>✧  VALLEY FINAL BOSS</Text><Text style={styles.name}>The Decision Keeper</Text></View>
      <Text style={styles.hp} accessibilityLiveRegion="polite">{hp} / {DECISION_KEEPER_MAX_HP} HP</Text>
    </View>
    <View style={styles.scene}>
      <Text style={styles.sideRune}>◇</Text>
      <Animated.View accessible accessibilityLabel={hp === 0 ? 'The Decision Keeper defeated' : 'Ancient stone guardian with a glowing rune core'} style={[styles.guardian, {
        opacity: fall.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }),
        transform: [{ translateX: impact.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 1], outputRange: [0, -8, 8, -3, 0] }) },
          { scale: fall.interpolate({ inputRange: [0, 1], outputRange: [1, 0.86] }) }],
      }]}>
        <View style={styles.halo}><Text style={styles.haloRune}>✧</Text></View>
        <View style={styles.shoulders} />
        <View style={styles.head}><View style={styles.eyes}><View style={styles.eye} /><View style={styles.eye} /></View></View>
        <View style={styles.core}><Text style={styles.coreRune}>◈</Text></View>
      </Animated.View>
      <Text style={styles.sideRune}>◇</Text>
      {showDamage ? <Animated.Text style={[styles.damage, !reducedMotion && {
        opacity: impact.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] }),
        transform: [{ translateY: impact.interpolate({ inputRange: [0, 1], outputRange: [5, -22] }) }],
      }]}>−{DECISION_KEEPER_DAMAGE} HP</Animated.Text> : null}
    </View>
    <View style={styles.track} accessibilityRole="progressbar" accessibilityLabel="Decision Keeper health" accessibilityValue={{ min: 0, max: DECISION_KEEPER_MAX_HP, now: hp }}>
      <Animated.View style={[styles.fill, { width: health.interpolate({ inputRange: [0, DECISION_KEEPER_MAX_HP], outputRange: ['0%', '100%'] }) }]} />
    </View>
    <Text style={styles.footer} accessibilityLiveRegion="polite">{hp === 0 ? 'KEEPER DEFEATED · THE VALLEY AWAKENS' : 'FIVE SEALS · FIVE SPELLS OF LOGIC'}</Text>
  </View>;
}

const styles = StyleSheet.create({
  arena: { marginTop: 3, borderRadius: 21, borderWidth: 1.5, borderColor: colors.gold, backgroundColor: '#20283C', padding: 14, overflow: 'hidden' },
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  nameBlock: { flexShrink: 1 },
  eyebrow: { color: colors.gold, fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  name: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 3 },
  hp: { color: colors.green, fontSize: 13, fontWeight: '900' },
  scene: { height: 104, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 30 },
  sideRune: { color: colors.violet, fontSize: 28 },
  guardian: { width: 106, height: 100, alignItems: 'center' },
  halo: { position: 'absolute', top: 0, width: 78, height: 78, borderRadius: 39, borderWidth: 2, borderColor: '#AE91D0', alignItems: 'center' },
  haloRune: { color: colors.gold, fontSize: 21 },
  shoulders: { position: 'absolute', bottom: 3, width: 103, height: 42, backgroundColor: '#5B6685', borderColor: '#A6A2BC', borderWidth: 3, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  head: { position: 'absolute', top: 27, width: 57, height: 43, borderWidth: 3, borderColor: '#BBABC8', backgroundColor: '#625D7B', borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  eyes: { flexDirection: 'row', gap: 15 },
  eye: { width: 7, height: 6, backgroundColor: colors.green },
  core: { position: 'absolute', top: 62, width: 51, height: 35, borderWidth: 2, borderColor: colors.gold, backgroundColor: '#35334F', alignItems: 'center', justifyContent: 'center' },
  coreRune: { color: colors.green, fontSize: 27, lineHeight: 31 },
  damage: { position: 'absolute', right: 4, top: 30, color: colors.gold, fontSize: 17, fontWeight: '900' },
  track: { height: 12, borderRadius: 7, borderWidth: 1, borderColor: '#B8A0CF', backgroundColor: '#101426', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.green },
  footer: { marginTop: 8, color: colors.gold, fontSize: 9, fontWeight: '800', textAlign: 'center', letterSpacing: 0.7 },
});
