const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
const { worlds, chapters, missions, exercises, listArchipelago, loopCaverns } = require('../src/game/worldContent.ts');
const { inventoryUpdateMissions: targets, inventoryUpdateChapters: islands, inventoryUpdateExercises: questions } = require('../src/game/archipelagoUpdatesContent.ts');
const { isCodeBuilderExercise, assembledCode, readFragmentIds, editBuilderAnswer } = require('../src/game/codeBuilder.ts');
const { isChoiceExercise, isExerciseAnswerCorrect, getIncorrectAnswerFeedback } = require('../src/game/exerciseValidation.ts');
const { startMissionAttempt, getPlayableMission, submitMissionAnswer, continueMissionAttempt } = require('../src/game/worldMission.ts');
const { getTotalEarnedXp, getWorldProgress, isMissionUnlocked, isWorldUnlocked, completeMission } = require('../src/game/progression.ts');
const { getPlayerStatistics, getAchievements } = require('../src/game/profile.ts');
const { createProgressionStore, parseSavedProgression } = require('../src/game/progressionStorage.ts');
const { createNotesStore, setExerciseNote } = require('../src/game/notesStorage.ts');
const { lessons, getLessonForExercise } = require('../src/game/lessonContent.ts');
const { getVisibleLesson, initialLessonSession, lessonSessionReducer } = require('../src/game/lessonSession.ts');
const { spellbookEntries, exerciseSpellbookEntryIds, getSpellbookEntryForExercise } = require('../src/game/spellbookContent.ts');
const { getAccessibleMapChapters, resolveMapWorld, worldMapForMission } = require('../src/navigation/worldRoutes.ts');
const { isBossMission, isWorldCleared, getBossHp } = require('../src/game/boss.ts');
const { trackForRoute } = require('../src/game/audioController.ts');
const { listIterationMissions, listIterationChapters, listIterationExercises } = require('../src/game/archipelagoIterationContent.ts');
const { treasureGuardianChapter, treasureGuardianMission, treasureGuardianExercises } = require('../src/game/archipelagoBossContent.ts');
const { forgeMissions, forgeExercises, forgeChapters } = require('../src/game/forgeContent.ts');
const baseline = require('./fixtures/inventory-updates-compatibility.json');
const before = { completedMissionIds: Object.keys(baseline.missions) };
const builders = questions.filter(isCodeBuilderExercise);
const answerFor = e => isCodeBuilderExercise(e) ? JSON.stringify(e.validation.expectedFragmentIds) : e.validation.correctOptionId;
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('Inventory updates preserve all 83 exercises, 21 missions/rewards, old lessons/references, bosses and runtime systems', () => {
  for (const [name, items] of Object.entries({ chapters, missions, exercises, lessons, spellbook: spellbookEntries })) {
    for (const [id, expected] of Object.entries(baseline[name])) assert.equal(hash(items.find(v => v.id === id)), expected, id);
    assert.deepEqual(items.filter(v => Object.hasOwn(baseline[name], v.id)).map(v => v.id), Object.keys(baseline[name]));
  }
  for (const world of worlds.slice(0, 3)) assert.equal(hash(world), baseline.worlds[world.id]);
  assert.deepEqual(listArchipelago, { ...baseline.archipelago, chapterIds: [...baseline.archipelago.chapterIds, ...islands.map(c => c.id), ...listIterationChapters.map(c => c.id), treasureGuardianChapter.id], xpReward: 320 });
  for (const [id, entry] of Object.entries(baseline.spellbookLinks)) assert.equal(exerciseSpellbookEntryIds[id], entry);
  for (const [file, expected] of Object.entries(baseline.protectedFiles)) require('./protectedSource.cjs').assertProtectedSource(file, expected);
  assert.equal(Object.keys(baseline.exercises).length, 83);
  assert.equal(getTotalEarnedXp(before), 1020);
});

