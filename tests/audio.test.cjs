const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
const { AUDIO_STORAGE_KEY, defaultAudioSettings, validateAudioSettings, createAudioSettingsStore } = require('../src/game/audioSettings.ts');
const { createAudioController, trackForRoute } = require('../src/game/audioController.ts');
const { gameAudioMode, createPlaybackRequest } = require('../src/game/audioPlayback.ts');

test('Game audio is independent of silent/vibrate ringer without recording or background playback', () => {
  assert.equal(gameAudioMode.playsInSilentMode, true);
  assert.equal(gameAudioMode.shouldPlayInBackground, false);
  assert.equal(gameAudioMode.allowsRecording, false);
  assert.equal(gameAudioMode.allowsBackgroundRecording, false);
  // SDK 57 Android's native play gate: playsInSilentMode || ringerMode == NORMAL.
  for (const ringer of ['normal', 'silent', 'vibrate']) assert.equal(gameAudioMode.playsInSilentMode || ringer === 'normal', true);
});
test('Slow asset loading starts a pending request once, only after native readiness', () => {
  const request = createPlaybackRequest(); let starts = 0;
  request.request(); request.ready(false, () => starts++);
  assert.equal(starts, 0);
  request.ready(true, () => starts++); request.ready(true, () => starts++);
  assert.equal(starts, 1);
});
test('Muting, changing source, or backgrounding cancels delayed playback', () => {
  const request = createPlaybackRequest(); let starts = 0;
  request.request(); request.cancel(); request.ready(true, () => starts++);
  assert.equal(starts, 0);
  request.request(); request.ready(true, () => starts++); assert.equal(starts, 1);
});
test('Failed native starts are not marked as successfully started', () => {
  const request = createPlaybackRequest(); request.request();
  assert.throws(() => request.ready(true, () => { throw Error('native'); }));
  let starts = 0; request.ready(true, () => starts++); assert.equal(starts, 1);
});

