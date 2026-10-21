const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
const { worlds, chapters, missions, exercises, loopCaverns } = require('../src/game/worldContent.ts');
const { builderChapters, builderMissions, builderExercises } = require('../src/game/cavernBuilderContent.ts');
const { whileChapters, whileMissions } = require('../src/game/cavernWhileContent.ts');
const { isCodeBuilderExercise, readFragmentIds, editBuilderAnswer, assembledCode } = require('../src/game/codeBuilder.ts');
const { isChoiceExercise, isExerciseAnswerCorrect } = require('../src/game/exerciseValidation.ts');
const { getPlayableMission, startMissionAttempt, submitMissionAnswer, continueMissionAttempt } = require('../src/game/worldMission.ts');
const { getTotalEarnedXp, getWorldProgress, isMissionUnlocked } = require('../src/game/progression.ts');
const { getPlayerStatistics, getAchievements } = require('../src/game/profile.ts');
const { createProgressionStore, parseSavedProgression, PROGRESSION_STORAGE_KEY } = require('../src/game/progressionStorage.ts');
const { setExerciseNote, createNotesStore } = require('../src/game/notesStorage.ts');
const { lessons, getLessonForExercise } = require('../src/game/lessonContent.ts');
const { getVisibleLesson, initialLessonSession, lessonSessionReducer } = require('../src/game/lessonSession.ts');
const { spellbookEntries, exerciseSpellbookEntryIds, getSpellbookEntryForExercise } = require('../src/game/spellbookContent.ts');
const { getAccessibleMapChapters, worldMapForMission } = require('../src/navigation/worldRoutes.ts');
const { isWorldCleared, getBossHp } = require('../src/game/boss.ts');
const { hasUnfinishedMissionProgress } = require('../src/navigation/navigationActions.ts');
const baseline = require('./fixtures/code-builder-compatibility.json');
const before = { completedMissionIds: Object.keys(baseline.missions) };
const builders = builderExercises.filter(isCodeBuilderExercise);
const answerFor = e => isCodeBuilderExercise(e) ? JSON.stringify(e.validation.expectedFragmentIds) : e.validation.correctOptionId;
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('Stage 3H.2 preserves all 60 prior exercises, 14 missions, lessons, references, links and earlier worlds', () => {
  for (const [name, items] of Object.entries({ chapters, missions, exercises, lessons, spellbook: spellbookEntries })) {
    for (const [id, expected] of Object.entries(baseline[name])) assert.equal(hash(items.find(v => v.id === id)), expected, id);
    assert.deepEqual(items.filter(v => Object.hasOwn(baseline[name], v.id)).map(v => v.id), Object.keys(baseline[name]));
  }
  for (const world of worlds.slice(0, 2)) assert.equal(hash(world), baseline.worlds[world.id]);
  assert.deepEqual(loopCaverns, { ...baseline.loopCaverns, chapterIds: [...baseline.loopCaverns.chapterIds, ...builderChapters.map(c => c.id), ...whileChapters.map(c => c.id)], xpReward: 220 });
  for (const [id, entry] of Object.entries(baseline.spellbookLinks)) assert.equal(exerciseSpellbookEntryIds[id], entry);
  assert.equal(Object.keys(baseline.exercises).length, 60);
  assert.equal(getTotalEarnedXp(before), 700);
});

test('Builder missions retain three spells and 40 XP within the expanded registry', () => {
  assert.deepEqual([worlds.length, chapters.length, missions.length, exercises.length, lessons.length, spellbookEntries.length], [3, 18, 18, 72, 37, 21]);
  assert.deepEqual([exercises.filter(isChoiceExercise).length, exercises.filter(isCodeBuilderExercise).length], [64, 6]);
  assert.equal(exercises.filter(e => !isChoiceExercise(e) && !isCodeBuilderExercise(e)).length, 2);
  assert.deepEqual(missions.filter(m => !Object.hasOwn(baseline.missions, m.id)), [...builderMissions, ...whileMissions]);
  assert.deepEqual(builderMissions.map(m => [m.title, m.exerciseIds.length, m.xpReward, m.encounter]), [['Echo Bridge', 3, 40, undefined], ['Counting Tower', 3, 40, undefined]]);
  assert.equal(missions.reduce((xp, m) => xp + m.xpReward, 0), 860);
  const ids = [...worlds, ...chapters, ...missions, ...exercises, ...lessons, ...spellbookEntries,
    ...exercises.filter(isChoiceExercise).flatMap(e => e.options), ...builders.flatMap(e => e.fragments)].map(v => v.id);
  assert.equal(new Set(ids).size, ids.length);
});

