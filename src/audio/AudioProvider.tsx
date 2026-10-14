import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
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
  diagnostic: string; testSound: () => void;
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
  const [diagnostic, setDiagnostic] = useState('Audio not initialized');
  const directTest = useRef<() => void>(() => {});

  useEffect(() => { pathRef.current = path; controller.current?.scene(path); }, [path]);
  useEffect(() => {
    let cancelled = false;
    let transport: Controller | null = null;
    let appState = AppState.currentState;
    let focused = true;
    let sessionReady = false;
    alive.current = true;
    const log = (event: string, details?: Record<string, unknown>) => {
      if (__DEV__ && !cancelled) { console.info('[DevQuest audio]', event, details ?? {}); setDiagnostic(event); }
    };
    const syncLifecycle = () => transport?.lifecycle(appState === 'active' && focused, sessionReady);
    const listener = AppState.addEventListener('change', (value) => { appState = value; log(`AppState: ${value}`); syncLifecycle(); });
    const blur = AppState.addEventListener('blur', () => { focused = false; log('Window blurred'); syncLifecycle(); });
    const focus = AppState.addEventListener('focus', () => { focused = true; log('Window focused'); syncLifecycle(); });
    const report = (error?: unknown) => { if (!cancelled) { log('Playback error — check loading/session status', { type: error instanceof Error ? error.name : 'native status error' }); setWarning('Audio is unavailable right now. You can keep playing with all feedback on screen.'); } };
    void (async () => {
      const loaded = await store.load();
      if (cancelled) return;
      preferences.current = loaded.settings; writable.current = loaded.writable;
      setSettings(loaded.settings); setWarning(loaded.warning); setReady(true);
      log('Preferences restored', { ...loaded.settings });
      const players = new Set<AudioPlayer>();
      const subscriptions = new Map<AudioPlayer, { remove(): void }>();
      const requests = new Map<AudioPlayer, ReturnType<typeof createPlaybackRequest>>();
      function observe(player: AudioPlayer, label: string) {
        const request = createPlaybackRequest(); requests.set(player, request);
        let last = '';
        let advanced = false;
        subscriptions.set(player, player.addListener('playbackStatusUpdate', (status) => {
          const snapshot = { loaded: status.isLoaded, playing: status.playing, buffering: status.isBuffering, muted: status.mute, error: !!status.error };
          const signature = JSON.stringify(snapshot);
          if (signature !== last) {
            last = signature;
            log(`${label}: ${status.error ? 'native error' : status.isBuffering ? 'buffering' : status.playing ? 'playing' : status.isLoaded ? 'loaded / paused' : 'loading'}`, snapshot);
          }
          if (!advanced && status.playing && !status.isBuffering && status.currentTime > 0.1) { advanced = true; log(`${label}: playback position advancing`); }
          if (status.error) { log(`${label}: native error`, { message: status.error.replace(/(?:https?|file):\/\/\S+/g, '[audio source]') }); report(); return; }
          try { request.ready(status.isLoaded, () => { log(`${label}: play()`, { volume: player.volume, muted: player.muted }); player.play(); }); } catch (error) { report(error); }
        }));
        return request;
      }
      try {
        log('Initializing audio mode', gameAudioMode);
        await setAudioModeAsync(gameAudioMode);
        if (cancelled) return;
        await setIsAudioActiveAsync(true);
        if (cancelled) return;
        sessionReady = true;
        log('Audio session activated');
        const background = createAudioPlayer(null); players.add(background);
        const musicRequest = observe(background, 'Music');
        background.loop = true;
        const clips: Partial<Record<SoundEffect, AudioPlayer>> = {};
        let epoch = 0;
        const sequences: Partial<Record<SoundEffect, number>> = {};
        const sourceInfo = (source: number) => { const asset = Asset.fromModule(source); return { format: asset.type, location: asset.localUri ? 'local cache' : asset.uri.startsWith('http') ? 'Metro / Tunnel' : 'bundled' }; };
        const port: AudioPort = {
          replace: (track) => { musicRequest.cancel(); log(`Music source: ${track}`, sourceInfo(music[track])); background.replace(music[track]); background.loop = true; },
          play: () => { musicRequest.request(); musicRequest.ready(background.isLoaded, () => { log('Music: play()', { volume: background.volume, muted: background.muted }); background.play(); }); },
          pause: () => { musicRequest.cancel(); background.pause(); log('Music: pause()'); }, volume: (value) => { background.volume = value; },
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
            if (!clip) { log(`Effect source: ${kind}`, sourceInfo(effects[kind])); clip = createAudioPlayer(effects[kind]); clips[kind] = clip; players.add(clip); observe(clip, kind); }
            const generation = epoch;
            const sequence = (sequences[kind] ?? 0) + 1; sequences[kind] = sequence;
            const request = requests.get(clip)!;
            request.cancel(); clip.pause(); clip.volume = volume;
            if (!clip.isLoaded) { request.request(); return; }
            void clip.seekTo(0).then(() => {
              if (!cancelled && generation === epoch && sequence === sequences[kind]) { request.request(); request.ready(clip.isLoaded, () => { log(`${kind}: play()`, { volume: clip.volume, muted: clip.muted }); clip.play(); }); }
            }).catch((error) => { if (!cancelled && generation === epoch) report(error); });
          },
          dispose: () => { epoch++; subscriptions.forEach((subscription) => subscription.remove()); requests.forEach((request) => request.cancel()); players.forEach((player) => { try { player.remove(); } catch { /* Already released. */ } }); },
        };
        transport = createAudioController(port, report);
        controller.current = transport;
        transport.configure(preferences.current); transport.scene(pathRef.current); syncLifecycle();
        directTest.current = () => {
          log('Test Sound requested', { active: appState === 'active', focused, sessionReady, ...preferences.current });
          if (appState === 'active' && focused && sessionReady && preferences.current.effectsEnabled && preferences.current.effectsVolume > 0) {
            try { port.effect('correct', preferences.current.effectsVolume); } catch (error) { report(error); }
          } else log('Test Sound suppressed by lifecycle or effects settings');
        };
      } catch (error) {
        subscriptions.forEach((subscription) => subscription.remove());
        requests.forEach((request) => request.cancel());
        players.forEach((player) => { try { player.remove(); } catch { /* Partial initialization. */ } });
        report(error);
      }
    })();
    return () => {
      cancelled = true; alive.current = false;
      directTest.current = () => {};
      listener.remove(); blur.remove(); focus.remove(); transport?.dispose(); controller.current = null;
    };
  }, []);

  function update(patch: Partial<AudioSettings>) {
    if (!ready) return;
    const next = validateAudioSettings({ ...preferences.current, ...patch });
    preferences.current = next; setSettings(next); controller.current?.configure(next);
    if (__DEV__) console.info('[DevQuest audio] Preferences changed', next);
    if (!writable.current) return;
    const version = ++revision.current;
    void store.save(next).then((saved) => {
      if (alive.current && version === revision.current) setWarning(saved ? '' : 'Audio settings could not be saved. They apply now; change a setting to retry.');
    });
  }
  return <AudioContext.Provider value={{ settings, ready, warning, update, diagnostic, testSound: () => directTest.current(), playEffect: (kind, event) => controller.current?.effect(kind, event) }}>{children}</AudioContext.Provider>;
}
export function useGameAudio() {
  const value = useContext(AudioContext);
  if (!value) throw new Error('AudioProvider is required');
  return value;
}
