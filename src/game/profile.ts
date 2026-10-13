import { isGoblinKingMission } from './boss';
import { getTotalEarnedXp, getWorldProgress, isChapterCompleted, isMissionCompleted } from './progression';
import { chapters, exercises, forestOfVariables, missions } from './worldContent';
import type { ProgressionState } from './worldTypes';

export const avatars = [
  { id: 'mage', title: 'Mage', color: '#A78BE3', rune: '✦' },
  { id: 'knight', title: 'Knight', color: '#92BAD9', rune: '◆' },
  { id: 'rogue', title: 'Rogue', color: '#76C7AC', rune: '◇' },
  { id: 'wizard', title: 'Wizard', color: '#D4A2D8', rune: '✧' },
  { id: 'adventurer', title: 'Adventurer', color: '#E7B576', rune: '✣' },
] as const;
export type AvatarId = typeof avatars[number]['id'];
export interface PlayerProfile { nickname: string; avatarId: AvatarId }
export const defaultProfile: PlayerProfile = { nickname: 'Python Apprentice', avatarId: 'mage' };

export function validateNickname(value: string): { nickname: string; error: string | null } {
  const nickname = value.trim();
  const length = Array.from(nickname).length;
  const error = length < 3 ? 'Use at least 3 characters.' : length > 20 ? 'Use no more than 20 characters.'
    : /[\p{Cc}\p{Cf}]/u.test(nickname) ? 'Use visible characters on one line.' : null;
  return { nickname, error };
}

export function isAvatarId(value: unknown): value is AvatarId {
  return avatars.some((avatar) => avatar.id === value);
}

/** Cosmetic levels only. No rewards or progression state are changed. */
export function getPlayerLevel(totalXp: number) {
  const xp = Number.isFinite(totalXp) ? Math.max(0, Math.floor(totalXp)) : 0;
  return { level: Math.floor(xp / 100) + 1, xpInLevel: xp % 100, xpPerLevel: 100, percent: xp % 100 };
}

export function getPlayerStatistics(progress: ProgressionState) {
  const completedMissions = missions.filter((mission) => isMissionCompleted(progress, mission.id));
  const validExercises = new Set(exercises.map((exercise) => exercise.id));
  // Individual attempts aren't persisted. Count distinct exercises in completed missions only.
  const completedExercises = new Set(completedMissions.flatMap((mission) => mission.exerciseIds).filter((id) => validExercises.has(id)));
  const totalXp = getTotalEarnedXp(progress);
  return {
    totalXp, ...getPlayerLevel(totalXp),
    completedMissions: completedMissions.length,
    completedExercises: completedExercises.size,
    defeatedBosses: completedMissions.filter((mission) => isGoblinKingMission(mission.id)).length,
    currentWorld: forestOfVariables.title,
    worldProgress: getWorldProgress(progress, forestOfVariables.id),
  };
}

export function getAchievements(progress: ProgressionState) {
  const firstMissionId = chapters.find((chapter) => chapter.id === forestOfVariables.chapterIds[0])?.missionIds[0];
  const completedChapters = forestOfVariables.chapterIds.filter((id) => isChapterCompleted(progress, id)).length;
  return [
    { id: 'first-spell', title: 'First Spell', description: 'Complete A Voice in the Forest.', glyph: '✦', unlocked: !!firstMissionId && isMissionCompleted(progress, firstMissionId) },
    { id: 'forest-explorer', title: 'Forest Explorer', description: 'Complete three Forest chapters.', glyph: '✣', unlocked: completedChapters >= 3 },
    { id: 'bug-hunter', title: 'Bug Hunter', description: 'Complete Broken Spells.', glyph: '◇', unlocked: isChapterCompleted(progress, 'python-forest-broken-spells') },
    { id: 'goblin-slayer', title: 'Goblin Slayer', description: 'Defeat the Goblin King.', glyph: '♛', unlocked: missions.some((mission) => isGoblinKingMission(mission.id) && isMissionCompleted(progress, mission.id)) },
  ];
}
