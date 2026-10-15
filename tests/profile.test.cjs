const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
};
const { avatars, defaultProfile, validateNickname, getPlayerStatistics, getPlayerLevel, getAchievements } = require('../src/game/profile.ts');
const { createProfileStore, parseSavedProfile, PROFILE_STORAGE_KEY } = require('../src/game/profileStorage.ts');
const { completeMission, getTotalEarnedXp } = require('../src/game/progression.ts');
const { missions } = require('../src/game/worldContent.ts');
const { startMissionAttempt, submitMissionAnswer, getPlayableMission } = require('../src/game/worldMission.ts');
const { PROGRESSION_STORAGE_KEY } = require('../src/game/progressionStorage.ts');
const { NOTES_STORAGE_KEY } = require('../src/game/notesStorage.ts');
const { ONBOARDING_STORAGE_KEY } = require('../src/game/onboardingStorage.ts');
const { isHydrating, shouldShowSkeleton, SKELETON_REVEAL_MS } = require('../src/game/hydration.ts');

function storage(initial = null) {
  const values = new Map(initial === null ? [] : [[PROFILE_STORAGE_KEY, initial]]);
  const writes = [];
  return { values, writes, getItem: async (key) => values.get(key) ?? null, setItem: async (key, value) => { writes.push([key, value]); values.set(key, value); } };
}
function complete(count) {
  let progress = { completedMissionIds: [] };
  for (const mission of missions.slice(0, count)) progress = completeMission(progress, mission.id).progress;
  return progress;
}

test('Missing profile loads Python Apprentice and Mage without writing defaults', async () => {
  const adapter = storage();
  const result = await createProfileStore(adapter).load();
  assert.deepEqual(result, { status: 'ready', profile: { nickname: 'Python Apprentice', avatarId: 'mage' }, issue: null });
  assert.deepEqual(adapter.writes, []);
});

test('Nickname validation trims, accepts 3–20 visible characters, and rejects invalid names', () => {
  for (const name of ['Ada', '  Rune Keeper  ', 'x'.repeat(20), 'Żółw']) {
    assert.deepEqual(validateNickname(name), { nickname: name.trim(), error: null });
  }
  for (const name of ['', '  ', 'ab', 'x'.repeat(21), 'Rune\nKeeper', 'Rune\u200bKeeper']) assert.ok(validateNickname(name).error, name);
});

test('Nickname and all avatar choices survive a fresh store instance', async () => {
  const adapter = storage();
  for (const avatar of avatars) {
    assert.equal(await createProfileStore(adapter).save({ nickname: '  Rune Keeper  ', avatarId: avatar.id }), true);
    const loaded = await createProfileStore(adapter).load();
    assert.deepEqual(loaded.profile, { nickname: 'Rune Keeper', avatarId: avatar.id });
    assert.equal(loaded.issue, null);
  }
});

test('Corrupted profile falls back safely without an automatic overwrite', async () => {
  for (const raw of ['{bad', 'null', '[]', '{}', '{"version":1,"nickname":"","avatarId":"mage"}', '{"version":1,"nickname":"Ada","avatarId":"missing"}', '{"version":1,"nickname":42,"avatarId":"mage"}']) {
    const adapter = storage(raw);
    const result = await createProfileStore(adapter).load();
    assert.equal(result.status, 'ready');
    assert.equal(result.issue, 'invalid-save');
    assert.deepEqual(result.profile, defaultProfile);
    assert.equal(adapter.values.get(PROFILE_STORAGE_KEY), raw);
    assert.deepEqual(adapter.writes, []);
  }
  assert.equal(parseSavedProfile('{"version":2}').status, 'unavailable');
});

test('Read failure is safe, invalid edits do not write, and failed saves can be retried', async () => {
  const unreadable = createProfileStore({ getItem: async () => { throw Error('read'); }, setItem: async () => {} });
  assert.equal((await unreadable.load()).issue, 'read-failed');
  const adapter = storage();
  let fail = true;
  const store = createProfileStore({ getItem: adapter.getItem, setItem: async (...args) => { if (fail) { fail = false; throw Error('disk'); } return adapter.setItem(...args); } });
  assert.equal(await store.save({ nickname: '', avatarId: 'mage' }), false);
  assert.equal(await store.save({ nickname: 'Ada', avatarId: 'unknown' }), false);
  assert.equal(adapter.writes.length, 0);
  assert.equal(await store.save({ nickname: 'Ada', avatarId: 'rogue' }), false);
  assert.deepEqual((await store.load()).profile, defaultProfile);
  assert.equal(await store.save({ nickname: 'Ada', avatarId: 'rogue' }), true);
  assert.deepEqual((await store.load()).profile, { nickname: 'Ada', avatarId: 'rogue' });
});

test('Rapid profile saves are ordered and capture the latest nickname and avatar', async () => {
  let release;
  const adapter = storage();
  let calls = 0;
  const store = createProfileStore({ getItem: adapter.getItem, setItem: async (...args) => {
    if (++calls === 1) await new Promise((resolve) => { release = resolve; });
    await adapter.setItem(...args);
  } });
  const first = store.save({ nickname: 'First Mage', avatarId: 'mage' });
  const finalProfile = { nickname: 'Last Knight', avatarId: 'knight' };
  const last = store.save(finalProfile);
  finalProfile.nickname = 'Mutated after Save';
  await new Promise(setImmediate);
  assert.equal(calls, 1);
  release();
  assert.deepEqual(await Promise.all([first, last]), [true, true]);
  assert.deepEqual((await store.load()).profile, { nickname: 'Last Knight', avatarId: 'knight' });
});

