import { StyleSheet, Text, View } from 'react-native';

/** Original decorative islands, chest, bridge and parchment; no image assets. */
export function ArchipelagoScenery() {
  return <View style={styles.sea} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <View style={styles.horizon} />
    <View style={styles.islands}>
      <View style={styles.island}>
        <View style={styles.chest}><View style={styles.lid} /><View style={styles.clasp} /></View>
        <Text style={styles.grass}>✦</Text>
      </View>
      <View style={styles.bridge}>{[0, 1, 2, 3, 4].map(i => <View key={i} style={styles.plank} />)}</View>
      <View style={[styles.island, styles.farIsland]}>
        <View style={styles.crystal} /><View style={styles.chart}><Text style={styles.chartMark}>× · ◇</Text></View>
      </View>
    </View>
    <Text style={styles.waves}>~  ·  ~     ~  ·  ~</Text>
  </View>;
}

const styles = StyleSheet.create({
  sea: { width: '100%', maxWidth: 250, marginTop: 15, paddingTop: 10, alignItems: 'center' },
  horizon: { width: '90%', height: 1, backgroundColor: '#419DAB', marginBottom: 12 },
  islands: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' },
  island: { width: 76, height: 60, borderRadius: 28, borderBottomWidth: 7, borderColor: '#C9AD72', backgroundColor: '#398678', alignItems: 'center', justifyContent: 'center' },
  farIsland: { width: 68, height: 52, flexDirection: 'row', gap: 4 },
  chest: { width: 38, height: 28, borderRadius: 4, borderWidth: 2, borderColor: '#EACB7D', backgroundColor: '#845432', alignItems: 'center' },
  lid: { width: '100%', height: 11, borderBottomWidth: 2, borderColor: '#EACB7D', backgroundColor: '#A97444' },
  clasp: { width: 6, height: 9, backgroundColor: '#F8DC93', marginTop: -4 },
  grass: { color: '#B9F0A6', fontSize: 12, lineHeight: 13 },
  bridge: { flexDirection: 'row', gap: 3, paddingVertical: 3, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#CEB78A', transform: [{ rotate: '-8deg' }] },
  plank: { width: 7, height: 16, backgroundColor: '#A87B50', borderWidth: 1, borderColor: '#D5AD75' },
  crystal: { width: 12, height: 25, borderWidth: 2, borderColor: '#B3FFFF', backgroundColor: '#51CCD6', transform: [{ rotate: '16deg' }] },
  chart: { width: 30, height: 22, backgroundColor: '#D8BC82', borderWidth: 2, borderColor: '#987043', transform: [{ rotate: '-10deg' }], justifyContent: 'center' },
  chartMark: { color: '#644737', fontSize: 9, textAlign: 'center' },
  waves: { color: '#83D8DD', fontSize: 16, letterSpacing: 3, marginTop: 9 },
});
