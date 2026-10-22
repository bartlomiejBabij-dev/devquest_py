import { StyleSheet, Text, View } from 'react-native';

/** Original local shapes: a magical anvil in an ancient stone workshop. */
export function ForgeScenery() {
  return <View style={styles.scene} accessible accessibilityLabel="A glowing golden anvil, enchanted hammer and blue-purple runes in an ancient forge">
    <View style={styles.arch} />
    <Text style={[styles.rune, styles.leftRune]}>✧</Text><Text style={[styles.rune, styles.rightRune]}>◇</Text>
    <View style={styles.glow}><View style={styles.flame} /></View>
    <View style={styles.anvilTop}><View style={styles.inscription}><Text style={styles.code}>def</Text></View></View>
    <View style={styles.horn} /><View style={styles.neck} /><View style={styles.base} />
    <View style={styles.hammer}><View style={styles.handle} /><View style={styles.head} /></View>
    <View style={styles.floor} />
  </View>;
}

const styles = StyleSheet.create({
  scene: { height: 116, width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  arch: { position: 'absolute', top: 0, width: 180, height: 108, borderTopLeftRadius: 70, borderTopRightRadius: 70, borderWidth: 9, borderColor: '#50445D', backgroundColor: '#211C32' },
  glow: { position: 'absolute', top: 18, width: 78, height: 68, borderRadius: 35, backgroundColor: '#DB7A2E44', alignItems: 'center' },
  flame: { width: 26, height: 36, top: 7, borderTopLeftRadius: 18, borderBottomRightRadius: 15, transform: [{ rotate: '30deg' }], backgroundColor: '#F7AB44', borderWidth: 3, borderColor: '#FFE6A4' },
  anvilTop: { position: 'absolute', top: 57, width: 96, height: 23, borderRadius: 4, borderWidth: 3, borderColor: '#EAC36E', backgroundColor: '#6D536B', alignItems: 'center' },
  inscription: { marginTop: -1 },
  code: { color: '#B6DEFF', fontFamily: 'monospace', fontSize: 13, fontWeight: '900' },
  horn: { position: 'absolute', top: 58, marginLeft: -110, width: 23, height: 17, backgroundColor: '#EAC36E', borderBottomLeftRadius: 18 },
  neck: { position: 'absolute', top: 80, width: 42, height: 17, backgroundColor: '#6D536B', borderLeftWidth: 3, borderRightWidth: 3, borderColor: '#DCA85A' },
  base: { position: 'absolute', top: 96, width: 84, height: 10, borderRadius: 3, backgroundColor: '#C6A062' },
  hammer: { position: 'absolute', top: 15, marginLeft: 100, width: 35, height: 55, transform: [{ rotate: '-26deg' }] },
  handle: { position: 'absolute', left: 13, top: 12, width: 8, height: 40, backgroundColor: '#957061' },
  head: { width: 34, height: 18, borderRadius: 3, borderWidth: 2, borderColor: '#B49FF2', backgroundColor: '#6962B5' },
  rune: { position: 'absolute', top: 43, color: '#AEBEFF', fontSize: 26 },
  leftRune: { left: 8 }, rightRune: { right: 8, color: '#BD97F0' },
  floor: { position: 'absolute', bottom: 0, width: 206, height: 8, borderRadius: 3, backgroundColor: '#67566A' },
});
