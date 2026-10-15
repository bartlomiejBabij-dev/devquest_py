import { isExerciseAnswerCorrect } from './exerciseValidation';
import { completeMission, getTotalEarnedXp, getUnlockedChapterIds, isMissionUnlocked } from './progression';
import { chapters, exercises, missions, worlds } from './worldContent';
import type { Chapter, Exercise, Mission, ProgressionState } from './worldTypes';

export interface PlayableMission {
  mission: Mission;
  chapter: Chapter;
  exercises: readonly Exercise[];
}

export interface MissionResult {
  xpAwarded: number;
  totalXp: number;
  newlyUnlockedChapterIds: readonly string[];
}

export interface MissionAttempt {
  missionId: string;
  exerciseIndex: number;
  phase: 'answering' | 'solved' | 'complete';
  solvedExerciseIds: readonly string[];
  result: MissionResult | null;
}

export function getPlayableMission(progress: ProgressionState, missionId: string): PlayableMission | null {
  const mission = missions.find((item) => item.id === missionId);
  if (!mission || !isMissionUnlocked(progress, missionId)) return null;
  const chapter = chapters.find((item) => item.id === mission.chapterId);
  const orderedExercises = mission.exerciseIds.map((id) => exercises.find((item) => item.id === id));
  if (!chapter || !orderedExercises.length || orderedExercises.some((item) => !item)) return null;
  return { mission, chapter, exercises: orderedExercises as Exercise[] };
}

export function startMissionAttempt(progress: ProgressionState, missionId: string): MissionAttempt | null {
  return getPlayableMission(progress, missionId)
    ? { missionId, exerciseIndex: 0, phase: 'answering', solvedExerciseIds: [], result: null }
    : null;
}

export type MissionAnswerResult = {
  status: 'unavailable' | 'ignored' | 'incorrect' | 'correct';
  attempt: MissionAttempt;
  progress: ProgressionState;
  xpAwarded: number;
};

export function submitMissionAnswer(progress: ProgressionState, attempt: MissionAttempt, answer: string): MissionAnswerResult {
  const playable = getPlayableMission(progress, attempt.missionId);
  const exercise = playable?.exercises[attempt.exerciseIndex];
  if (!exercise || !Number.isInteger(attempt.exerciseIndex)) return { status: 'unavailable', attempt, progress, xpAwarded: 0 };
  if (attempt.phase !== 'answering') return { status: 'ignored', attempt, progress, xpAwarded: 0 };
  if (attempt.solvedExerciseIds.length !== attempt.exerciseIndex
    || attempt.solvedExerciseIds.some((id, index) => id !== playable.exercises[index].id)) {
    return { status: 'unavailable', attempt, progress, xpAwarded: 0 };
  }
  if (!isExerciseAnswerCorrect(exercise, answer)) return { status: 'incorrect', attempt, progress, xpAwarded: 0 };

  const solvedAttempt: MissionAttempt = { ...attempt, phase: 'solved', solvedExerciseIds: [...attempt.solvedExerciseIds, exercise.id] };
  if (attempt.exerciseIndex < playable.exercises.length - 1) {
    return { status: 'correct', attempt: solvedAttempt, progress, xpAwarded: 0 };
  }

  const unlockedBefore = new Set(worlds.flatMap((world) => getUnlockedChapterIds(progress, world.id)));
  const completion = completeMission(progress, attempt.missionId);
  return {
    status: 'correct',
    attempt: {
      ...solvedAttempt,
      result: {
        xpAwarded: completion.xpAwarded,
        totalXp: getTotalEarnedXp(completion.progress),
        newlyUnlockedChapterIds: worlds.flatMap((world) => getUnlockedChapterIds(completion.progress, world.id)).filter((id) => !unlockedBefore.has(id)),
      },
    },
    progress: completion.progress,
    xpAwarded: completion.xpAwarded,
  };
}

export function continueMissionAttempt(attempt: MissionAttempt, exerciseCount: number): MissionAttempt {
  if (attempt.phase !== 'solved' || !Number.isInteger(exerciseCount) || exerciseCount < 1) return attempt;
  if (attempt.solvedExerciseIds.length !== attempt.exerciseIndex + 1) return attempt;
  if (attempt.exerciseIndex === exerciseCount - 1 && attempt.result) return { ...attempt, phase: 'complete' };
  if (attempt.exerciseIndex >= 0 && attempt.exerciseIndex < exerciseCount - 1) {
    return { ...attempt, exerciseIndex: attempt.exerciseIndex + 1, phase: 'answering' };
  }
  return attempt;
}
