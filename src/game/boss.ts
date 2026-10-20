import { chapters, forestOfVariables, missions } from './worldContent';
import type { MissionAttempt } from './worldMission';
import type { ProgressionState } from './worldTypes';
import { isMissionCompleted, isWorldCompleted } from './progression';

export const GOBLIN_KING_MAX_HP = 100;
export const GOBLIN_KING_DAMAGE = 20;
export const DECISION_KEEPER_MAX_HP = 100;
export const DECISION_KEEPER_DAMAGE = 20;

const finalChapterId = forestOfVariables.chapterIds.at(-1);
const finalChapter = chapters.find((chapter) => chapter.id === finalChapterId);
export const goblinKingMissionId = missions.find((mission) => finalChapter?.missionIds.includes(mission.id))?.id;
export const decisionKeeperMissionId = missions.find((mission) => mission.encounter === 'decision-keeper')?.id;

/** Boss identity comes from registered content; ordinary guardians are not bosses. */
export function getBossEncounter(missionId: string) {
  if (isGoblinKingMission(missionId)) return { kind: 'goblin-king' as const, name: 'Goblin King' };
  if (decisionKeeperMissionId !== undefined && missionId === decisionKeeperMissionId) return { kind: 'decision-keeper' as const, name: 'The Decision Keeper' };
  return null;
}

export function isBossMission(missionId: string): boolean { return getBossEncounter(missionId) !== null; }

/** A finale is cleared only with its boss and all currently registered missions. */
export function isWorldCleared(progress: ProgressionState, worldId: string): boolean {
  return isWorldCompleted(progress, worldId) && chapters.some(chapter => chapter.worldId === worldId
    && chapter.missionIds.some(id => isBossMission(id) && isMissionCompleted(progress, id)));
}

export function getBossHp(attempt: MissionAttempt): number | null {
  if (isGoblinKingMission(attempt.missionId)) return getGoblinKingHp(attempt);
  if (getBossEncounter(attempt.missionId)?.kind !== 'decision-keeper') return null;
  const mission = missions.find(item => item.id === attempt.missionId);
  if (!mission) return null;
  let solved = 0;
  while (solved < mission.exerciseIds.length && attempt.solvedExerciseIds[solved] === mission.exerciseIds[solved]) solved++;
  return Math.max(0, DECISION_KEEPER_MAX_HP - solved * DECISION_KEEPER_DAMAGE);
}

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
