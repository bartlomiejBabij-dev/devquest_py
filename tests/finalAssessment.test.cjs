const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
const { worlds, chapters, missions, exercises } = require('../src/game/worldContent.ts');
const { lessons, getLessonForExercise } = require('../src/game/lessonContent.ts');
const { initialLessonSession, getVisibleLesson, lessonSessionReducer } = require('../src/game/lessonSession.ts');
const { isChoiceExercise, isExerciseAnswerCorrect, getIncorrectAnswerFeedback } = require('../src/game/exerciseValidation.ts');
const { startMissionAttempt, submitMissionAnswer, continueMissionAttempt } = require('../src/game/worldMission.ts');
const { getGoblinKingHp, goblinKingMissionId } = require('../src/game/boss.ts');
const { isWorldUnlocked, getTotalEarnedXp, getWorldProgress } = require('../src/game/progression.ts');
const { createProgressionStore, parseSavedProgression } = require('../src/game/progressionStorage.ts');
const { getPlayerStatistics, getAchievements } = require('../src/game/profile.ts');
const { exerciseSpellbookEntryIds, getSpellbookEntryForExercise } = require('../src/game/spellbookContent.ts');
const { createNotesStore, setExerciseNote } = require('../src/game/notesStorage.ts');
const preExpansion = require('./helpers/preExpansionContent.cjs');
const baseline = require('./fixtures/final-assessment-compatibility.json');
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const targetMissions = [goblinKingMissionId, 'python-valley-guardian-01'].map(id => missions.find(m => m.id === id));
const targets = targetMissions.flatMap(m => m.exerciseIds.map(id => exercises.find(e => e.id === id)));
const boss = suffix => exercises.find(e => e.id === `python-forest-goblin-king-${suffix}`);
const guardian = suffix => exercises.find(e => e.id === `python-valley-guardian-${suffix}`);

// Independent review: exact source, intended choice and all other labels.
const reviewed = [
  [boss('output'), 'c', 'Pyro\n6', 'hero = "Pyro"\nspells = 2 * 3\nprint(hero)\nprint(spells)', ['hero\nspells', 'Pyro\n5', '6\nPyro']],
  [boss('variable'), 'b', '5', 'flame = 4\nflame = flame + 1\nprint(flame)', ['4', '1']],
  [boss('string'), 'd', 'Fireball', 'print("Fire" + "ball")', ['Fire ball', 'fireball', '"Fireball"']],
  [boss('arithmetic'), 'b', '*', 'damage = 3 ____ 4\nprint(damage)', ['+', '-']],
  [guardian('if'), 'b', 'if', 'mana = 5\n____ mana >= 3:\n    print("Cast")', ['else', 'print']],
  [guardian('indent'), 'c', 'mana = 5\nif mana >= 3:\n    print("Cast")', 'mana = 5\nif mana >= 3:\nprint("Cast")', ['mana = 5\nif mana >= 3:\nprint("Cast")', 'mana = 5\n    if mana >= 3:\n    print("Cast")']],
  [guardian('skip'), 'b', 'Ready', 'mana = 1\nif mana >= 3:\n    print("Cast")\nprint("Ready")', ['Cast\nReady', 'Cast']],
  [guardian('else'), 'a', 'else', 'mana = 1\nif mana >= 3:\n    print("Cast")\n____:\n    print("Rest")', ['if', 'False']],
  [guardian('branch'), 'b', 'mana = 2\nif mana < 3:\n    print("Rest")\nelse:\n    print("Cast")', 'mana = 2\nif mana >= 3:\n    print("Rest")\nelse:\n    print("Cast")', ['mana = 2\nif mana <= 3:\n    print("Rest")\nelse:\n    print("Cast")', 'mana = 2\nif mana >= 3:\n    print("Rest")\nelse:\n    print("Cast")']],
];

test('Final conversion preserves all IDs, rewards, prerequisites, links, other 30 exercises and 17 earlier lessons', () => {
  for (const [name, value] of Object.entries({ worlds: preExpansion.worlds, chapters: preExpansion.chapters, missions: preExpansion.missions, spellbookLinks: preExpansion.spellbookLinks })) assert.equal(hash(value), baseline[name], name);
  assert.deepEqual(targets.map(e => e.id), baseline.targetIds);
  assert.deepEqual(targetMissions.map(m => m.exerciseIds.length), [5, 5]);
  assert.deepEqual(targetMissions.map(m => m.xpReward), [100, 80]);
  assert.deepEqual(new Set(Object.keys(baseline.unchangedExercises)), new Set(preExpansion.exercises.filter(e => !targets.includes(e)).map(e => e.id)));
  assert.equal(Object.keys(baseline.unchangedExercises).length, 30);
  for (const [id, expected] of Object.entries(baseline.unchangedExercises)) assert.equal(hash(exercises.find(e => e.id === id)), expected, id);
  assert.equal(Object.keys(baseline.existingLessons).length, 17);
  for (const [id, expected] of Object.entries(baseline.existingLessons)) assert.equal(hash(lessons.find(l => l.id === id)), expected, id);
  assert.equal(targets.slice(0, 5).filter(isChoiceExercise).length, 4);
  assert.equal(targets.slice(5).filter(isChoiceExercise).length, 5);
  assert.equal(preExpansion.exercises.filter(isChoiceExercise).length, 38);
  assert.ok(exercises.every(e => getLessonForExercise(e)), 'all forty exercises now have teaching or recap help');
});

