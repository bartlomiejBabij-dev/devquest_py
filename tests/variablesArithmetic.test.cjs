const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);

const { exercises, missions } = require('../src/game/worldContent.ts');
const { lessons, getLessonForExercise } = require('../src/game/lessonContent.ts');
const { getVisibleLesson, initialLessonSession, lessonSessionReducer } = require('../src/game/lessonSession.ts');
const { isChoiceExercise, isExerciseAnswerCorrect, getIncorrectAnswerFeedback } = require('../src/game/exerciseValidation.ts');
const { startMissionAttempt, submitMissionAnswer, continueMissionAttempt } = require('../src/game/worldMission.ts');
const { getTotalEarnedXp, isMissionCompleted, isMissionUnlocked, isWorldUnlocked } = require('../src/game/progression.ts');
const { parseSavedProgression, createProgressionStore } = require('../src/game/progressionStorage.ts');
const { getPlayerStatistics, getAchievements } = require('../src/game/profile.ts');
const { getSpellbookEntryForExercise } = require('../src/game/spellbookContent.ts');
const { createNotesStore, setExerciseNote } = require('../src/game/notesStorage.ts');
const preExpansion = require('./helpers/preExpansionContent.cjs');
const baseline = require('./fixtures/learning-compatibility.json');
const fireId = 'python-forest-fire-essence-01';
const manaId = 'python-forest-mana-stones-01';
const targetMissions = [fireId, manaId].map(id => missions.find(m => m.id === id));
const targetExercises = targetMissions.flatMap(m => m.exerciseIds.map(id => exercises.find(e => e.id === id)));
const find = suffix => targetExercises.find(e => e.id === `python-forest-${suffix}`);

// Independently reviewed answers, not generated from validation.correctOptionId.
const reviewed = [
  ['fire-essence-assignment', 'b', '10', 'mana = ____', ['"10"', '1']],
  ['fire-essence-read', 'c', 'mana is a name for the stored number 10.', 'mana = 10\nprint(mana)', ['print() always shows 10.', 'mana is quoted text.']],
  ['fire-essence-update', 'b', '7', 'mana = 4\nmana = mana + 3\nprint(mana)', ['4', '3', '43']],
  ['fire-essence-print', 'a', 'Mage', 'hero = "Mage"\nprint(hero)', ['hero', '"Mage"']],
  ['fire-essence-name', 'c', 'flame', 'flame = 8\nprint(____)', ['flmae', '"flame"']],
  ['mana-stones-operator', 'b', '-', 'mana = 20\nremaining = mana ____ 5', ['+', '=']],
  ['mana-stones-addition', 'c', '7', 'stones = 3 + 4\nprint(stones)', ['34', '4']],
  ['mana-stones-multiplication', 'c', '*', 'power = 2 ____ 5', ['+', 'x']],
  ['mana-stones-precedence', 'a', '14', 'print(2 + 3 * 4)', ['20', '9']],
  ['mana-stones-damage', 'b', '13', 'power = 6\nbonus = 2\ndamage = power * bonus + 1\nprint(damage)', ['18', '12']],
];

test('Variables/arithmetic keep original IDs, order, five questions and 30/40 XP; all ten questions use taps', () => {
  assert.deepEqual(targetMissions.map(m => ({ id: m.id, exerciseIds: m.exerciseIds, xpReward: m.xpReward })), baseline.missions.filter(m => [fireId, manaId].includes(m.id)));
  assert.deepEqual(targetMissions.map(m => m.xpReward), [30, 40]);
  assert.deepEqual(targetExercises.map(e => e.id), reviewed.map(row => `python-forest-${row[0]}`));
  for (const mission of targetMissions) {
    assert.equal(mission.exerciseIds.length, 5);
    assert.equal(new Set(mission.exerciseIds).size, 5);
    assert.ok(targetExercises.filter(e => mission.exerciseIds.includes(e.id)).every(isChoiceExercise));
  }
  assert.equal(targetExercises.filter(e => !isChoiceExercise(e)).length, 0);
  assert.equal(targetExercises.slice(0, 5).filter(e => ['multiple-choice', 'output-choice'].includes(e.type)).length, 3);
  assert.equal(targetExercises.slice(5).filter(e => e.type === 'output-choice').length, 3);
  assert.equal(targetExercises.slice(5).filter(e => e.type === 'missing-token').length, 2);
  assert.deepEqual(new Set(Object.keys(baseline.unchangedExercises)), new Set(preExpansion.exercises.filter(e => !targetExercises.includes(e)).map(e => e.id)), 'baseline must cover every other exercise, including Awakening and Crossroads');
});

