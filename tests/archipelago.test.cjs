const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
const { worlds, chapters, missions, exercises, listArchipelago, loopCaverns } = require('../src/game/worldContent.ts');
const { archipelagoMissions, archipelagoChapters: islands, archipelagoExercises } = require('../src/game/archipelagoContent.ts');
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
const baseline = require('./fixtures/archipelago-compatibility.json');
const before = { completedMissionIds: Object.keys(baseline.missions) };
const targets = archipelagoMissions.slice(0, 2);
const questions = archipelagoExercises.slice(0, 6);
const builders = questions.filter(isCodeBuilderExercise);
const answerFor = e => isCodeBuilderExercise(e) ? JSON.stringify(e.validation.expectedFragmentIds) : e.validation.correctOptionId;
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('Archipelago preserves all 77 exercises, nineteen missions, three worlds/bosses, lessons, references and protected engines', () => {
  for (const [name, items] of Object.entries({ worlds, chapters, missions, exercises, lessons, spellbook: spellbookEntries })) {
    for (const [id, expected] of Object.entries(baseline[name])) assert.equal(hash(items.find(v => v.id === id)), expected, id);
    assert.deepEqual(items.filter(v => Object.hasOwn(baseline[name], v.id)).map(v => v.id), Object.keys(baseline[name]));
  }
  for (const [id, entry] of Object.entries(baseline.spellbookLinks)) assert.equal(exerciseSpellbookEntryIds[id], entry);
  for (const [file, expected] of Object.entries(baseline.protectedFiles)) require('./protectedSource.cjs').assertProtectedSource(file, expected);
  assert.equal(Object.keys(baseline.exercises).length, 77);
  assert.equal(getTotalEarnedXp(before), 960);
});

test('Four worlds register exactly two short list missions, four lessons, two references and six unique touch questions', () => {
  assert.deepEqual([worlds.length, chapters.length, missions.length, exercises.length, lessons.length, spellbookEntries.length], [4, 26, 26, 100, 51, 26]);
  assert.deepEqual([exercises.filter(isChoiceExercise).length, exercises.filter(isCodeBuilderExercise).length], [82, 16]);
  assert.equal(exercises.filter(e => !isChoiceExercise(e) && !isCodeBuilderExercise(e)).length, 2);
  assert.deepEqual(missions.filter(m => !Object.hasOwn(baseline.missions, m.id)), archipelagoMissions);
  assert.deepEqual(exercises.filter(e => !Object.hasOwn(baseline.exercises, e.id)), archipelagoExercises);
  assert.deepEqual(targets.map(m => [m.title, m.exerciseIds.length, m.xpReward]), [['Treasure Inventory', 3, 30], ['Index Island', 3, 30]]);
  assert.deepEqual(questions.map(e => e.type), ['multiple-choice', 'multiple-choice', 'code-builder', 'output-choice', 'output-choice', 'code-builder']);
  assert.deepEqual(listArchipelago.chapterIds, islands.map(c => c.id));
  assert.equal(listArchipelago.xpReward, 320);
  assert.ok(targets.every(m => !m.encounter && !isBossMission(m.id)));
  const ids = [...worlds, ...chapters, ...missions, ...exercises, ...lessons, ...spellbookEntries,
    ...exercises.filter(isChoiceExercise).flatMap(e => e.options), ...exercises.filter(isCodeBuilderExercise).flatMap(e => e.fragments)].map(v => v.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(missions.reduce((xp, m) => xp + m.xpReward, 0), 1280);
  assert.equal(missions.filter(m => isBossMission(m.id)).length, 4);
});

test('All seven Caverns chapters including Warden gate World 4 and locked map/mission links; mission two follows one', () => {
  const cavernIds = missions.filter(m => loopCaverns.chapterIds.includes(m.chapterId)).map(m => m.id);
  assert.deepEqual(listArchipelago.prerequisiteMissionIds, cavernIds);
  assert.ok(cavernIds.includes('python-caverns-eternal-loop-01'));
  assert.deepEqual(islands.map(c => c.prerequisiteMissionIds), [[], [targets[0].id], [targets[1].id], ['python-archipelago-growing-chest-01'], ['python-archipelago-smiths-exchange-01'], ['python-archipelago-island-expedition-01'], ['python-archipelago-supply-run-01']]);
  for (const missing of cavernIds) {
    const locked = { completedMissionIds: before.completedMissionIds.filter(id => id !== missing) };
    assert.equal(isWorldUnlocked(locked, listArchipelago.id), false, missing);
    assert.deepEqual(getAccessibleMapChapters(locked, listArchipelago.id), []);
    for (const m of targets) {
      assert.equal(getPlayableMission(locked, m.id), null); assert.equal(startMissionAttempt(locked, m.id), null);
      assert.equal(completeMission(locked, m.id).xpAwarded, 0);
    }
  }
  assert.equal(isWorldUnlocked(before, listArchipelago.id), true);
  assert.deepEqual(getAccessibleMapChapters(before, listArchipelago.id), islands);
  assert.equal(isMissionUnlocked(before, targets[0].id), true);
  assert.equal(isMissionUnlocked(before, targets[1].id), false);
  assert.equal(getPlayableMission(before, targets[1].id), null);
  const forged = { missionId: targets[1].id, exerciseIndex: 0, solvedExerciseIds: [], phase: 'answering', result: null };
  assert.equal(submitMissionAnswer(before, forged, answerFor(questions[3])).status, 'unavailable');
});

// Independently reviewed display fixtures and index tables. No Python snippets are executed.
test('List syntax, exact outputs, zero-based positions and lengths are accurate; every choice has one correct stable ID', () => {
  const reviewed = [
    ['', 'b', 'It stores multiple items together in order.'],
    ['', 'a', 'gear = ["net", "hat"]'],
    ['kit = ["shell", "flag", "bell"]\nprint(kit[0])\nprint(kit[1])', 'c', 'shell\nflag'],
    ['bag = ["orb", "key", "cap"]\nprint(len(bag))', 'b', '3'],
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
    ['loot = ["orb", "key"]\nprint(loot)\nprint("Packed")', "['orb', 'key']\nPacked"],
    ['loot = ["ring", "map"]\nitem = loot[1]\nprint(item)', 'map'],
  ]);
  const positions = [[0, 'shell'], [1, 'flag'], [2, 'bell']];
  assert.deepEqual(positions.slice(0, 2).map(pair => pair[1]), ['shell', 'flag']);
  assert.equal(positions.length, 3); assert.equal(positions.some(([index]) => index === 3), false);
  assert.equal(['orb', 'key', 'cap'].length, 3);
  assert.match(questions[4].explanation, /Index 3 would be outside/);
});

