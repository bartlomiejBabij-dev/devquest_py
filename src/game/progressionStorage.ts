import { completeMission, initialProgressionState } from './progression';
import { missions } from './worldContent';
import type { ProgressionState } from './worldTypes';

export const PROGRESSION_STORAGE_KEY = 'devquest.progression';
const STORAGE_VERSION = 1;

export interface ProgressionStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export type ProgressionLoadResult =
  | { status: 'ready'; progression: ProgressionState }
  | { status: 'unavailable'; progression: ProgressionState; reason: 'read-failed' | 'invalid-save' | 'unsupported-version' };

function restoreCompletedMissions(ids: readonly string[]): ProgressionState {
  const requested = new Set(ids);
  let progression = initialProgressionState;
  // Reapply completions through the domain rules, even if stored IDs are out of order.
  for (let pass = 0; pass < missions.length; pass++) {
    let changed = false;
    for (const mission of missions) {
      if (!requested.has(mission.id)) continue;
      const next = completeMission(progression, mission.id).progress;
      if (next !== progression) { progression = next; changed = true; }
    }
    if (!changed) break;
  }
  return progression;
}

export function parseSavedProgression(raw: string): ProgressionLoadResult {
  let value: unknown;
  try { value = JSON.parse(raw); } catch {
    return { status: 'unavailable', progression: initialProgressionState, reason: 'invalid-save' };
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { status: 'unavailable', progression: initialProgressionState, reason: 'invalid-save' };
  }
  const record = value as Record<string, unknown>;
  if (record.version !== STORAGE_VERSION) {
    return { status: 'unavailable', progression: initialProgressionState,
      reason: typeof record.version === 'number' && record.version > STORAGE_VERSION ? 'unsupported-version' : 'invalid-save' };
  }
  if (!Array.isArray(record.completedMissionIds) || !record.completedMissionIds.every((id) => typeof id === 'string')) {
    return { status: 'unavailable', progression: initialProgressionState, reason: 'invalid-save' };
  }
  return { status: 'ready', progression: restoreCompletedMissions(record.completedMissionIds) };
}

export function createProgressionStore(storage: ProgressionStorageAdapter) {
  let pendingWrite: Promise<void> = Promise.resolve();
  return {
    async load(): Promise<ProgressionLoadResult> {
      try {
        const raw = await storage.getItem(PROGRESSION_STORAGE_KEY);
        return raw === null ? { status: 'ready', progression: initialProgressionState } : parseSavedProgression(raw);
      } catch {
        return { status: 'unavailable', progression: initialProgressionState, reason: 'read-failed' };
      }
    },
    save(progression: ProgressionState): Promise<boolean> {
      const payload = JSON.stringify({ version: STORAGE_VERSION, completedMissionIds: progression.completedMissionIds });
      const write = pendingWrite.then(async () => {
        try { await storage.setItem(PROGRESSION_STORAGE_KEY, payload); return true; }
        catch { return false; }
      });
      pendingWrite = write.then(() => undefined);
      return write;
    },
  };
}
