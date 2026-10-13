import { defaultProfile, isAvatarId, validateNickname, type PlayerProfile } from './profile';

export const PROFILE_STORAGE_KEY = 'devquest.profile.v1';
interface ProfileStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
export type ProfileLoadIssue = 'invalid-save' | 'unsupported-version' | 'read-failed' | null;
export interface ProfileLoadResult {
  status: 'ready' | 'unavailable';
  profile: PlayerProfile;
  issue: ProfileLoadIssue;
}

export function parseSavedProfile(raw: string): ProfileLoadResult {
  const fallback: ProfileLoadResult = { status: 'ready', profile: { ...defaultProfile }, issue: 'invalid-save' };
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return fallback; }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;
  const record = value as Record<string, unknown>;
  if (typeof record.version === 'number' && record.version > 1) return { ...fallback, status: 'unavailable', issue: 'unsupported-version' };
  if (record.version !== 1 || typeof record.nickname !== 'string' || !isAvatarId(record.avatarId)) return fallback;
  const name = validateNickname(record.nickname);
  if (name.error) return fallback;
  return { status: 'ready', profile: { nickname: name.nickname, avatarId: record.avatarId }, issue: null };
}

export function createProfileStore(storage: ProfileStorageAdapter) {
  let pendingWrite: Promise<void> = Promise.resolve();
  return {
    async load(): Promise<ProfileLoadResult> {
      try {
        const raw = await storage.getItem(PROFILE_STORAGE_KEY);
        return raw === null ? { status: 'ready', profile: { ...defaultProfile }, issue: null } : parseSavedProfile(raw);
      } catch { return { status: 'unavailable', profile: { ...defaultProfile }, issue: 'read-failed' }; }
    },
    save(profile: PlayerProfile): Promise<boolean> {
      const name = validateNickname(profile.nickname);
      if (name.error || !isAvatarId(profile.avatarId)) return Promise.resolve(false);
      // Capture only customizable values now; queued writes cannot overtake one another.
      const payload = JSON.stringify({ version: 1, nickname: name.nickname, avatarId: profile.avatarId });
      const write = pendingWrite.then(async () => {
        try { await storage.setItem(PROFILE_STORAGE_KEY, payload); return true; }
        catch { return false; }
      });
      pendingWrite = write.then(() => undefined);
      return write;
    },
  };
}