test('Every authored option has exactly one correct stable ID, unique text and misconception feedback', () => {
  for (const [suffix, answerSuffix, label, code, wrongLabels] of reviewed) {
    const exercise = find(suffix);
    const correctId = `${exercise.id}-${answerSuffix}`;
    assert.equal(exercise.code, code);
    assert.equal(exercise.validation.correctOptionId, correctId);
    assert.equal(exercise.options.find(o => o.id === correctId).label, label);
    assert.deepEqual(exercise.options.filter(o => o.id !== correctId).map(o => o.label), wrongLabels);
    assert.ok(exercise.options.length >= 3 && exercise.options.length <= 4);
    assert.equal(new Set(exercise.options.map(o => o.id)).size, exercise.options.length);
    assert.equal(new Set(exercise.options.map(o => o.label)).size, exercise.options.length);
    assert.equal(exercise.options.filter(o => isExerciseAnswerCorrect(exercise, o.id)).length, 1);
    for (const option of exercise.options) {
      assert.equal(isExerciseAnswerCorrect(exercise, option.id), option.id === correctId);
      assert.equal(isExerciseAnswerCorrect(exercise, option.label), false, 'display text cannot bypass stable IDs');
      assert.ok(option.feedback.length > 30);
      if (option.id !== correctId) assert.equal(getIncorrectAnswerFeedback(exercise, option.id), option.feedback);
    }
    for (const invalid of ['', 'unknown', ` ${correctId}`, correctId.toUpperCase(), `${exercise.id}-unknown`, 'python-forest-awakening-print-b']) {
      assert.equal(isExerciseAnswerCorrect(exercise, invalid), false);
    }
    assert.equal(isExerciseAnswerCorrect({ ...exercise, options: [...exercise.options].reverse() }, correctId), true);
    assert.equal(isExerciseAnswerCorrect({ ...exercise, options: exercise.options.filter(o => o.id !== correctId) }, correctId), false);
  }
});

test('Reviewed outputs follow numeric addition, reassignment, text printing and multiplication precedence', () => {
  // Fixed arithmetic, independently calculated from the reviewed code above.
  // No exercise source or player input is executed as Python or JavaScript.
  const outputs = [
    ['fire-essence-update', String(4 + 3)],
    ['fire-essence-print', 'Mage'],
    ['mana-stones-addition', String(3 + 4)],
    ['mana-stones-precedence', String(2 + (3 * 4))],
    ['mana-stones-damage', String((6 * 2) + 1)],
  ];
  for (const [suffix, output] of outputs) {
    const exercise = find(suffix);
    assert.equal(exercise.type, 'output-choice');
    assert.equal(exercise.options.filter(o => o.label === output).length, 1);
    assert.equal(exercise.options.find(o => o.label === output).id, exercise.validation.correctOptionId);
  }
  assert.notEqual(2 + 3 * 4, (2 + 3) * 4, 'precedence distractor is genuinely wrong');
  assert.notEqual(6 * 2 + 1, 6 * (2 + 1), 'applied calculation distractor is genuinely wrong');
  assert.equal(20 - 5, 15);
  assert.equal(2 * 5, 10);
  assert.ok(!targetExercises.some(e => e.code.includes('/')), 'division is outside the original integer curriculum');
});

const lessonExamples = [
  ['python-lesson-variables', 'health = 100\nprint(health)', '100'],
  ['python-lesson-variable-update', 'mana = 10\nmana = mana + 5\nprint(mana)', '15'],
  ['python-lesson-variable-text', 'hero = "Ranger"\nprint(hero)', 'Ranger'],
  ['python-lesson-add-subtract', 'crystals = 9\nremaining = crystals - 3\nprint(remaining)', '6'],
  ['python-lesson-multiply', 'damage = 4 * 3\nprint(damage)', '12'],
  ['python-lesson-calculation-order', 'power = 3\nbonus = 2\nprint(1 + power * bonus)', '7'],
];

