import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync, type AudioPlayer } from 'expo-audio';
import { createPlaybackRequest, gameAudioMode } from '@/game/audioPlayback';
import { createAudioController, type AudioPort, type SoundEffect } from '@/game/audioController';
import { createAudioSettingsStore, defaultAudioSettings, validateAudioSettings, type AudioSettings } from '@/game/audioSettings';

const music = { forest: require('../../assets/audio/forest.mp3'), battle: require('../../assets/audio/battle.mp3') };
const effects = { correct: require('../../assets/audio/correct.wav'), incorrect: require('../../assets/audio/incorrect.wav'), victory: require('../../assets/audio/victory.wav'), bossVictory: require('../../assets/audio/boss-victory.wav') };
const store = createAudioSettingsStore(AsyncStorage);
type Controller = ReturnType<typeof createAudioController>;
const AudioContext = createContext<{
  settings: AudioSettings; ready: boolean; warning: string; update: (patch: Partial<AudioSettings>) => void;
  playEffect: (kind: SoundEffect, event: object) => void;
} | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const path = usePathname();
  const pathRef = useRef(path);
  const controller = useRef<Controller | null>(null);
  const preferences = useRef({ ...defaultAudioSettings });
  const writable = useRef(false);
  const revision = useRef(0);
  const alive = useRef(false);
  const [settings, setSettings] = useState({ ...defaultAudioSettings });
  const [ready, setReady] = useState(false);
  const [warning, setWarning] = useState('');

  useEffect(() => { pathRef.current = path; controller.current?.scene(path); }, [path]);
  useEffect(() => {
    let cancelled = false;
    let transport: Controller | null = null;
    let appState = AppState.currentState;
    let focused = true;
    let sessionReady = false;
    alive.current = true;
    const syncLifecycle = () => transport?.lifecycle(appState === 'active' && focused, sessionReady);
    const listener = AppState.addEventListener('change', (value) => { appState = value; syncLifecycle(); });
    const blur = AppState.addEventListener('blur', () => { focused = false; syncLifecycle(); });
    const focus = AppState.addEventListener('focus', () => { focused = true; syncLifecycle(); });
    const report = (error?: unknown, source = 'audio') => {
      if (cancelled) return;
      // Fixed labels only: native messages can contain asset URLs or local paths.
      if (__DEV__) console.warn('[DevQuest audio] Playback failed', { source, type: error instanceof Error ? 'exception' : 'native status error' });
      setWarning('Audio is unavailable right now. You can keep playing with all feedback on screen.');
    };
    void (async () => {
      const loaded = await store.load();
      if (cancelled) return;
      preferences.current = loaded.settings; writable.current = loaded.writable;
      setSettings(loaded.settings); setWarning(loaded.warning); setReady(true);
      const players = new Set<AudioPlayer>();
      const subscriptions = new Map<AudioPlayer, { remove(): void }>();
      const requests = new Map<AudioPlayer, ReturnType<typeof createPlaybackRequest>>();
      function observe(player: AudioPlayer, label: string) {
        const request = createPlaybackRequest(); requests.set(player, request);
        let lastError: string | null = null;
        subscriptions.set(player, player.addListener('playbackStatusUpdate', (status) => {
          if (status.error) {
            if (status.error !== lastError) report(undefined, label);
            lastError = status.error;
            return;
          }
          lastError = null;
          try { request.ready(status.isLoaded, () => player.play()); } catch (error) { report(error, label); }
        }));
        return request;
      }
      try {
        await setAudioModeAsync(gameAudioMode);
        if (cancelled) return;
        await setIsAudioActiveAsync(true);
        if (cancelled) return;
        sessionReady = true;
        const background = createAudioPlayer(null); players.add(background);
        const musicRequest = observe(background, 'Music');
        background.loop = true;
        const clips: Partial<Record<SoundEffect, AudioPlayer>> = {};
        let epoch = 0;
        const sequences: Partial<Record<SoundEffect, number>> = {};
        const port: AudioPort = {
          replace: (track) => { musicRequest.cancel(); background.replace(music[track]); background.loop = true; },
          play: () => { musicRequest.request(); musicRequest.ready(background.isLoaded, () => background.play()); },
          pause: () => { musicRequest.cancel(); background.pause(); }, volume: (value) => { background.volume = value; },
          effectsVolume: (value) => { Object.values(clips).forEach((clip) => { clip.volume = value; }); },
          stopEffects: () => {
            epoch++;
            // Release short clips: native foreground restoration can resume paused players.
            (Object.keys(clips) as SoundEffect[]).forEach((kind) => {
              const clip = clips[kind];
              if (clip) { requests.get(clip)?.cancel(); subscriptions.get(clip)?.remove(); subscriptions.delete(clip); requests.delete(clip); clip.pause(); clip.remove(); players.delete(clip); delete clips[kind]; }
            });
          },
          effect: (kind, volume) => {
            let clip = clips[kind];
            if (!clip) { clip = createAudioPlayer(effects[kind]); clips[kind] = clip; players.add(clip); observe(clip, kind); }
            const generation = epoch;
            const sequence = (sequences[kind] ?? 0) + 1; sequences[kind] = sequence;
            const request = requests.get(clip)!;
            request.cancel(); clip.pause(); clip.volume = volume;
            if (!clip.isLoaded) { request.request(); return; }
            void clip.seekTo(0).then(() => {
              if (!cancelled && generation === epoch && sequence === sequences[kind]) { request.request(); request.ready(clip.isLoaded, () => clip.play()); }
            }).catch((error) => { if (!cancelled && generation === epoch) report(error); });
          },
          dispose: () => { epoch++; subscriptions.forEach((subscription) => subscription.remove()); requests.forEach((request) => request.cancel()); players.forEach((player) => { try { player.remove(); } catch { /* Already released. */ } }); },
        };
        transport = createAudioController(port, report);
        controller.current = transport;
        transport.configure(preferences.current); transport.scene(pathRef.current); syncLifecycle();
      } catch (error) {
        subscriptions.forEach((subscription) => subscription.remove());
        requests.forEach((request) => request.cancel());
        players.forEach((player) => { try { player.remove(); } catch { /* Partial initialization. */ } });
        report(error);
      }
    })();
    return () => {
      cancelled = true; alive.current = false;
      listener.remove(); blur.remove(); focus.remove(); transport?.dispose(); controller.current = null;
    };
  }, []);

  function update(patch: Partial<AudioSettings>) {
    if (!ready) return;
    const next = validateAudioSettings({ ...preferences.current, ...patch });
    preferences.current = next; setSettings(next); controller.current?.configure(next);
    if (!writable.current) return;
    const version = ++revision.current;
    void store.save(next).then((saved) => {
      if (alive.current && version === revision.current) setWarning(saved ? '' : 'Audio settings could not be saved. They apply now; change a setting to retry.');
    });
  }
  return <AudioContext.Provider value={{ settings, ready, warning, update, playEffect: (kind, event) => controller.current?.effect(kind, event) }}>{children}</AudioContext.Provider>;
}
export function useGameAudio() {
  const value = useContext(AudioContext);
  if (!value) throw new Error('AudioProvider is required');
  return value;
}
