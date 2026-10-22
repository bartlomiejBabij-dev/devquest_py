const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
const { worlds, chapters, missions, exercises, listArchipelago } = require('../src/game/worldContent.ts');
const { treasureGuardianChapter: chapter, treasureGuardianMission: mission, treasureGuardianExercises: questions } = require('../src/game/archipelagoBossContent.ts');
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
const { isBossMission, isWorldCleared, getBossHp, getBossEncounter, treasureGuardianMissionId } = require('../src/game/boss.ts');
const { trackForRoute } = require('../src/game/audioController.ts');
const baseline = require('./fixtures/treasure-guardian-compatibility.json');
const before = { completedMissionIds: Object.keys(baseline.missions) };
const builders = questions.filter(isCodeBuilderExercise);
const answerFor = e => isCodeBuilderExercise(e) ? JSON.stringify(e.validation.expectedFragmentIds) : e.validation.correctOptionId;
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

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

test('Guardian preserves all 95 old exercises, missions, rewards, lessons, references, three worlds and boss visuals', () => {
  for (const [name, items] of Object.entries({ chapters, missions, exercises, lessons, spellbook: spellbookEntries })) {
    for (const [id, expected] of Object.entries(baseline[name])) assert.equal(hash(items.find(v => v.id === id)), expected, id);
    assert.deepEqual(items.filter(v => Object.hasOwn(baseline[name], v.id)).map(v => v.id), Object.keys(baseline[name]));
  }
  for (const world of worlds.slice(0, 3)) assert.equal(hash(world), baseline.worlds[world.id]);
  assert.deepEqual(listArchipelago, { ...baseline.archipelago, chapterIds: [...baseline.archipelago.chapterIds, chapter.id], xpReward: 320 });
  for (const [id, entry] of Object.entries(baseline.spellbookLinks)) assert.equal(exerciseSpellbookEntryIds[id], entry);
  for (const [file, expected] of Object.entries(baseline.protectedFiles)) require('./protectedSource.cjs').assertProtectedSource(file, expected);
  assert.equal(Object.keys(baseline.exercises).length, 95); assert.equal(getTotalEarnedXp(before), 1180);
});