for (const exercise of builders) {
  test(`${exercise.id}: only authored IDs in the exact sequence validate; malformed and forged answers fail`, () => {
    const expected = exercise.validation.expectedFragmentIds;
    assert.equal(isExerciseAnswerCorrect(exercise, JSON.stringify(expected)), true);
    const bad = [[], [...expected].reverse(), expected.slice(1), [...expected, expected[0]],
      expected.map(() => expected[0]), [builders.find(e => e !== exercise).fragments[0].id, ...expected.slice(1)],
      ['unknown', ...expected.slice(1)], [...expected, 'extra'], expected.map(id => id.toUpperCase()),
      expected.map(id => ` ${id}`), expected.map(id => exercise.fragments.find(f => f.id === id).code),
      { correct: true, fragmentIds: expected }, null, true, 7, 'success'];
    for (const value of bad) assert.equal(isExerciseAnswerCorrect(exercise, JSON.stringify(value)), false, JSON.stringify(value));
    for (const value of ['', '[] trailing', '{', 'correct', assembledCode(exercise, JSON.stringify(expected))]) assert.equal(isExerciseAnswerCorrect(exercise, value), false);
    const changedPresentation = { ...exercise, fragments: [...exercise.fragments].reverse().map(f => ({ ...f, code: 'different display' })) };
    assert.equal(isExerciseAnswerCorrect(changedPresentation, JSON.stringify(expected)), true);
    const extraBank = { ...exercise, fragments: [...exercise.fragments, { id: 'unused-authored-fragment', code: 'print("Extra")' }] };
    assert.equal(isExerciseAnswerCorrect(extraBank, JSON.stringify(expected)), true);
    assert.equal(isExerciseAnswerCorrect(extraBank, JSON.stringify([...expected, 'unused-authored-fragment'])), false);
    assert.notDeepEqual(exercise.fragments.map(f => f.id), expected, 'authored bank starts shuffled');
    // Enumerate every possible authored ordering: exactly one intended arrangement.
    const permutations = values => values.length ? values.flatMap((v, i) => permutations(values.filter((_, j) => i !== j)).map(rest => [v, ...rest])) : [[]];
    assert.equal(permutations(exercise.fragments.map(f => f.id)).filter(ids => isExerciseAnswerCorrect(exercise, JSON.stringify(ids))).length, 1);
  });
}

test('Builder editing preserves indentation, prevents repeat taps, supports Undo/Reset and rejects foreign edits', () => {
  for (const e of builders) {
    let answer = '';
    assert.deepEqual(readFragmentIds(e, answer), []);
    assert.equal(editBuilderAnswer(e, answer, { type: 'undo' }), '');
    assert.equal(editBuilderAnswer(e, answer, { type: 'add', id: 'foreign' }), '');
    for (const id of e.validation.expectedFragmentIds) {
      answer = editBuilderAnswer(e, answer, { type: 'add', id });
      assert.equal(editBuilderAnswer(e, answer, { type: 'add', id }), answer);
    }
    assert.equal(isExerciseAnswerCorrect(e, answer), true);
    assert.ok(assembledCode(e, answer).includes('\n    print('));
    assert.deepEqual(readFragmentIds(e, editBuilderAnswer(e, answer, { type: 'undo' })), e.validation.expectedFragmentIds.slice(0, -1));
    assert.equal(editBuilderAnswer(e, answer, { type: 'reset' }), '');
    assert.equal(editBuilderAnswer(e, '{', { type: 'undo' }), '{');
    assert.equal(editBuilderAnswer(e, '{', { type: 'reset' }), '');
    assert.ok(e.fragments.every(f => f.code.length <= 22 && !f.code.includes('\n')), 'compact single-line fragments');
  }
});

// Independent authored review of exact valid Python and output; no Python is executed.
test('Authored loop programs, indentation and excluded range boundaries have the reviewed outputs', () => {
  const expectedPrograms = [
    ['for step in range(2):\n    print("Step")', 'Step\nStep'],
    ['print("Ready")\nfor step in range(3):\n    print("Cross")\nprint("Done")', 'Ready\nCross\nCross\nCross\nDone'],
    ['for n in range(5, 8):\n    print(n)', '5\n6\n7'],
    ['for n in range(6, 8):\n    print(n)\nprint("Top")', '6\n7\nTop'],
  ];
  assert.deepEqual(builders.map(e => [assembledCode(e, answerFor(e)), e.expectedOutput]), expectedPrograms);
  assert.deepEqual(builderExercises.filter(isChoiceExercise).map(e => [e.code, e.options.find(o => o.id === e.validation.correctOptionId).label]), [
    ['for bell in range(2):\n    print("Bell")\nprint("Safe")', 'Bell\nBell\nSafe'],
    ['for n in range(4, 7):\n    print(n)', '4\n5\n6'],
  ]);
  assert.equal(Array.from({ length: 8 - 5 }, (_, i) => 5 + i).join('\n'), builders[2].expectedOutput);
  assert.equal(Array.from({ length: 8 - 6 }, (_, i) => 6 + i).join('\n') + '\nTop', builders[3].expectedOutput);
  for (const e of builderExercises.filter(isChoiceExercise)) {
    assert.equal(e.options.filter(o => isExerciseAnswerCorrect(e, o.id)).length, 1);
    for (const o of e.options) assert.ok(o.feedback.length > 30);
  }
});

