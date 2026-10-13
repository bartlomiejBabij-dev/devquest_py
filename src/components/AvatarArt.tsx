import { StyleSheet, Text, View } from 'react-native';
import { avatars, type AvatarId } from '@/game/profile';
import { colors } from '@/theme';

/** Original bundled shape illustrations, in the same style as CharacterArt. */
export function AvatarArt({ avatarId, size = 72 }: { avatarId: AvatarId; size?: number }) {
  const avatar = avatars.find((item) => item.id === avatarId) ?? avatars[0];
  const pointed = avatar.id === 'mage' || avatar.id === 'wizard';
  return <View accessible accessibilityLabel={`${avatar.title} avatar`} style={[styles.frame, { width: size, height: size, borderColor: avatar.color }]}>
    <View style={[styles.stage, { transform: [{ scale: size / 80 }] }]}>
      <View style={[styles.cloak, { backgroundColor: avatar.color }]} />
      <View style={styles.face}><Text style={styles.eyes}>• •</Text></View>
      {pointed ? <><View style={[styles.hat, { borderBottomColor: avatar.color }]} /><View style={[styles.brim, { backgroundColor: avatar.color }]} /></>
        : <View style={[styles.hood, { backgroundColor: avatar.color }, avatar.id === 'knight' && styles.helmet, avatar.id === 'adventurer' && styles.cap]} />}
      {avatar.id === 'rogue' ? <View style={styles.mask} /> : null}
      {avatar.id === 'wizard' ? <View style={styles.beard} /> : null}
      <Text style={styles.rune}>{avatar.rune}</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  frame: { borderRadius: 18, borderWidth: 1.5, backgroundColor: '#28223F', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  stage: { width: 80, height: 80, alignItems: 'center', flexShrink: 0 },
  cloak: { position: 'absolute', width: 49, height: 35, bottom: -3, borderTopLeftRadius: 17, borderTopRightRadius: 17 },
  face: { position: 'absolute', top: 29, width: 31, height: 28, borderRadius: 11, backgroundColor: '#F0C5A7', alignItems: 'center' },
  eyes: { color: '#352C48', fontSize: 15, fontWeight: '900', letterSpacing: 3 },
  hat: { position: 'absolute', top: 4, borderLeftWidth: 21, borderRightWidth: 21, borderBottomWidth: 32, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  brim: { position: 'absolute', top: 32, width: 54, height: 7, borderRadius: 4 },
  hood: { position: 'absolute', top: 16, width: 45, height: 24, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  helmet: { top: 15, height: 22, borderTopLeftRadius: 9, borderTopRightRadius: 9, borderWidth: 2, borderColor: '#D8E6EF' },
  cap: { height: 18, top: 19, width: 49, borderBottomRightRadius: 8 },
  mask: { position: 'absolute', top: 44, width: 31, height: 12, borderRadius: 4, backgroundColor: '#244339' },
  beard: { position: 'absolute', top: 48, borderLeftWidth: 12, borderRightWidth: 12, borderTopWidth: 15, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#EBE4F2' },
  rune: { position: 'absolute', bottom: 0, color: colors.background, fontSize: 20, fontWeight: '900' },
});
