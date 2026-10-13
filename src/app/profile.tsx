import { useRef, useState } from 'react';
import { useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AvatarArt } from '@/components/AvatarArt';
import { GameScreen } from '@/components/GameScreen';
import { NavigationButton } from '@/components/NavigationButton';
import { HydrationPlaceholder } from '@/components/Skeleton';
import { XpProgress } from '@/components/XpProgress';
import { useGame } from '@/game/GameContext';
import { isHydrating } from '@/game/hydration';
import { avatars, getAchievements, getPlayerStatistics, validateNickname, type AvatarId, type PlayerProfile } from '@/game/profile';
import { useScreenBack, useScreenNavigation } from '@/navigation/useScreenNavigation';
import { colors } from '@/theme';

function ProfileEditor({ profile, saving, setSaving, resetNavigation }: { profile: PlayerProfile; saving: boolean; setSaving: (value: boolean) => void; resetNavigation: () => void }) {
  const { saveProfile, profileStatus, profileIssue } = useGame();
  const stack = useNavigation();
  const [nickname, setNickname] = useState(profile.nickname);
  const [avatarId, setAvatarId] = useState<AvatarId>(profile.avatarId);
  const [touched, setTouched] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [failed, setFailed] = useState(false);
  const inFlight = useRef(false);
  const dialog = useRef(false);
  const validation = validateNickname(nickname);
  const dirty = nickname.trim() !== profile.nickname || avatarId !== profile.avatarId;
  const available = profileStatus === 'ready';
  usePreventRemove(dirty || saving, ({ data }) => {
    if (inFlight.current) { resetNavigation(); return; }
    if (dialog.current) return;
    dialog.current = true;
    const cancel = () => { dialog.current = false; resetNavigation(); };
    Alert.alert('Discard profile changes?', 'Your nickname and avatar have unsaved changes.', [
      { text: 'Keep Editing', style: 'cancel', onPress: cancel },
      { text: 'Discard', style: 'destructive', onPress: () => { dialog.current = false; stack.dispatch(data.action); } },
    ], { cancelable: true, onDismiss: cancel });
  });

  async function save() {
    setTouched(true);
    if (!available || validation.error || inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setFeedback('');
    let saved = false;
    try { saved = await saveProfile({ nickname: validation.nickname, avatarId }); } catch { saved = false; }
    inFlight.current = false;
    setSaving(false);
    setFailed(!saved);
    if (saved) { setNickname(validation.nickname); Keyboard.dismiss(); }
    setFeedback(saved ? 'Profile saved on this device.' : 'Could not save your profile. Your changes are still here; please try again.');
  }

  const canSave = available && !saving && !validation.error && (dirty || failed || profileIssue === 'invalid-save');
  return <View style={styles.card}>
    <Text style={styles.sectionTitle}>MAKE IT YOURS</Text>
    <Text style={styles.help}>A local nickname and avatar, just for your adventure.</Text>
    {profileIssue ? <Text accessibilityRole="alert" style={styles.notice}>{profileIssue === 'invalid-save' ? 'Your saved profile could not be read. Default details are shown; save to replace them.' : 'Your saved profile is unavailable. Defaults are shown and saving is disabled to protect it.'}</Text> : null}
    <Text style={styles.inputLabel}>CHOOSE YOUR AVATAR</Text>
    <View style={styles.avatarGrid}>
      {avatars.map((avatar) => <Pressable key={avatar.id} accessibilityRole="radio" accessibilityLabel={`${avatar.title} avatar`} accessibilityState={{ checked: avatarId === avatar.id, disabled: !available || saving }}
        disabled={!available || saving} onPress={() => { setAvatarId(avatar.id); setFeedback(''); setFailed(false); }}
        style={({ pressed }) => [styles.avatarOption, avatarId === avatar.id && styles.avatarSelected, pressed && styles.pressed]}>
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden><AvatarArt avatarId={avatar.id} size={54} /></View>
        <Text style={[styles.avatarLabel, avatarId === avatar.id && styles.selectedLabel]}>{avatar.title}</Text>
        <Text style={styles.selectionMark}>{avatarId === avatar.id ? '✓ Selected' : 'Select'}</Text>
      </Pressable>)}
    </View>
    <Text style={styles.inputLabel}>NICKNAME</Text>
    <TextInput accessibilityLabel="Player nickname" accessibilityHint="3 to 20 characters. Tap Save Profile to keep your changes."
      value={nickname} onChangeText={(value) => { setNickname(value); setTouched(true); setFeedback(''); setFailed(false); }}
      editable={available && !saving} maxLength={80} autoCorrect={false} returnKeyType="done" onSubmitEditing={save} style={[styles.input, touched && validation.error ? styles.inputInvalid : null]} />
    <View style={styles.validationRow}><Text accessibilityLiveRegion="polite" style={[styles.help, touched && validation.error ? styles.error : null]}>{touched && validation.error ? validation.error : '3–20 characters · spaces at the ends are trimmed'}</Text><Text style={styles.count}>{Array.from(nickname.trim()).length}/20</Text></View>
    <Pressable accessibilityRole="button" accessibilityLabel="Save Profile" accessibilityState={{ disabled: !canSave, busy: saving }} disabled={!canSave} onPress={save}
      style={({ pressed }) => [styles.save, !canSave && styles.saveDisabled, pressed && styles.pressed]}>
      <Text style={[styles.saveText, !canSave && styles.saveDisabledText]}>{saving ? 'Saving…' : !dirty && !failed && !profileIssue ? '✓ Profile up to date' : 'Save Profile'}</Text>
    </Pressable>
    {feedback ? <Text accessibilityLiveRegion="polite" style={[styles.feedback, failed && styles.error]}>{feedback}</Text> : null}
  </View>;
}

function Stat({ value, label }: { value: number; label: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

export default function ProfileScreen() {
  const { profile, profileStatus, progression, progressionStatus } = useGame();
  const navigation = useScreenNavigation();
  const [saving, setSaving] = useState(false);
  function goHome() { if (!saving) navigation.returnTo('/'); }
  useScreenBack(goHome);
  const pending = isHydrating(profileStatus, progressionStatus);
  const stats = progressionStatus === 'ready' ? getPlayerStatistics(progression) : null;
  const achievements = progressionStatus === 'ready' ? getAchievements(progression) : [];
  return <GameScreen compact scrollToEndOnKeyboard header={<View style={styles.header}><NavigationButton label="Home" accessibilityLabel="Back to Home" onPress={goHome} disabled={saving} /><Text style={styles.eyebrow}>YOUR CHARACTER SHEET</Text></View>}>
    <Text accessibilityRole="header" style={styles.title}>Adventurer Profile</Text>
    <Text style={styles.subtitle}>Small spells. A growing adventure.</Text>
    {pending ? <HydrationPlaceholder pending label="Opening your character sheet…" /> : <>
      <View style={styles.hero}>
        <View style={styles.heroRow}><AvatarArt avatarId={profile.avatarId} size={80} /><View style={styles.heroCopy}><Text style={styles.heroName}>{profile.nickname}</Text><Text style={styles.heroClass}>{avatars.find((avatar) => avatar.id === profile.avatarId)?.title} · Python adventurer</Text></View></View>
        {stats ? <XpProgress totalXp={stats.totalXp} /> : <Text style={styles.notice}>Saved statistics could not be loaded.</Text>}
      </View>
      {stats ? <View style={styles.card}>
        <Text style={styles.sectionTitle}>YOUR JOURNEY</Text>
        <View style={styles.stats}><Stat value={stats.completedExercises} label="Exercises" /><Stat value={stats.completedMissions} label="Missions" /><Stat value={stats.defeatedBosses} label="Bosses" /></View>
        <Text style={styles.help}>Exercises count only those in completed missions. Unfinished attempts are not included.</Text>
        <View style={styles.world}><Text style={styles.eyebrow}>CURRENT WORLD</Text><Text style={styles.worldTitle}>{stats.currentWorld}</Text><Text style={styles.worldProgress}>{stats.worldProgress.percent}% complete · {stats.worldProgress.completed}/{stats.worldProgress.total} missions</Text></View>
        <Text style={styles.levelNote}>Level 1 + one level per 100 XP. Levels are a display of your mission XP.</Text>
      </View> : null}
      {stats ? <View style={styles.card}>
        <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
        <Text style={styles.help}>Milestones earned through your Forest missions.</Text>
        {achievements.map((achievement) => <View key={achievement.id} accessible accessibilityLabel={`${achievement.title}, ${achievement.unlocked ? 'unlocked' : 'locked'}. ${achievement.description}`} style={[styles.achievement, achievement.unlocked && styles.achievementUnlocked]}>
          <Text style={[styles.achievementGlyph, achievement.unlocked && styles.unlockedText]}>{achievement.glyph}</Text>
          <View style={styles.achievementCopy}><Text style={styles.achievementTitle}>{achievement.title}</Text><Text style={styles.help}>{achievement.description}</Text><Text style={[styles.achievementState, achievement.unlocked && styles.unlockedText]}>{achievement.unlocked ? '✓ UNLOCKED' : 'LOCKED'}</Text></View>
        </View>)}
      </View> : null}
      <ProfileEditor profile={profile} saving={saving} setSaving={setSaving} resetNavigation={navigation.reset} />
    </>}
  </GameScreen>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  eyebrow: { color: colors.violet, fontSize: 10, fontWeight: '900', letterSpacing: 1, flexShrink: 1, textAlign: 'right' },
  title: { color: colors.text, fontSize: 27, fontWeight: '900', marginTop: 12 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 6, marginBottom: 18 },
  hero: { padding: 18, borderRadius: 22, borderWidth: 1, borderColor: '#8B709E', backgroundColor: '#2B2445', gap: 20, marginBottom: 14 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  heroCopy: { flex: 1, gap: 7 },
  heroName: { color: colors.gold, fontSize: 21, fontWeight: '900' },
  heroClass: { color: '#D0C6DE', fontSize: 12, lineHeight: 18 },
  card: { padding: 17, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel, marginBottom: 14 },
  sectionTitle: { color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1.6, marginBottom: 9 },
  help: { color: colors.muted, fontSize: 12, lineHeight: 18, flexShrink: 1 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 14 },
  stat: { flex: 1, minWidth: 75, paddingVertical: 13, backgroundColor: '#13182F', borderRadius: 13, alignItems: 'center', gap: 5 },
  statValue: { color: colors.text, fontSize: 27, fontWeight: '900' },
  statLabel: { color: colors.violet, fontSize: 11, fontWeight: '800' },
  world: { borderTopWidth: 1, borderColor: colors.border, marginTop: 16, paddingTop: 15, alignItems: 'flex-start', gap: 6 },
  worldTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  worldProgress: { color: colors.green, fontSize: 12 },
  levelNote: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 13 },
  inputLabel: { color: colors.violet, fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginTop: 20, marginBottom: 10 },
  input: { minHeight: 50, borderRadius: 12, borderWidth: 1, borderColor: '#8D7AA9', paddingHorizontal: 13, paddingVertical: 11, fontSize: 17, color: colors.text, backgroundColor: '#11162C' },
  inputInvalid: { borderColor: colors.red },
  validationRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 7 },
  count: { color: colors.muted, fontSize: 11 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  avatarOption: { minWidth: 83, flexGrow: 1, flexBasis: '28%', paddingVertical: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 14, alignItems: 'center', gap: 6, backgroundColor: '#171B34' },
  avatarSelected: { borderColor: colors.gold, backgroundColor: '#39304D' },
  avatarLabel: { color: colors.text, fontSize: 12, fontWeight: '800' },
  selectedLabel: { color: colors.gold },
  selectionMark: { color: colors.muted, fontSize: 10 },
  save: { minHeight: 52, marginTop: 18, borderRadius: 13, backgroundColor: colors.gold, justifyContent: 'center', alignItems: 'center', padding: 12 },
  saveDisabled: { backgroundColor: '#333650', borderWidth: 1, borderColor: colors.border },
  saveText: { color: '#29203C', fontSize: 15, fontWeight: '900' },
  saveDisabledText: { color: colors.muted },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  feedback: { color: colors.green, fontSize: 13, lineHeight: 19, marginTop: 11 },
  error: { color: colors.red },
  notice: { color: colors.gold, fontSize: 12, lineHeight: 19, marginTop: 9 },
  achievement: { flexDirection: 'row', gap: 12, padding: 13, borderRadius: 14, borderWidth: 1, borderColor: '#3F405E', backgroundColor: '#171A32', marginTop: 11 },
  achievementUnlocked: { borderColor: '#797055', backgroundColor: '#302D3C' },
  achievementGlyph: { color: '#8A829B', fontSize: 27 },
  achievementCopy: { flex: 1, gap: 4 },
  achievementTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  achievementState: { color: colors.muted, fontSize: 10, fontWeight: '900', marginTop: 4 },
  unlockedText: { color: colors.gold },
});