test('Reviewed tap answers use stable IDs, reject every distractor and raw label, and have exactly one correct option', () => {
  for (const [exercise, letter, label, code, distractors] of reviewed) {
    const id = `${exercise.id}-${letter}`;
    assert.equal(exercise.code, code);
    assert.equal(exercise.validation.correctOptionId, id);
    assert.equal(exercise.options.find(o => o.id === id).label, label);
    assert.deepEqual(exercise.options.filter(o => o.id !== id).map(o => o.label), distractors);
    assert.equal(new Set(exercise.options.map(o => o.id)).size, exercise.options.length);
    assert.equal(new Set(exercise.options.map(o => o.label)).size, exercise.options.length);
    assert.equal(exercise.options.filter(o => isExerciseAnswerCorrect(exercise, o.id)).length, 1);
    for (const option of exercise.options) {
      assert.equal(isExerciseAnswerCorrect(exercise, option.id), option.id === id);
      assert.equal(isExerciseAnswerCorrect(exercise, option.label), false);
      assert.ok(option.feedback.length > 30);
      if (option.id !== id) assert.equal(getIncorrectAnswerFeedback(exercise, option.id), option.feedback);
    }
    for (const invalid of ['', 'unknown', 'toString', ` ${id}`, `${id} `, id.toUpperCase(), 'python-forest-awakening-print-b']) assert.equal(isExerciseAnswerCorrect(exercise, invalid), false);
    assert.equal(isExerciseAnswerCorrect({ ...exercise, options: [...exercise.options].reverse() }, id), true);
    assert.equal(isExerciseAnswerCorrect({ ...exercise, options: exercise.options.filter(o => o.id !== id) }, id), false);
  }
});

test('Mastery recall remains one short exact identifier; no full program, extra statements or case changes pass', () => {
  const exercise = boss('debug');
  assert.equal(exercise.code, 'power = 3\nprint(powr * 2)');
  assert.deepEqual(exercise.validation, { kind: 'exact', acceptedAnswers: ['power'], caseSensitive: true });
  assert.match(exercise.prompt, /type only the variable name/);
  for (const value of ['power', ' power ']) assert.equal(isExerciseAnswerCorrect(exercise, value), true);
  for (const value of ['Power', 'powr', '6', '"power"', 'power * 2', 'print(power * 2)', 'power\nprint(6)', 'power; import os']) assert.equal(isExerciseAnswerCorrect(exercise, value), false);
  assert.equal(exercise.code.replace('powr', 'power'), 'power = 3\nprint(power * 2)');
  assert.match(exercise.explanation, /powr is undefined/);
});

test('Reviewed outputs, indentation and branch boundaries match the stated Python semantics', () => {
  // Fixed calculations cross-check the reviewed literal snippets, never execute input or content.
  const outputs = [[boss('output'), `Pyro\n${2 * 3}`], [boss('variable'), String(4 + 1)], [boss('string'), 'Fire' + 'ball'], [guardian('skip'), 1 >= 3 ? 'Cast\nReady' : 'Ready']];
  for (const [e, output] of outputs) assert.equal(e.options.find(o => o.id === e.validation.correctOptionId).label, output);
  const indent = guardian('indent');
  assert.equal(indent.optionFormat, 'code');
  assert.deepEqual(indent.options.map(o => o.label.split('\n').map(line => line.length - line.trimStart().length)), [[0, 0, 0], [0, 4, 4], [0, 0, 4]]);
  const branch = guardian('branch');
  assert.equal(branch.optionFormat, 'code');
  for (const option of branch.options) {
    assert.deepEqual(option.label.split('\n').map(line => line.length - line.trimStart().length), [0, 0, 4, 0, 4]);
    assert.ok(option.label.split('\n').every(line => line.length <= 18), 'snippets remain short on narrow screens');
  }
  const rule = mana => mana < 3 ? 'Rest' : 'Cast';
  assert.deepEqual([0, 2, 3, 4].map(rule), ['Rest', 'Rest', 'Cast', 'Cast']);
  assert.notEqual(3 <= 3 ? 'Rest' : 'Cast', rule(3), 'the <= distractor fails exactly at the boundary');
  assert.notEqual(2 >= 3 ? 'Rest' : 'Cast', rule(2), 'the >= distractor reverses the branches');
  assert.match(branch.prompt, /3 or more.*boundary/);
  assert.match(indent.explanation, /syntax error/);
});

