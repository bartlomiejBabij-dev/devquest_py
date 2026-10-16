const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);

const { exercises, missions } = require('../src/game/worldContent.ts');
const { lessons, getLessonForExercise } = require('../src/game/lessonContent.ts');
const { getVisibleLesson, initialLessonSession, lessonSessionReducer } = require('../src/game/lessonSession.ts');
const { isChoiceExercise, isExerciseAnswerCorrect, getIncorrectAnswerFeedback } = require('../src/game/exerciseValidation.ts');
const { getPlayableMission, startMissionAttempt, submitMissionAnswer, continueMissionAttempt } = require('../src/game/worldMission.ts');
const { initialProgressionState, isMissionCompleted, getTotalEarnedXp, isWorldUnlocked } = require('../src/game/progression.ts');
const { parseSavedProgression, createProgressionStore } = require('../src/game/progressionStorage.ts');
const { getPlayerStatistics, getAchievements } = require('../src/game/profile.ts');
const { getSpellbookEntryForExercise } = require('../src/game/spellbookContent.ts');
const { setExerciseNote, createNotesStore } = require('../src/game/notesStorage.ts');
const { initialProgressionSession, progressionSessionReducer, shouldPersistProgression } = require('../src/game/progressionSession.ts');
const baseline = require('./fixtures/learning-compatibility.json');
const legacy = require('./fixtures/forest-complete-v1.json');
const sliceIds = ['python-forest-awakening-01', 'python-valley-crossroads-01'];
const sliceExercises = sliceIds.flatMap(id => missions.find(m => m.id === id).exerciseIds.map(e => exercises.find(item => item.id === e)));

// Independent curriculum review: stable ID, intended answer label and the exact question code.
const reviewedChoices = [
  ['python-forest-awakening-print', 'b', 'print', '____("Welcome to DevQuest")'],
  ['python-forest-awakening-literal', 'c', '"Forest"', 'print(____)'],
  ['python-forest-awakening-number', 'a', 'Numbers can go directly inside print().', 'print(7)'],
  ['python-forest-awakening-output', 'd', 'Spark', 'print("Spark")'],
  ['python-valley-crossroads-boolean', 'c', 'True', 'path_open = ____\nprint(path_open)'],
  ['python-valley-crossroads-equality', 'd', '==', 'runes = 4\nprint(runes ____ 4)'],
  ['python-valley-crossroads-difference', 'b', 'True\nFalse', 'print(3 != 5)\nprint(3 > 5)'],
  ['python-valley-crossroads-boundary', 'a', 'True\nTrue', 'print(2 < 6)\nprint(6 <= 6)'],
  ['python-valley-crossroads-threshold', 'c', 'mana >= 8', 'mana = 8'],
];

test('Mission IDs and rewards stay stable; the 30 exercises outside the latest conversion match their baseline', () => {
  assert.deepEqual(missions.map(m => ({ id: m.id, exerciseIds: m.exerciseIds, xpReward: m.xpReward })), baseline.missions);
  assert.equal(sliceExercises.length, 10);
  assert.equal(new Set(exercises.map(e => e.id)).size, 40);
  assert.equal(Object.keys(baseline.unchangedExercises).length, 30);
  for (const [id, hash] of Object.entries(baseline.unchangedExercises)) {
    const exercise = exercises.find(e => e.id === id);
    assert.equal(crypto.createHash('sha256').update(JSON.stringify(exercise)).digest('hex'), hash, id);
  }
  assert.equal(sliceExercises.filter(isChoiceExercise).length, 9);
  const typing = sliceExercises.filter(e => !isChoiceExercise(e));
  assert.equal(typing.length, 1);
  assert.equal(typing[0].id, 'python-forest-awakening-repair');
  assert.deepEqual(typing[0].validation.acceptedAnswers, ['print']);
});

test('All lessons stay short and complete; the original slice retains its reviewed examples and lesson links', () => {
  const examples = [
    ['print("A lantern glows")', 'A lantern glows'],
    ['print("Lanterns")\nprint(4)', 'Lanterns\n4'],
    ['gate_closed = False\nprint(gate_closed)', 'False'],
    ['print(6 == 2)\nprint(6 != 2)', 'False\nTrue'],
    ['print(5 > 9)\nprint(5 >= 5)', 'False\nTrue'],
  ];
  const originalLessonIds = new Set(sliceExercises.map(e => e.lessonId));
  const originalLessons = lessons.filter(l => originalLessonIds.has(l.id));
  assert.equal(originalLessons.length, 5);
  assert.equal(new Set(lessons.map(l => l.id)).size, lessons.length);
  assert.deepEqual(originalLessons.map(l => [l.codeExample,l.expectedOutput]), examples);
  for (const lesson of lessons) {
    for (const field of ['title','explanation','codeExample','expectedOutput','whyItWorks','importantRule']) assert.ok(lesson[field].trim(), field);
    assert.ok([lesson.explanation,lesson.whyItWorks,lesson.importantRule].join(' ').split(/\s+/).length <= 110);
  }
  for (const exercise of exercises) {
    assert.equal(originalLessonIds.has(exercise.lessonId), sliceExercises.includes(exercise), exercise.id);
    if (exercise.lessonId) assert.notEqual(getLessonForExercise(exercise).codeExample, exercise.code, 'teaching example must differ from the challenge');
  }
});

