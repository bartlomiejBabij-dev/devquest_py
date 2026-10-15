const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  module._compile(compiled.outputText, filename);
};

const { forestChapters: chapters, forestExercises: exercises, forestMissions: missions } = require('../src/game/worldContent.ts');
const { isExerciseAnswerCorrect } = require('../src/game/exerciseValidation.ts');
const { continueMissionAttempt, getPlayableMission, startMissionAttempt, submitMissionAnswer } = require('../src/game/worldMission.ts');
const { getTotalEarnedXp, initialProgressionState } = require('../src/game/progression.ts');

const expectedSequenceIds = [
  ['python-forest-awakening-print', 'python-forest-awakening-literal', 'python-forest-awakening-number', 'python-forest-awakening-output', 'python-forest-awakening-repair'],
  ['python-forest-fire-essence-assignment', 'python-forest-fire-essence-read', 'python-forest-fire-essence-update', 'python-forest-fire-essence-print', 'python-forest-fire-essence-name'],
  ['python-forest-mana-stones-operator', 'python-forest-mana-stones-addition', 'python-forest-mana-stones-multiplication', 'python-forest-mana-stones-precedence', 'python-forest-mana-stones-damage'],
  ['python-forest-talking-trees-output', 'python-forest-talking-trees-variable', 'python-forest-talking-trees-repeat', 'python-forest-talking-trees-length', 'python-forest-talking-trees-repair'],
  ['python-forest-broken-spells-name', 'python-forest-broken-spells-parenthesis', 'python-forest-broken-spells-quotes', 'python-forest-broken-spells-assignment', 'python-forest-broken-spells-debug'],
  ['python-forest-goblin-king-output', 'python-forest-goblin-king-variable', 'python-forest-goblin-king-string', 'python-forest-goblin-king-arithmetic', 'python-forest-goblin-king-debug'],
];

const reviewedAnswers = [
  ['print', '"Forest"', '7', 'Spark', 'print'],
  ['10', '10', '7', 'print', 'flame'],
  ['-', '7', '*', '14', '13'],
  ['Hello, Pyromancer', 'Oak', 'hahaha', '6', '"3"'],
  ['energy', ')', '"Fire"', '=', 'power'],
  ['Pyro\n6', '5', 'Fireball', '*', 'power'],
];

test('Exactly five ordered exercises belong to each chapter and every reference resolves', () => {
  assert.equal(exercises.length, 30);
  assert.equal(new Set(exercises.map((exercise) => exercise.id)).size, 30);
  assert.deepEqual(missions.map((mission) => mission.exerciseIds), expectedSequenceIds);
  assert.deepEqual(new Set(missions.flatMap((mission) => mission.exerciseIds)), new Set(exercises.map((exercise) => exercise.id)));
  for (const chapter of chapters) {
    const chapterMissions = missions.filter((mission) => mission.chapterId === chapter.id);
    assert.deepEqual(chapter.missionIds, chapterMissions.map((mission) => mission.id));
    assert.equal(chapterMissions.flatMap((mission) => mission.exerciseIds).length, 5);
    for (const mission of chapterMissions) {
      for (const id of mission.exerciseIds) assert.equal(exercises.find((exercise) => exercise.id === id)?.chapterId, chapter.id);
    }
  }
});

test('All exercises have complete beginner content and accepted answers pass exact validation', () => {
  const types = new Set();
  for (const exercise of exercises) {
    types.add(exercise.type);
    assert.equal(exercise.languageId, 'python');
    assert.ok(['intro', 'practice', 'challenge'].includes(exercise.difficulty));
    for (const field of ['concept', 'prompt', 'code', 'hint', 'explanation']) assert.ok(exercise[field].trim(), `${exercise.id}: ${field}`);
    assert.ok(exercise.validation.acceptedAnswers.length > 0, exercise.id);
    assert.equal(exercise.validation.kind, 'exact');
    for (const answer of exercise.validation.acceptedAnswers) {
      assert.ok(answer.trim(), exercise.id);
      assert.equal(isExerciseAnswerCorrect(exercise, answer), true, `${exercise.id}: ${answer}`);
    }
    if (exercise.type === 'choose-operator') {
      assert.equal(new Set(exercise.options).size, exercise.options.length);
      for (const answer of exercise.validation.acceptedAnswers) assert.ok(exercise.options.includes(answer));
      for (const wrong of exercise.options.filter((option) => !exercise.validation.acceptedAnswers.includes(option))) {
        assert.equal(isExerciseAnswerCorrect(exercise, wrong), false, `${exercise.id}: ${wrong}`);
      }
    }
    assert.equal(isExerciseAnswerCorrect(exercise, ''), false, exercise.id);
    assert.equal(isExerciseAnswerCorrect(exercise, 'definitely wrong'), false, exercise.id);
  }
  assert.deepEqual(types, new Set(['fill-blank', 'predict-output', 'fix-mistake', 'choose-operator']));
});

test('Reviewed expected answers match every authored exercise', () => {
  for (let chapterIndex = 0; chapterIndex < expectedSequenceIds.length; chapterIndex++) {
    for (let exerciseIndex = 0; exerciseIndex < 5; exerciseIndex++) {
      const exercise = exercises.find((item) => item.id === expectedSequenceIds[chapterIndex][exerciseIndex]);
      const expected = reviewedAnswers[chapterIndex][exerciseIndex];
      assert.ok(exercise.validation.acceptedAnswers.includes(expected), exercise.id);
      assert.equal(isExerciseAnswerCorrect(exercise, expected), true, exercise.id);
    }
  }
});

test('Explicit equivalent quotes are accepted without ignoring meaningful case or inner spaces', () => {
  const literal = exercises.find((exercise) => exercise.id === 'python-forest-awakening-literal');
  assert.equal(isExerciseAnswerCorrect(literal, '"Forest"'), true);
  assert.equal(isExerciseAnswerCorrect(literal, "'Forest'"), true);
  assert.equal(isExerciseAnswerCorrect(literal, 'Forest'), false);
  assert.equal(isExerciseAnswerCorrect(literal, '"forest"'), false);
  const output = exercises.find((exercise) => exercise.id === 'python-forest-talking-trees-output');
  assert.equal(isExerciseAnswerCorrect(output, 'Hello,  Pyromancer'), false);
});

test('Every authored exercise is playable in order and XP remains mission based', () => {
  let progress = initialProgressionState;
  for (let index = 0; index < missions.length; index++) {
    const mission = missions[index];
    const playable = getPlayableMission(progress, mission.id);
    assert.deepEqual(playable.exercises.map((exercise) => exercise.id), expectedSequenceIds[index]);
    let attempt = startMissionAttempt(progress, mission.id);
    for (let exerciseIndex = 0; exerciseIndex < 5; exerciseIndex++) {
      const exercise = playable.exercises[exerciseIndex];
      const submission = submitMissionAnswer(progress, attempt, reviewedAnswers[index][exerciseIndex]);
      assert.equal(submission.status, 'correct');
      assert.equal(submission.xpAwarded, exerciseIndex === 4 ? mission.xpReward : 0);
      progress = submission.progress;
      attempt = continueMissionAttempt(submission.attempt, 5);
    }
    assert.equal(attempt.phase, 'complete');
  }
  assert.equal(getTotalEarnedXp(progress), 300);
});