test('Six concise lessons have independently reviewed examples, output and relevant teaching rules', () => {
  for (const [id, code, output] of lessonExamples) {
    const lesson = lessons.find(l => l.id === id);
    assert.ok(lesson);
    assert.equal(lesson.codeExample, code);
    assert.equal(lesson.expectedOutput, output);
    for (const field of ['title', 'explanation', 'whyItWorks', 'importantRule']) assert.ok(lesson[field].trim());
    assert.ok([lesson.explanation, lesson.whyItWorks, lesson.importantRule].join(' ').split(/\s+/).length <= 110);
  }
  const variables = lessons.find(l => l.id === 'python-lesson-variables');
  assert.match(variables.explanation, /name for a stored value/);
  assert.match(variables.importantRule, /One = assigns; == compares/);
  const update = lessons.find(l => l.id === 'python-lesson-variable-update');
  assert.match(update.whyItWorks, /old mana value, 10, adds 5, then stores 15/);
  assert.match(update.importantRule, /right side of = first/);
  assert.match(lessons.find(l => l.id === 'python-lesson-multiply').importantRule, /star \*.*not x.*×/);
  assert.match(lessons.find(l => l.id === 'python-lesson-calculation-order').importantRule, /multiplication comes before addition and subtraction/);
  for (const exercise of targetExercises) {
    const lesson = getLessonForExercise(exercise);
    assert.ok(lessonExamples.some(([id]) => id === lesson?.id));
    assert.notEqual(lesson.codeExample, exercise.code);
    assert.notEqual(lesson.expectedOutput, exercise.options.find(o => o.id === exercise.validation.correctOptionId).label, 'review example must not give this question\'s answer');
  }
});

test('Concept lessons appear before their first dependent challenge; each mission introduces only three cards', () => {
  // Explicit curriculum sequence: foundational assignment before reading;
  // addition/reassignment before updates; strings before printing text;
  // subtraction/addition, then *, then precedence before the damage calculation.
  const expectedLessons = [
    ['variables', 'variables', 'variable-update', 'variable-text', 'variables'],
    ['add-subtract', 'add-subtract', 'multiply', 'calculation-order', 'calculation-order'],
  ];
  targetMissions.forEach((mission, missionIndex) => {
    let session = initialLessonSession;
    const introducedAt = [];
    mission.exerciseIds.forEach((id, index) => {
      const exercise = exercises.find(e => e.id === id);
      const lessonId = `python-lesson-${expectedLessons[missionIndex][index]}`;
      assert.equal(exercise.lessonId, lessonId);
      const view = getVisibleLesson(exercise, 'answering', false, session);
      if (view) {
        assert.equal(view.lesson.id, lessonId);
        assert.equal(view.introduction, true);
        introducedAt.push(index);
        session = lessonSessionReducer(session, { type: 'continue', lessonId });
      }
      assert.ok(session.seenLessonIds.includes(lessonId), `${id}: concept must already be taught`);
      assert.equal(getVisibleLesson(exercise, 'answering', false, session), null);
    });
    assert.deepEqual(introducedAt, [0, 2, 3]);
  });
});

test('Both missions reject locked entry; wrong answers stay put, success advances once and rewards are paid once', () => {
  targetMissions.forEach((mission, missionIndex) => {
    assert.equal(startMissionAttempt({ completedMissionIds: [] }, mission.id), null);
    let progress = { completedMissionIds: missions.slice(0, missionIndex + 1).map(m => m.id) };
    assert.ok(isMissionUnlocked(progress, mission.id));
    for (let replay = 0; replay < 2; replay++) {
      let attempt = startMissionAttempt(progress, mission.id);
      let earned = 0;
      for (const id of mission.exerciseIds) {
        const exercise = exercises.find(e => e.id === id);
        const correctId = exercise.validation.correctOptionId;
        for (const wrong of exercise.options.filter(o => o.id !== correctId)) {
          const submission = submitMissionAnswer(progress, attempt, wrong.id);
          assert.equal(submission.status, 'incorrect');
          assert.equal(submission.attempt, attempt);
          assert.equal(submission.progress, progress);
          assert.equal(submission.xpAwarded, 0);
        }
        const submission = submitMissionAnswer(progress, attempt, correctId);
        assert.equal(submission.status, 'correct');
        assert.equal(submission.attempt.phase, 'solved', 'explanation stays until Continue');
        assert.equal(submission.attempt.solvedExerciseIds.length, attempt.solvedExerciseIds.length + 1);
        assert.equal(submission.xpAwarded, replay === 0 && attempt.exerciseIndex === 4 ? [30, 40][missionIndex] : 0);
        const duplicate = submitMissionAnswer(submission.progress, submission.attempt, correctId);
        assert.equal(duplicate.status, 'ignored');
        assert.equal(duplicate.attempt, submission.attempt);
        assert.equal(duplicate.xpAwarded, 0);
        earned += submission.xpAwarded;
        progress = submission.progress;
        attempt = continueMissionAttempt(submission.attempt, 5);
        assert.equal(continueMissionAttempt(attempt, 5), attempt, 'double Continue cannot skip a question');
      }
      assert.equal(attempt.phase, 'complete');
      assert.equal(earned, replay === 0 ? [30, 40][missionIndex] : 0);
      assert.equal(getTotalEarnedXp(progress), [50, 90][missionIndex]);
      assert.equal(isMissionCompleted(progress, mission.id), true);
    }
  });
});

