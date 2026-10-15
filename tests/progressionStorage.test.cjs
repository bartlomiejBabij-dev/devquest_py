const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  module._compile(compiled.outputText, filename);
};

const { createProgressionStore, parseSavedProgression, PROGRESSION_STORAGE_KEY } = require('../src/game/progressionStorage.ts');
const { initialProgressionSession, progressionSessionReducer, shouldPersistProgression } = require('../src/game/progressionSession.ts');
const { completeMission, getTotalEarnedXp, getWorldProgress, isChapterUnlocked } = require('../src/game/progression.ts');
const { forestChapters: chapters, forestOfVariables, forestMissions: missions } = require('../src/game/worldContent.ts');
const { continueMissionAttempt, startMissionAttempt, submitMissionAnswer, getPlayableMission } = require('../src/game/worldMission.ts');

function memoryStorage(initial = null) {
  let value = initial;
  const writes = [];
  return { writes, getItem: async () => value, setItem: async (key, next) => { assert.equal(key, PROGRESSION_STORAGE_KEY); writes.push(next); value = next; }, value: () => value };
}

function completeThrough(index) {
  let progression = { completedMissionIds: [] };
  for (const mission of missions.slice(0, index + 1)) progression = completeMission(progression, mission.id).progress;
  return progression;
}

test('Completed missions save in a minimal versioned record and restore XP and unlocks', async () => {
  const storage = memoryStorage();
  const store = createProgressionStore(storage);
  const progress = completeThrough(0);
  assert.equal(await store.save(progress), true);
  assert.deepEqual(JSON.parse(storage.value()), { version: 1, completedMissionIds: [missions[0].id] });
  const restored = await createProgressionStore(storage).load();
  assert.equal(restored.status, 'ready');
  assert.deepEqual(restored.progression, progress);
  assert.equal(getTotalEarnedXp(restored.progression), missions[0].xpReward);
  assert.equal(isChapterUnlocked(restored.progression, chapters[1].id), true);
});

test('Boss completion restores World 1 at 100%; replay after relaunch grants no XP', async () => {
  const storage = memoryStorage();
  const fullProgress = completeThrough(missions.length - 1);
  await createProgressionStore(storage).save(fullProgress);
  let progress = (await createProgressionStore(storage).load()).progression;
  assert.equal(getWorldProgress(progress, forestOfVariables.id).percent, 100);
  assert.equal(getTotalEarnedXp(progress), forestOfVariables.xpReward);
  let attempt = startMissionAttempt(progress, missions.at(-1).id);
  for (let index = 0; index < 5; index++) {
    const exercise = getPlayableMission(progress, attempt.missionId).exercises[index];
    const result = submitMissionAnswer(progress, attempt, (exercise.validation.correctOptionId ?? exercise.validation.acceptedAnswers[0]));
    assert.equal(result.xpAwarded, 0);
    progress = result.progress;
    attempt = continueMissionAttempt(result.attempt, 5);
  }
  assert.equal(attempt.result.xpAwarded, 0);
  await createProgressionStore(storage).save(progress);
  const again = await createProgressionStore(storage).load();
  assert.equal(getTotalEarnedXp(again.progression), forestOfVariables.xpReward);
  assert.equal(getWorldProgress(again.progression, forestOfVariables.id).percent, 100);
});

test('First launch has empty progress and hydration cannot write the initial state', async () => {
  const storage = memoryStorage();
  const store = createProgressionStore(storage);
  const loaded = await store.load();
  assert.equal(loaded.status, 'ready');
  assert.deepEqual(loaded.progression.completedMissionIds, []);
  assert.equal(shouldPersistProgression(initialProgressionSession), false);
  const hydrated = progressionSessionReducer(initialProgressionSession, { type: 'hydrate', result: loaded });
  assert.equal(shouldPersistProgression(hydrated), false);
  assert.equal(storage.writes.length, 0);
  const changed = progressionSessionReducer(hydrated, { type: 'completeMission', missionId: missions[0].id });
  assert.equal(shouldPersistProgression(changed), true);
  await store.save(changed.progression);
  assert.equal(storage.writes.length, 1);
});

test('Corrupt, incomplete, and future-version records stay untouched', async () => {
  for (const raw of ['{broken', '{}', '{"version":1}', '{"version":1,"completedMissionIds":[3]}', '{"version":2,"completedMissionIds":[]}']) {
    const storage = memoryStorage(raw);
    const result = await createProgressionStore(storage).load();
    assert.equal(result.status, 'unavailable');
    assert.deepEqual(result.progression.completedMissionIds, []);
    const hydrated = progressionSessionReducer(initialProgressionSession, { type: 'hydrate', result });
    assert.equal(shouldPersistProgression(hydrated), false);
    const played = progressionSessionReducer(hydrated, { type: 'completeMission', missionId: missions[0].id });
    assert.deepEqual(played.progression.completedMissionIds, [missions[0].id]);
    assert.equal(shouldPersistProgression(played), false);
    assert.equal(storage.value(), raw);
    assert.equal(storage.writes.length, 0);
  }
  assert.equal(parseSavedProgression('{"version":2,"completedMissionIds":[]}').reason, 'unsupported-version');
});

test('Duplicate, unknown, out-of-order, and locked mission IDs are sanitized through domain rules', () => {
  const requested = [missions[2].id, 'unknown', missions[1].id, missions[0].id, missions[1].id, missions[4].id];
  const result = parseSavedProgression(JSON.stringify({ version: 1, completedMissionIds: requested }));
  assert.equal(result.status, 'ready');
  assert.deepEqual(result.progression.completedMissionIds, missions.slice(0, 3).map((mission) => mission.id));
  assert.equal(getTotalEarnedXp(result.progression), missions.slice(0, 3).reduce((sum, mission) => sum + mission.xpReward, 0));
  assert.equal(isChapterUnlocked(result.progression, chapters[3].id), true);
  assert.equal(isChapterUnlocked(result.progression, chapters[4].id), false);
});

test('Storage read and write failures do not throw or block later saves', async () => {
  const failure = createProgressionStore({ getItem: async () => { throw Error('read failed'); }, setItem: async () => { throw Error('write failed'); } });
  assert.equal((await failure.load()).reason, 'read-failed');
  assert.equal(await failure.save(completeThrough(0)), false);
  let fail = true;
  const storage = memoryStorage();
  const store = createProgressionStore({ getItem: storage.getItem, setItem: async (...args) => { if (fail) { fail = false; throw Error('interrupted'); } await storage.setItem(...args); } });
  assert.equal(await store.save(completeThrough(0)), false);
  assert.equal(await store.save(completeThrough(1)), true);
  assert.deepEqual((await store.load()).progression.completedMissionIds, missions.slice(0, 2).map((mission) => mission.id));
});

test('Queued rapid saves finish in order, leaving the newest progression on disk', async () => {
  let releaseFirst;
  let value = null;
  const writes = [];
  const store = createProgressionStore({
    getItem: async () => value,
    setItem: async (_key, payload) => {
      writes.push(payload);
      if (writes.length === 1) await new Promise((resolve) => { releaseFirst = resolve; });
      value = payload;
    },
  });
  const first = store.save(completeThrough(0));
  const latest = store.save(completeThrough(1));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(writes.length, 1);
  releaseFirst();
  assert.equal(await first, true);
  assert.equal(await latest, true);
  assert.equal(writes.length, 2);
  assert.deepEqual((await store.load()).progression.completedMissionIds, missions.slice(0, 2).map((mission) => mission.id));
});