const lessonReview = [
  ['forest-mastery', 'name = "Rune"\ncharge = 2\ncharge = charge + 2\nprint(name + "stone")\nprint(charge * 2)', 'Runestone\n8'],
  ['if-block', 'keys = 4\nif keys > 2:\n    print("Unlock")', 'Unlock'],
  ['skipping-blocks', 'keys = 0\nif keys > 2:\n    print("Unlock")\nprint("Waiting")', 'Waiting'],
  ['else-branches', 'coins = 4\nif coins < 4:\n    print("Save")\nelse:\n    print("Buy")', 'Buy'],
];

test('Four short cards have reviewed examples; Guardian introduces if/indent, skipping, then else before assessment', () => {
  for (const [suffix, code, output] of lessonReview) {
    const lesson = lessons.find(l => l.id === `python-lesson-${suffix}`);
    assert.equal(lesson.codeExample, code);
    assert.equal(lesson.expectedOutput, output);
    for (const field of ['title', 'explanation', 'codeExample', 'expectedOutput', 'whyItWorks', 'importantRule']) assert.ok(lesson[field].trim());
    assert.ok([lesson.explanation, lesson.whyItWorks, lesson.importantRule].join(' ').split(/\s+/).length <= 110);
  }
  assert.match(getLessonForExercise(guardian('indent')).importantRule, /four spaces/);
  assert.match(getLessonForExercise(guardian('skip')).explanation, /False.*skips/);
  assert.match(getLessonForExercise(guardian('branch')).whyItWorks, /excludes equality/);
  const expected = ['if-block', 'if-block', 'skipping-blocks', 'else-branches', 'else-branches'];
  let session = initialLessonSession;
  const introduced = [];
  targets.slice(5).forEach((exercise, index) => {
    assert.equal(exercise.lessonId, `python-lesson-${expected[index]}`);
    const view = getVisibleLesson(exercise, 'answering', false, session);
    if (view) {
      assert.equal(view.introduction, true);
      introduced.push(index);
      session = lessonSessionReducer(session, { type: 'continue', lessonId: exercise.lessonId });
    }
    assert.ok(session.seenLessonIds.includes(exercise.lessonId));
    assert.equal(getVisibleLesson(exercise, 'answering', false, session), null);
    assert.equal(getVisibleLesson(exercise, 'answering', true, initialLessonSession), null);
  });
  assert.deepEqual(introduced, [0, 2, 3]);
});

test('Boss recap is optional even before the first spell; help during both encounters preserves attempt and selection', () => {
  for (const exercise of targets.slice(0, 5)) {
    assert.equal(exercise.lessonId, 'python-lesson-forest-mastery');
    assert.equal(getVisibleLesson(exercise, 'answering', false, initialLessonSession), null);
    assert.equal(getVisibleLesson(exercise, 'answering', true, initialLessonSession), null);
  }
  for (const mission of targetMissions) {
    const progress = { completedMissionIds: missions.slice(0, missions.indexOf(mission)).map(m => m.id) };
    const attempt = startMissionAttempt(progress, mission.id);
    const exercise = exercises.find(e => e.id === mission.exerciseIds[0]);
    const selected = exercise.options.find(o => o.id !== exercise.validation.correctOptionId).id;
    const wrong = submitMissionAnswer(progress, attempt, selected);
    const snapshot = structuredClone({ attempt: wrong.attempt, progress: wrong.progress, selected });
    let session = lessonSessionReducer(initialLessonSession, { type: 'continue', lessonId: exercise.lessonId });
    session = lessonSessionReducer(session, { type: 'review' });
    const view = getVisibleLesson(exercise, 'answering', false, session);
    assert.equal(view.lesson.id, exercise.lessonId);
    assert.equal(view.introduction, false);
    assert.ok(getSpellbookEntryForExercise(exercise.id));
    session = lessonSessionReducer(session, { type: 'close' });
    assert.equal(getVisibleLesson(exercise, 'answering', false, session), null);
    assert.deepEqual({ attempt: wrong.attempt, progress: wrong.progress, selected }, snapshot);
    assert.equal(getVisibleLesson(exercise, 'complete', false, { ...session, reviewing: true }), null);
  }
});

