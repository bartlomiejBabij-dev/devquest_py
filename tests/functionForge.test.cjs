const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
const { worlds, chapters, missions, exercises, functionForge } = require('../src/game/worldContent.ts');
const { forgeMissions: targets, forgeChapters: islands, forgeExercises: questions } = require('../src/game/forgeContent.ts');
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
const baseline = require('./fixtures/function-forge-compatibility.json');
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

test('Function Forge preserves all four worlds, 100 exercises, old rewards, references, boss art and runtime systems', () => {
  for (const [name, items] of Object.entries({ worlds, chapters, missions, exercises, lessons, spellbook: spellbookEntries })) {
    for (const [id, expected] of Object.entries(baseline[name])) assert.equal(hash(items.find(v => v.id === id)), expected, id);
    assert.deepEqual(items.filter(v => Object.hasOwn(baseline[name], v.id)).map(v => v.id), Object.keys(baseline[name]));
  }
  for (const [id, entry] of Object.entries(baseline.spellbookLinks)) assert.equal(exerciseSpellbookEntryIds[id], entry);
  for (const [file, expected] of Object.entries(baseline.protectedFiles)) require('./protectedSource.cjs').assertProtectedSource(file, expected);
  assert.equal(Object.keys(baseline.exercises).length, 100); assert.equal(getTotalEarnedXp(before), 1280);
});

test('Five worlds register two three-spell missions, four lessons and two references with unique stable IDs', () => {
  assert.deepEqual([worlds.length, chapters.length, missions.length, exercises.length, lessons.length, spellbookEntries.length], [5, 28, 28, 106, 55, 28]);
  assert.deepEqual([exercises.filter(isChoiceExercise).length, exercises.filter(isCodeBuilderExercise).length], [86, 18]);
  assert.equal(exercises.filter(e => !isChoiceExercise(e) && !isCodeBuilderExercise(e)).length, 2);
  assert.deepEqual(missions.filter(m => !Object.hasOwn(baseline.missions, m.id)), targets);
  assert.deepEqual(exercises.filter(e => !Object.hasOwn(baseline.exercises, e.id)), questions);
  assert.deepEqual(targets.map(m => [m.title, m.exerciseIds.length, m.xpReward]), [['The Silent Anvil', 3, 30], ['The Rune Engraver', 3, 30]]);
  assert.deepEqual(questions.map(e => e.type), ['output-choice', 'missing-token', 'code-builder', 'output-choice', 'missing-token', 'code-builder']);
  assert.deepEqual(functionForge.chapterIds, islands.map(c => c.id)); assert.equal(functionForge.xpReward, 60);
  assert.ok(targets.every(m => !m.encounter && !isBossMission(m.id)));
  const ids = [...worlds, ...chapters, ...missions, ...exercises, ...lessons, ...spellbookEntries,
    ...exercises.filter(isChoiceExercise).flatMap(e => e.options), ...exercises.filter(isCodeBuilderExercise).flatMap(e => e.fragments)].map(v => v.id);
  assert.equal(new Set(ids).size, ids.length); assert.equal(missions.reduce((sum, m) => sum + m.xpReward, 0), 1340);
  assert.equal(missions.filter(m => isBossMission(m.id)).length, 4);
});

test('All seven Archipelago chapters including Guardian gate Forge and deep links; Engraver follows Anvil', () => {
  const oldWorld = worlds[3];
  const required = missions.filter(m => oldWorld.chapterIds.includes(m.chapterId)).map(m => m.id);
  assert.deepEqual(functionForge.prerequisiteMissionIds, required);
  assert.ok(required.includes('python-archipelago-treasure-guardian-01'));
  assert.deepEqual(islands.map(c => c.prerequisiteMissionIds), [[], [targets[0].id]]);
  for (const missing of required) {
    const locked = { completedMissionIds: before.completedMissionIds.filter(id => id !== missing) };
    assert.equal(isWorldUnlocked(locked, functionForge.id), false); assert.deepEqual(getAccessibleMapChapters(locked, functionForge.id), []);
    for (const m of targets) { assert.equal(getPlayableMission(locked, m.id), null); assert.equal(startMissionAttempt(locked, m.id), null); assert.equal(completeMission(locked, m.id).xpAwarded, 0); }
  }
  assert.equal(isWorldCleared(before, oldWorld.id), true); assert.equal(isWorldUnlocked(before, functionForge.id), true);
  assert.equal(isMissionUnlocked(before, targets[0].id), true); assert.equal(startMissionAttempt(before, targets[1].id), null);
  assert.deepEqual(getAccessibleMapChapters(before, functionForge.id), islands);
  const forged = { ...startMissionAttempt(before, targets[0].id), exerciseIndex: 2 };
  assert.equal(submitMissionAnswer(before, forged, answerFor(questions[2])).status, 'unavailable');
});