test('Exactly two three-question missions add 80 XP, four lessons and two references with globally unique IDs', () => {
  assert.deepEqual([worlds.length, chapters.length, missions.length, exercises.length, lessons.length, spellbookEntries.length], [5, 28, 28, 106, 55, 28]);
  assert.deepEqual([exercises.filter(isChoiceExercise).length, exercises.filter(isCodeBuilderExercise).length], [86, 18]);
  assert.equal(exercises.filter(e => !isChoiceExercise(e) && !isCodeBuilderExercise(e)).length, 2);
  assert.deepEqual(missions.filter(m => !Object.hasOwn(baseline.missions, m.id)), [...targets, ...listIterationMissions, treasureGuardianMission, ...forgeMissions]);
  assert.deepEqual(exercises.filter(e => !Object.hasOwn(baseline.exercises, e.id)), [...questions, ...listIterationExercises, ...treasureGuardianExercises, ...forgeExercises]);
  assert.deepEqual(targets.map(m => [m.title, m.exerciseIds.length, m.xpReward]), [['The Growing Chest', 3, 40], ["The Smith's Exchange", 3, 40]]);
  assert.deepEqual(questions.map(e => e.type), ['output-choice', 'missing-token', 'code-builder', 'output-choice', 'multiple-choice', 'code-builder']);
  assert.ok(targets.every(m => !m.encounter && !isBossMission(m.id)));
  const ids = [...worlds, ...chapters, ...missions, ...exercises, ...lessons, ...spellbookEntries,
    ...exercises.filter(isChoiceExercise).flatMap(e => e.options), ...exercises.filter(isCodeBuilderExercise).flatMap(e => e.fragments)].map(v => v.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(missions.reduce((xp, m) => xp + m.xpReward, 0), 1340);
  assert.equal(missions.filter(m => isBossMission(m.id)).length, 4);
});

test('Index Island gates Growing Chest, which gates Smith; locked deep links and fabricated final submissions fail', () => {
  assert.deepEqual(islands.map(c => c.prerequisiteMissionIds), [['python-archipelago-index-island-01'], [targets[0].id]]);
  const locked = { completedMissionIds: before.completedMissionIds.slice(0, -1) };
  for (const m of targets) {
    assert.equal(getPlayableMission(locked, m.id), null); assert.equal(startMissionAttempt(locked, m.id), null);
    assert.equal(completeMission(locked, m.id).xpAwarded, 0);
    const forged = { missionId: m.id, exerciseIndex: 2, solvedExerciseIds: [], phase: 'answering', result: null };
    const answer = answerFor(questions.find(e => e.id === m.exerciseIds[2]));
    assert.equal(submitMissionAnswer(locked, forged, answer).status, 'unavailable');
    assert.equal(submitMissionAnswer(before, forged, answer).status, 'unavailable');
  }
  assert.equal(isMissionUnlocked(before, targets[0].id), true);
  assert.equal(isMissionUnlocked(before, targets[1].id), false);
  assert.equal(isWorldUnlocked(before, listArchipelago.id), true);
  assert.equal(getAccessibleMapChapters(before, listArchipelago.id).length, 7);
});

// Fixed, independently reviewed fixtures/tables only; never execute authored Python.
test('Append and indexed assignment snippets, outputs and option IDs match independently reviewed semantics', () => {
  const reviewed = [
    ['loot = ["orb"]\nloot.append("shell")\nprint(loot[1])', 'b', 'shell'],
    ['bag = ["key", "cap"]\nbag.____("pin")\nprint(len(bag))', 'a', 'append'],
    ['gear = ["bow", "cap"]\ngear[1] = "helm"\nprint(gear[1])', 'c', 'helm'],
    ['bag = ["gem", "net"]', 'b', 'bag[0] = "pearl"'],
  ];
  questions.filter(isChoiceExercise).forEach((e, i) => {
    assert.equal(e.code, reviewed[i][0]); assert.equal(answerFor(e), `${e.id}-${reviewed[i][1]}`);
    assert.equal(e.options.find(o => o.id === answerFor(e)).label, reviewed[i][2]);
    assert.equal(e.options.filter(o => isExerciseAnswerCorrect(e, o.id)).length, 1);
    for (const o of e.options) {
      assert.equal(isExerciseAnswerCorrect(e, o.label), false);
      if (o.id !== answerFor(e)) assert.equal(getIncorrectAnswerFeedback(e, o.id), o.feedback);
    }
    for (const bad of ['', 'unknown', 'toString', `${answerFor(e)} `, ...questions.filter(v => v !== e).map(answerFor)]) assert.equal(isExerciseAnswerCorrect(e, bad), false);
  });
  assert.deepEqual(builders.map(e => [assembledCode(e, answerFor(e)), e.expectedOutput]), [
    ['pack = ["bell", "hat"]\npack.append("map")\nprint(len(pack))', '3'],
    ['kit = ["axe", "orb"]\nkit[0] = "staff"\nprint(kit[0])', 'staff'],
  ]);
  // Explicit before/after tables check one new final item versus replacement at the same slot.
  const additions = [[['orb'], ['orb', 'shell']], [['key', 'cap'], ['key', 'cap', 'pin']], [['bell', 'hat'], ['bell', 'hat', 'map']]];
  for (const [old, updated] of additions) {
    assert.equal(updated.length, old.length + 1); assert.deepEqual(updated.slice(0, old.length), old);
    assert.equal(updated.indexOf(updated.at(-1)), old.length);
  }
  const replacements = [[['bow', 'cap'], ['bow', 'helm'], 1], [['gem', 'net'], ['pearl', 'net'], 0], [['axe', 'orb'], ['staff', 'orb'], 0]];
  for (const [old, updated, index] of replacements) {
    assert.equal(updated.length, old.length); assert.notEqual(updated[index], old[index]);
    old.forEach((value, i) => { if (i !== index) assert.equal(updated[i], value); });
  }
  assert.match(questions[1].explanation, /changes bag rather than returning a new list/);
  assert.match(questions[4].explanation, /len\(bag\) stays 2/);
  assert.match(questions[4].options[0].feedback, /third item/);
});

test('Four concise lessons teach change, append, replacement and length before use; replays skip introductions', () => {
  const expected = [
    ['python-lesson-list-append', 'bag = ["rope", "coin"]\nbag.append("gem")\nprint(bag[2])', 'gem'],
    ['python-lesson-append-length', 'kit = ["map"]\nkit.append("ink")\nprint(len(kit))', '2'],
    ['python-lesson-list-replace', 'tools = ["rod", "cup"]\ntools[1] = "mug"\nprint(tools[1])', 'mug'],
    ['python-lesson-replace-length', 'kit = ["oar", "flag"]\nkit[0] = "sail"\nprint(len(kit))', '2'],
  ];
  for (const [id, code, output] of expected) {
    const l = lessons.find(l => l.id === id);
    assert.deepEqual([l.codeExample, l.expectedOutput], [code, output]);
    for (const key of ['title', 'explanation', 'whyItWorks', 'importantRule']) assert.ok(l[key].length > 10);
    assert.ok([l.explanation, l.whyItWorks, l.importantRule].join(' ').split(/\s+/).length <= 115);
  }
  assert.match(lessons.find(l => l.id === expected[0][0]).importantRule, /does not return a new list/);
  targets.forEach((m, i) => {
    let session = initialLessonSession;
    m.exerciseIds.forEach((id, index) => {
      const e = questions.find(v => v.id === id), lesson = getLessonForExercise(e);
      assert.equal(lesson.id, expected[i * 2 + (index === 0 ? 0 : 1)][0]);
      assert.equal(!!getVisibleLesson(e, 'answering', false, session), index !== 2);
      assert.equal(getVisibleLesson(e, 'answering', true, initialLessonSession), null);
      session = lessonSessionReducer(session, { type: 'continue', lessonId: lesson.id });
      assert.equal(getVisibleLesson(e, 'answering', false, session), null);
      assert.equal(getVisibleLesson(e, 'answering', false, lessonSessionReducer(session, { type: 'review' })).lesson, lesson);
      assert.notEqual(lesson.codeExample, isCodeBuilderExercise(e) ? assembledCode(e, answerFor(e)) : e.code);
      assert.notEqual(lesson.expectedOutput, isCodeBuilderExercise(e) ? e.expectedOutput : e.options.find(o => o.id === answerFor(e)).label);
    });
  });
});

for (const e of builders) test(`${e.id}: exactly one accepted order, stable IDs, malformed/foreign rejection and recoverable wrong drafts`, () => {
  const expected = e.validation.expectedFragmentIds;
  const permutations = a => a.length ? a.flatMap((id, i) => permutations(a.filter((_, j) => i !== j)).map(rest => [id, ...rest])) : [[]];
  assert.equal(e.fragments.length, 3);
  assert.equal(permutations(expected).filter(ids => isExerciseAnswerCorrect(e, JSON.stringify(ids))).length, 1);
  assert.ok(e.fragments.every(f => f.code.length <= 22 && !f.code.includes('\n')));
  for (const ids of [expected.slice(1), [...expected, expected[0]], [expected[0], expected[0], ...expected.slice(2)],
    ['unknown', ...expected.slice(1)], [builders.find(v => v !== e).fragments[0].id, ...expected.slice(1)], [...expected, 'extra'],
    expected.map(id => e.fragments.find(f => f.id === id).code)]) assert.equal(isExerciseAnswerCorrect(e, JSON.stringify(ids)), false);
  for (const bad of ['{', '{}', 'null', 'true', '', '[]', assembledCode(e, answerFor(e))]) assert.equal(isExerciseAnswerCorrect(e, bad), false);
  assert.equal(isExerciseAnswerCorrect({ ...e, fragments: e.fragments.map(f => ({ ...f, code: 'display changed' })) }, answerFor(e)), true);
  let answer = '';
  for (const id of [...expected].reverse()) answer = editBuilderAnswer(e, answer, { type: 'add', id });
  assert.equal(isExerciseAnswerCorrect(e, answer), false);
  assert.equal(getIncorrectAnswerFeedback(e, answer), e.hint);
  const draft = answer;
  assert.equal(editBuilderAnswer(e, answer, { type: 'add', id: expected[0] }), draft);
  answer = editBuilderAnswer(e, answer, { type: 'undo' }); assert.equal(readFragmentIds(e, answer).length, 2);
  answer = editBuilderAnswer(e, answer, { type: 'reset' }); assert.equal(answer, '');
  for (const id of expected) answer = editBuilderAnswer(e, answer, { type: 'add', id });
  assert.equal(isExerciseAnswerCorrect(e, answer), true);
});

function play(progress, m, reward) {
  let attempt = startMissionAttempt(progress, m.id);
  m.exerciseIds.forEach((id, i) => {
    const e = questions.find(e => e.id === id), answer = answerFor(e);
    const wrong = submitMissionAnswer(progress, attempt, isCodeBuilderExercise(e) ? JSON.stringify([...e.validation.expectedFragmentIds].reverse()) : e.options.find(o => o.id !== answer).id);
    assert.equal(wrong.status, 'incorrect'); assert.equal(wrong.attempt, attempt); assert.equal(wrong.progress, progress); assert.equal(wrong.xpAwarded, 0);
    const right = submitMissionAnswer(progress, attempt, answer);
    assert.equal(right.status, 'correct'); assert.equal(right.attempt.phase, 'solved'); assert.equal(getBossHp(right.attempt), null);
    assert.equal(right.xpAwarded, i === 2 ? reward : 0);
    if (i < 2) { assert.equal(right.progress, progress); assert.equal(right.attempt.result, null); }
    for (let tap = 0; tap < 4; tap++) {
      const duplicate = submitMissionAnswer(right.progress, right.attempt, answer);
      assert.equal(duplicate.status, 'ignored'); assert.equal(duplicate.xpAwarded, 0); assert.equal(duplicate.attempt, right.attempt);
    }
    progress = right.progress; attempt = continueMissionAttempt(right.attempt, 3);
    assert.equal(attempt.phase, i === 2 ? 'complete' : 'answering');
    assert.equal(continueMissionAttempt(attempt, 3), attempt);
  });
  return { progress, attempt };
}

test('Third valid spell awards 40 XP exactly once; old 2/7 progress reaches 4/7 and unlocks Expedition with no boss or world clear', () => {
  let progress = before;
  assert.deepEqual(getWorldProgress(progress, listArchipelago.id), { completed: 2, total: 7, percent: 29 });
  targets.forEach((m, i) => {
    const won = play(progress, m, 40); progress = won.progress;
    assert.equal(getTotalEarnedXp(progress), 1060 + i * 40);
    assert.deepEqual(won.attempt.result.newlyUnlockedChapterIds, i === 0 ? [islands[1].id] : [listIterationChapters[0].id]);
    assert.deepEqual(getWorldProgress(progress, listArchipelago.id), { completed: 3 + i, total: 7, percent: i === 0 ? 43 : 57 });
    assert.equal(isWorldCleared(progress, listArchipelago.id), false);
    assert.equal(play(progress, m, 0).progress, progress);
    assert.equal(completeMission(progress, m.id).xpAwarded, 0);
    const stats = getPlayerStatistics(progress);
    assert.deepEqual([stats.totalXp, stats.completedExercises, stats.completedMissions, stats.defeatedBosses], [1060 + i * 40, 86 + i * 3, 22 + i, 3]);
    assert.equal(stats.currentWorld, listArchipelago.title);
    assert.deepEqual(worldMapForMission(m.id), { pathname: '/world-map', params: { worldId: listArchipelago.id } });
    assert.equal(trackForRoute(`/mission/${m.id}`), 'battle');
  });
  assert.deepEqual(getAchievements(progress), getAchievements(before));
  for (const world of worlds.slice(0, 3)) assert.equal(isWorldCleared(progress, world.id), true);
});

test('All old save prefixes and 1020/1060/1100 records restore without migration; profile/settings and all 100 note links survive', async () => {
  for (let n = 0; n <= before.completedMissionIds.length; n++) {
    const progress = { completedMissionIds: before.completedMissionIds.slice(0, n) };
    const restored = parseSavedProgression(JSON.stringify({ version: 1, completedMissionIds: progress.completedMissionIds })).progression;
    assert.deepEqual(restored, progress);
    assert.equal(getTotalEarnedXp(restored), missions.slice(0, n).reduce((sum, m) => sum + m.xpReward, 0));
  }
  const sentinels = [['devquest.profile.v1', JSON.stringify({ version: 1, nickname: 'Chest Keeper', avatarId: 'knight' })], ['devquest.audio.v1', 'audio-sentinel'], ['devquest.onboarding.v1', 'onboarding-sentinel']];
  const data = new Map(sentinels);
  const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
  let progress = before;
  for (let i = 0; i < 3; i++) {
    if (i) progress = play(progress, targets[i - 1], 40).progress;
    await createProgressionStore(storage).save(progress);
    const restored = (await createProgressionStore(storage).load()).progression;
    assert.deepEqual(restored, progress); assert.equal(getTotalEarnedXp(restored), 1020 + i * 40);
    if (i) assert.equal(play(restored, targets[i - 1], 0).progress, restored);
    for (const [key, value] of sentinels) assert.equal(data.get(key), value);
  }
  let notes = {};
  for (const e of exercises) {
    assert.ok(getLessonForExercise(e)); assert.ok(getSpellbookEntryForExercise(e.id));
    notes = setExerciseNote(notes, e.id, `Remember ${e.id}`);
  }
  await createNotesStore(storage).save(notes); assert.deepEqual((await createNotesStore(storage).load()).notes, notes);
  assert.deepEqual(questions.map(e => getSpellbookEntryForExercise(e.id).id), ['python-list-append', 'python-list-append', 'python-list-append', 'python-list-replacement', 'python-list-replacement', 'python-list-replacement']);
  const entries = spellbookEntries.filter(e => ['python-list-append', 'python-list-replacement'].includes(e.id));
  assert.deepEqual(entries.map(e => [e.codeExample, e.expectedOutput]), [
    ['chest = ["coin"]\nchest.append("ring")\nprint(chest[1])\nprint(len(chest))', 'ring\n2'],
    ['gear = ["cloak", "boots"]\ngear[0] = "cape"\nprint(gear[0])\nprint(len(gear))', 'cape\n2'],
  ]);
  assert.match(entries[0].commonMistake, /does not return a new list/);
});
