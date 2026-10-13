import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode, type Dispatch } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HydrationPlaceholder } from '@/components/Skeleton';
import { isHydrating, type HydrationStatus } from './hydration';
import { defaultProfile, isAvatarId, validateNickname, type PlayerProfile } from './profile';
import { createProfileStore, type ProfileLoadIssue } from './profileStorage';
import { battleReducer, initialBattleState, type BattleAction } from './battle';
import { createNotesStore, deleteExerciseNote as removeNote, isValidExerciseId, setExerciseNote as updateNote, type NotesState } from './notesStorage';
import { createOnboardingStore, shouldShowOnboarding } from './onboardingStorage';
import { type ProgressionAction } from './progression';
import { initialProgressionSession, progressionSessionReducer, shouldPersistProgression } from './progressionSession';
import { createProgressionStore } from './progressionStorage';
import type { BattleState } from './types';
import type { ProgressionState } from './worldTypes';
import { colors } from '@/theme';

interface GameContextValue {
  battle: BattleState;
  dispatch: Dispatch<BattleAction>;
  progression: ProgressionState;
  progressionStatus: HydrationStatus;
  dispatchProgression: Dispatch<ProgressionAction>;
  onboardingReady: boolean;
  needsOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
  notes: NotesState;
  notesStatus: 'loading' | 'ready' | 'unavailable';
  saveExerciseNote: (exerciseId: string, text: string) => Promise<boolean>;
  deleteExerciseNote: (exerciseId: string) => Promise<boolean>;
  profile: PlayerProfile;
  profileStatus: HydrationStatus;
  profileIssue: ProfileLoadIssue;
  saveProfile: (profile: PlayerProfile) => Promise<boolean>;
}
const GameContext = createContext<GameContextValue | null>(null);
const progressionStore = createProgressionStore(AsyncStorage);
const onboardingStore = createOnboardingStore(AsyncStorage);
const notesStore = createNotesStore(AsyncStorage);
const profileStore = createProfileStore(AsyncStorage);

export function GameProvider({ children }: { children: ReactNode }) {
  const [battle, dispatch] = useReducer(battleReducer, initialBattleState);
  const [session, dispatchProgression] = useReducer(progressionSessionReducer, initialProgressionSession);
  const [saveFailed, setSaveFailed] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<'loading' | 'complete' | 'incomplete' | 'unavailable'>('loading');
  const [onboardingSaveFailed, setOnboardingSaveFailed] = useState(false);
  const [notes, setNotes] = useState<NotesState>({});
  const [notesStatus, setNotesStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const notesRef = useRef<NotesState>({});
  const savedNotesRef = useRef<NotesState>({});
  const noteRevisionRef = useRef(0);
  const [profile, setProfile] = useState<PlayerProfile>({ ...defaultProfile });
  const [profileStatus, setProfileStatus] = useState<HydrationStatus>('loading');
  const [profileIssue, setProfileIssue] = useState<ProfileLoadIssue>(null);

  useEffect(() => {
    let active = true;
    profileStore.load().then((result) => {
      if (!active) return;
      setProfile(result.profile);
      setProfileIssue(result.issue);
      setProfileStatus(result.status);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    progressionStore.load().then((result) => { if (active) dispatchProgression({ type: 'hydrate', result }); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    onboardingStore.load().then((status) => { if (active) setOnboardingStatus(status); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    notesStore.load().then((result) => {
      if (!active) return;
      notesRef.current = result.notes;
      savedNotesRef.current = result.notes;
      setNotes(result.notes);
      setNotesStatus(result.status);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!shouldPersistProgression(session)) return;
    let active = true;
    progressionStore.save(session.progression).then((saved) => { if (active) setSaveFailed(!saved); });
    return () => { active = false; };
  }, [session]);

  const onboardingReady = !isHydrating(session.hydration, onboardingStatus);
  const needsOnboarding = session.hydration === 'ready' && onboardingStatus !== 'loading'
    && shouldShowOnboarding(onboardingStatus, session.progression.completedMissionIds);

  async function completeOnboarding() {
    setOnboardingStatus('complete');
    setOnboardingSaveFailed(!(await onboardingStore.complete()));
  }

  async function persistNotes(next: NotesState): Promise<boolean> {
    const revision = ++noteRevisionRef.current;
    if (next !== notesRef.current) {
      notesRef.current = next;
      setNotes(next);
    }
    const saved = await notesStore.save(next);
    if (saved) savedNotesRef.current = next;
    else if (revision === noteRevisionRef.current) {
      notesRef.current = savedNotesRef.current;
      setNotes(savedNotesRef.current);
    }
    return saved;
  }

  async function saveExerciseNote(exerciseId: string, text: string): Promise<boolean> {
    if (notesStatus !== 'ready' || !isValidExerciseId(exerciseId)) return false;
    return persistNotes(updateNote(notesRef.current, exerciseId, text));
  }

  async function deleteExerciseNote(exerciseId: string): Promise<boolean> {
    if (notesStatus !== 'ready' || !isValidExerciseId(exerciseId)) return false;
    return persistNotes(removeNote(notesRef.current, exerciseId));
  }

  async function saveProfile(next: PlayerProfile): Promise<boolean> {
    const name = validateNickname(next.nickname);
    if (profileStatus !== 'ready' || name.error || !isAvatarId(next.avatarId)) return false;
    const snapshot = { nickname: name.nickname, avatarId: next.avatarId };
    const saved = await profileStore.save(snapshot);
    if (saved) { setProfile(snapshot); setProfileIssue(null); }
    return saved;
  }

  const warning = session.loadIssue === 'unsupported-version'
    ? 'This save was created by a newer version. Progress will not be saved in this session.'
    : session.loadIssue
      ? 'Saved progress could not be loaded. This session will not replace it.'
      : saveFailed ? 'Progress could not be saved. Keep playing to try again.'
        : onboardingSaveFailed ? 'The introduction could not be saved. It may appear again next time.' : null;

  return <GameContext.Provider value={{ battle, dispatch, progression: session.progression, progressionStatus: session.hydration, dispatchProgression, onboardingReady, needsOnboarding, completeOnboarding, notes, notesStatus, saveExerciseNote, deleteExerciseNote, profile, profileStatus, profileIssue, saveProfile }}>
    <View style={styles.app}>
      {warning ? <Text accessibilityRole="alert" style={styles.warning}>{warning}</Text> : null}
      <View style={styles.app} pointerEvents={onboardingReady ? 'auto' : 'none'} accessibilityElementsHidden={!onboardingReady} importantForAccessibility={onboardingReady ? 'auto' : 'no-hide-descendants'}>{children}</View>
      {!onboardingReady ? <SafeAreaView style={styles.loading}><HydrationPlaceholder pending /></SafeAreaView> : null}
    </View>
  </GameContext.Provider>;
}

export function useGame() {
  const game = useContext(GameContext);
  if (!game) throw new Error('useGame must be used inside GameProvider');
  return game;
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.background },
  loading: { ...StyleSheet.absoluteFill, zIndex: 2, backgroundColor: colors.background },
  warning: { backgroundColor: '#49352F', color: colors.text, paddingHorizontal: 16, paddingVertical: 9, fontSize: 12, textAlign: 'center' },
});
