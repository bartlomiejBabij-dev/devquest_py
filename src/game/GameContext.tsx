import { createContext, useContext, useEffect, useReducer, useState, type ReactNode, type Dispatch } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { battleReducer, initialBattleState, type BattleAction } from './battle';
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
  dispatchProgression: Dispatch<ProgressionAction>;
  onboardingReady: boolean;
  needsOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
}
const GameContext = createContext<GameContextValue | null>(null);
const progressionStore = createProgressionStore(AsyncStorage);
const onboardingStore = createOnboardingStore(AsyncStorage);

export function GameProvider({ children }: { children: ReactNode }) {
  const [battle, dispatch] = useReducer(battleReducer, initialBattleState);
  const [session, dispatchProgression] = useReducer(progressionSessionReducer, initialProgressionSession);
  const [saveFailed, setSaveFailed] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<'loading' | 'complete' | 'incomplete' | 'unavailable'>('loading');
  const [onboardingSaveFailed, setOnboardingSaveFailed] = useState(false);

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
    if (!shouldPersistProgression(session)) return;
    let active = true;
    progressionStore.save(session.progression).then((saved) => { if (active) setSaveFailed(!saved); });
    return () => { active = false; };
  }, [session]);

  const onboardingReady = session.hydration !== 'loading' && onboardingStatus !== 'loading';
  const needsOnboarding = session.hydration === 'ready' && onboardingStatus !== 'loading'
    && shouldShowOnboarding(onboardingStatus, session.progression.completedMissionIds);

  async function completeOnboarding() {
    setOnboardingStatus('complete');
    setOnboardingSaveFailed(!(await onboardingStore.complete()));
  }

  const warning = session.loadIssue === 'unsupported-version'
    ? 'This save was created by a newer version. Progress will not be saved in this session.'
    : session.loadIssue
      ? 'Saved progress could not be loaded. This session will not replace it.'
      : saveFailed ? 'Progress could not be saved. Keep playing to try again.'
        : onboardingSaveFailed ? 'The introduction could not be saved. It may appear again next time.' : null;

  return <GameContext.Provider value={{ battle, dispatch, progression: session.progression, dispatchProgression, onboardingReady, needsOnboarding, completeOnboarding }}>
    <View style={styles.app}>
      {warning ? <Text accessibilityRole="alert" style={styles.warning}>{warning}</Text> : null}
      {children}
      {!onboardingReady ? <View style={styles.loading}><ActivityIndicator color={colors.green} /><Text style={styles.loadingText}>Loading your adventure…</Text></View> : null}
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
  loading: { ...StyleSheet.absoluteFill, zIndex: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, gap: 12 },
  loadingText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  warning: { backgroundColor: '#49352F', color: colors.text, paddingHorizontal: 16, paddingVertical: 9, fontSize: 12, textAlign: 'center' },
});