// Reviewed text fixtures and independent bounded call tables, never executing Python.
test('Definitions are silent until called; syntax, positional argument binding and printed outputs are accurate', () => {
  const expected = [
    ['def spark():\n    print("Zap!")', 'No output'],
    ['____ shine():\n    print("Glow")\nshine()', 'def'],
    ['def chime():\n    print("Ding")\nchime()', 'Ding'],
    ['def stamp(mark):\n    print(mark)\nstamp("Sun")', 'Sun'],
    ['def show(rune):\n    print(____)\nshow("Oak")\nshow("Ash")', 'rune'],
    ['def seal(sign):\n    print(sign)\nseal("Moon")', 'Moon'],
  ];
  questions.forEach((e, i) => assert.deepEqual([isCodeBuilderExercise(e) ? assembledCode(e, answerFor(e)) : e.code,
    isCodeBuilderExercise(e) ? e.expectedOutput : e.options.find(o => o.id === answerFor(e)).label], expected[i]));
  const calls = [[], ['Ding'], ['Sun'], ['Oak', 'Ash'], ['Moon']];
  assert.equal(calls[0].join('\n'), '', 'definition alone has no calls/output');
  assert.equal(calls[1].join('\n'), 'Ding'); assert.equal(calls[2].join('\n'), 'Sun');
  assert.equal(calls[3].map(argument => ({ rune: argument })).map(binding => binding.rune).join('\n'), 'Oak\nAsh');
  assert.equal(calls[4].join('\n'), 'Moon');
  assert.match(questions[0].explanation, /No output/); assert.match(questions[3].explanation, /parameter name.*argument/);
  assert.ok(questions.every(e => e.hint && e.explanation));
  for (const e of questions.filter(isChoiceExercise)) {
    assert.equal(e.options.filter(o => isExerciseAnswerCorrect(e, o.id)).length, 1);
    for (const o of e.options) { assert.equal(isExerciseAnswerCorrect(e, o.id), o.id === answerFor(e)); if (o.id !== answerFor(e)) assert.equal(getIncorrectAnswerFeedback(e, o.id), o.feedback); }
    for (const bad of ['', 'unknown', e.options.find(o => o.id === answerFor(e)).label, ...questions.filter(q => q !== e).map(answerFor)]) assert.equal(isExerciseAnswerCorrect(e, bad), false);
  }
});

test('Four concise lessons precede assessment, distinguish definitions/calls and parameters/arguments; replays skip introductions', () => {
  const added = lessons.filter(l => !Object.hasOwn(baseline.lessons, l.id));
  assert.deepEqual(added.map(l => [l.codeExample, l.expectedOutput]), [
    ['def ring_bell():\n    print("Bell!")\nring_bell()', 'Bell!'],
    ['def light_lamp():\n    print("Lit")\nlight_lamp()\nlight_lamp()', 'Lit\nLit'],
    ['def announce(item):\n    print(item)\nannounce("Ruby")', 'Ruby'],
    ['def reveal(treasure):\n    print(treasure)\nreveal("Pearl")\nreveal("Coin")', 'Pearl\nCoin'],
  ]);
  assert.match(added[0].importantRule, /produces no output/); assert.match(added[0].importantRule, /does not always need a parameter/);
  assert.match(added[2].whyItWorks, /item is the parameter.*Ruby.*argument/);
  for (const m of targets) {
    let session = initialLessonSession; const shown = [];
    m.exerciseIds.forEach((id, i) => {
      const e = questions.find(e => e.id === id), lesson = getLessonForExercise(e);
      if (getVisibleLesson(e, 'answering', false, session)) shown.push(i);
      assert.equal(getVisibleLesson(e, 'answering', true, session), null);
      session = lessonSessionReducer(session, { type: 'continue', lessonId: lesson.id });
      assert.equal(getVisibleLesson(e, 'answering', false, session), null);
      const reviewed = lessonSessionReducer(session, { type: 'review' });
      assert.equal(getVisibleLesson(e, 'answering', false, reviewed).lesson, lesson);
      assert.equal(getVisibleLesson(e, 'answering', false, lessonSessionReducer(reviewed, { type: 'close' })), null);
      assert.notEqual(lesson.codeExample, isCodeBuilderExercise(e) ? assembledCode(e, answerFor(e)) : e.code);
      for (const field of ['title', 'explanation', 'codeExample', 'expectedOutput', 'whyItWorks', 'importantRule']) assert.ok(lesson[field]);
      assert.ok([lesson.explanation, lesson.whyItWorks, lesson.importantRule].join(' ').split(/\s+/).length <= 120);
    });
    assert.deepEqual(shown, [0, 1]);
  }
});