test('Four lessons introduce list creation, display, indexing and length before assessment with distinct accurate examples', () => {
  const expected = [
    ['python-lesson-list-create', 'supplies = ["rope", "coin"]\nprint("Ready")', 'Ready'],
    ['python-lesson-list-display', 'pack = ["ink", "wax"]\nprint(pack)\nprint("Stored")', "['ink', 'wax']\nStored"],
    ['python-lesson-list-index', 'kit = ["map", "oar", "gem"]\nprint(kit[0])\nprint(kit[2])', 'map\ngem'],
    ['python-lesson-list-length', 'gems = ["red", "blue"]\nprint(len(gems))\nlast = gems[1]\nprint(last)', '2\nblue'],
  ];
  for (const [id, code, output] of expected) {
    const lesson = lessons.find(l => l.id === id);
    assert.deepEqual([lesson.codeExample, lesson.expectedOutput], [code, output]);
    for (const key of ['title', 'explanation', 'whyItWorks', 'importantRule']) assert.ok(lesson[key].length > 10);
    assert.equal(!!lesson.optionalReview, false);
  }
  assert.match(lessons.find(l => l.id === expected[3][0]).importantRule, /text only/);
  targets.forEach((m, i) => {
    let session = initialLessonSession;
    m.exerciseIds.forEach((id, index) => {
      const e = questions.find(v => v.id === id), lesson = getLessonForExercise(e);
      assert.equal(lesson.id, expected[i * 2 + (i === 0 ? index === 2 ? 1 : 0 : index > 0 ? 1 : 0)][0]);
      assert.equal(!!getVisibleLesson(e, 'answering', false, session), i === 0 ? index !== 1 : index !== 2);
      assert.equal(getVisibleLesson(e, 'answering', true, initialLessonSession), null);
      session = lessonSessionReducer(session, { type: 'continue', lessonId: lesson.id });
      assert.equal(getVisibleLesson(e, 'answering', false, session), null);
      assert.equal(getVisibleLesson(e, 'answering', false, lessonSessionReducer(session, { type: 'review' })).lesson, lesson);
      assert.notEqual(lesson.codeExample, isCodeBuilderExercise(e) ? assembledCode(e, answerFor(e)) : e.code);
      assert.notEqual(lesson.expectedOutput, isCodeBuilderExercise(e) ? e.expectedOutput : e.options.find(o => o.id === answerFor(e)).label);
    });
  });
});