test('One seventh chapter registers five touch spells, one optional recap, 100 XP and globally unique IDs', () => {
  assert.deepEqual([worlds.length, chapters.length, missions.length, exercises.length, lessons.length, spellbookEntries.length], [4, 26, 26, 100, 51, 26]);
  assert.deepEqual([exercises.filter(isChoiceExercise).length, exercises.filter(isCodeBuilderExercise).length], [82, 16]);
  assert.deepEqual(missions.filter(m => !Object.hasOwn(baseline.missions, m.id)), [mission]);
  assert.deepEqual(exercises.filter(e => !Object.hasOwn(baseline.exercises, e.id)), questions);
  assert.deepEqual(questions.map(e => e.type), ['output-choice', 'output-choice', 'code-builder', 'output-choice', 'code-builder']);
  assert.deepEqual(mission.exerciseIds, questions.map(e => e.id));
  assert.deepEqual([treasureGuardianMissionId, mission.encounter, mission.xpReward], [mission.id, 'treasure-guardian', 100]);
  assert.deepEqual(getBossEncounter(mission.id), { kind: 'treasure-guardian', name: 'The Treasure Guardian' });
  assert.equal(listArchipelago.chapterIds[6], chapter.id);
  const ids = [...worlds, ...chapters, ...missions, ...exercises, ...lessons, ...spellbookEntries,
    ...exercises.filter(isChoiceExercise).flatMap(e => e.options), ...exercises.filter(isCodeBuilderExercise).flatMap(e => e.fragments)].map(v => v.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(missions.reduce((xp, m) => xp + m.xpReward, 0), 1280);
  assert.equal(missions.filter(m => isBossMission(m.id)).length, 4);
});

test('Supply Run and world prerequisites gate the boss and deep links; forged or malformed attempts cannot win', () => {
  assert.deepEqual(chapter.prerequisiteMissionIds, ['python-archipelago-supply-run-01']);
  assert.equal(isMissionUnlocked(before, mission.id), true);
  for (const removed of [...listArchipelago.prerequisiteMissionIds, ...chapter.prerequisiteMissionIds]) {
    const locked = { completedMissionIds: before.completedMissionIds.filter(id => id !== removed) };
    assert.equal(getPlayableMission(locked, mission.id), null); assert.equal(startMissionAttempt(locked, mission.id), null);
    assert.equal(completeMission(locked, mission.id).xpAwarded, 0);
    assert.equal(submitMissionAnswer(locked, startMissionAttempt(before, mission.id), answerFor(questions[0])).status, 'unavailable');
  }
  for (const removed of before.completedMissionIds) {
    const restored = parseSavedProgression(JSON.stringify({ version: 1, completedMissionIds: before.completedMissionIds.filter(id => id !== removed) })).progression;
    assert.equal(getPlayableMission(restored, mission.id), null, removed);
  }
  const initial = startMissionAttempt(before, mission.id);
  for (const patch of [{ exerciseIndex: 4 }, { exerciseIndex: -1 }, { exerciseIndex: 1.5 },
    { exerciseIndex: 1, solvedExerciseIds: ['foreign'] }, { solvedExerciseIds: [questions[0].id, questions[0].id] }]) {
    const rejected = submitMissionAnswer(before, { ...initial, ...patch }, answerFor(questions[4]));
    assert.equal(rejected.status, 'unavailable'); assert.equal(rejected.xpAwarded, 0); assert.equal(rejected.progress, before);
  }
});

// Independently reviewed display fixtures and bounded value tables, never Python execution.
test('Indexing, length, replacement and ordered iteration have accurate answers and reject foreign IDs', () => {
  const reviewed = [
    ['loot = ["pearl", "crown", "gem"]\nprint(loot[1])', 'crown'],
    ['vault = ["ring", "coin"]\nvault.append("key")\nprint(len(vault))', '3'],
    ['cargo = ["flint", "flag"]\ncargo[1] = "sail"\nfor item in cargo:\n    print(item)', 'flint\nsail'],
  ];
  questions.filter(isChoiceExercise).forEach((e, i) => {
    assert.equal(e.code, reviewed[i][0]); assert.equal(e.options.find(o => o.id === answerFor(e)).label, reviewed[i][1]);
    assert.equal(e.options.filter(o => isExerciseAnswerCorrect(e, o.id)).length, 1);
    for (const o of e.options) {
      assert.equal(isExerciseAnswerCorrect(e, o.label), false);
      if (o.id !== answerFor(e)) assert.equal(getIncorrectAnswerFeedback(e, o.id), o.feedback);
    }
    for (const bad of ['', 'unknown', 'toString', `${answerFor(e)} `, ...questions.filter(v => v !== e).map(answerFor)]) assert.equal(isExerciseAnswerCorrect(e, bad), false);
  });
  assert.deepEqual(builders.map(e => [assembledCode(e, answerFor(e)), e.expectedOutput]), [
    ['gear = ["club", "helm"]\ngear[0] = "spear"\nprint(gear[0])', 'spear'],
    ['kit = ["oil", "rag"]\nkit.append("wick")\nfor item in kit:\n    print(item)', 'oil\nrag\nwick'],
  ]);
  assert.equal(['pearl', 'crown', 'gem'][1], reviewed[0][1]);
  const vault = ['ring', 'coin']; vault.push('key'); assert.equal(String(vault.length), reviewed[1][1]);
  const gear = ['club', 'helm']; gear[0] = 'spear'; assert.equal(gear.length, 2); assert.equal(gear[0], builders[0].expectedOutput);
  const cargo = ['flint', 'flag']; cargo[1] = 'sail'; assert.equal(cargo.join('\n'), reviewed[2][1]);
  const kit = ['oil', 'rag']; kit.push('wick'); assert.equal(kit.join('\n'), builders[1].expectedOutput);
  assert.match(builders[1].prompt, /BEFORE inspection/);
  assert.equal(builders[1].fragments.filter(f => f.code.startsWith('    ')).length, 1);
  assert.equal(assembledCode(builders[1], answerFor(builders[1])).split('\n').at(-1), '    print(item)');
});

test('One optional recap is available for every spell, before or after answers, without changing combat', () => {
  const recap = getLessonForExercise(questions[0]);
  assert.deepEqual(lessons.filter(l => !Object.hasOwn(baseline.lessons, l.id)), [recap]);
  assert.equal(recap.optionalReview, true);
  assert.equal(recap.codeExample, 'bag = ["map", "rope"]\nbag[0] = "chart"\nbag.append("torch")\nprint(len(bag))\nfor item in bag:\n    print(item)');
  assert.equal(recap.expectedOutput, '3\nchart\nrope\ntorch');
  for (const e of questions) {
    assert.equal(getLessonForExercise(e), recap);
    assert.notEqual(recap.codeExample, isCodeBuilderExercise(e) ? assembledCode(e, answerFor(e)) : e.code);
    for (const replay of [false, true]) for (const phase of ['answering', 'solved']) {
      assert.equal(getVisibleLesson(e, phase, replay, initialLessonSession), null);
      const review = lessonSessionReducer(initialLessonSession, { type: 'review' });
      assert.equal(getVisibleLesson(e, phase, replay, review).lesson, recap);
      assert.equal(getVisibleLesson(e, phase, replay, lessonSessionReducer(review, { type: 'close' })), null);
    }
  }
  const attempt = startMissionAttempt(before, mission.id), selected = questions[0].options[0].id;
  const wrong = submitMissionAnswer(before, attempt, selected);
  lessonSessionReducer(lessonSessionReducer(initialLessonSession, { type: 'review' }), { type: 'close' });
  assert.equal(wrong.status, 'incorrect'); assert.equal(wrong.attempt, attempt); assert.equal(wrong.progress, before);
  assert.equal(getBossHp(wrong.attempt), 100); assert.equal(getTotalEarnedXp(before), 1180);
});

test('Five explicit spells give 100→0 HP, explanations before Continue, 100 XP once, replay zero and World 4 clear', () => {
  assert.deepEqual(getWorldProgress(before, listArchipelago.id), { completed: 6, total: 7, percent: 86 });
  assert.equal(isWorldCleared(before, listArchipelago.id), false);
  const won = play(before, 100);
  assert.deepEqual(won.attempt.result, { xpAwarded: 100, totalXp: 1280, newlyUnlockedChapterIds: [] });
  assert.equal(isWorldCleared(won.progress, listArchipelago.id), true);
  assert.deepEqual(getWorldProgress(won.progress, listArchipelago.id), { completed: 7, total: 7, percent: 100 });
  assert.equal(play(won.progress, 0).progress, won.progress); assert.equal(completeMission(won.progress, mission.id).xpAwarded, 0);
  const stats = getPlayerStatistics(won.progress);
  assert.deepEqual([stats.totalXp, stats.completedExercises, stats.completedMissions, stats.defeatedBosses], [1280, 100, 26, 4]);
  assert.equal(getPlayerLevel(stats.totalXp).level, 13); assert.deepEqual(getAchievements(won.progress), getAchievements(before));
  for (const world of worlds.slice(0, 3)) { assert.equal(isWorldCleared(before, world.id), true); assert.equal(isWorldCleared(won.progress, world.id), true); }
  assert.deepEqual(worldMapForMission(mission.id), { pathname: '/world-map', params: { worldId: listArchipelago.id } });
  assert.equal(trackForRoute(`/mission/${mission.id}`), 'battle'); assert.equal(trackForRoute('/world-map'), 'forest');
});

test('1180/1280-XP saves restore without migration or duplicate XP; every note and settings record survives', async () => {
  const sentinels = [['devquest.profile.v1', 'profile-sentinel'], ['devquest.audio.v1', 'audio-sentinel'], ['devquest.onboarding.v1', 'onboarding-sentinel']];
  const data = new Map(sentinels), writes = [];
  const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); writes.push(k); } };
  for (const progress of [before, play(before, 100).progress]) {
    const raw = JSON.stringify({ version: 1, completedMissionIds: progress.completedMissionIds });
    assert.deepEqual(parseSavedProgression(raw).progression, progress);
    await createProgressionStore(storage).save(progress); assert.equal(data.get(PROGRESSION_STORAGE_KEY), raw);
    const restored = (await createProgressionStore(storage).load()).progression;
    assert.deepEqual(restored, progress); assert.equal(isMissionUnlocked(restored, mission.id), true);
    assert.equal(getTotalEarnedXp(restored), progress === before ? 1180 : 1280);
    if (progress !== before) assert.equal(play(restored, 0).progress, restored);
    for (const [key, value] of sentinels) assert.equal(data.get(key), value);
  }
  assert.deepEqual(new Set(writes), new Set([PROGRESSION_STORAGE_KEY]));
  let notes = {};
  for (const e of exercises) { assert.ok(getLessonForExercise(e)); assert.ok(getSpellbookEntryForExercise(e.id)); notes = setExerciseNote(notes, e.id, `Remember ${e.id}`); }
  await createNotesStore(storage).save(notes); assert.deepEqual((await createNotesStore(storage).load()).notes, notes);
  assert.deepEqual(questions.map(e => getSpellbookEntryForExercise(e.id).id), ['python-list-indexing', 'python-list-append', 'python-list-replacement', 'python-list-iteration', 'python-list-iteration']);
});