test('Multiple-choice, missing-token and output choices validate reviewed IDs, never display text or another option', () => {
  assert.deepEqual(new Set(sliceExercises.filter(isChoiceExercise).map(e => e.type)), new Set(['missing-token','multiple-choice','output-choice']));
  for (const [id,suffix,label,code] of reviewedChoices) {
    const exercise = exercises.find(e => e.id === id);
    const correctId = `${id}-${suffix}`;
    assert.equal(exercise.code, code);
    assert.equal(exercise.validation.kind, 'option-id');
    assert.equal(exercise.validation.correctOptionId, correctId);
    assert.equal(exercise.options.find(o => o.id === correctId).label, label);
    assert.ok(exercise.options.length >= 3 && exercise.options.length <= 4);
    assert.equal(new Set(exercise.options.map(o => o.id)).size, exercise.options.length);
    assert.equal(new Set(exercise.options.map(o => o.label)).size, exercise.options.length);
    for (const option of exercise.options) {
      assert.equal(isExerciseAnswerCorrect(exercise, option.id), option.id === correctId);
      assert.equal(isExerciseAnswerCorrect(exercise, option.label), false, 'labels never bypass IDs');
      if (option.id !== correctId) assert.equal(getIncorrectAnswerFeedback(exercise, option.id), option.feedback);
      assert.ok(option.feedback.length > 20, 'every choice has a useful explanation');
    }
    for (const value of ['', 'missing', 'toString', ` ${correctId}`, correctId.toUpperCase(), reviewedChoices.find(row => row[0] !== id)[0]+'-a']) {
      assert.equal(isExerciseAnswerCorrect(exercise, value), false);
    }
    assert.equal(isExerciseAnswerCorrect({ ...exercise, options: [...exercise.options].reverse() }, correctId), true, 'order cannot change correctness');
    assert.equal(isExerciseAnswerCorrect({ ...exercise, options: exercise.options.map(o => ({ ...o, label: 'changed display' })) }, correctId), true, 'display text is not the validator');
    assert.equal(isExerciseAnswerCorrect({ ...exercise, options: exercise.options.filter(o => o.id !== correctId) }, correctId), false, 'missing options fail safely');
  }
});

test('Short typing retains exact safe validation and the existing multiline validator remains strict', () => {
  const short = exercises.find(e => e.id === 'python-forest-awakening-repair');
  assert.equal(isExerciseAnswerCorrect(short, ' print '), true);
  for (const wrong of ['Print','prnt','print("Ready")','anything print','print; import os']) assert.equal(isExerciseAnswerCorrect(short, wrong), false);
  const block = exercises.find(e => e.id === 'python-valley-guardian-indent');
  assert.equal(isExerciseAnswerCorrect(block, 'mana = 5\nif mana >= 3:\n    print("Cast")'), true);
  assert.equal(isExerciseAnswerCorrect(block, 'mana = 5\nif mana >= 3:\nprint("Cast")'), false);
});

test('New concepts appear once per attempt; completed-mission replays skip introductions but always allow review', () => {
  for (const [missionIndex, id] of sliceIds.entries()) {
    const progress = missionIndex === 0 ? initialProgressionState : { completedMissionIds: legacy.completedMissionIds };
    const playable = getPlayableMission(progress, id);
    let teaching = initialLessonSession;
    const shown = [];
    for (const exercise of playable.exercises) {
      const view = getVisibleLesson(exercise, 'answering', false, teaching);
      if (view) {
        assert.equal(view.introduction, true);
        shown.push(view.lesson.id);
        teaching = lessonSessionReducer(teaching, { type: 'continue', lessonId: view.lesson.id });
      }
      assert.equal(getVisibleLesson(exercise, 'answering', false, teaching), null);
      assert.equal(getVisibleLesson(exercise, 'solved', false, teaching), null);
      assert.equal(getVisibleLesson(exercise, 'answering', true, initialLessonSession), null);
      const reviewing = lessonSessionReducer(teaching, { type: 'review' });
      assert.equal(getVisibleLesson(exercise, 'answering', true, reviewing)?.lesson.id, exercise.lessonId);
      assert.equal(getVisibleLesson(exercise, 'solved', true, reviewing)?.introduction, false);
      assert.equal(getVisibleLesson(exercise, 'complete', true, reviewing), null);
      assert.equal(getVisibleLesson(exercise, 'answering', true, lessonSessionReducer(reviewing, { type: 'close' })), null);
    }
    assert.equal(shown.length, missionIndex === 0 ? 2 : 3);
    assert.equal(new Set(shown).size, shown.length);
    assert.deepEqual(lessonSessionReducer(teaching, { type: 'reset' }), initialLessonSession);
    assert.equal(lessonSessionReducer(teaching, { type: 'continue', lessonId: 'unknown' }), teaching);
  }
});