test('Lessons introduce building/order and counting before assessment, with different examples and no repeated mandatory cards', () => {
  const expectedLessons = [
    ['print("Start")\nfor glow in range(4):\n    print("Glow")\nprint("Open")', 'Start\nGlow\nGlow\nGlow\nGlow\nOpen'],
    ['for n in range(2, 4):\n    print(n)\nprint("Lit")', '2\n3\nLit'],
  ];
  builderMissions.forEach((mission, i) => {
    let session = initialLessonSession;
    mission.exerciseIds.forEach((id, index) => {
      const e = exercises.find(v => v.id === id), lesson = getLessonForExercise(e);
      assert.deepEqual([lesson.codeExample, lesson.expectedOutput], expectedLessons[i]);
      assert.equal(!!getVisibleLesson(e, 'answering', false, session), index === 0);
      assert.equal(getVisibleLesson(e, 'answering', true, initialLessonSession), null);
      session = lessonSessionReducer(session, { type: 'continue', lessonId: lesson.id });
      assert.equal(getVisibleLesson(e, 'answering', false, session), null);
      assert.notEqual(lesson.codeExample, isCodeBuilderExercise(e) ? assembledCode(e, answerFor(e)) : e.code);
      assert.notEqual(lesson.expectedOutput, isCodeBuilderExercise(e) ? e.expectedOutput : e.options.find(o => o.id === answerFor(e)).label);
      assert.equal(getVisibleLesson(e, 'answering', false, lessonSessionReducer(session, { type: 'review' })).lesson, lesson);
    });
  });
});

test('Lanterns gates Echo Bridge; Echo gates Counting Tower; locked deep links and fabricated attempt jumps fail', () => {
  assert.deepEqual(builderChapters.map(c => c.prerequisiteMissionIds), [['python-caverns-lanterns-of-range-01'], [builderMissions[0].id]]);
  const locked = { completedMissionIds: before.completedMissionIds.slice(0, -1) };
  for (const mission of builderMissions) {
    assert.equal(getPlayableMission(locked, mission.id), null);
    assert.equal(startMissionAttempt(locked, mission.id), null);
    const forged = { missionId: mission.id, exerciseIndex: 2, solvedExerciseIds: [], phase: 'answering', result: null };
    assert.equal(submitMissionAnswer(locked, forged, answerFor(exercises.find(e => e.id === mission.exerciseIds[2]))).status, 'unavailable');
  }
  assert.equal(isMissionUnlocked(before, builderMissions[0].id), true);
  assert.equal(isMissionUnlocked(before, builderMissions[1].id), false);
  const start = startMissionAttempt(before, builderMissions[0].id);
  const forged = { ...start, exerciseIndex: 2 };
  assert.equal(submitMissionAnswer(before, forged, answerFor(builders[1])).status, 'unavailable');
  assert.deepEqual(getAccessibleMapChapters({ completedMissionIds: [] }, loopCaverns.id), []);
});

function play(progress, mission, reward) {
  let attempt = startMissionAttempt(progress, mission.id);
  for (const [index, id] of mission.exerciseIds.entries()) {
    const e = exercises.find(v => v.id === id);
    const answer = answerFor(e);
    const wrong = submitMissionAnswer(progress, attempt, isCodeBuilderExercise(e) ? JSON.stringify([...e.validation.expectedFragmentIds].reverse()) : 'foreign');
    assert.equal(wrong.status, 'incorrect'); assert.equal(wrong.attempt, attempt); assert.equal(wrong.progress, progress); assert.equal(wrong.xpAwarded, 0);
    const right = submitMissionAnswer(progress, attempt, answer);
    assert.equal(right.status, 'correct'); assert.equal(right.attempt.phase, 'solved');
    assert.equal(right.xpAwarded, index === 2 ? reward : 0);
    assert.equal(getBossHp(right.attempt), null);
    if (index < 2) { assert.equal(right.progress, progress); assert.equal(right.attempt.result, null); }
    for (let tap = 0; tap < 4; tap++) {
      const repeated = submitMissionAnswer(right.progress, right.attempt, answer);
      assert.equal(repeated.status, 'ignored'); assert.equal(repeated.xpAwarded, 0); assert.equal(repeated.attempt, right.attempt);
    }
    progress = right.progress;
    attempt = continueMissionAttempt(right.attempt, 3);
    assert.equal(attempt.phase, index === 2 ? 'complete' : 'answering');
    assert.equal(continueMissionAttempt(attempt, 3), attempt, 'double Continue does not skip');
  }
  return { progress, attempt };
}

