import { chapters, forestOfVariables, missions } from './worldContent';
import type { MissionAttempt } from './worldMission';
import type { ProgressionState } from './worldTypes';
import { isMissionCompleted, isWorldCompleted } from './progression';

export const GOBLIN_KING_MAX_HP = 100;
export const GOBLIN_KING_DAMAGE = 20;
export const DECISION_KEEPER_MAX_HP = 100;
export const DECISION_KEEPER_DAMAGE = 20;
export const LOOP_WARDEN_MAX_HP = 100;
export const LOOP_WARDEN_DAMAGE = 20;
export const TREASURE_GUARDIAN_MAX_HP = 100;
export const TREASURE_GUARDIAN_DAMAGE = 20;

const finalChapterId = forestOfVariables.chapterIds.at(-1);
const finalChapter = chapters.find((chapter) => chapter.id === finalChapterId);
export const goblinKingMissionId = missions.find((mission) => finalChapter?.missionIds.includes(mission.id))?.id;
export const decisionKeeperMissionId = missions.find((mission) => mission.encounter === 'decision-keeper')?.id;
export const loopWardenMissionId = missions.find((mission) => mission.encounter === 'loop-warden')?.id;

export const treasureGuardianMissionId = missions.find((mission) => mission.encounter === 'treasure-guardian')?.id;

/** Boss identity comes from registered content; ordinary guardians are not bosses. */
export function getBossEncounter(missionId: string) {
  if (isGoblinKingMission(missionId)) return { kind: 'goblin-king' as const, name: 'Goblin King' };
  if (decisionKeeperMissionId !== undefined && missionId === decisionKeeperMissionId) return { kind: 'decision-keeper' as const, name: 'The Decision Keeper' };
  if (loopWardenMissionId !== undefined && missionId === loopWardenMissionId) return { kind: 'loop-warden' as const, name: 'The Loop Warden' };
  if (treasureGuardianMissionId !== undefined && missionId === treasureGuardianMissionId) return { kind: 'treasure-guardian' as const, name: 'The Treasure Guardian' };
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
  const kind = getBossEncounter(attempt.missionId)?.kind;
  if (kind !== 'decision-keeper' && kind !== 'loop-warden' && kind !== 'treasure-guardian') return null;
  const mission = missions.find(item => item.id === attempt.missionId);
  if (!mission) return null;
  let solved = 0;
  while (solved < mission.exerciseIds.length && attempt.solvedExerciseIds[solved] === mission.exerciseIds[solved]) solved++;
  if (kind === 'treasure-guardian') return Math.max(0, TREASURE_GUARDIAN_MAX_HP - solved * TREASURE_GUARDIAN_DAMAGE);
  return kind === 'loop-warden'
    ? Math.max(0, LOOP_WARDEN_MAX_HP - solved * LOOP_WARDEN_DAMAGE)
    : Math.max(0, DECISION_KEEPER_MAX_HP - solved * DECISION_KEEPER_DAMAGE);
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
