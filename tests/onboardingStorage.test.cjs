const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  module._compile(compiled.outputText, filename);
};

const { ONBOARDING_STORAGE_KEY, createOnboardingStore, shouldShowOnboarding } = require('../src/game/onboardingStorage.ts');
const { PROGRESSION_STORAGE_KEY } = require('../src/game/progressionStorage.ts');

function memoryStorage(initial = null) {
  const values = new Map();
  const writes = [];
  if (initial !== null) values.set(ONBOARDING_STORAGE_KEY, initial);
  return {
    values,
    writes,
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => { writes.push([key, value]); values.set(key, value); },
  };
}

test('New players see onboarding', async () => {
  const status = await createOnboardingStore(memoryStorage()).load();
  assert.equal(status, 'incomplete');
  assert.equal(shouldShowOnboarding(status, []), true);
});

test('Completion marker survives a new store instance and suppresses onboarding', async () => {
  const storage = memoryStorage();
  assert.equal(await createOnboardingStore(storage).complete(), true);
  const status = await createOnboardingStore(storage).load();
  assert.equal(status, 'complete');
  assert.equal(shouldShowOnboarding(status, []), false);
  assert.deepEqual(storage.writes, [[ONBOARDING_STORAGE_KEY, 'complete']]);
});

test('Established mission progress bypasses onboarding without changing storage', async () => {
  const storage = memoryStorage();
  const status = await createOnboardingStore(storage).load();
  assert.equal(shouldShowOnboarding(status, ['forest-awakening']), false);
  assert.deepEqual(storage.writes, []);
});

test('Onboarding never writes to the progression key', async () => {
  const storage = memoryStorage();
  storage.values.set(PROGRESSION_STORAGE_KEY, '{"version":1,"completedMissionIds":["existing"]}');
  const original = storage.values.get(PROGRESSION_STORAGE_KEY);
  await createOnboardingStore(storage).complete();
  assert.equal(storage.values.get(PROGRESSION_STORAGE_KEY), original);
  assert.ok(storage.writes.every(([key]) => key === ONBOARDING_STORAGE_KEY));
});

test('Read, write, and malformed marker failures are safe', async () => {
  const failing = createOnboardingStore({
    getItem: async () => { throw Error('read failed'); },
    setItem: async () => { throw Error('write failed'); },
  });
  assert.equal(await failing.load(), 'unavailable');
  assert.equal(await failing.complete(), false);
  assert.equal(shouldShowOnboarding('unavailable', []), false);
  assert.equal(shouldShowOnboarding('unavailable', ['existing']), false);
  assert.equal(await createOnboardingStore(memoryStorage('bad marker')).load(), 'unavailable');
});
