import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Alert, BackHandler, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useGame } from '@/game/GameContext';
import { MAX_NOTE_LENGTH } from '@/game/notesStorage';
import type { SpellbookEntry } from '@/game/spellbookContent';
import { chapters } from '@/game/worldContent';
import { colors } from '@/theme';

interface Props {
  entry: SpellbookEntry;
  exerciseId?: string;
  onClose?: () => void;
}

export interface SpellbookEntryHandle {
  requestClose: () => void;
}

export const SpellbookEntryView = forwardRef<SpellbookEntryHandle, Props>(function SpellbookEntryView({ entry, exerciseId, onClose }, ref) {
  const { notes, notesStatus, saveExerciseNote, deleteExerciseNote } = useGame();
  const savedNote = exerciseId ? notes[exerciseId] ?? '' : '';
  const [draft, setDraft] = useState(savedNote);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [feedback, setFeedback] = useState('');
  const dirty = useRef(false);
  const previousExerciseId = useRef(exerciseId);
  const scrollRef = useRef<ScrollView>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chapter = chapters.find((item) => item.id === entry.chapterId);

  useEffect(() => {
    if (previousExerciseId.current !== exerciseId) {
      previousExerciseId.current = exerciseId;
      dirty.current = false;
      setFeedback('');
      setSaveFailed(false);
      setDraft(savedNote);
    } else if (!dirty.current) {
      setDraft(savedNote);
    }
  }, [exerciseId, savedNote]);

  useEffect(() => {
    if (!exerciseId) return;
    const show = Keyboard.addListener('keyboardDidShow', () => {
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
      scrollTimer.current = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 180);
    });
    return () => {
      show.remove();
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, [exerciseId]);

  useEffect(() => {
    if (!onClose) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => listener.remove();
  });

  function close() {
    if (!onClose) return;
    if (exerciseId && (draft !== savedNote || saveFailed)) {
      Alert.alert('Discard unsaved changes?', 'Save your personal note before leaving the Spellbook.', [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => { Keyboard.dismiss(); onClose(); } },
      ]);
      return;
    }
    Keyboard.dismiss();
    onClose();
  }

  useImperativeHandle(ref, () => ({ requestClose: close }));

  async function saveNote() {
    if (!exerciseId || notesStatus !== 'ready' || saving || !draft.trim()) return;
    setSaving(true);
    const saved = await saveExerciseNote(exerciseId, draft);
    setSaving(false);
    if (saved) {
      dirty.current = false;
      setSaveFailed(false);
      setFeedback('Saved on this device.');
      Keyboard.dismiss();
    } else {
      setSaveFailed(true);
      setFeedback('Could not save your note. Please try again.');
    }
  }

  async function deleteNote() {
    if (!exerciseId || notesStatus !== 'ready' || saving || !savedNote) return;
    setSaving(true);
    const deleted = await deleteExerciseNote(exerciseId);
    setSaving(false);
    if (deleted) {
      dirty.current = false;
      setSaveFailed(false);
      setDraft('');
      setFeedback('Note deleted.');
      Keyboard.dismiss();
    } else {
      setSaveFailed(true);
      setFeedback('Could not delete your note. Please try again.');
    }
  }

  function confirmDelete() {
    Alert.alert('Delete this note?', 'This removes your personal note for this exercise.', [
      { text: 'Keep Note', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { void deleteNote(); } },
    ]);
  }

  const canSave = !!exerciseId && notesStatus === 'ready' && !saving && !!draft.trim() && (draft !== savedNote || saveFailed);
  const canDelete = !!exerciseId && notesStatus === 'ready' && !saving && !!savedNote;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView ref={scrollRef} keyboardShouldPersistTaps="always" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.navRow}>
            <Text style={styles.navLabel}>✦  PYTHON SPELLBOOK</Text>
            {onClose ? <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close Spellbook" style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <Text style={styles.closeText}>✕  CLOSE</Text>
            </Pressable> : null}
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroGlyph}><Text style={styles.heroGlyphText}>✧</Text></View>
            <Text style={styles.eyebrow}>ARCANE KNOWLEDGE</Text>
            <Text accessibilityRole="header" style={styles.title}>{entry.title}</Text>
            <Text style={styles.chapter}>✦  {chapter?.title ?? 'Forest of Variables'}</Text>
          </View>

          <View style={styles.lessonCard}>
            <Text style={styles.sectionLabel}>THE IDEA</Text>
            <Text style={styles.body}>{entry.explanation}</Text>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>EXAMPLE SPELL</Text>
            <Text style={styles.generalNotice}>A general example to study. Your mission has its own answer.</Text>
            <View style={styles.codeBox}>
              <View style={styles.codeGutter}><View style={styles.codeDot} /><View style={styles.codeDot} /><View style={styles.codeDot} /></View>
              <Text selectable style={styles.code}>{entry.codeExample}</Text>
            </View>
            {entry.expectedOutput !== undefined ? <>
              <Text style={[styles.sectionLabel, styles.outputLabel]}>EXPECTED OUTPUT</Text>
              <View style={styles.outputBox}><Text selectable style={styles.output}>{entry.expectedOutput}</Text></View>
            </> : null}
          </View>

          <View style={styles.mistakeCard}>
            <Text style={styles.mistakeGlyph}>✦</Text>
            <View style={styles.mistakeCopy}>
              <Text style={styles.mistakeLabel}>WATCH FOR THIS</Text>
              <Text style={styles.mistakeText}>{entry.commonMistake}</Text>
            </View>
          </View>

          {exerciseId ? <View style={styles.notesCard}>
            <View style={styles.notesTitleRow}>
              <Text style={styles.sectionLabel}>YOUR PERSONAL NOTE</Text>
              <Text style={styles.counter}>{draft.length}/{MAX_NOTE_LENGTH}</Text>
            </View>
            <Text style={styles.notesHelp}>Keep a reminder for this exercise. Notes stay on this device.</Text>
            {notesStatus === 'loading' ? <Text style={styles.notesStatus}>Opening your notes…</Text> : null}
            {notesStatus === 'unavailable' ? <Text accessibilityRole="alert" style={styles.notesError}>Notes could not be opened. Existing saved notes will not be replaced.</Text> : null}
            <TextInput
              accessibilityLabel="Personal exercise note"
              accessibilityHint="Write a note about this exercise, then tap Save Note"
              value={draft}
              onChangeText={(value) => { dirty.current = true; setDraft(value); setSaveFailed(false); setFeedback(''); }}
              maxLength={MAX_NOTE_LENGTH}
              editable={notesStatus === 'ready' && !saving}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholder="What helped this spell make sense?"
              placeholderTextColor="#8589A8"
              style={styles.noteInput}
            />
            <View style={styles.noteActions}>
              <Pressable onPress={() => { void saveNote(); }} disabled={!canSave} accessibilityRole="button" accessibilityLabel="Save Note" accessibilityState={{ disabled: !canSave }}
                style={({ pressed }) => [styles.saveButton, !canSave && styles.disabledButton, pressed && canSave && styles.pressed]}>
                <Text style={styles.saveButtonText}>{saving ? 'SAVING…' : 'SAVE NOTE'}</Text>
              </Pressable>
              {canDelete ? <Pressable onPress={confirmDelete} accessibilityRole="button" accessibilityLabel="Delete Note" style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
                <Text style={styles.deleteText}>DELETE</Text>
              </Pressable> : null}
            </View>
            {feedback ? <Text accessibilityLiveRegion="polite" style={[styles.feedback, saveFailed && styles.errorFeedback]}>{feedback}</Text> : null}
          </View> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
  content: { width: '100%', maxWidth: 500, alignSelf: 'center' },
  navRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  navLabel: { color: colors.violet, fontSize: 10, fontWeight: '900', letterSpacing: 1.6, flexShrink: 1 },
  closeButton: { minHeight: 44, minWidth: 80, justifyContent: 'center', alignItems: 'flex-end' },
  closeText: { color: colors.muted, fontSize: 12, fontWeight: '900', letterSpacing: 0.6 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  heroCard: { alignItems: 'center', backgroundColor: '#211D43', borderColor: '#6E5CA6', borderWidth: 1, borderRadius: 22, paddingHorizontal: 18, paddingTop: 19, paddingBottom: 22 },
  heroGlyph: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#3B315D', borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  heroGlyphText: { color: colors.gold, fontSize: 39, lineHeight: 47 },
  eyebrow: { color: colors.violet, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  title: { color: colors.text, fontSize: 25, lineHeight: 31, fontWeight: '900', textAlign: 'center', marginTop: 5 },
  chapter: { color: colors.gold, fontSize: 12, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  lessonCard: { backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: 18, marginTop: 13 },
  sectionLabel: { color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.8 },
  body: { color: colors.text, fontSize: 15, lineHeight: 23, marginTop: 9 },
  divider: { height: 1, backgroundColor: '#404366', marginVertical: 18 },
  generalNotice: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6, marginBottom: 11 },
  codeBox: { backgroundColor: '#10152D', borderColor: '#485079', borderWidth: 1, borderRadius: 13, overflow: 'hidden' },
  codeGutter: { flexDirection: 'row', gap: 5, backgroundColor: '#1C2341', paddingHorizontal: 11, paddingVertical: 9 },
  codeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#8278AA' },
  code: { color: '#D6F9EC', fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), fontSize: 14, lineHeight: 22, padding: 13 },
  outputLabel: { marginTop: 16 },
  outputBox: { backgroundColor: '#17302F', borderColor: '#386B61', borderWidth: 1, borderRadius: 12, marginTop: 8, paddingHorizontal: 13, paddingVertical: 11 },
  output: { color: colors.green, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), fontSize: 14, lineHeight: 21 },
  mistakeCard: { flexDirection: 'row', gap: 12, backgroundColor: '#2B233C', borderColor: '#745879', borderWidth: 1, borderRadius: 17, padding: 16, marginTop: 13 },
  mistakeGlyph: { color: colors.orange, fontSize: 19, lineHeight: 23 },
  mistakeCopy: { flex: 1 },
  mistakeLabel: { color: colors.orange, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  mistakeText: { color: colors.text, fontSize: 13, lineHeight: 20, marginTop: 6 },
  notesCard: { backgroundColor: colors.panel, borderColor: '#7565AC', borderWidth: 1, borderRadius: 20, padding: 18, marginTop: 13 },
  notesTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  counter: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  notesHelp: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  notesStatus: { color: colors.gold, fontSize: 12, marginTop: 10 },
  notesError: { color: colors.red, fontSize: 12, lineHeight: 18, marginTop: 10 },
  noteInput: { minHeight: 118, maxHeight: 220, borderColor: colors.border, borderWidth: 1, borderRadius: 13, backgroundColor: '#11162E', color: colors.text, fontSize: 14, lineHeight: 21, paddingHorizontal: 13, paddingVertical: 12, marginTop: 12 },
  noteActions: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12 },
  saveButton: { minHeight: 48, minWidth: 135, backgroundColor: colors.gold, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  saveButtonText: { color: '#29203C', fontSize: 12, fontWeight: '900', letterSpacing: 0.7 },
  disabledButton: { opacity: 0.48 },
  deleteButton: { minHeight: 48, minWidth: 80, alignItems: 'center', justifyContent: 'center' },
  deleteText: { color: colors.red, fontSize: 12, fontWeight: '900', letterSpacing: 0.7 },
  feedback: { color: colors.green, fontSize: 12, marginTop: 9 },
  errorFeedback: { color: colors.red },
});