test('Third valid answer grants 30 XP once; wrong/duplicate answers and replays grant none; Forge stays UP TO DATE', () => {
  let progress = before;
  assert.deepEqual(getWorldProgress(progress, functionForge.id), { completed: 0, total: 2, percent: 0 });
  targets.forEach((m, i) => {
    const won = play(progress, m, 30); progress = won.progress;
    assert.equal(getTotalEarnedXp(progress), 1310 + i * 30);
    assert.deepEqual(won.attempt.result.newlyUnlockedChapterIds, i === 0 ? [islands[1].id] : []);
    assert.deepEqual(getWorldProgress(progress, functionForge.id), { completed: i + 1, total: 2, percent: 50 + i * 50 });
    assert.equal(isWorldCleared(progress, functionForge.id), false);
    assert.equal(play(progress, m, 0).progress, progress); assert.equal(completeMission(progress, m.id).xpAwarded, 0);
    const stats = getPlayerStatistics(progress);
    assert.deepEqual([stats.totalXp, stats.completedExercises, stats.completedMissions, stats.defeatedBosses], [1310 + i * 30, 103 + i * 3, 27 + i, 4]);
    assert.equal(stats.currentWorld, functionForge.title);
    assert.deepEqual(worldMapForMission(m.id), { pathname: '/world-map', params: { worldId: functionForge.id } });
    assert.equal(trackForRoute(`/mission/${m.id}`), 'battle');
  });
  assert.equal(trackForRoute('/world-map'), 'forest'); assert.deepEqual(getAchievements(progress), getAchievements(before));
  for (const w of worlds.slice(0, 4)) assert.equal(isWorldCleared(progress, w.id), true);
});

test('1280/1310/1340-XP saves restore without migration; old save prefixes and all 106 note links remain valid', async () => {
  for (let n = 0; n <= before.completedMissionIds.length; n++) {
    const saved = { completedMissionIds: before.completedMissionIds.slice(0, n) };
    assert.deepEqual(parseSavedProgression(JSON.stringify({ version: 1, ...saved })).progression, saved);
    assert.equal(isWorldUnlocked(saved, functionForge.id), n === 26);
  }
  const sentinels = [['devquest.profile.v1', 'nickname-avatar-sentinel'], ['devquest.audio.v1', 'audio-sentinel'], ['devquest.onboarding.v1', 'onboarding-sentinel']];
  const data = new Map(sentinels), writes = [];
  const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); writes.push(k); } };
  let progress = before;
  for (let i = 0; i < 3; i++) {
    if (i) progress = play(progress, targets[i - 1], 30).progress;
    await createProgressionStore(storage).save(progress);
    const restored = (await createProgressionStore(storage).load()).progression;
    assert.deepEqual(restored, progress); assert.equal(getTotalEarnedXp(restored), 1280 + i * 30);
    if (i) assert.equal(play(restored, targets[i - 1], 0).progress, restored);
    for (const [key, value] of sentinels) assert.equal(data.get(key), value);
  }
  assert.deepEqual(new Set(writes), new Set(['devquest.progression']));
  let notes = {};
  for (const e of exercises) { assert.ok(getLessonForExercise(e)); assert.ok(getSpellbookEntryForExercise(e.id)); notes = setExerciseNote(notes, e.id, `Remember ${e.id}`); }
  await createNotesStore(storage).save(notes); assert.deepEqual((await createNotesStore(storage).load()).notes, notes);
  assert.deepEqual(questions.map(e => getSpellbookEntryForExercise(e.id).id), ['python-functions', 'python-functions', 'python-functions', 'python-function-parameters', 'python-function-parameters', 'python-function-parameters']);
  const entries = spellbookEntries.filter(e => !Object.hasOwn(baseline.spellbook, e.id));
  assert.deepEqual(entries.map(e => [e.codeExample, e.expectedOutput]), [
    ['def greet():\n    print("Welcome!")\ngreet()\ngreet()', 'Welcome!\nWelcome!'],
    ['def display(symbol):\n    print(symbol)\ndisplay("Star")\ndisplay("Wave")', 'Star\nWave'],
  ]);
});

for (const e of builders) test(`${e.id}: one intended order, compact indentation and recoverable drafts`, () => {
  const expected = e.validation.expectedFragmentIds;
  const permutations = a => a.length ? a.flatMap((id, i) => permutations(a.filter((_, j) => i !== j)).map(rest => [id, ...rest])) : [[]];
  assert.equal(e.fragments.length, 3);
  assert.equal(permutations(expected).filter(ids => isExerciseAnswerCorrect(e, JSON.stringify(ids))).length, 1);
  assert.ok(e.fragments.every(f => f.code.length <= 22 && !f.code.includes('\n')));
  const lines = assembledCode(e, answerFor(e)).split('\n');
  assert.match(lines[0], /^def [a-z_]+\([a-z_]*\):$/);
  assert.match(lines[1], /^ {4}print\(/);
  assert.ok(!lines[2].startsWith(' '));
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