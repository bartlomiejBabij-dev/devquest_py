export interface AudioSettings { musicEnabled: boolean; effectsEnabled: boolean; musicVolume: number; effectsVolume: number }
export const defaultAudioSettings: AudioSettings = { musicEnabled: false, effectsEnabled: true, musicVolume: 0.2, effectsVolume: 0.45 };
export const AUDIO_STORAGE_KEY = 'devquest.audio.v1';
export function clampVolume(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;
}
export function validateAudioSettings(value: unknown): AudioSettings {
  const record = value && typeof value === 'object' ? value as Partial<AudioSettings> : {};
  return {
    musicEnabled: typeof record.musicEnabled === 'boolean' ? record.musicEnabled : defaultAudioSettings.musicEnabled,
    effectsEnabled: typeof record.effectsEnabled === 'boolean' ? record.effectsEnabled : defaultAudioSettings.effectsEnabled,
    musicVolume: clampVolume(record.musicVolume, defaultAudioSettings.musicVolume),
    effectsVolume: clampVolume(record.effectsVolume, defaultAudioSettings.effectsVolume),
  };
}
export function createAudioSettingsStore(storage: { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> }) {
  let pending = Promise.resolve();
  return {
    async load() {
      try {
        const raw = await storage.getItem(AUDIO_STORAGE_KEY);
        if (!raw) return { settings: { ...defaultAudioSettings }, writable: true, warning: '' };
        let value;
        try { value = JSON.parse(raw); } catch { return { settings: { ...defaultAudioSettings }, writable: true, warning: 'Saved audio preferences were damaged. Defaults are in use.' }; }
        if (value?.version !== 1) return { settings: { ...defaultAudioSettings }, writable: false, warning: 'Audio preferences have an unsupported version. Changes will apply for this session only.' };
        return { settings: validateAudioSettings(value), writable: true, warning: '' };
      } catch { return { settings: { ...defaultAudioSettings }, writable: false, warning: 'Audio preferences could not be loaded. Changes will apply for this session only.' }; }
    },
    save(settings: AudioSettings) {
      const payload = JSON.stringify({ version: 1, ...validateAudioSettings(settings) });
      const write = pending.then(async () => { try { await storage.setItem(AUDIO_STORAGE_KEY, payload); return true; } catch { return false; } });
      pending = write.then(() => undefined);
      return write;
    },
  };
}
