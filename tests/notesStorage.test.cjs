const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  module._compile(compiled.outputText, filename);
};

const { createNotesStore, deleteExerciseNote, isValidExerciseId, MAX_NOTE_LENGTH, NOTES_STORAGE_KEY, parseSavedNotes, setExerciseNote } = require('../src/game/notesStorage.ts');
const { exercises } = require('../src/game/worldContent.ts');
const { PROGRESSION_STORAGE_KEY } = require('../src/game/progressionStorage.ts');
const { ONBOARDING_STORAGE_KEY } = require('../src/game/onboardingStorage.ts');

const firstId = exercises[0].id;
const secondId = exercises[1].id;

function memoryStorage(initial = null) {
  const values = new Map();
  const writes = [];
  if (initial !== null) values.set(NOTES_STORAGE_KEY, initial);
  return {
    values,
    writes,
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => { writes.push([key, value]); values.set(key, value); },
  };
}

test('Notes attach only to known stable exercise IDs and have a 1000-character limit', () => {
  assert.equal(isValidExerciseId(firstId), true);
  assert.equal(isValidExerciseId('unknown-exercise'), false);
  const first = setExerciseNote({}, firstId, 'Remember print()');
  assert.deepEqual(first, { [firstId]: 'Remember print()' });
  assert.equal(setExerciseNote(first, 'unknown-exercise', 'hidden'), first);
  const second = setExerciseNote(first, secondId, 'x'.repeat(MAX_NOTE_LENGTH + 20));
  assert.equal(second[firstId], 'Remember print()');
  assert.equal(second[secondId].length, MAX_NOTE_LENGTH);
  assert.equal(Object.keys(second).length, 2);
  assert.equal(first[secondId], undefined);
});

test('Notes survive save and restore, then can be edited and deleted', async () => {
  const storage = memoryStorage();
  let notes = setExerciseNote({}, firstId, 'First draft');
  assert.equal(await createNotesStore(storage).save(notes), true);
  notes = (await createNotesStore(storage).load()).notes;
  assert.equal(notes[firstId], 'First draft');
  notes = setExerciseNote(notes, firstId, 'Better explanation');
  assert.equal(await createNotesStore(storage).save(notes), true);
  notes = (await createNotesStore(storage).load()).notes;
  assert.equal(notes[firstId], 'Better explanation');
  notes = deleteExerciseNote(notes, firstId);
  assert.equal(await createNotesStore(storage).save(notes), true);
  assert.deepEqual((await createNotesStore(storage).load()).notes, {});
  assert.equal(deleteExerciseNote(notes, 'unknown-exercise'), notes);
  assert.deepEqual(setExerciseNote({ [firstId]: 'written' }, firstId, '   '), {});
});

test('Malformed and future-version saved notes are unavailable and remain untouched', async () => {
  for (const raw of ['{bad', '{}', '{"version":1}', '{"version":1,"notes":[]}', '{"version":2,"notes":{}}']) {
    const storage = memoryStorage(raw);
    const result = await createNotesStore(storage).load();
    assert.equal(result.status, 'unavailable');
    assert.deepEqual(result.notes, {});
    assert.equal(storage.values.get(NOTES_STORAGE_KEY), raw);
    assert.deepEqual(storage.writes, []);
  }
  assert.equal(parseSavedNotes('{"version":2,"notes":{}}').reason, 'unsupported-version');
});

test('Unknown IDs, non-string values, and oversized notes are sanitized on load and save', async () => {
  const storage = memoryStorage(JSON.stringify({ version: 1, notes: { [firstId]: 'x'.repeat(MAX_NOTE_LENGTH + 10), bogus: 'unsafe', [secondId]: 7 } }));
  const result = await createNotesStore(storage).load();
  assert.equal(result.status, 'ready');
  assert.deepEqual(Object.keys(result.notes), [firstId]);
  assert.equal(result.notes[firstId].length, MAX_NOTE_LENGTH);
  await createNotesStore(storage).save({ [firstId]: 'safe', bogus: 'unsafe' });
  assert.deepEqual(JSON.parse(storage.values.get(NOTES_STORAGE_KEY)), { version: 1, notes: { [firstId]: 'safe' } });
});

test('Read and write failures are safe; a failed write does not block a later save', async () => {
  const failing = createNotesStore({
    getItem: async () => { throw Error('read failed'); },
    setItem: async () => { throw Error('write failed'); },
  });
  assert.equal((await failing.load()).reason, 'read-failed');
  assert.equal(await failing.save({ [firstId]: 'note' }), false);
  const storage = memoryStorage();
  let failOnce = true;
  const store = createNotesStore({
    getItem: storage.getItem,
    setItem: async (...args) => {
      if (failOnce) { failOnce = false; throw Error('interrupted'); }
      await storage.setItem(...args);
    },
  });
  assert.equal(await store.save({ [firstId]: 'first' }), false);
  assert.equal(await store.save({ [firstId]: 'second' }), true);
  assert.equal((await store.load()).notes[firstId], 'second');
});

test('Rapid saves finish in order with the newest note retained', async () => {
  let releaseFirst;
  let value = null;
  const writes = [];
  const store = createNotesStore({
    getItem: async () => value,
    setItem: async (_key, payload) => {
      writes.push(payload);
      if (writes.length === 1) await new Promise((resolve) => { releaseFirst = resolve; });
      value = payload;
    },
  });
  const first = store.save({ [firstId]: 'old' });
  const latest = store.save({ [firstId]: 'new' });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(writes.length, 1);
  releaseFirst();
  assert.equal(await first, true);
  assert.equal(await latest, true);
  assert.equal(writes.length, 2);
  assert.equal((await store.load()).notes[firstId], 'new');
});

test('Notes use their own storage key and never write progression or onboarding', async () => {
  const storage = memoryStorage();
  storage.values.set(PROGRESSION_STORAGE_KEY, 'progress');
  storage.values.set(ONBOARDING_STORAGE_KEY, 'complete');
  await createNotesStore(storage).save({ [firstId]: 'private note' });
  assert.deepEqual(storage.writes.map(([key]) => key), [NOTES_STORAGE_KEY]);
  assert.equal(storage.values.get(PROGRESSION_STORAGE_KEY), 'progress');
  assert.equal(storage.values.get(ONBOARDING_STORAGE_KEY), 'complete');
});
