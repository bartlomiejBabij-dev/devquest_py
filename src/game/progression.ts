import { chapters, missions, worlds } from './worldContent';
import type { CompletionProgress, ProgressionState } from './worldTypes';

export const initialProgressionState: ProgressionState = { completedMissionIds: [] };

export type ProgressionAction = { type: 'completeMission'; missionId: string };

export function isMissionCompleted(progress: ProgressionState, missionId: string): boolean {
  return missions.some((mission) => mission.id === missionId) && progress.completedMissionIds.includes(missionId);
}

export function isWorldUnlocked(progress: ProgressionState, worldId: string): boolean {
  const world = worlds.find((item) => item.id === worldId);
  return !!world && world.prerequisiteMissionIds.every((id) => isMissionCompleted(progress, id));
}

export function isChapterUnlocked(progress: ProgressionState, chapterId: string): boolean {
  const chapter = chapters.find((item) => item.id === chapterId);
  return !!chapter && isWorldUnlocked(progress, chapter.worldId) && chapter.prerequisiteMissionIds.every((id) => isMissionCompleted(progress, id));
}

export function isMissionUnlocked(progress: ProgressionState, missionId: string): boolean {
  const mission = missions.find((item) => item.id === missionId);
  return !!mission && isChapterUnlocked(progress, mission.chapterId)
    && mission.prerequisiteMissionIds.every((id) => isMissionCompleted(progress, id));
}

export function completeMission(progress: ProgressionState, missionId: string): { progress: ProgressionState; xpAwarded: number } {
  const mission = missions.find((item) => item.id === missionId);
  if (!mission || !isMissionUnlocked(progress, missionId) || isMissionCompleted(progress, missionId)) {
    return { progress, xpAwarded: 0 };
  }
  return {
    progress: { completedMissionIds: [...progress.completedMissionIds, missionId] },
    xpAwarded: mission.xpReward,
  };
}

export function progressionReducer(progress: ProgressionState, action: ProgressionAction): ProgressionState {
  return completeMission(progress, action.missionId).progress;
}

export function getTotalEarnedXp(progress: ProgressionState): number {
  const completed = new Set(progress.completedMissionIds);
  return missions.reduce((total, mission) => total + (completed.has(mission.id) ? mission.xpReward : 0), 0);
}

function completionProgress(progress: ProgressionState, missionIds: readonly string[]): CompletionProgress {
  const completed = missionIds.filter((id) => isMissionCompleted(progress, id)).length;
  return { completed, total: missionIds.length, percent: missionIds.length ? Math.round((completed / missionIds.length) * 100) : 0 };
}

export function getChapterProgress(progress: ProgressionState, chapterId: string): CompletionProgress {
  const chapter = chapters.find((item) => item.id === chapterId);
  return completionProgress(progress, chapter?.missionIds ?? []);
}

export function isChapterCompleted(progress: ProgressionState, chapterId: string): boolean {
  const chapter = chapters.find((item) => item.id === chapterId);
  return !!chapter && chapter.missionIds.length > 0 && chapter.missionIds.every((id) => isMissionCompleted(progress, id));
}

export function getWorldProgress(progress: ProgressionState, worldId: string): CompletionProgress {
  const world = worlds.find((item) => item.id === worldId);
  const missionIds = world?.chapterIds.flatMap((chapterId) => chapters.find((item) => item.id === chapterId)?.missionIds ?? []) ?? [];
  return completionProgress(progress, missionIds);
}

export function isWorldCompleted(progress: ProgressionState, worldId: string): boolean {
  const world = worlds.find((item) => item.id === worldId);
  return !!world && world.chapterIds.length > 0 && world.chapterIds.every((id) => isChapterCompleted(progress, id));
}

export function getUnlockedChapterIds(progress: ProgressionState, worldId: string): readonly string[] {
  const world = worlds.find((item) => item.id === worldId);
  return world?.chapterIds.filter((id) => isChapterUnlocked(progress, id)) ?? [];
}