for (const e of builders) test(`${e.id}: one meaningful order, malformed/foreign fragments rejected and wrong drafts recover with Undo/Reset`, () => {
  const expected = e.validation.expectedFragmentIds;
  const permutations = a => a.length ? a.flatMap((id, i) => permutations(a.filter((_, j) => i !== j)).map(rest => [id, ...rest])) : [[]];
  assert.equal(e.fragments.length, 3);
  assert.equal(permutations(expected).filter(ids => isExerciseAnswerCorrect(e, JSON.stringify(ids))).length, 1);
  assert.ok(e.fragments.every(f => f.code.length <= 22 && !f.code.includes('\n')));
  for (const ids of [expected.slice(1), [...expected, expected[0]], [expected[0], expected[0], ...expected.slice(2)],
    ['unknown', ...expected.slice(1)], [builders.find(v => v !== e).fragments[0].id, ...expected.slice(1)], [...expected, 'extra'],
    expected.map(id => e.fragments.find(f => f.id === id).code)]) assert.equal(isExerciseAnswerCorrect(e, JSON.stringify(ids)), false);
  for (const bad of ['{', '{}', 'null', 'true', '', '[]', assembledCode(e, answerFor(e))]) assert.equal(isExerciseAnswerCorrect(e, bad), false);
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
    const wrong = submitMissionAnswer(progress, attempt, isCodeBuilderExercise(e) ? JSON.stringify([...e.validation.expectedFragmentIds].reverse()) : 'foreign');
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

test('Three valid spells pay 30 XP once, replay zero, sequential unlocking and 2/4 available progress without a world clear', () => {
  let progress = before;
  targets.forEach((m, i) => {
    const won = play(progress, m, 30); progress = won.progress;
    assert.equal(getTotalEarnedXp(progress), 990 + i * 30);
    assert.deepEqual(won.attempt.result.newlyUnlockedChapterIds, [islands[i + 1].id]);
    assert.deepEqual(getWorldProgress(progress, listArchipelago.id), { completed: 1 + i, total: 7, percent: i === 0 ? 14 : 29 });
    assert.equal(isWorldCleared(progress, listArchipelago.id), false);
    assert.equal(play(progress, m, 0).progress, progress);
    assert.equal(completeMission(progress, m.id).xpAwarded, 0);
    const stats = getPlayerStatistics(progress);
    assert.deepEqual([stats.totalXp, stats.completedExercises, stats.completedMissions, stats.defeatedBosses], [990 + i * 30, 80 + i * 3, 20 + i, 3]);
    assert.equal(stats.currentWorld, listArchipelago.title);
  });
  assert.deepEqual(getAchievements(progress), getAchievements(before));
  for (const world of worlds.slice(0, 3)) assert.equal(isWorldCleared(progress, world.id), true);
});

test('World switching and mission returns resolve all four worlds while preserving Home/map audio routing', () => {
  for (const w of [...worlds, ...worlds].reverse()) {
    assert.equal(resolveMapWorld(w.id), w);
    for (const m of missions.filter(m => w.chapterIds.includes(m.chapterId))) {
      assert.deepEqual(worldMapForMission(m.id), { pathname: '/world-map', params: { worldId: w.id } });
      assert.equal(trackForRoute(`/mission/${m.id}`), 'battle');
    }
  }
  assert.equal(resolveMapWorld('unknown'), worlds[0]);
  assert.equal(trackForRoute('/'), 'forest'); assert.equal(trackForRoute('/world-map'), 'forest');
});

test('Every prior save prefix, including 960 XP, restores unchanged; new 990/1020 saves keep profile, settings, notes and replay rewards', async () => {
  for (let n = 0; n <= before.completedMissionIds.length; n++) {
    const progress = { completedMissionIds: before.completedMissionIds.slice(0, n) };
    const restored = parseSavedProgression(JSON.stringify({ version: 1, completedMissionIds: progress.completedMissionIds })).progression;
    assert.deepEqual(restored, progress);
    assert.equal(getTotalEarnedXp(restored), missions.slice(0, n).reduce((sum, m) => sum + m.xpReward, 0));
    assert.equal(isWorldUnlocked(restored, listArchipelago.id), n === 19);
  }
  const sentinels = [['devquest.profile.v1', JSON.stringify({ version: 1, nickname: 'Island Reader', avatarId: 'mage' })], ['devquest.audio.v1', 'audio-sentinel'], ['devquest.onboarding.v1', 'onboarding-sentinel']];
  const data = new Map(sentinels);
  const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
  let progress = before;
  for (let i = 0; i < 3; i++) {
    if (i) progress = play(progress, targets[i - 1], 30).progress;
    await createProgressionStore(storage).save(progress);
    const restored = (await createProgressionStore(storage).load()).progression;
    assert.deepEqual(restored, progress); assert.equal(getTotalEarnedXp(restored), 960 + i * 30);
    if (i) assert.equal(play(restored, targets[i - 1], 0).progress, restored);
    for (const [key, value] of sentinels) assert.equal(data.get(key), value);
  }
  let notes = {};
  for (const e of exercises) {
    assert.ok(getLessonForExercise(e)); assert.ok(getSpellbookEntryForExercise(e.id));
    notes = setExerciseNote(notes, e.id, `Remember ${e.id}`);
  }
  await createNotesStore(storage).save(notes); assert.deepEqual((await createNotesStore(storage).load()).notes, notes);
  assert.deepEqual(questions.map(e => getSpellbookEntryForExercise(e.id).id), ['python-lists', 'python-lists', 'python-lists', 'python-list-indexing', 'python-list-indexing', 'python-list-indexing']);
  const entries = spellbookEntries.filter(e => ['python-lists', 'python-list-indexing'].includes(e.id));
  assert.deepEqual(entries.map(e => [e.codeExample, e.expectedOutput]), [
    ['chest = ["pearl", "shell"]\nprint(chest)', "['pearl', 'shell']"],
    ['cargo = ["sail", "anchor"]\nprint(cargo[0])\nprint(len(cargo))', 'sail\n2'],
  ]);
  assert.match(entries[1].commonMistake, /text only/);
});
