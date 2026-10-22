import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { TREASURE_GUARDIAN_DAMAGE, TREASURE_GUARDIAN_MAX_HP } from '@/game/boss';
import { colors } from '@/theme';

/** Original stone vault and island crystals; animation only presents validated HP. */
export function TreasureGuardianEncounter({ hp, hitCount, showDamage, reducedMotion }: {
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
      Animated.timing(health, { toValue: hp, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(impact, { toValue: 1, duration: 620, useNativeDriver: true }),
      Animated.timing(release, { toValue: hp === 0 ? 1 : 0, duration: 780, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [health, hp, hitCount, impact, reducedMotion, release]);

  return <View style={styles.arena}>
    <View style={styles.heading}>
      <View style={styles.nameBlock}><Text style={styles.eyebrow}>◇  ARCHIPELAGO FINAL BOSS</Text><Text style={styles.name}>The Treasure Guardian</Text></View>
      <Text style={styles.hp} accessibilityLiveRegion="polite">{hp} / {TREASURE_GUARDIAN_MAX_HP} HP</Text>
    </View>
    <View style={styles.scene}>
      <View style={[styles.islandCrystal, styles.leftCrystal]} /><View style={[styles.islandCrystal, styles.rightCrystal]} />
      <Animated.View accessible accessibilityLabel={hp === 0 ? 'Treasure Guardian defeated: the vault opens and its golden core rises' : 'Ancient stone and gold vault guardian with a glowing core and turquoise crystals'} style={[styles.guardian, {
        transform: [{ translateX: impact.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 1], outputRange: [0, -6, 6, -3, 0] }) }],
      }]}>
        <Animated.View style={[styles.armor, { opacity: release.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }) }]}>
          <View style={[styles.shoulder, styles.leftShoulder]} /><View style={[styles.shoulder, styles.rightShoulder]} />
          <View style={styles.vault}><View style={styles.goldBand} /></View>
          <Animated.View style={[styles.lid, { transform: [{ translateY: release.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) }] }]}>
            <View style={styles.eye} /><View style={styles.eye} />
          </Animated.View>
        </Animated.View>
        <Animated.View style={[styles.coreHalo, { transform: [{ translateY: release.interpolate({ inputRange: [0, 1], outputRange: [0, -23] }) }, { scale: release.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }] }]}>
          <View style={styles.core}><View style={styles.coreLight} /></View>
        </Animated.View>
      </Animated.View>
      {showDamage ? <Animated.Text style={[styles.damage, !reducedMotion && {
        opacity: impact.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] }),
        transform: [{ translateY: impact.interpolate({ inputRange: [0, 1], outputRange: [5, -20] }) }],
      }]}>−{TREASURE_GUARDIAN_DAMAGE} HP</Animated.Text> : null}
    </View>
    <View style={styles.track} accessibilityRole="progressbar" accessibilityLabel="Treasure Guardian health" accessibilityValue={{ min: 0, max: TREASURE_GUARDIAN_MAX_HP, now: hp }}>
      <Animated.View style={[styles.fill, { width: health.interpolate({ inputRange: [0, TREASURE_GUARDIAN_MAX_HP], outputRange: ['0%', '100%'] }) }]} />
    </View>
    <Text style={styles.footer} accessibilityLiveRegion="polite">{hp === 0 ? 'GUARDIAN DEFEATED · THE GOLDEN CORE IS FREE' : 'FIVE SEALS · UNLOCK THE ANCIENT VAULT'}</Text>
  </View>;
}

const styles = StyleSheet.create({
  arena: { marginTop: 3, borderRadius: 21, borderWidth: 1.5, borderColor: colors.gold, backgroundColor: '#142D31', padding: 14, overflow: 'hidden' },
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  nameBlock: { flexShrink: 1 },
  eyebrow: { color: '#76E9D4', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  name: { color: colors.text, fontSize: 19, fontWeight: '900', marginTop: 3 },
  hp: { color: colors.gold, fontSize: 13, fontWeight: '900' },
  scene: { height: 112, alignItems: 'center', justifyContent: 'center' },
  guardian: { width: 148, height: 100 },
  armor: { width: '100%', height: '100%' },
  shoulder: { position: 'absolute', top: 42, width: 29, height: 46, backgroundColor: '#37504B', borderWidth: 3, borderColor: '#C5A55D' },
  leftShoulder: { left: 0, transform: [{ rotate: '10deg' }] },
  rightShoulder: { right: 0, transform: [{ rotate: '-10deg' }] },
  vault: { position: 'absolute', left: 26, top: 42, width: 96, height: 53, backgroundColor: '#34413E', borderWidth: 4, borderColor: '#C5A55D', borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  goldBand: { position: 'absolute', left: 38, width: 12, height: '100%', backgroundColor: '#9A8048' },
  lid: { position: 'absolute', top: 19, left: 24, width: 100, height: 30, borderWidth: 4, borderColor: '#E6C77F', backgroundColor: '#43574E', borderTopLeftRadius: 15, borderTopRightRadius: 15, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  eye: { width: 17, height: 5, backgroundColor: '#76E9D4' },
  coreHalo: { position: 'absolute', top: 48, left: 52, width: 44, height: 44, borderRadius: 22, backgroundColor: '#9B813F55', alignItems: 'center', justifyContent: 'center' },
  core: { width: 23, height: 23, transform: [{ rotate: '45deg' }], backgroundColor: '#E8B94C', borderWidth: 2, borderColor: '#FFF0AE', alignItems: 'center', justifyContent: 'center' },
  coreLight: { width: 8, height: 15, backgroundColor: '#FFF0AE' },
  islandCrystal: { position: 'absolute', width: 15, height: 31, backgroundColor: '#39BCAA', borderWidth: 2, borderColor: '#9BFBE5' },
  leftCrystal: { left: 10, top: 60, transform: [{ rotate: '-22deg' }] },
  rightCrystal: { right: 10, top: 60, transform: [{ rotate: '22deg' }] },
  damage: { position: 'absolute', right: 3, top: 12, color: colors.gold, fontSize: 17, fontWeight: '900' },
  track: { height: 12, borderRadius: 7, borderWidth: 1, borderColor: '#E6C77F', backgroundColor: '#101C25', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#E8B94C' },
  footer: { marginTop: 8, color: '#9BFBE5', fontSize: 9, fontWeight: '800', textAlign: 'center', letterSpacing: 0.5 },
});
