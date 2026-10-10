import { chapters, forestOfVariables, missions } from './worldContent';
import type { MissionAttempt } from './worldMission';

export const GOBLIN_KING_MAX_HP = 100;
export const GOBLIN_KING_DAMAGE = 20;

const finalChapterId = forestOfVariables.chapterIds.at(-1);
const finalChapter = chapters.find((chapter) => chapter.id === finalChapterId);
export const goblinKingMissionId = missions.find((mission) => finalChapter?.missionIds.includes(mission.id))?.id;

export function isGoblinKingMission(missionId: string): boolean {
  return goblinKingMissionId !== undefined && missionId === goblinKingMissionId;
}

/** HP is a view of the validated spell sequence, never separate combat state. */
export function getGoblinKingHp(attempt: MissionAttempt): number | null {
  if (!isGoblinKingMission(attempt.missionId)) return null;
  const mission = missions.find((item) => item.id === attempt.missionId);
  if (!mission) return null;
  let solved = 0;
  while (solved < mission.exerciseIds.length && attempt.solvedExerciseIds[solved] === mission.exerciseIds[solved]) solved++;
  return Math.max(0, GOBLIN_KING_MAX_HP - solved * GOBLIN_KING_DAMAGE);
}