test('Replay skips introductions; review and Spellbook preserve selected answers and an unfinished attempt', () => {
  for (const mission of targetMissions) {
    const progress = { completedMissionIds: missions.slice(0, 3).map(m => m.id) };
    const attempt = startMissionAttempt(progress, mission.id);
    const exercise = exercises.find(e => e.id === mission.exerciseIds[0]);
    const selectedId = exercise.options.find(o => o.id !== exercise.validation.correctOptionId).id;
    const wrong = submitMissionAnswer(progress, attempt, selectedId);
    const before = JSON.stringify({ progress, attempt: wrong.attempt, selectedId });
    assert.equal(getVisibleLesson(exercise, 'answering', true, initialLessonSession), null);
    let session = lessonSessionReducer(initialLessonSession, { type: 'review' });
    assert.equal(getVisibleLesson(exercise, 'answering', true, session)?.introduction, false);
    assert.ok(getSpellbookEntryForExercise(exercise.id));
    session = lessonSessionReducer(session, { type: 'continue', lessonId: exercise.lessonId });
    assert.equal(getVisibleLesson(exercise, 'answering', true, session), null);
    assert.equal(JSON.stringify({ progress, attempt: wrong.attempt, selectedId }), before);
    assert.equal(getTotalEarnedXp(progress), 90);
  }
});

test('Legacy saves preserve XP, completions, stats, achievements and world gates at every completion point', async () => {
  for (let count = 0; count <= preExpansion.missions.length; count++) {
    const ids = baseline.missions.slice(0, count).map(m => m.id);
    const loaded = parseSavedProgression(JSON.stringify({ version: 1, completedMissionIds: ids }));
    assert.equal(loaded.status, 'ready');
    assert.deepEqual(loaded.progression.completedMissionIds, ids);
    assert.equal(getTotalEarnedXp(loaded.progression), [0, 20, 50, 90, 140, 200, 300, 370, 450][count]);
    assert.equal(getPlayerStatistics(loaded.progression).completedExercises, count * 5);
    assert.equal(isWorldUnlocked(loaded.progression, 'python-valley-of-decisions'), count >= 6);
    assert.equal(getAchievements(loaded.progression).find(a => a.id === 'goblin-slayer').unlocked, count >= 6);
    assert.equal(isMissionUnlocked(loaded.progression, fireId), count >= 1);
    assert.equal(isMissionUnlocked(loaded.progression, manaId), count >= 2);
    const saved = new Map();
    const adapter = { getItem: async key => saved.get(key) ?? null, setItem: async (key, value) => { saved.set(key, value); } };
    await createProgressionStore(adapter).save(loaded.progression);
    assert.deepEqual((await createProgressionStore(adapter).load()).progression, loaded.progression);
  }
});

test('Existing exercise notes and all ten Spellbook associations survive the presentation change', async () => {
  const expectedEntries = ['python-variables', 'python-variables', 'python-variables', 'python-print', 'python-debugging', 'python-operators', 'python-integers', 'python-operators', 'python-operators', 'python-integers'];
  let notes = {};
  targetExercises.forEach((exercise, index) => {
    assert.equal(getSpellbookEntryForExercise(exercise.id)?.id, expectedEntries[index]);
    notes = setExerciseNote(notes, exercise.id, `My saved reminder ${index}`);
  });
  const saved = new Map();
  const adapter = { getItem: async key => saved.get(key) ?? null, setItem: async (key, value) => { saved.set(key, value); } };
  await createNotesStore(adapter).save(notes);
  assert.deepEqual((await createNotesStore(adapter).load()).notes, notes);
});
