const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
const { worlds, chapters, missions, exercises, listArchipelago } = require('../src/game/worldContent.ts');
const { listIterationMissions: targets, listIterationChapters: islands, listIterationExercises: questions } = require('../src/game/archipelagoIterationContent.ts');
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
const { getAccessibleMapChapters, worldMapForMission } = require('../src/navigation/worldRoutes.ts');
const { isBossMission, isWorldCleared, getBossHp } = require('../src/game/boss.ts');
const { trackForRoute } = require('../src/game/audioController.ts');
const { treasureGuardianChapter, treasureGuardianMission, treasureGuardianExercises } = require('../src/game/archipelagoBossContent.ts');
const { forgeMissions, forgeExercises, forgeChapters } = require('../src/game/forgeContent.ts');
const baseline = require('./fixtures/list-iteration-compatibility.json');
const before = { completedMissionIds: Object.keys(baseline.missions) };
const builders = questions.filter(isCodeBuilderExercise);
const answerFor = e => isCodeBuilderExercise(e) ? JSON.stringify(e.validation.expectedFragmentIds) : e.validation.correctOptionId;
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

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

test('Iteration preserves all 89 earlier exercises, 23 missions, lessons, references, saves and runtime systems', () => {
  for (const [name, items] of Object.entries({ chapters, missions, exercises, lessons, spellbook: spellbookEntries })) {
    for (const [id, expected] of Object.entries(baseline[name])) assert.equal(hash(items.find(v => v.id === id)), expected, id);
    assert.deepEqual(items.filter(v => Object.hasOwn(baseline[name], v.id)).map(v => v.id), Object.keys(baseline[name]));
  }
  for (const world of worlds.slice(0, 3)) assert.equal(hash(world), baseline.worlds[world.id]);
  assert.deepEqual(listArchipelago, { ...baseline.archipelago, chapterIds: [...baseline.archipelago.chapterIds, ...islands.map(c => c.id), treasureGuardianChapter.id], xpReward: 320 });
  for (const [id, entry] of Object.entries(baseline.spellbookLinks)) assert.equal(exerciseSpellbookEntryIds[id], entry);
  for (const [file, expected] of Object.entries(baseline.protectedFiles)) require('./protectedSource.cjs').assertProtectedSource(file, expected);
  assert.equal(Object.keys(baseline.exercises).length, 89);
  assert.equal(getTotalEarnedXp(before), 1100);
});

