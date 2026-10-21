const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  module._compile(compiled.outputText, filename);
};

const { chapters, exercises } = require('../src/game/worldContent.ts');
const { exerciseSpellbookEntryIds, getSpellbookEntryForExercise, spellbookEntries } = require('../src/game/spellbookContent.ts');
const { continueMissionAttempt, getPlayableMission, startMissionAttempt, submitMissionAnswer } = require('../src/game/worldMission.ts');
const { getTotalEarnedXp, initialProgressionState, isMissionCompleted } = require('../src/game/progression.ts');

const expectedTitles = [
  'print() and output',
  'Variables and assignments',
  'Integers and arithmetic',
  'Python operators',
  'Strings',
  'Joining strings',
  'len() and string length',
  'Common syntax mistakes',
  'Basic debugging',
  'Boolean values',
  'Comparison operators',
  'if statements',
  'else statements',
  'Python indentation',
  'elif and multiple branches',
  'and: both conditions',
  'or: at least one condition',
  'not: reverse a Boolean',
  'for loops',
  'range()',
  'while loops',
];

test('Spellbook covers all twenty-one beginner Python concepts with complete content', () => {
  assert.deepEqual(spellbookEntries.map((entry) => entry.title), expectedTitles);
  assert.equal(new Set(spellbookEntries.map((entry) => entry.id)).size, spellbookEntries.length);
  const chapterIds = new Set(chapters.map((chapter) => chapter.id));
  for (const entry of spellbookEntries) {
    for (const field of ['id', 'title', 'explanation', 'codeExample', 'commonMistake', 'expectedOutput']) {
      assert.ok(entry[field]?.trim(), `${entry.id}: missing ${field}`);
    }
    assert.ok(chapterIds.has(entry.chapterId), `${entry.id}: invalid chapter`);
    assert.ok(entry.codeExample.includes('print('), `${entry.id}: example should display its result`);
  }
});

test('All 72 exercises resolve to a valid relevant Spellbook entry', () => {
  const exerciseIds = new Set(exercises.map((exercise) => exercise.id));
  assert.deepEqual(new Set(Object.keys(exerciseSpellbookEntryIds)), exerciseIds);
  const entryIds = new Set(spellbookEntries.map((entry) => entry.id));
  for (const exercise of exercises) {
    const entryId = exerciseSpellbookEntryIds[exercise.id];
    assert.ok(entryIds.has(entryId), `${exercise.id}: unknown entry`);
    assert.equal(getSpellbookEntryForExercise(exercise.id)?.id, entryId);
  }
  assert.equal(getSpellbookEntryForExercise('missing'), null);
  assert.equal(getSpellbookEntryForExercise('toString'), null);
});

test('Reference examples avoid copying exercise code or giving its exact output answer', () => {
  for (const exercise of exercises) {
    const entry = getSpellbookEntryForExercise(exercise.id);
    assert.notEqual(entry.codeExample, exercise.code, exercise.id);
    const answers = exercise.validation.kind === 'option-id' ? exercise.options.filter(o => o.id === exercise.validation.correctOptionId).map(o => o.label) : exercise.type === 'code-builder' ? [exercise.expectedOutput] : exercise.validation.acceptedAnswers;
    assert.ok(!answers.includes(entry.expectedOutput), `${exercise.id}: reference output is an exercise answer`);
  }
});

test('Looking up a concept during an active mission preserves exercise position and progression', () => {
  const missionId = 'python-forest-awakening-01';
  const progress = initialProgressionState;
  const playable = getPlayableMission(progress, missionId);
  let attempt = startMissionAttempt(progress, missionId);
  assert.ok(playable);
  assert.ok(attempt);

  const firstAnswer = (playable.exercises[0].validation.correctOptionId ?? playable.exercises[0].validation.acceptedAnswers[0]);
  const submission = submitMissionAnswer(progress, attempt, firstAnswer);
  assert.equal(submission.status, 'correct');
  attempt = continueMissionAttempt(submission.attempt, playable.exercises.length);
  assert.equal(attempt.exerciseIndex, 1);
  assert.equal(attempt.phase, 'answering');

  const attemptBeforeLookup = structuredClone(attempt);
  const progressBeforeLookup = structuredClone(submission.progress);
  const xpBeforeLookup = getTotalEarnedXp(submission.progress);
  const activeExerciseId = playable.exercises[attempt.exerciseIndex].id;
  const entry = getSpellbookEntryForExercise(activeExerciseId);

  assert.ok(entry);
  assert.equal(entry.id, exerciseSpellbookEntryIds[activeExerciseId]);
  assert.deepEqual(attempt, attemptBeforeLookup);
  assert.deepEqual(submission.progress, progressBeforeLookup);
  assert.equal(getTotalEarnedXp(submission.progress), xpBeforeLookup);
  assert.equal(isMissionCompleted(submission.progress, missionId), false);
});
