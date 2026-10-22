const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
const { worlds, chapters, missions, exercises, loopCaverns } = require('../src/game/worldContent.ts');
const { eternalLoopChapter: chapter, eternalLoopMission: mission, eternalLoopExercises: questions } = require('../src/game/cavernBossContent.ts');
const { isCodeBuilderExercise, assembledCode, readFragmentIds, editBuilderAnswer } = require('../src/game/codeBuilder.ts');
const { isChoiceExercise, isExerciseAnswerCorrect, getIncorrectAnswerFeedback } = require('../src/game/exerciseValidation.ts');
const { startMissionAttempt, getPlayableMission, submitMissionAnswer, continueMissionAttempt } = require('../src/game/worldMission.ts');
const { getTotalEarnedXp, getWorldProgress, isMissionUnlocked, completeMission } = require('../src/game/progression.ts');
const { getPlayerStatistics, getAchievements, getPlayerLevel } = require('../src/game/profile.ts');
const { createProgressionStore, parseSavedProgression, PROGRESSION_STORAGE_KEY } = require('../src/game/progressionStorage.ts');
const { createNotesStore, setExerciseNote } = require('../src/game/notesStorage.ts');
const { lessons, getLessonForExercise } = require('../src/game/lessonContent.ts');
const { getVisibleLesson, initialLessonSession, lessonSessionReducer } = require('../src/game/lessonSession.ts');
const { spellbookEntries, exerciseSpellbookEntryIds, getSpellbookEntryForExercise } = require('../src/game/spellbookContent.ts');
const { worldMapForMission } = require('../src/navigation/worldRoutes.ts');
const { isBossMission, isWorldCleared, getBossHp, getBossEncounter, loopWardenMissionId } = require('../src/game/boss.ts');
const { trackForRoute } = require('../src/game/audioController.ts');
const { archipelagoMissions, archipelagoExercises, archipelagoChapters } = require('../src/game/archipelagoContent.ts');
const { forgeMissions, forgeExercises, forgeChapters } = require('../src/game/forgeContent.ts');
const baseline = require('./fixtures/loop-warden-compatibility.json');
const before = { completedMissionIds: Object.keys(baseline.missions) };
const builders = questions.filter(isCodeBuilderExercise);
const answerFor = e => isCodeBuilderExercise(e) ? JSON.stringify(e.validation.expectedFragmentIds) : e.validation.correctOptionId;
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('Warden preserves all 72 exercises, eighteen missions, earlier bosses, engines, save formats and reference content', () => {
  for (const [name, items] of Object.entries({ chapters, missions, exercises, lessons, spellbook: spellbookEntries })) {
    for (const [id, expected] of Object.entries(baseline[name])) assert.equal(hash(items.find(v => v.id === id)), expected, id);
    assert.deepEqual(items.filter(v => Object.hasOwn(baseline[name], v.id)).map(v => v.id), Object.keys(baseline[name]));
  }
  for (const world of worlds.slice(0, 2)) assert.equal(hash(world), baseline.worlds[world.id]);
  assert.deepEqual(loopCaverns, { ...baseline.loopCaverns, chapterIds: [...baseline.loopCaverns.chapterIds, chapter.id], xpReward: 320 });
  for (const [id, entry] of Object.entries(baseline.spellbookLinks)) assert.equal(exerciseSpellbookEntryIds[id], entry);
  for (const [file, expected] of Object.entries(baseline.protectedFiles)) require('./protectedSource.cjs').assertProtectedSource(file, expected);
  assert.equal(Object.keys(baseline.exercises).length, 72);
  assert.equal(getTotalEarnedXp(before), 860);
});