test('Five boss spells deal exactly 20 each; wrong/duplicate answers do nothing, XP pays once, Guardian also replays for zero', () => {
  for (const [missionIndex, mission] of targetMissions.entries()) {
    assert.equal(startMissionAttempt({ completedMissionIds: [] }, mission.id), null);
    let progress = { completedMissionIds: missions.slice(0, missions.indexOf(mission)).map(m => m.id) };
    for (let replay = 0; replay < 2; replay++) {
      let attempt = startMissionAttempt(progress, mission.id);
      if (missionIndex === 0) assert.equal(getGoblinKingHp(attempt), 100);
      for (const [index, id] of mission.exerciseIds.entries()) {
        const e = exercises.find(e => e.id === id);
        const wrongAnswers = isChoiceExercise(e) ? e.options.filter(o => o.id !== e.validation.correctOptionId).map(o => o.id) : ['powr', 'Power'];
        for (const answer of wrongAnswers) {
          const wrong = submitMissionAnswer(progress, attempt, answer);
          assert.equal(wrong.status, 'incorrect');
          assert.equal(wrong.attempt, attempt);
          assert.equal(wrong.progress, progress);
          assert.equal(wrong.xpAwarded, 0);
          if (missionIndex === 0) assert.equal(getGoblinKingHp(wrong.attempt), 100 - index * 20);
        }
        const answer = isChoiceExercise(e) ? e.validation.correctOptionId : 'power';
        const correct = submitMissionAnswer(progress, attempt, answer);
        assert.equal(correct.status, 'correct');
        assert.equal(correct.attempt.phase, 'solved');
        assert.equal(correct.xpAwarded, replay === 0 && index === 4 ? [100, 80][missionIndex] : 0);
        const duplicate = submitMissionAnswer(correct.progress, correct.attempt, answer);
        assert.equal(duplicate.status, 'ignored');
        assert.equal(duplicate.attempt, correct.attempt);
        assert.equal(duplicate.xpAwarded, 0);
        if (missionIndex === 0) {
          assert.equal(getGoblinKingHp(correct.attempt), 80 - index * 20);
          assert.equal(isWorldUnlocked(correct.progress, 'python-valley-of-decisions'), replay === 1 || index === 4);
          if (index < 4) assert.ok(getGoblinKingHp(correct.attempt) > 0);
        }
        progress = correct.progress;
        attempt = continueMissionAttempt(correct.attempt, 5);
        assert.equal(continueMissionAttempt(attempt, 5), attempt);
      }
      assert.equal(attempt.phase, 'complete');
      assert.equal(attempt.result.xpAwarded, replay === 0 ? [100, 80][missionIndex] : 0);
      assert.equal(attempt.result.totalXp, [300, 450][missionIndex]);
      assert.equal(getWorldProgress(progress, worlds[missionIndex].id).percent, missionIndex === 0 ? 100 : 50);
    }
  }
  const forestIds = missions.slice(0, 6).map(m => m.id);
  for (const missing of forestIds) assert.equal(isWorldUnlocked({ completedMissionIds: forestIds.filter(id => id !== missing) }, worlds[1].id), false);
});

test('Every legacy progress point restores XP, stats, achievements and gates; target notes retain their IDs', async () => {
  for (let count = 0; count <= preExpansion.missions.length; count++) {
    const ids = missions.slice(0, count).map(m => m.id);
    const loaded = parseSavedProgression(JSON.stringify({ version: 1, completedMissionIds: ids }));
    assert.equal(loaded.status, 'ready');
    assert.deepEqual(loaded.progression.completedMissionIds, ids);
    assert.equal(getTotalEarnedXp(loaded.progression), [0, 20, 50, 90, 140, 200, 300, 370, 450][count]);
    assert.equal(getPlayerStatistics(loaded.progression).completedExercises, count * 5);
    assert.equal(getAchievements(loaded.progression).find(a => a.id === 'goblin-slayer').unlocked, count >= 6);
    assert.equal(isWorldUnlocked(loaded.progression, worlds[1].id), count >= 6);
    const data = new Map();
    const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
    await createProgressionStore(storage).save(loaded.progression);
    assert.deepEqual((await createProgressionStore(storage).load()).progression, loaded.progression);
    let notes = {};
    for (const e of targets) {
      notes = setExerciseNote(notes, e.id, 'My earlier reminder');
      assert.ok(getSpellbookEntryForExercise(e.id));
    }
    await createNotesStore(storage).save(notes);
    assert.deepEqual((await createNotesStore(storage).load()).notes, notes);
  }
});
