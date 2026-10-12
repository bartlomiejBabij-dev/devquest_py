import type { MissionAttempt } from '../game/worldMission';

/** Lock synchronously until the source screen is focused again. */
export function createNavigationGate() {
  let navigating = false;
  return {
    run(action: () => void): boolean {
      if (navigating) return false;
      navigating = true;
      try { action(); } catch (error) { navigating = false; throw error; }
      return true;
    },
    reset() { navigating = false; },
  };
}

export function hasUnfinishedMissionProgress(attempt: MissionAttempt | null, answer: string): boolean {
  if (!attempt || attempt.result || attempt.phase === 'complete') return false;
  return attempt.solvedExerciseIds.length > 0 || answer.trim().length > 0;
}
