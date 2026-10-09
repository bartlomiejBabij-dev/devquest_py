import { isExerciseAnswerCorrect } from './exerciseValidation';
import { completeMission, getTotalEarnedXp, getUnlockedChapterIds, isMissionUnlocked } from './progression';
import { chapters, exercises, forestOfVariables, missions } from './worldContent';
import type { Chapter, Exercise, Mission, ProgressionState } from './worldTypes';

export interface PlayableMission {
  mission: Mission;
  chapter: Chapter;
  exercise: Exercise;
}

export function getPlayableMission(progress: ProgressionState, missionId: string): PlayableMission | null {
  const mission = missions.find((item) => item.id === missionId);
  if (!mission || !isMissionUnlocked(progress, missionId)) return null;
  const chapter = chapters.find((item) => item.id === mission.chapterId);
  const exercise = exercises.find((item) => item.id === mission.exerciseIds[0]);
  return chapter && exercise ? { mission, chapter, exercise } : null;
}

export type MissionSubmission =
  | { status: 'unavailable' | 'incorrect'; progress: ProgressionState; xpAwarded: 0 }
  | { status: 'correct'; progress: ProgressionState; xpAwarded: number; totalXp: number; newlyUnlockedChapterIds: readonly string[] };

export function submitWorldMission(progress: ProgressionState, missionId: string, answer: string): MissionSubmission {
  const playable = getPlayableMission(progress, missionId);
  if (!playable) return { status: 'unavailable', progress, xpAwarded: 0 };
  if (!isExerciseAnswerCorrect(playable.exercise, answer)) return { status: 'incorrect', progress, xpAwarded: 0 };

  const unlockedBefore = new Set(getUnlockedChapterIds(progress, forestOfVariables.id));
  const completion = completeMission(progress, missionId);
  return {
    status: 'correct',
    ...completion,
    totalXp: getTotalEarnedXp(completion.progress),
    newlyUnlockedChapterIds: getUnlockedChapterIds(completion.progress, forestOfVariables.id).filter((id) => !unlockedBefore.has(id)),
  };
}
