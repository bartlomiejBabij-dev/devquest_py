import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { GOBLIN_KING_DAMAGE, GOBLIN_KING_MAX_HP } from '@/game/boss';
import { colors } from '@/theme';

export function GoblinKingEncounter({ hp, hitCount, showDamage, reducedMotion }: { hp: number; hitCount: number; showDamage: boolean; reducedMotion: boolean }) {
  const [health] = useState(() => new Animated.Value(hp));
  const [hit] = useState(() => new Animated.Value(0));
  const [floating] = useState(() => new Animated.Value(0));
  const [defeat] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (hitCount === 0 || reducedMotion) {
      health.setValue(hp);
      hit.setValue(0);
      floating.setValue(0);
      defeat.setValue(hp === 0 ? 1 : 0);
      return;
    }
    hit.setValue(0);
    floating.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(hit, { toValue: 1, duration: 95, useNativeDriver: true }),
        Animated.timing(hit, { toValue: -1, duration: 95, useNativeDriver: true }),
        Animated.timing(hit, { toValue: 0, duration: 120, useNativeDriver: true }),
      ]),
      Animated.timing(health, { toValue: hp, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(floating, { toValue: 1, duration: 740, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
    if (hp === 0) {
      Animated.sequence([
        Animated.delay(470),
        Animated.timing(defeat, { toValue: 1, duration: 360, useNativeDriver: true }),
      ]).start();
    }
  }, [defeat, floating, health, hit, hitCount, hp, reducedMotion]);

  return (
    <View style={styles.arena} accessible accessibilityLabel={`Goblin King final boss, ${hp} of ${GOBLIN_KING_MAX_HP} health`}>
      <View style={styles.titleRow}>
        <View><Text style={styles.eyebrow}>♛  FINAL BOSS</Text><Text style={styles.name}>Goblin King</Text></View>
        <View style={styles.healthNumber}><Text style={styles.healthValue}>{hp}</Text><Text style={styles.healthSuffix}> / {GOBLIN_KING_MAX_HP} HP</Text></View>
      </View>
      <View style={styles.scene}>
        <Text style={styles.runeLeft}>✦</Text><Text style={styles.runeRight}>✧</Text>
        <Animated.View style={[styles.sprite, {
          opacity: defeat.interpolate({ inputRange: [0, 1], outputRange: [1, 0.28] }),
          transform: [{ translateX: hit.interpolate({ inputRange: [-1, 0, 1], outputRange: [-11, 0, 11] }) }, { translateY: defeat.interpolate({ inputRange: [0, 1], outputRange: [0, 12] }) }, { scale: defeat.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] }) }],
        }]}>
          <View style={styles.earLeft} /><View style={styles.earRight} />
          <View style={styles.body}><Text style={styles.bodyRune}>◆</Text></View>
          <View style={styles.head}><View style={styles.eyes}><View style={styles.eye} /><View style={styles.eye} /></View><Text style={styles.mouth}>{hp === 0 ? '×' : '▂'}</Text></View>
          <View style={styles.crownBase} /><View style={styles.crownPoints}><View style={styles.crownPoint} /><View style={styles.crownPointTall} /><View style={styles.crownPoint} /></View>
          <View style={styles.staff}><View style={styles.staffOrb} /></View>
        </Animated.View>
        {showDamage ? reducedMotion ? <Text style={styles.staticDamage}>−{GOBLIN_KING_DAMAGE} HP</Text> :
          <Animated.Text style={[styles.floatingDamage, {
            opacity: floating.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 1, 1, 0] }),
            transform: [{ translateY: floating.interpolate({ inputRange: [0, 1], outputRange: [8, -32] }) }],
          }]}>−{GOBLIN_KING_DAMAGE} HP</Animated.Text> : null}
        {hp === 0 ? <Animated.Text style={[styles.defeatedLabel, { opacity: defeat }]}>KING DEFEATED</Animated.Text> : null}
      </View>
      <View style={styles.hpTrack} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: GOBLIN_KING_MAX_HP, now: hp }}>
        <Animated.View style={[styles.hpFill, { width: health.interpolate({ inputRange: [0, GOBLIN_KING_MAX_HP], outputRange: ['0%', '100%'] }) }]} />
      </View>
      <Text style={styles.arenaFooter}>FIVE SPELLS TO BREAK THE CROWN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  arena: { overflow: 'hidden', borderRadius: 21, borderWidth: 1.5, borderColor: '#8B6B9F', backgroundColor: '#211733', paddingHorizontal: 16, paddingTop: 13, paddingBottom: 12, marginTop: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  eyebrow: { color: colors.gold, fontSize: 9, fontWeight: '900', letterSpacing: 1.6 },
  name: { color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 1 },
  healthNumber: { flexDirection: 'row', alignItems: 'baseline' },
  healthValue: { color: colors.green, fontSize: 22, fontWeight: '900' },
  healthSuffix: { color: '#C8B6DA', fontSize: 10, fontWeight: '900' },
  scene: { height: 104, alignItems: 'center', justifyContent: 'center' },
  runeLeft: { position: 'absolute', left: 23, top: 27, color: colors.violet, fontSize: 27, opacity: 0.8 },
  runeRight: { position: 'absolute', right: 22, top: 8, color: colors.green, fontSize: 24, opacity: 0.8 },
  sprite: { width: 130, height: 104, alignItems: 'center' },
  earLeft: { position: 'absolute', width: 27, height: 27, top: 42, left: 14, backgroundColor: '#6AAB67', borderWidth: 2, borderColor: '#B5D582', transform: [{ rotate: '-30deg' }] },
  earRight: { position: 'absolute', width: 27, height: 27, top: 42, right: 14, backgroundColor: '#6AAB67', borderWidth: 2, borderColor: '#B5D582', transform: [{ rotate: '30deg' }] },
  body: { position: 'absolute', top: 61, width: 65, height: 41, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: '#634071', borderWidth: 3, borderColor: '#BB86C8', alignItems: 'center' },
  bodyRune: { color: colors.gold, fontSize: 22, lineHeight: 29 },
  head: { position: 'absolute', top: 29, width: 72, height: 54, borderRadius: 13, backgroundColor: '#78B66D', borderWidth: 3, borderColor: '#BDE299', alignItems: 'center', justifyContent: 'center' },
  eyes: { flexDirection: 'row', gap: 21, marginTop: 10 },
  eye: { width: 8, height: 9, borderRadius: 2, backgroundColor: '#3B2448' },
  mouth: { color: '#3B2448', fontSize: 17, fontWeight: '900', lineHeight: 20 },
  crownBase: { position: 'absolute', top: 25, width: 81, height: 13, borderRadius: 3, backgroundColor: '#E9AC59', borderWidth: 2, borderColor: '#FFE4A3' },
  crownPoints: { position: 'absolute', top: 7, width: 80, height: 23, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  crownPoint: { width: 16, height: 19, backgroundColor: '#FFD17A', transform: [{ rotate: '15deg' }] },
  crownPointTall: { width: 17, height: 25, backgroundColor: '#FFE4A3', transform: [{ rotate: '45deg' }] },
  staff: { position: 'absolute', right: 2, top: 41, width: 7, height: 59, borderRadius: 2, backgroundColor: '#D5A966', borderWidth: 1, borderColor: '#FFE0A0' },
  staffOrb: { position: 'absolute', top: -12, left: -7, width: 19, height: 19, borderRadius: 10, backgroundColor: colors.violet, borderWidth: 2, borderColor: '#E6D5FF' },
  floatingDamage: { position: 'absolute', right: 25, top: 24, color: colors.gold, fontSize: 20, fontWeight: '900', textShadowColor: '#130A22', textShadowRadius: 5 },
  staticDamage: { position: 'absolute', right: 19, top: 23, color: colors.gold, fontSize: 15, fontWeight: '900' },
  defeatedLabel: { position: 'absolute', bottom: 3, color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
  hpTrack: { height: 12, borderRadius: 8, borderWidth: 1, borderColor: '#A588B5', backgroundColor: '#0E0A1D', overflow: 'hidden' },
  hpFill: { height: '100%', backgroundColor: colors.green },
  arenaFooter: { color: '#B49EBE', fontSize: 8, fontWeight: '900', letterSpacing: 1.5, textAlign: 'center', marginTop: 7 },
});
