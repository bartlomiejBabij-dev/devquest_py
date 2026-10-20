import { chapters, forestOfVariables, missions, worlds } from '../game/worldContent';
import { isWorldUnlocked } from '../game/progression';
import type { ProgressionState } from '../game/worldTypes';

export function resolveMapWorld(worldId: unknown) {
  return worlds.find((world) => world.id === worldId) ?? forestOfVariables;
}

/** Locked map links show the unlock requirement, never an enterable chapter path. */
export function getAccessibleMapChapters(progress: ProgressionState, worldId: string) {
  const world = worlds.find(item => item.id === worldId);
  if (!world || !isWorldUnlocked(progress, worldId)) return [];
  return world.chapterIds.flatMap(id => chapters.find(chapter => chapter.id === id) ?? []);
}

/** Return to the same map route, including when the mission was opened by a deep link. */
export function worldMapForMission(missionId: string) {
  const mission = missions.find((item) => item.id === missionId);
  const chapter = chapters.find((item) => item.id === mission?.chapterId);
  return { pathname: '/world-map' as const, params: { worldId: resolveMapWorld(chapter?.worldId).id } };
}
