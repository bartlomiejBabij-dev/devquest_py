import { chapters, forestOfVariables, missions, worlds } from '../game/worldContent';

export function resolveMapWorld(worldId: unknown) {
  return worlds.find((world) => world.id === worldId) ?? forestOfVariables;
}

/** Return to the same map route, including when the mission was opened by a deep link. */
export function worldMapForMission(missionId: string) {
  const mission = missions.find((item) => item.id === missionId);
  const chapter = chapters.find((item) => item.id === mission?.chapterId);
  return { pathname: '/world-map' as const, params: { worldId: resolveMapWorld(chapter?.worldId).id } };
}