test('Profile writes contain only customization; other keys and earned XP stay unchanged', async () => {
  const progress = complete(3);
  const before = structuredClone(progress);
  const adapter = storage();
  for (const key of [PROGRESSION_STORAGE_KEY, NOTES_STORAGE_KEY, ONBOARDING_STORAGE_KEY]) adapter.values.set(key, `original:${key}`);
  await createProfileStore(adapter).save({ nickname: 'Ada', avatarId: 'wizard', totalXp: 9999, completedMissionIds: ['fake'] });
  assert.deepEqual(JSON.parse(adapter.values.get(PROFILE_STORAGE_KEY)), { version: 1, nickname: 'Ada', avatarId: 'wizard' });
  for (const key of [PROGRESSION_STORAGE_KEY, NOTES_STORAGE_KEY, ONBOARDING_STORAGE_KEY]) assert.equal(adapter.values.get(key), `original:${key}`);
  assert.deepEqual(progress, before);
  assert.equal(getPlayerStatistics(progress).totalXp, getTotalEarnedXp(before));
  assert.equal(completeMission(progress, missions[0].id).xpAwarded, 0);
});

test('Statistics count persisted completed missions, distinct exercises, and the actual boss', () => {
  const totals = [0, 20, 50, 90, 140, 200, 300];
  for (let count = 0; count <= 6; count++) {
    const stats = getPlayerStatistics(complete(count));
    assert.equal(stats.totalXp, totals[count]);
    assert.equal(stats.completedMissions, count);
    assert.equal(stats.completedExercises, count * 5);
    assert.equal(stats.defeatedBosses, count === 6 ? 1 : 0);
    assert.equal(stats.currentWorld, 'Forest of Variables');
  }
  const stats = getPlayerStatistics({ completedMissionIds: [missions[0].id, missions[0].id, 'missing'] });
  assert.equal(stats.totalXp, 20);
  assert.equal(stats.completedExercises, 5);
  assert.equal(stats.completedMissions, 1);
  assert.equal(getPlayerStatistics(complete(6)).worldProgress.percent, 100);
});

test('A correct spell in an unfinished mission does not inflate permanent profile statistics', () => {
  const progress = complete(0);
  const missionId = missions[0].id;
  const attempt = startMissionAttempt(progress, missionId);
  const answer = (getPlayableMission(progress, missionId).exercises[0].validation.correctOptionId ?? getPlayableMission(progress, missionId).exercises[0].validation.acceptedAnswers[0]);
  const result = submitMissionAnswer(progress, attempt, answer);
  assert.equal(result.status, 'correct');
  assert.equal(result.attempt.solvedExerciseIds.length, 1);
  assert.equal(getPlayerStatistics(result.progress).completedExercises, 0);
  assert.equal(getPlayerStatistics(result.progress).totalXp, 0);
});

test('Display-only level calculation has exact 100-XP boundaries', () => {
  assert.deepEqual(getPlayerLevel(0), { level: 1, xpInLevel: 0, xpPerLevel: 100, percent: 0 });
  assert.equal(getPlayerLevel(99).level, 1);
  assert.equal(getPlayerLevel(100).level, 2);
  assert.equal(getPlayerLevel(140).xpInLevel, 40);
  assert.equal(getPlayerLevel(300).level, 4);
  assert.equal(getPlayerLevel(-1).level, 1);
  assert.equal(getPlayerLevel(NaN).level, 1);
});

test('Achievements unlock only at their real mission and chapter milestones', () => {
  const expected = [[], ['first-spell'], ['first-spell'], ['first-spell', 'forest-explorer'], ['first-spell', 'forest-explorer'], ['first-spell', 'forest-explorer', 'bug-hunter'], ['first-spell', 'forest-explorer', 'bug-hunter', 'goblin-slayer']];
  for (let count = 0; count <= 6; count++) assert.deepEqual(getAchievements(complete(count)).filter((item) => item.unlocked).map((item) => item.id), expected[count]);
});

test('Unresolved hydration shows skeletons only after the visibility threshold', async () => {
  let release;
  const store = createProfileStore({ getItem: () => new Promise((resolve) => { release = resolve; }), setItem: async () => assert.fail('hydration must not save defaults') });
  let status = 'loading';
  const load = store.load().then((result) => { status = result.status; });
  assert.equal(isHydrating(status, 'ready'), true);
  assert.equal(shouldShowSkeleton(isHydrating(status), 0), false);
  assert.equal(shouldShowSkeleton(isHydrating(status), SKELETON_REVEAL_MS), true);
  release(null);
  await load;
  assert.equal(shouldShowSkeleton(isHydrating(status), 9999), false);
});

test('Resolved, failed, or background-saving data does not reenter skeleton loading', () => {
  assert.equal(isHydrating('ready', 'ready'), false);
  assert.equal(isHydrating('unavailable', 'ready'), false);
  assert.equal(isHydrating('ready', 'loading'), true);
  assert.equal(shouldShowSkeleton(false, 0), false);
  assert.equal(shouldShowSkeleton(false, 5000), false);
  // A note save does not change the profile/progression hydration inputs.
  const profileStatus = 'ready'; const progressionStatus = 'ready';
  for (const noteSave of ['pending', 'saved', 'failed']) assert.equal(isHydrating(profileStatus, progressionStatus), false, noteSave);
});