test('Two three-question adventures, four lessons and one reference register unique IDs and 1280 available XP', () => {
  assert.deepEqual([worlds.length, chapters.length, missions.length, exercises.length, lessons.length, spellbookEntries.length], [5, 28, 28, 106, 55, 28]);
  assert.deepEqual([exercises.filter(isChoiceExercise).length, exercises.filter(isCodeBuilderExercise).length], [86, 18]);
  assert.equal(exercises.filter(e => !isChoiceExercise(e) && !isCodeBuilderExercise(e)).length, 2);
  assert.deepEqual(missions.filter(m => !Object.hasOwn(baseline.missions, m.id)), [...targets, treasureGuardianMission, ...forgeMissions]);
  assert.deepEqual(exercises.filter(e => !Object.hasOwn(baseline.exercises, e.id)), [...questions, ...treasureGuardianExercises, ...forgeExercises]);
  assert.deepEqual(targets.map(m => [m.title, m.exerciseIds.length, m.xpReward]), [['Island Expedition', 3, 40], ['The Supply Run', 3, 40]]);
  assert.deepEqual(questions.map(e => e.type), ['output-choice', 'missing-token', 'code-builder', 'output-choice', 'code-builder', 'output-choice']);
  assert.ok(targets.every(m => !m.encounter && !isBossMission(m.id)));
  const ids = [...worlds, ...chapters, ...missions, ...exercises, ...lessons, ...spellbookEntries,
    ...exercises.filter(isChoiceExercise).flatMap(e => e.options), ...exercises.filter(isCodeBuilderExercise).flatMap(e => e.fragments)].map(v => v.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(missions.reduce((sum, m) => sum + m.xpReward, 0), 1340);
  assert.equal(missions.filter(m => isBossMission(m.id)).length, 4);
});

test('Smith gates Expedition, which gates Supply Run; locked deep links and fabricated final submissions are rejected', () => {
  assert.deepEqual(islands.map(c => c.prerequisiteMissionIds), [['python-archipelago-smiths-exchange-01'], [targets[0].id]]);
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
  const withoutBoss = { completedMissionIds: before.completedMissionIds.filter(id => id !== 'python-caverns-eternal-loop-01') };
  assert.equal(isWorldUnlocked(withoutBoss, listArchipelago.id), false);
  assert.deepEqual(getAccessibleMapChapters(withoutBoss, listArchipelago.id), []);
  assert.equal(startMissionAttempt(withoutBoss, targets[0].id), null);
});

// Independent display fixtures and finite value tables only. No Python is executed or parsed.
test('Reviewed Python shows item values in list order, current-variable semantics and updates before inspection', () => {
  const displays = [
    ['finds = ["shell", "bell"]\nfor find in finds:\n    print(find)', 'shell\nbell'],
    ['loot = ["gem", "cap"]\nfor piece in loot:\n    print(____)', 'piece'],
    ['kit = ["orb", "key"]\nfor tool in kit:\n    print(tool)', 'orb\nkey'],
    ['bag = ["ink"]\nbag.append("wax")\nfor supply in bag:\n    print(supply)', 'ink\nwax'],
    ['pack = ["net"]\npack.append("hat")\nfor item in pack:\n    print(item)', 'net\nhat'],
    ['gear = ["axe", "cup"]\ngear[0] = "bow"\nfor item in gear:\n    print(item)', 'bow\ncup'],
  ];
  questions.forEach((e, i) => assert.deepEqual([
    isCodeBuilderExercise(e) ? assembledCode(e, answerFor(e)) : e.code,
    isCodeBuilderExercise(e) ? e.expectedOutput : e.options.find(o => o.id === answerFor(e)).label,
  ], displays[i]));
  const ordered = ['shell', 'bell'];
  assert.equal(ordered.join('\n'), displays[0][1]);
  assert.notEqual(ordered.map((_, index) => index).join('\n'), displays[0][1]);
  const appended = ['ink']; appended.push('wax');
  assert.equal(appended.join('\n'), displays[3][1]); assert.equal(appended.length, 2);
  const replaced = ['axe', 'cup']; replaced[0] = 'bow';
  assert.equal(replaced.join('\n'), displays[5][1]); assert.equal(replaced.length, 2);
  assert.match(questions[1].explanation, /piece receives gem.*cap/);
  assert.match(questions[4].prompt, /BEFORE the loop/);
  assert.ok(questions.every(e => e.hint && e.explanation));
});

test('Each choice accepts only its stable correct ID and supplies constructive wrong feedback', () => {
  for (const e of questions.filter(isChoiceExercise)) {
    assert.equal(e.options.filter(o => isExerciseAnswerCorrect(e, o.id)).length, 1);
    for (const option of e.options) {
      assert.equal(isExerciseAnswerCorrect(e, option.id), option.id === answerFor(e));
      if (option.id !== answerFor(e)) assert.equal(getIncorrectAnswerFeedback(e, option.id), option.feedback);
    }
    for (const invalid of ['', 'unknown', e.options.find(o => o.id === answerFor(e)).label,
      questions.filter(isChoiceExercise).find(other => other !== e).validation.correctOptionId]) assert.equal(isExerciseAnswerCorrect(e, invalid), false);
  }
});

for (const [index, e] of builders.entries()) test(`${e.id}: one intended order, compact indentation and recoverable drafts`, () => {
  const expected = e.validation.expectedFragmentIds;
  const permutations = a => a.length ? a.flatMap((id, i) => permutations(a.filter((_, j) => i !== j)).map(rest => [id, ...rest])) : [[]];
  assert.equal(e.fragments.length, index + 3);
  assert.equal(permutations(expected).filter(ids => isExerciseAnswerCorrect(e, JSON.stringify(ids))).length, 1);
  assert.ok(e.fragments.every(f => f.code.length <= 22 && !f.code.includes('\n')));
  const lines = assembledCode(e, answerFor(e)).split('\n');
  assert.ok(lines.at(-2).startsWith('for ') && lines.at(-2).endsWith(':'));
  assert.match(lines.at(-1), /^ {4}print\(/);
  assert.ok(lines.slice(0, -1).every(line => !line.startsWith(' ')));
  for (const ids of [expected.slice(1), [...expected, expected[0]], [expected[0], expected[0], ...expected.slice(2)],
    ['unknown', ...expected.slice(1)], [builders.find(v => v !== e).fragments[0].id, ...expected.slice(1)], [...expected, 'extra'],
    expected.map(id => e.fragments.find(f => f.id === id).code)]) assert.equal(isExerciseAnswerCorrect(e, JSON.stringify(ids)), false);
  for (const bad of ['{', '{}', 'null', 'true', '', '[]', assembledCode(e, answerFor(e))]) assert.equal(isExerciseAnswerCorrect(e, bad), false);
  let answer = '';
  for (const id of [...expected].reverse()) answer = editBuilderAnswer(e, answer, { type: 'add', id });
  assert.equal(isExerciseAnswerCorrect(e, answer), false);
  const draft = answer;
  assert.equal(editBuilderAnswer(e, answer, { type: 'add', id: expected[0] }), draft);
  answer = editBuilderAnswer(e, answer, { type: 'undo' }); assert.equal(readFragmentIds(e, answer).length, expected.length - 1);
  answer = editBuilderAnswer(e, answer, { type: 'reset' }); assert.equal(answer, '');
  for (const id of expected) answer = editBuilderAnswer(e, answer, { type: 'add', id });
  assert.equal(isExerciseAnswerCorrect(e, answer), true);
});

test('Four focused lessons teach before assessment; review remains available and replays skip introductions', () => {
  const added = lessons.filter(l => questions.some(e => e.lessonId === l.id));
  assert.deepEqual(added.map(l => [l.codeExample, l.expectedOutput]), [
    ['treasures = ["ruby", "map", "coin"]\nfor treasure in treasures:\n    print(treasure)', 'ruby\nmap\ncoin'],
    ['colors = ["red", "blue"]\nfor color in colors:\n    print(color)', 'red\nblue'],
    ['supplies = ["rope"]\nsupplies.append("torch")\nfor item in supplies:\n    print(item)', 'rope\ntorch'],
    ['tools = ["rod", "pan"]\ntools[1] = "pot"\nfor tool in tools:\n    print(tool)', 'rod\npot'],
  ]);
  assert.match(added[0].whyItWorks, /Three list items give three turns/);
  targets.forEach((m, missionIndex) => {
    let session = initialLessonSession;
    const automatic = [];
    m.exerciseIds.forEach((id, i) => {
      const e = questions.find(e => e.id === id), lesson = getLessonForExercise(e);
      if (getVisibleLesson(e, 'answering', false, session)) automatic.push(i);
      assert.equal(getVisibleLesson(e, 'answering', true, session), null);
      session = lessonSessionReducer(session, { type: 'continue', lessonId: lesson.id });
      const snapshot = JSON.stringify(session);
      const review = lessonSessionReducer(session, { type: 'review' });
      assert.equal(getVisibleLesson(e, 'answering', false, review).lesson, lesson);
      assert.equal(getVisibleLesson(e, 'answering', false, lessonSessionReducer(review, { type: 'close' })), null);
      assert.equal(JSON.stringify(session), snapshot);
      assert.notEqual(lesson.codeExample, isCodeBuilderExercise(e) ? assembledCode(e, answerFor(e)) : e.code);
      for (const field of ['title', 'explanation', 'codeExample', 'expectedOutput', 'whyItWorks', 'importantRule']) assert.ok(lesson[field]);
      assert.ok([lesson.explanation, lesson.whyItWorks, lesson.importantRule].join(' ').split(/\s+/).length <= 115);
    });
    assert.deepEqual(automatic, missionIndex === 0 ? [0, 1] : [0, 2]);
  });
});

test('Third valid spell alone grants 40 XP; replay and duplicate taps grant zero, six chapters unlock the boss without clearing World 4', () => {
  let progress = before;
  assert.deepEqual(getWorldProgress(progress, listArchipelago.id), { completed: 4, total: 7, percent: 57 });
  targets.forEach((m, i) => {
    const won = play(progress, m, 40); progress = won.progress;
    assert.equal(getTotalEarnedXp(progress), 1140 + i * 40);
    assert.deepEqual(won.attempt.result.newlyUnlockedChapterIds, i === 0 ? [islands[1].id] : [treasureGuardianChapter.id]);
    assert.deepEqual(getWorldProgress(progress, listArchipelago.id), { completed: 5 + i, total: 7, percent: i === 0 ? 71 : 86 });
    assert.equal(isWorldCleared(progress, listArchipelago.id), false);
    assert.equal(play(progress, m, 0).progress, progress);
    assert.equal(completeMission(progress, m.id).xpAwarded, 0);
    const stats = getPlayerStatistics(progress);
    assert.deepEqual([stats.totalXp, stats.completedExercises, stats.completedMissions, stats.defeatedBosses], [1140 + i * 40, 92 + i * 3, 24 + i, 3]);
    assert.equal(stats.currentWorld, listArchipelago.title);
    assert.deepEqual(worldMapForMission(m.id), { pathname: '/world-map', params: { worldId: listArchipelago.id } });
    assert.equal(trackForRoute(`/mission/${m.id}`), 'battle');
  });
  assert.deepEqual(getAchievements(progress), getAchievements(before));
  for (const world of worlds.slice(0, 3)) assert.equal(isWorldCleared(progress, world.id), true);
});

test('Old prefixes and 1100/1140/1180 saves restore without migration; all notes/reference links remain valid', async () => {
  for (let n = 0; n <= before.completedMissionIds.length; n++) {
    const progress = { completedMissionIds: before.completedMissionIds.slice(0, n) };
    const restored = parseSavedProgression(JSON.stringify({ version: 1, completedMissionIds: progress.completedMissionIds })).progression;
    assert.deepEqual(restored, progress);
    assert.equal(getTotalEarnedXp(restored), missions.slice(0, n).reduce((sum, m) => sum + m.xpReward, 0));
  }
  const sentinels = [['devquest.profile.v1', 'profile-sentinel'], ['devquest.audio.v1', 'audio-sentinel'], ['devquest.onboarding.v1', 'onboarding-sentinel']];
  const data = new Map(sentinels), writes = [];
  const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); writes.push(k); } };
  let progress = before;
  for (let i = 0; i < 3; i++) {
    if (i) progress = play(progress, targets[i - 1], 40).progress;
    await createProgressionStore(storage).save(progress);
    const restored = (await createProgressionStore(storage).load()).progression;
    assert.deepEqual(restored, progress); assert.equal(getTotalEarnedXp(restored), 1100 + i * 40);
    if (i) assert.equal(play(restored, targets[i - 1], 0).progress, restored);
    for (const [key, value] of sentinels) assert.equal(data.get(key), value);
  }
  assert.deepEqual(new Set(writes), new Set(['devquest.progression']));
  let notes = {};
  for (const e of exercises) {
    assert.ok(getLessonForExercise(e)); assert.ok(getSpellbookEntryForExercise(e.id));
    notes = setExerciseNote(notes, e.id, `Remember ${e.id}`);
  }
  await createNotesStore(storage).save(notes); assert.deepEqual((await createNotesStore(storage).load()).notes, notes);
  assert.ok(questions.every(e => getSpellbookEntryForExercise(e.id).id === 'python-list-iteration'));
  const entries = spellbookEntries.filter(e => e.id === 'python-list-iteration');
  assert.equal(entries.length, 1);
  assert.deepEqual([entries[0].codeExample, entries[0].expectedOutput], ['cargo = ["sail", "rope"]\nfor item in cargo:\n    print(item)', 'sail\nrope']);
});

