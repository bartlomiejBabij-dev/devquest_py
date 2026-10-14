import { defaultAudioSettings, validateAudioSettings, type AudioSettings } from './audioSettings';
export type MusicTrack = 'forest' | 'battle';
export type SoundEffect = 'correct' | 'incorrect' | 'victory' | 'bossVictory';
export function trackForRoute(path: string): MusicTrack { return path === '/battle' || path.startsWith('/mission/') ? 'battle' : 'forest'; }
export interface AudioPort {
  replace(track: MusicTrack): void; play(): void; pause(): void; volume(value: number): void;
  effect(kind: SoundEffect, volume: number): void; stopEffects(): void; effectsVolume(value: number): void; dispose(): void;
}
/** One music transport. Native details are injected so lifecycle decisions can be tested. */
export function createAudioController(port: AudioPort, onError: (error?: unknown) => void = () => {}) {
  let settings = { ...defaultAudioSettings };
  let track: MusicTrack = 'forest';
  let loaded: MusicTrack | null = null;
  let playing = false;
  let active = false;
  let ready = false;
  let disposed = false;
  const events = new WeakMap<object, Set<SoundEffect>>();
  const safely = (action: () => void) => { try { action(); } catch (error) { onError(error); } };
  function sync() {
    if (disposed) return;
    safely(() => {
      port.volume(settings.musicVolume);
      port.effectsVolume(settings.effectsVolume);
      if (!active || !ready || !settings.effectsEnabled) port.stopEffects();
      if (!active || !ready || !settings.musicEnabled || settings.musicVolume === 0) {
        port.pause(); playing = false; return;
      }
      if (loaded !== track) { port.pause(); playing = false; port.replace(track); loaded = track; }
      if (!playing) { port.play(); playing = true; }
    });
  }
  return {
    configure(next: AudioSettings) { settings = validateAudioSettings(next); sync(); },
    scene(path: string) { track = trackForRoute(path); sync(); },
    lifecycle(isActive: boolean, isReady = ready) { active = isActive; ready = isReady; sync(); },
    effect(kind: SoundEffect, event: object) {
      const seen = events.get(event) ?? new Set<SoundEffect>();
      if (seen.has(kind)) return;
      seen.add(kind); events.set(event, seen);
      if (!disposed && active && ready && settings.effectsEnabled && settings.effectsVolume > 0) safely(() => port.effect(kind, settings.effectsVolume));
    },
    dispose() { disposed = true; safely(() => port.pause()); safely(() => port.stopEffects()); safely(() => port.dispose()); },
  };
}