test('Reviewing lessons and Spellbook preserves selection, attempt, XP and persistence revision', () => {
  const progress = initialProgressionState;
  const attempt = startMissionAttempt(progress, sliceIds[0]);
  const exercise = getPlayableMission(progress, attempt.missionId).exercises[0];
  const selected = exercise.options[0].id;
  const wrong = submitMissionAnswer(progress, attempt, selected);
  const gameSession = progressionSessionReducer(initialProgressionSession, { type: 'hydrate', result: { status: 'ready', progression: progress } });
  const before = structuredClone({ attempt: wrong.attempt, progress: wrong.progress, selected, gameSession });
  let teaching = lessonSessionReducer(initialLessonSession, { type: 'continue', lessonId: exercise.lessonId });
  for (let i=0; i<3; i++) {
    teaching = lessonSessionReducer(teaching, { type: 'review' });
    assert.ok(getVisibleLesson(exercise, 'answering', false, teaching));
    assert.ok(getSpellbookEntryForExercise(exercise.id));
    teaching = lessonSessionReducer(teaching, { type: 'continue', lessonId: exercise.lessonId });
  }
  assert.deepEqual({ attempt: wrong.attempt, progress: wrong.progress, selected, gameSession }, before);
  assert.equal(getTotalEarnedXp(progress), 0);
  assert.equal(shouldPersistProgression(gameSession), false);
});

test('Both redesigned missions handle wrong answers, duplicate taps, explanations, XP-once and zero-XP replays', () => {
  sliceIds.forEach((missionId, missionIndex) => {
    let progress = missionIndex === 0 ? initialProgressionState : { completedMissionIds: legacy.completedMissionIds };
    const playable = getPlayableMission(progress, missionId);
    for (let replay = 0; replay < 2; replay++) {
      let attempt = startMissionAttempt(progress, missionId);
      for (const exercise of playable.exercises) {
        const incorrect = submitMissionAnswer(progress, attempt, isChoiceExercise(exercise) ? exercise.options.find(o => o.id !== exercise.validation.correctOptionId).id : 'prnt');
        assert.equal(incorrect.status, 'incorrect');
        assert.equal(incorrect.attempt, attempt);
        assert.equal(incorrect.progress, progress);
        const answer = isChoiceExercise(exercise) ? exercise.validation.correctOptionId : 'print';
        const correct = submitMissionAnswer(progress, attempt, answer);
        assert.equal(correct.status, 'correct');
        assert.equal(correct.attempt.phase, 'solved', 'explanations are never skipped');
        assert.equal(correct.xpAwarded, replay === 0 && attempt.exerciseIndex === 4 ? [20,70][missionIndex] : 0);
        const duplicate = submitMissionAnswer(correct.progress, correct.attempt, answer);
        assert.equal(duplicate.status, 'ignored');
        assert.equal(duplicate.xpAwarded, 0);
        progress = correct.progress;
        attempt = continueMissionAttempt(correct.attempt, 5);
      }
      assert.equal(attempt.phase, 'complete');
      assert.equal(getTotalEarnedXp(progress), missionIndex === 0 ? 20 : 370);
    }
  });
});

test('Presentation changes preserve legacy completions, stats, world unlocks, achievements and exercise notes', async () => {
  for (const count of [1,6,7,8]) {
    const ids = missions.slice(0,count).map(m => m.id);
    const loaded = parseSavedProgression(JSON.stringify({ version: 1, completedMissionIds: ids }));
    assert.equal(loaded.status, 'ready');
    assert.deepEqual(loaded.progression.completedMissionIds, ids);
    const stats = getPlayerStatistics(loaded.progression);
    assert.equal(stats.totalXp, [0,20,50,90,140,200,300,370,450][count]);
    assert.equal(stats.completedExercises, count*5);
    assert.equal(isWorldUnlocked(loaded.progression, 'python-valley-of-decisions'), count>=6);
    assert.equal(getAchievements(loaded.progression).find(a => a.id === 'goblin-slayer').unlocked, count>=6);
    for (const id of ids) assert.equal(isMissionCompleted(loaded.progression,id), true);
    const records = new Map();
    const adapter = { getItem: async k => records.get(k) ?? null, setItem: async (k,v) => records.set(k,v) };
    await createProgressionStore(adapter).save(loaded.progression);
    assert.deepEqual((await createProgressionStore(adapter).load()).progression, loaded.progression);
    let notes = {};
    for (const exercise of sliceExercises) {
      notes = setExerciseNote(notes, exercise.id, 'My existing note');
      assert.ok(getSpellbookEntryForExercise(exercise.id));
    }
    await createNotesStore(adapter).save(notes);
    assert.deepEqual((await createNotesStore(adapter).load()).notes, notes);
  }
});
