import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

export function CharacterArt({ kind, defeated = false, compact = false }: { kind: 'hero' | 'goblin'; defeated?: boolean; compact?: boolean }) {
  const hero = kind === 'hero';
  return (
    <View style={[styles.frame, compact && styles.compactFrame]} accessible accessibilityLabel={hero ? 'Python Pyromancer character' : defeated ? 'Defeated Bug Goblin' : 'Bug Goblin enemy'}>
    <View style={[styles.stage, compact && styles.compactStage, defeated && { opacity: 0.5 }]}>
      <View style={[styles.halo, { backgroundColor: hero ? colors.violet : colors.red }]} />
      <Text style={[styles.spark, { top: 9, left: 35 }]}>✦</Text>
      <Text style={[styles.spark, { top: 28, right: 38 }]}>✧</Text>
      {hero ? (
        <>
          <View style={styles.hatTip} /><View style={styles.hatBrim} />
          <View style={styles.heroFace}><Text style={styles.faceText}>• ᴗ •</Text></View>
          <View style={styles.heroBody}><Text style={styles.bodyRune}>✦</Text></View>
          <View style={styles.flame}><Text style={styles.flameText}>✦</Text></View>
        </>
      ) : (
        <>
          <View style={[styles.ear, styles.leftEar]} /><View style={[styles.ear, styles.rightEar]} />
          <View style={styles.goblinHead}>
            <View style={styles.eyes}><View style={styles.eye} /><View style={styles.eye} /></View>
            <Text style={styles.goblinMouth}>{defeated ? '×  ×' : '⌣'}</Text>
          </View>
          <View style={styles.goblinBody}><Text style={styles.bodyRune}>⌁</Text></View>
        </>
      )}
      <View style={styles.ground} />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { height: 210, width: 220, alignSelf: 'center' },
  compactFrame: { height: 145, width: 170 },
  stage: { height: 210, width: 220, alignItems: 'center', justifyContent: 'center' },
  compactStage: { position: 'absolute', top: -32, left: -25, transform: [{ scale: 0.7 }] },
  halo: { position: 'absolute', width: 176, height: 176, borderRadius: 88, opacity: 0.22 },
  spark: { position: 'absolute', color: colors.gold, fontSize: 22 },
  ground: { position: 'absolute', bottom: 10, width: 155, height: 12, borderRadius: 100, backgroundColor: '#080B1B', zIndex: -1 },
  hatTip: { position: 'absolute', top: 9, width: 0, height: 0, borderLeftWidth: 40, borderRightWidth: 40, borderBottomWidth: 82, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#7464B4', transform: [{ rotate: '-9deg' }] },
  hatBrim: { position: 'absolute', top: 82, width: 125, height: 16, borderRadius: 9, backgroundColor: '#5B508F', borderWidth: 2, borderColor: '#A597E3' },
  heroFace: { position: 'absolute', top: 89, width: 70, height: 57, borderRadius: 24, backgroundColor: '#F7C49E', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#ECA77F' },
  faceText: { color: '#44344C', fontSize: 19, fontWeight: '900' },
  heroBody: { position: 'absolute', top: 140, width: 93, height: 57, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: '#584E98', borderWidth: 3, borderColor: '#A897E0', alignItems: 'center' },
  bodyRune: { color: colors.gold, fontSize: 31, fontWeight: 'bold', lineHeight: 45 },
  flame: { position: 'absolute', right: 30, top: 112, width: 37, height: 47, borderRadius: 22, backgroundColor: '#FF915B', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '20deg' }] },
  flameText: { color: '#FFE4A1', fontSize: 27 },
  ear: { position: 'absolute', top: 63, width: 52, height: 43, backgroundColor: '#79A77D', borderWidth: 3, borderColor: '#A4CE98' },
  leftEar: { left: 35, transform: [{ rotate: '-28deg' }], borderTopLeftRadius: 35 },
  rightEar: { right: 35, transform: [{ rotate: '28deg' }], borderTopRightRadius: 35 },
  goblinHead: { position: 'absolute', top: 54, width: 112, height: 94, borderRadius: 40, backgroundColor: '#7DAF80', borderWidth: 4, borderColor: '#B5D39B', alignItems: 'center', justifyContent: 'center' },
  eyes: { flexDirection: 'row', gap: 26, marginTop: 11 }, eye: { width: 15, height: 15, borderRadius: 3, backgroundColor: '#322947' },
  goblinMouth: { fontSize: 27, color: '#3D4253', fontWeight: '900', lineHeight: 35 },
  goblinBody: { position: 'absolute', top: 140, width: 80, height: 55, backgroundColor: '#8D546A', borderWidth: 3, borderColor: '#C87982', borderTopLeftRadius: 17, borderTopRightRadius: 17, alignItems: 'center' },
});