test('One seventh-chapter boss adds five touch exercises, one recap, 100 XP and globally unique IDs', () => {
  assert.deepEqual([worlds.length, chapters.length, missions.length, exercises.length, lessons.length, spellbookEntries.length], [5, 28, 28, 106, 55, 28]);
  assert.deepEqual([exercises.filter(isChoiceExercise).length, exercises.filter(isCodeBuilderExercise).length], [86, 18]);
  assert.equal(exercises.filter(e => !isChoiceExercise(e) && !isCodeBuilderExercise(e)).length, 2);
  assert.deepEqual(missions.filter(m => !Object.hasOwn(baseline.missions, m.id)), [mission, ...archipelagoMissions, ...forgeMissions]);
  assert.deepEqual(exercises.filter(e => !Object.hasOwn(baseline.exercises, e.id)), [...questions, ...archipelagoExercises, ...forgeExercises]);
  assert.deepEqual(questions.map(e => e.type), ['output-choice', 'code-builder', 'output-choice', 'missing-token', 'code-builder']);
  assert.deepEqual(mission.exerciseIds, questions.map(e => e.id));
  assert.deepEqual([loopWardenMissionId, mission.encounter, mission.xpReward], [mission.id, 'loop-warden', 100]);
  assert.deepEqual(getBossEncounter(mission.id), { kind: 'loop-warden', name: 'The Loop Warden' });
  assert.equal(loopCaverns.chapterIds[6], chapter.id);
  const ids = [...worlds, ...chapters, ...missions, ...exercises, ...lessons, ...spellbookEntries,
    ...exercises.filter(isChoiceExercise).flatMap(e => e.options), ...exercises.filter(isCodeBuilderExercise).flatMap(e => e.fragments)].map(v => v.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(missions.reduce((xp, m) => xp + m.xpReward, 0), 1340);
  assert.equal(missions.filter(m => isBossMission(m.id)).length, 4);
});

test('Stopping Crystal and all earlier prerequisites gate Warden, including deep links and forged attempts', () => {
  assert.deepEqual(chapter.prerequisiteMissionIds, ['python-caverns-stopping-crystal-01']);
  assert.equal(isMissionUnlocked(before, mission.id), true);
  for (const removed of [...loopCaverns.prerequisiteMissionIds, ...chapter.prerequisiteMissionIds]) {
    const locked = { completedMissionIds: before.completedMissionIds.filter(id => id !== removed) };
    assert.equal(isMissionUnlocked(locked, mission.id), false, removed);
    assert.equal(getPlayableMission(locked, mission.id), null);
    assert.equal(startMissionAttempt(locked, mission.id), null);
    assert.equal(completeMission(locked, mission.id).xpAwarded, 0);
    assert.equal(submitMissionAnswer(locked, startMissionAttempt(before, mission.id), answerFor(questions[0])).status, 'unavailable');
  }
  // Restore validates the whole prerequisite chain, including impossible old-save gaps.
  for (const removed of before.completedMissionIds) {
    const restored = parseSavedProgression(JSON.stringify({ version: 1, completedMissionIds: before.completedMissionIds.filter(id => id !== removed) })).progression;
    assert.equal(getPlayableMission(restored, mission.id), null, removed);
  }
  const forged = { ...startMissionAttempt(before, mission.id), exerciseIndex: 4 };
  assert.equal(submitMissionAnswer(before, forged, answerFor(questions[4])).status, 'unavailable');
});

// Independently reviewed text and bounded arithmetic tables: never execute authored Python.
test('Reviewed Warden snippets have accurate range bounds, indentation, print order and stopping points', () => {
  const reviewed = [
    ['for mark in range(2, 6):\n    print(mark)', 'b', '2\n3\n4\n5'],
    ['charge = 5\nwhile charge > 2:\n    print(charge)\n    charge = charge - 1', 'a', '5\n4\n3'],
    ['echo = 1\nwhile echo < 4:\n    print("Ring")\n    ____', 'c', 'echo = echo + 1'],
  ];
  questions.filter(isChoiceExercise).forEach((e, i) => {
    assert.equal(e.code, reviewed[i][0]);
    assert.equal(answerFor(e), `${e.id}-${reviewed[i][1]}`);
    assert.equal(e.options.find(o => o.id === answerFor(e)).label, reviewed[i][2]);
    assert.equal(e.options.filter(o => isExerciseAnswerCorrect(e, o.id)).length, 1);
    for (const o of e.options) {
      assert.equal(isExerciseAnswerCorrect(e, o.label), false);
      if (o.id !== answerFor(e)) assert.equal(getIncorrectAnswerFeedback(e, o.id), o.feedback);
    }
    for (const bad of ['', 'unknown', 'toString', `${answerFor(e)} `, ...questions.filter(v => v !== e).map(answerFor)]) assert.equal(isExerciseAnswerCorrect(e, bad), false);
  });
  assert.deepEqual(builders.map(e => [assembledCode(e, answerFor(e)), e.expectedOutput]), [
    ['for glow in range(3):\n    print("Path")\nprint("Cross")', 'Path\nPath\nPath\nCross'],
    ['seal = 2\nwhile seal < 5:\n    print(seal)\n    seal = seal + 1', '2\n3\n4'],
  ]);
  assert.deepEqual([2, 3, 4, 5].filter(n => n >= 2 && n < 6), [2, 3, 4, 5]); assert.equal(6 < 6, false);
  assert.deepEqual([5, 4, 3].map(n => [n > 2, n - 1]), [[true, 4], [true, 3], [true, 2]]); assert.equal(2 > 2, false);
  assert.deepEqual([1, 2, 3].map(n => n + 1), [2, 3, 4]); assert.equal(4 < 4, false);
  assert.deepEqual([2, 3, 4].map(n => n + 1), [3, 4, 5]); assert.equal(5 < 5, false);
  assert.match(questions[3].prompt, /as text/); assert.match(questions[3].explanation, /None of these snippets is executed/);
  assert.match(questions[3].options[0].feedback, /never reaches/); assert.match(questions[3].options[1].feedback, /away from 4/);
});

for (const e of builders) test(`${e.concept}: one valid order; malformed/foreign/duplicate fragments rejected; Undo and Reset preserve combat`, () => {
  const expected = e.validation.expectedFragmentIds;
  const permutations = a => a.length ? a.flatMap((id, i) => permutations(a.filter((_, j) => i !== j)).map(rest => [id, ...rest])) : [[]];
  assert.equal(permutations(expected).filter(ids => isExerciseAnswerCorrect(e, JSON.stringify(ids))).length, 1);
  assert.ok(e.fragments.length <= 4);
  assert.ok(e.fragments.every(f => f.code.length <= 24 && !f.code.includes('\n')));
  for (const ids of [expected.slice(1), [...expected, expected[0]], [expected[0], expected[0], ...expected.slice(2)],
    ['unknown', ...expected.slice(1)], [builders.find(v => v !== e).fragments[0].id, ...expected.slice(1)], [...expected, 'extra'],
    expected.map(id => e.fragments.find(f => f.id === id).code)]) assert.equal(isExerciseAnswerCorrect(e, JSON.stringify(ids)), false);
  for (const bad of ['{', '{}', 'null', 'true', '', '[]', assembledCode(e, answerFor(e))]) assert.equal(isExerciseAnswerCorrect(e, bad), false);
  let attempt = startMissionAttempt(before, mission.id);
  while (attempt.exerciseIndex < questions.indexOf(e)) attempt = continueMissionAttempt(submitMissionAnswer(before, attempt, answerFor(questions[attempt.exerciseIndex])).attempt, 5);
  const hp = getBossHp(attempt), snapshot = JSON.stringify(attempt);
  let answer = '';
  for (const id of [...expected].reverse()) answer = editBuilderAnswer(e, answer, { type: 'add', id });
  assert.equal(getBossHp(attempt), hp);
  assert.equal(submitMissionAnswer(before, attempt, answer).attempt, attempt);
  assert.equal(getIncorrectAnswerFeedback(e, answer), e.hint);
  const wrongDraft = answer;
  let review = lessonSessionReducer(initialLessonSession, { type: 'review' });
  assert.equal(getVisibleLesson(e, 'answering', false, review).introduction, false);
  review = lessonSessionReducer(review, { type: 'close' });
  assert.equal(getVisibleLesson(e, 'answering', false, review), null);
  assert.equal(answer, wrongDraft); assert.equal(getBossHp(attempt), hp);
  answer = editBuilderAnswer(e, answer, { type: 'undo' }); assert.equal(readFragmentIds(e, answer).length, expected.length - 1);
  answer = editBuilderAnswer(e, answer, { type: 'reset' }); assert.equal(answer, '');
  assert.equal(JSON.stringify(attempt), snapshot); assert.equal(getBossHp(attempt), hp);
  for (const id of expected) answer = editBuilderAnswer(e, answer, { type: 'add', id });
  assert.equal(isExerciseAnswerCorrect(e, answer), true); assert.equal(getBossHp(attempt), hp);
});

test('Recap is optional before/during first play and replay, uses different examples, and preserves selected-answer feedback', () => {
  const recap = getLessonForExercise(questions[0]);
  assert.equal(recap.optionalReview, true);
  assert.equal(recap.codeExample, 'for n in range(1, 3):\n    print(n)\nfuel = 2\nwhile fuel > 0:\n    print(fuel)\n    fuel = fuel - 1');
  assert.equal(recap.expectedOutput, '1\n2\n2\n1');
  for (const e of questions) {
    assert.equal(getLessonForExercise(e), recap);
    assert.notEqual(recap.codeExample, isCodeBuilderExercise(e) ? assembledCode(e, answerFor(e)) : e.code);
    for (const replay of [false, true]) {
      for (const phase of ['answering', 'solved']) {
        assert.equal(getVisibleLesson(e, phase, replay, initialLessonSession), null);
        const review = lessonSessionReducer(initialLessonSession, { type: 'review' });
        assert.equal(getVisibleLesson(e, phase, replay, review).lesson, recap);
        assert.equal(getVisibleLesson(e, phase, replay, lessonSessionReducer(review, { type: 'continue', lessonId: recap.id })), null);
      }
    }
  }
  const selected = questions[0].options[0].id, attempt = startMissionAttempt(before, mission.id);
  const wrong = submitMissionAnswer(before, attempt, selected);
  const feedback = getIncorrectAnswerFeedback(questions[0], selected);
  lessonSessionReducer(lessonSessionReducer(initialLessonSession, { type: 'review' }), { type: 'close' });
  assert.equal(wrong.status, 'incorrect'); assert.equal(wrong.attempt, attempt); assert.equal(wrong.progress, before);
  assert.equal(getIncorrectAnswerFeedback(questions[0], selected), feedback); assert.equal(getBossHp(attempt), 100);
});

function play(progress, reward) {
  let attempt = startMissionAttempt(progress, mission.id);
  assert.equal(getBossHp(attempt), 100);
  questions.forEach((e, i) => {
    const wrong = submitMissionAnswer(progress, attempt, isCodeBuilderExercise(e) ? JSON.stringify([...e.validation.expectedFragmentIds].reverse()) : e.options.find(o => o.id !== answerFor(e)).id);
    assert.equal(wrong.status, 'incorrect'); assert.equal(wrong.attempt, attempt); assert.equal(wrong.progress, progress); assert.equal(wrong.xpAwarded, 0);
    assert.equal(getBossHp(wrong.attempt), 100 - i * 20);
    const right = submitMissionAnswer(progress, attempt, answerFor(e));
    assert.equal(right.status, 'correct'); assert.equal(right.attempt.phase, 'solved');
    assert.equal(getBossHp(right.attempt), [80, 60, 40, 20, 0][i]);
    assert.equal(right.xpAwarded, i === 4 ? reward : 0);
    if (i < 4) { assert.equal(right.progress, progress); assert.equal(right.attempt.result, null); }
    for (let tap = 0; tap < 4; tap++) {
      const duplicate = submitMissionAnswer(right.progress, right.attempt, answerFor(e));
      assert.equal(duplicate.status, 'ignored'); assert.equal(duplicate.xpAwarded, 0); assert.equal(duplicate.attempt, right.attempt);
      assert.equal(getBossHp(duplicate.attempt), getBossHp(right.attempt));
    }
    progress = right.progress; attempt = continueMissionAttempt(right.attempt, 5);
    assert.equal(attempt.phase, i === 4 ? 'complete' : 'answering');
    assert.equal(continueMissionAttempt(attempt, 5), attempt);
    if (i < 4) assert.equal(submitMissionAnswer(progress, attempt, answerFor(e)).status, 'incorrect', 'stale previous answer cannot solve next spell');
  });
  return { progress, attempt };
}

test('Five explicit spells yield 100→0 HP, explanations before Continue, 100 XP once, replay zero and World 3 clear', () => {
  assert.deepEqual(getWorldProgress(before, loopCaverns.id), { completed: 6, total: 7, percent: 86 });
  assert.equal(isWorldCleared(before, loopCaverns.id), false);
  const won = play(before, 100);
  assert.deepEqual(won.attempt.result, { xpAwarded: 100, totalXp: 960, newlyUnlockedChapterIds: [archipelagoChapters[0].id] });
  assert.equal(isWorldCleared(won.progress, loopCaverns.id), true);
  assert.deepEqual(getWorldProgress(won.progress, loopCaverns.id), { completed: 7, total: 7, percent: 100 });
  assert.equal(play(won.progress, 0).progress, won.progress);
  assert.equal(completeMission(won.progress, mission.id).xpAwarded, 0);
  const stats = getPlayerStatistics(won.progress);
  assert.deepEqual([stats.totalXp, stats.completedExercises, stats.completedMissions, stats.defeatedBosses], [960, 77, 19, 3]);
  assert.equal(getPlayerLevel(stats.totalXp).level, 10);
  assert.deepEqual(getAchievements(won.progress), getAchievements(before));
  for (const world of worlds.slice(0, 2)) { assert.equal(isWorldCleared(before, world.id), true); assert.equal(isWorldCleared(won.progress, world.id), true); }
  assert.deepEqual(worldMapForMission(mission.id), { pathname: '/world-map', params: { worldId: loopCaverns.id } });
  assert.equal(trackForRoute(`/mission/${mission.id}`), 'battle'); assert.equal(trackForRoute('/world-map'), 'forest');
});

test('860/960-XP version-1 saves restore correctly with replay zero; profile/audio/onboarding and every note link survive', async () => {
  const sentinels = [['devquest.profile.v1', 'profile-sentinel'], ['devquest.audio.v1', 'audio-sentinel'], ['devquest.onboarding.v1', 'onboarding-sentinel']];
  const data = new Map(sentinels);
  const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
  for (const progress of [before, play(before, 100).progress]) {
    const raw = JSON.stringify({ version: 1, completedMissionIds: progress.completedMissionIds });
    assert.deepEqual(parseSavedProgression(raw).progression, progress);
    await createProgressionStore(storage).save(progress);
    assert.equal(data.get(PROGRESSION_STORAGE_KEY), raw);
    const restored = (await createProgressionStore(storage).load()).progression;
    assert.deepEqual(restored, progress);
    assert.equal(isMissionUnlocked(restored, mission.id), true);
    assert.equal(getTotalEarnedXp(restored), progress === before ? 860 : 960);
    if (progress !== before) assert.equal(play(restored, 0).progress, restored);
    for (const [key, value] of sentinels) assert.equal(data.get(key), value);
  }
  let notes = {};
  for (const e of exercises) {
    assert.ok(getLessonForExercise(e)); assert.ok(getSpellbookEntryForExercise(e.id));
    notes = setExerciseNote(notes, e.id, `Remember ${e.id}`);
  }
  await createNotesStore(storage).save(notes); assert.deepEqual((await createNotesStore(storage).load()).notes, notes);
  assert.deepEqual(questions.map(e => getSpellbookEntryForExercise(e.id).id), ['python-range', 'python-for-loops', 'python-while-loops', 'python-while-loops', 'python-while-loops']);
});