function fixture() {
  const calls = [];
  const port = Object.fromEntries(['replace','play','pause','volume','effect','stopEffects','effectsVolume','dispose'].map(key => [key, (...args) => calls.push([key, ...args])]));
  const controller = createAudioController(port);
  controller.configure({ ...defaultAudioSettings, musicEnabled: true });
  controller.lifecycle(true, true);
  return { controller, calls, count: key => calls.filter(call => call[0] === key).length };
}
test('Audio starts quietly: music off, effects on, moderate independent volumes', () => {
  assert.deepEqual(defaultAudioSettings, { musicEnabled: false, effectsEnabled: true, musicVolume: .2, effectsVolume: .45 });
});
test('Settings validate types and clamp both volumes without accepting NaN', () => {
  assert.deepEqual(validateAudioSettings(null), defaultAudioSettings);
  assert.deepEqual(validateAudioSettings({ musicEnabled: 'yes', effectsEnabled: 0, musicVolume: NaN, effectsVolume: Infinity }), defaultAudioSettings);
  assert.equal(validateAudioSettings({ musicVolume: 4, effectsVolume: -2 }).musicVolume, 1);
  assert.equal(validateAudioSettings({ musicVolume: 4, effectsVolume: -2 }).effectsVolume, 0);
  assert.equal(validateAudioSettings({ musicVolume: -1, effectsVolume: 3 }).musicVolume, 0);
  assert.equal(validateAudioSettings({ musicVolume: -1, effectsVolume: 3 }).effectsVolume, 1);
});
test('Preferences persist only in their own versioned key', async () => {
  const data = new Map([['devquest.progression.v1', 'untouched'], ['devquest.profile.v1', 'untouched']]);
  const store = createAudioSettingsStore({ getItem: async key => data.get(key) ?? null, setItem: async (key, value) => data.set(key, value) });
  assert.deepEqual((await store.load()).settings, defaultAudioSettings);
  assert.equal(data.size, 2);
  const next = { ...defaultAudioSettings, musicEnabled: true, effectsVolume: .25 };
  assert.equal(await store.save(next), true);
  assert.deepEqual((await store.load()).settings, next);
  assert.deepEqual(JSON.parse(data.get(AUDIO_STORAGE_KEY)), { version: 1, ...next });
  assert.equal(data.get('devquest.progression.v1'), 'untouched');
  assert.equal(data.get('devquest.profile.v1'), 'untouched');
});
test('Damaged JSON falls back safely; future versions and read failure are protected', async () => {
  for (const raw of ['{bad', 'null', '{"version":2}']) {
    const store = createAudioSettingsStore({ getItem: async () => raw, setItem: async () => assert.fail('no automatic overwrite') });
    const result = await store.load();
    assert.deepEqual(result.settings, defaultAudioSettings);
    assert.ok(result.warning);
    if (raw !== '{bad') assert.equal(result.writable, false);
  }
  const failed = createAudioSettingsStore({ getItem: async () => { throw Error(); }, setItem: async () => {} });
  assert.equal((await failed.load()).writable, false);
});
test('Write failures resolve safely and do not poison later saves', async () => {
  let fail = true;
  const store = createAudioSettingsStore({ getItem: async () => null, setItem: async () => { if (fail) throw Error(); } });
  assert.equal(await store.save(defaultAudioSettings), false);
  fail = false;
  assert.equal(await store.save(defaultAudioSettings), true);
});
test('Rapid writes are serialized, snapshot values, and preserve newest settings', async () => {
  const values = []; let release;
  const gate = new Promise(resolve => { release = resolve; });
  const store = createAudioSettingsStore({ getItem: async () => null, setItem: async (_, value) => { if (!values.length) await gate; values.push(JSON.parse(value)); } });
  const first = { ...defaultAudioSettings, musicVolume: .1 };
  const a = store.save(first); first.musicVolume = .9;
  const b = store.save({ ...defaultAudioSettings, musicVolume: .7 });
  release(); await Promise.all([a,b]);
  assert.deepEqual(values.map(x => x.musicVolume), [.1,.7]);
});
test('Routes select exploration or battle, including boss and prototype', () => {
  for (const path of ['/', '/world-map', '/profile', '/tutorial', '/spellbook', '/victory']) assert.equal(trackForRoute(path), 'forest');
  for (const path of ['/battle', '/mission/python-forest-final-assessment']) assert.equal(trackForRoute(path), 'battle');
});
test('Home to map and repeated scene updates never restart the music transport', () => {
  const { controller, count } = fixture();
  controller.scene('/'); controller.scene('/world-map'); controller.scene('/profile'); controller.scene('/');
  assert.equal(count('play'), 1); assert.equal(count('replace'), 1);
});
test('Battle switches pause before replacing, with one play per distinct track', () => {
  const { controller, calls, count } = fixture();
  controller.scene('/mission/test'); controller.scene('/battle'); controller.scene('/world-map');
  assert.equal(count('play'), 3);
  assert.deepEqual(calls.filter(c => ['pause','replace','play'].includes(c[0])).slice(-6), [['pause'],['replace','battle'],['play'],['pause'],['replace','forest'],['play']]);
});
test('Disabling music or setting zero volume pauses; enabling resumes the same source', () => {
  const { controller, count } = fixture();
  controller.configure(defaultAudioSettings);
  const plays = count('play'); controller.scene('/world-map'); assert.equal(count('play'), plays);
  controller.configure({ ...defaultAudioSettings, musicEnabled: true, musicVolume: 0 }); assert.equal(count('play'), plays);
  controller.configure({ ...defaultAudioSettings, musicEnabled: true }); assert.equal(count('play'), plays + 1); assert.equal(count('replace'), 1);
});
test('Muted effects are suppressed immediately and not replayed upon unmute', () => {
  const { controller, count } = fixture(); const event = {};
  controller.configure({ ...defaultAudioSettings, effectsEnabled: false }); controller.effect('correct', event);
  assert.equal(count('effect'), 0);
  controller.configure(defaultAudioSettings); controller.effect('correct', event); assert.equal(count('effect'), 0);
  controller.effect('incorrect', {}); assert.equal(count('effect'), 1);
});
test('Each completion event plays once; a genuinely new replay attempt may celebrate', () => {
  const { controller, count } = fixture(); const attempt = {};
  controller.effect('victory', attempt); controller.effect('victory', attempt);
  assert.equal(count('effect'), 1);
  controller.effect('victory', {}); controller.effect('bossVictory', attempt); controller.effect('bossVictory', attempt);
  assert.equal(count('effect'), 3);
});
test('Background stops all audio; foreground resumes without replacing the current track', () => {
  const { controller, count } = fixture();
  controller.lifecycle(false); const plays = count('play');
  controller.effect('correct', {}); controller.scene('/world-map'); assert.equal(count('effect'), 0); assert.equal(count('play'), plays);
  controller.lifecycle(true); assert.equal(count('play'), plays + 1); assert.equal(count('replace'), 1);
  controller.dispose(); controller.lifecycle(true); controller.effect('victory', {});
  assert.equal(count('dispose'), 1); assert.equal(count('play'), plays + 1);
});
test('Unresolved preferences do not start music or effects', () => {
  const { controller, count } = fixture(); controller.lifecycle(true, false);
  const plays = count('play'); controller.scene('/battle'); controller.effect('correct', {});
  assert.equal(count('play'), plays); assert.equal(count('effect'), 0);
});
test('Volume updates apply to both transports without restarting music', () => {
  const { controller, calls, count } = fixture(); controller.configure({ ...defaultAudioSettings, musicEnabled: true, musicVolume: .3, effectsVolume: .2 });
  assert.ok(calls.some(c => c[0] === 'volume' && c[1] === .3));
  assert.ok(calls.some(c => c[0] === 'effectsVolume' && c[1] === .2)); assert.equal(count('play'), 1);
});
test('Native audio failures cannot escape into gameplay', () => {
  let errors = 0;
  const fail = () => { throw Error('native unavailable'); };
  const c = createAudioController({ replace: fail, play: fail, pause: fail, volume: fail, effect: fail, stopEffects: fail, effectsVolume: fail, dispose: fail }, () => errors++);
  assert.doesNotThrow(() => { c.lifecycle(true, true); c.effect('correct', {}); c.dispose(); }); assert.ok(errors > 0);
});
