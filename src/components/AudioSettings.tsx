import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameAudio } from '@/audio/AudioProvider';
import { colors } from '@/theme';

export function AudioSettingsButton() {
  const [open, setOpen] = useState(false);
  const { settings, ready, warning, update } = useGameAudio();
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Open Audio Settings" onPress={() => setOpen(true)} style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}><Text style={styles.gold}>♫  Audio</Text></Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <SafeAreaView style={styles.backdrop}><View accessibilityViewIsModal style={styles.panel}><ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>Audio Settings</Text>
        <Text style={styles.help}>A little magic for your journey. All learning feedback remains visible with sound off.</Text>
        {!ready ? <Text style={styles.help}>Loading audio preferences…</Text> : <>
          <View style={styles.row}><Text style={styles.label}>Music {settings.musicEnabled ? 'ON' : 'OFF'}</Text><Switch accessibilityLabel="Music" value={settings.musicEnabled} onValueChange={(musicEnabled) => update({ musicEnabled })} trackColor={{ true: colors.green }} style={styles.switch} /></View>
          <Volume label="Music volume" value={settings.musicVolume} change={(musicVolume) => update({ musicVolume })} />
          <View style={styles.row}><Text style={styles.label}>Sound Effects {settings.effectsEnabled ? 'ON' : 'OFF'}</Text><Switch accessibilityLabel="Sound Effects" value={settings.effectsEnabled} onValueChange={(effectsEnabled) => update({ effectsEnabled })} trackColor={{ true: colors.green }} style={styles.switch} /></View>
          <Volume label="Effects volume" value={settings.effectsVolume} change={(effectsVolume) => update({ effectsVolume })} />
          <Pressable accessibilityRole="button" onPress={() => update({ musicEnabled: false, effectsEnabled: false })} style={styles.button}><Text style={styles.gold}>Mute All</Text></Pressable>
          <Text style={styles.help}>Saved automatically on this device. These controls govern game audio independently of your ringer.</Text>
        </>}
        {warning ? <Text accessibilityRole="alert" style={styles.warning}>{warning}</Text> : null}
        <Pressable accessibilityRole="button" accessibilityLabel="Close Audio Settings" onPress={() => setOpen(false)} style={styles.button}><Text style={styles.gold}>Done</Text></Pressable>
      </ScrollView></View></SafeAreaView>
    </Modal>
  </>;
}
function Volume({ label, value, change }: { label: string; value: number; change: (value: number) => void }) {
  return <View style={styles.volume}><Text style={styles.help}>{label}</Text><View style={styles.row}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Decrease ${label.toLowerCase()}`} disabled={value <= 0} onPress={() => change(Math.max(0, Math.round((value - 0.1) * 100) / 100))} style={styles.step}><Text style={styles.gold}>−</Text></Pressable>
    <Text accessibilityLiveRegion="polite" accessibilityLabel={`${label}: ${Math.round(value * 100)} percent`} style={styles.label}>{Math.round(value * 100)}%</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`Increase ${label.toLowerCase()}`} disabled={value >= 1} onPress={() => change(Math.min(1, Math.round((value + 0.1) * 100) / 100))} style={styles.step}><Text style={styles.gold}>+</Text></Pressable>
  </View></View>;
}
const styles = StyleSheet.create({
  trigger: { minHeight: 48, minWidth: 90, alignSelf: 'flex-end', justifyContent: 'center', alignItems: 'center', borderRadius: 13, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, marginBottom: 10, backgroundColor: colors.panel },
  pressed: { opacity: 0.7 }, gold: { color: colors.gold, fontSize: 16, fontWeight: '800' },
  backdrop: { flex: 1, backgroundColor: '#080B18DD', justifyContent: 'center', padding: 20 },
  panel: { maxHeight: '100%', width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: colors.panel, borderRadius: 22, borderWidth: 1, borderColor: '#847098' },
  content: { padding: 20, gap: 16 }, title: { color: colors.gold, fontSize: 25, fontWeight: '900' },
  help: { color: colors.muted, fontSize: 13, lineHeight: 20 }, label: { color: colors.text, fontSize: 15, fontWeight: '700', flexShrink: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  switch: { minHeight: 48, minWidth: 48 }, volume: { gap: 8 },
  step: { minWidth: 56, minHeight: 48, borderRadius: 12, backgroundColor: '#36304D', alignItems: 'center', justifyContent: 'center' },
  button: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  warning: { color: colors.gold, fontSize: 12, lineHeight: 18 },
});
