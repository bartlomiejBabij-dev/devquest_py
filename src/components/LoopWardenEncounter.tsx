import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LOOP_WARDEN_DAMAGE, LOOP_WARDEN_MAX_HP } from '@/game/boss';
import { colors } from '@/theme';

/** Original crystal-and-stone artwork. Animation values only present validated HP. */
export function LoopWardenEncounter({ hp, hitCount, showDamage, reducedMotion }: {
  hp: number; hitCount: number; showDamage: boolean; reducedMotion: boolean;
}) {
  const [health] = useState(() => new Animated.Value(hp));
  const [impact] = useState(() => new Animated.Value(0));
  const [release] = useState(() => new Animated.Value(hp === 0 ? 1 : 0));
  useEffect(() => {
    if (reducedMotion || hitCount === 0) {
      health.setValue(hp); impact.setValue(0); release.setValue(hp === 0 ? 1 : 0);
      return;
    }
    impact.setValue(0);
    const animation = Animated.parallel([
      Animated.timing(health, { toValue: hp, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(impact, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.timing(release, { toValue: hp === 0 ? 1 : 0, duration: 780, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [health, hp, hitCount, impact, reducedMotion, release]);

  return <View style={styles.arena}>
    <View style={styles.heading}>
      <View style={styles.nameBlock}><Text style={styles.eyebrow}>∞  CAVERNS FINAL BOSS</Text><Text style={styles.name}>The Loop Warden</Text></View>
      <Text style={styles.hp} accessibilityLiveRegion="polite">{hp} / {LOOP_WARDEN_MAX_HP} HP</Text>
    </View>
    <View style={styles.scene}>
      <Text style={styles.rune}>⟲</Text>
      <Animated.View accessible accessibilityLabel={hp === 0 ? 'The Loop Warden defeated, crystal heart freed' : 'Dark stone armor surrounding a cyan crystal heart and looping runes'} style={[styles.warden, {
        opacity: release.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] }),
        transform: [{ translateX: impact.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 1], outputRange: [0, -7, 7, -3, 0] }) },
          { translateY: release.interpolate({ inputRange: [0, 1], outputRange: [0, 9] }) }],
      }]}>
        <View style={styles.orbit}><Text style={styles.orbitRune}>∞</Text></View>
        <View style={[styles.pauldron, styles.leftArmor]} /><View style={[styles.pauldron, styles.rightArmor]} />
        <View style={styles.helmet}><View style={styles.visor} /></View>
        <View style={styles.chest} />
        <View style={styles.crystal}><View style={styles.crystalFacet} /></View>
      </Animated.View>
      <Text style={styles.rune}>⟳</Text>
      {showDamage ? <Animated.Text style={[styles.damage, !reducedMotion && {
        opacity: impact.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] }),
        transform: [{ translateY: impact.interpolate({ inputRange: [0, 1], outputRange: [5, -22] }) }],
      }]}>−{LOOP_WARDEN_DAMAGE} HP</Animated.Text> : null}
    </View>
    <View style={styles.track} accessibilityRole="progressbar" accessibilityLabel="Loop Warden health" accessibilityValue={{ min: 0, max: LOOP_WARDEN_MAX_HP, now: hp }}>
      <Animated.View style={[styles.fill, { width: health.interpolate({ inputRange: [0, LOOP_WARDEN_MAX_HP], outputRange: ['0%', '100%'] }) }]} />
    </View>
    <Text style={styles.footer} accessibilityLiveRegion="polite">{hp === 0 ? 'WARDEN DEFEATED · THE CRYSTAL HEART IS FREE' : 'FIVE RUNES · BREAK THE ETERNAL LOOP'}</Text>
  </View>;
}

const styles = StyleSheet.create({
  arena: { marginTop: 3, borderRadius: 21, borderWidth: 1.5, borderColor: '#70E3EA', backgroundColor: '#152936', padding: 14, overflow: 'hidden' },
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  nameBlock: { flexShrink: 1 },
  eyebrow: { color: '#70E3EA', fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  name: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 3 },
  hp: { color: '#A8FAF5', fontSize: 13, fontWeight: '900' },
  scene: { height: 104, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24 },
  rune: { color: colors.violet, fontSize: 32 },
  warden: { width: 116, height: 100, alignItems: 'center' },
  orbit: { position: 'absolute', top: 0, width: 98, height: 93, borderRadius: 48, borderWidth: 2, borderColor: '#7975B7', alignItems: 'center' },
  orbitRune: { color: '#A8FAF5', fontSize: 23, lineHeight: 25 },
  pauldron: { position: 'absolute', top: 43, width: 32, height: 47, borderWidth: 3, borderColor: '#627B8A', backgroundColor: '#253B4C' },
  leftArmor: { left: 1, transform: [{ rotate: '12deg' }] },
  rightArmor: { right: 1, transform: [{ rotate: '-12deg' }] },
  helmet: { position: 'absolute', top: 24, width: 49, height: 30, backgroundColor: '#283541', borderWidth: 3, borderColor: '#657B88', borderTopLeftRadius: 12, borderTopRightRadius: 12, alignItems: 'center', justifyContent: 'center' },
  visor: { height: 4, width: 27, backgroundColor: '#A8FAF5' },
  chest: { position: 'absolute', top: 52, width: 64, height: 43, backgroundColor: '#263544', borderWidth: 3, borderColor: '#7C76A6', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  crystal: { position: 'absolute', top: 56, width: 27, height: 32, transform: [{ rotate: '45deg' }], backgroundColor: '#43D8E0', borderColor: '#B0FFFF', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  crystalFacet: { width: 10, height: 21, backgroundColor: '#B0FFFF' },
  damage: { position: 'absolute', right: 4, top: 30, color: '#A8FAF5', fontSize: 17, fontWeight: '900' },
  track: { height: 12, borderRadius: 7, borderWidth: 1, borderColor: '#85C4D5', backgroundColor: '#101426', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#43D8E0' },
  footer: { marginTop: 8, color: '#A8FAF5', fontSize: 9, fontWeight: '800', textAlign: 'center', letterSpacing: 0.7 },
});