test('Builder missions pay 40 XP only after three spells, replay for zero, and reach four completed chapters without clearing World 3', () => {
  let progress = before;
  assert.deepEqual(getWorldProgress(progress, loopCaverns.id), { completed: 2, total: 6, percent: 33 });
  builderMissions.forEach((mission, i) => {
    const won = play(progress, mission, 40);
    progress = won.progress;
    assert.equal(getTotalEarnedXp(progress), 740 + 40 * i);
    assert.deepEqual(won.attempt.result.newlyUnlockedChapterIds, i === 0 ? [builderChapters[1].id] : ['python-caverns-endless-echo']);
    assert.deepEqual(getWorldProgress(progress, loopCaverns.id), { completed: 3 + i, total: 6, percent: i === 0 ? 50 : 67 });
    assert.equal(isWorldCleared(progress, loopCaverns.id), false);
    const replayStart = startMissionAttempt(progress, mission.id);
    assert.deepEqual([replayStart.exerciseIndex, replayStart.solvedExerciseIds, replayStart.result], [0, [], null]);
    assert.equal(play(progress, mission, 0).progress, progress);
    assert.deepEqual(worldMapForMission(mission.id), { pathname: '/world-map', params: { worldId: loopCaverns.id } });
  });
  const stats = getPlayerStatistics(progress);
  assert.deepEqual([stats.totalXp, stats.completedMissions, stats.completedExercises, stats.defeatedBosses], [780, 16, 66, 2]);
  assert.deepEqual(getAchievements(progress), getAchievements(before));
});

test('Version-1 saves retain 700 XP and old data; new completion/replay reloads at 740/780 with stable notes', async () => {
  let progress = before;
  const profile = JSON.stringify({ version: 1, nickname: 'Echo Mage', avatarId: 'wizard' });
  const data = new Map([['devquest.profile.v1', profile], ['devquest.audio.v1', 'audio-sentinel'], ['devquest.onboarding.v1', 'onboarding-sentinel']]);
  const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
  for (let step = 0; step < 3; step++) {
    if (step) progress = play(progress, builderMissions[step - 1], 40).progress;
    const raw = JSON.stringify({ version: 1, completedMissionIds: progress.completedMissionIds });
    assert.deepEqual(parseSavedProgression(raw).progression, progress);
    await createProgressionStore(storage).save(progress);
    assert.equal(data.get(PROGRESSION_STORAGE_KEY), raw);
    const restored = (await createProgressionStore(storage).load()).progression;
    assert.equal(getTotalEarnedXp(restored), 700 + step * 40);
    if (step) assert.equal(play(restored, builderMissions[step - 1], 0).progress, restored);
    assert.equal(data.get('devquest.profile.v1'), profile);
    assert.equal(data.get('devquest.audio.v1'), 'audio-sentinel');
    assert.equal(data.get('devquest.onboarding.v1'), 'onboarding-sentinel');
  }
  let notes = {};
  for (const e of exercises) {
    assert.ok(getLessonForExercise(e)); assert.ok(getSpellbookEntryForExercise(e.id));
    notes = setExerciseNote(notes, e.id, `Note for ${e.id}`);
  }
  await createNotesStore(storage).save(notes);
  assert.deepEqual((await createNotesStore(storage).load()).notes, notes);
});

test('Lesson and reference operations preserve the parent-owned builder answer and unfinished-attempt guard', () => {
  const e = builders[0];
  const attempt = { ...startMissionAttempt(before, builderMissions[0].id), exerciseIndex: 1, solvedExerciseIds: [builderMissions[0].exerciseIds[0]] };
  const answer = editBuilderAnswer(e, '', { type: 'add', id: e.fragments[0].id });
  const parentState = { attempt, answer };
  const snapshot = structuredClone(parentState);
  let lesson = lessonSessionReducer(initialLessonSession, { type: 'continue', lessonId: e.lessonId });
  lesson = lessonSessionReducer(lesson, { type: 'review' });
  assert.ok(getVisibleLesson(e, 'answering', false, lesson));
  lesson = lessonSessionReducer(lesson, { type: 'close' });
  assert.equal(getVisibleLesson(e, 'answering', false, lesson), null);
  assert.ok(getSpellbookEntryForExercise(e.id));
  assert.deepEqual(parentState, snapshot);
  assert.equal(hasUnfinishedMissionProgress(attempt, answer), true);
});
