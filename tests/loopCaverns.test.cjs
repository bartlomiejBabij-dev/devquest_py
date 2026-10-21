const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
const { worlds, chapters, missions, exercises, loopCaverns, valleyOfDecisions, forestOfVariables } = require('../src/game/worldContent.ts');
const { cavernChapters, cavernMissions, cavernExercises } = require('../src/game/cavernContent.ts');
const foundationMissions = cavernMissions.slice(0, 2);
const foundationExercises = cavernExercises.slice(0, 6);
const { lessons, getLessonForExercise } = require('../src/game/lessonContent.ts');
const { initialLessonSession, getVisibleLesson, lessonSessionReducer } = require('../src/game/lessonSession.ts');
const { isChoiceExercise, isExerciseAnswerCorrect, getIncorrectAnswerFeedback } = require('../src/game/exerciseValidation.ts');
const { getPlayableMission, startMissionAttempt, submitMissionAnswer, continueMissionAttempt } = require('../src/game/worldMission.ts');
const { getTotalEarnedXp, getWorldProgress, isMissionUnlocked, isWorldUnlocked, completeMission } = require('../src/game/progression.ts');
const { getPlayerStatistics, getAchievements } = require('../src/game/profile.ts');
const { parseSavedProfile } = require('../src/game/profileStorage.ts');
const { parseSavedProgression, createProgressionStore, PROGRESSION_STORAGE_KEY } = require('../src/game/progressionStorage.ts');
const { spellbookEntries, exerciseSpellbookEntryIds, getSpellbookEntryForExercise } = require('../src/game/spellbookContent.ts');
const { setExerciseNote, createNotesStore } = require('../src/game/notesStorage.ts');
const { getAccessibleMapChapters, resolveMapWorld, worldMapForMission } = require('../src/navigation/worldRoutes.ts');
const { trackForRoute } = require('../src/game/audioController.ts');
const { isBossMission, isWorldCleared, getBossHp } = require('../src/game/boss.ts');
const { archipelagoMissions } = require('../src/game/archipelagoContent.ts');
const baseline = require('./fixtures/loop-caverns-compatibility.json');
const oldComplete = { completedMissionIds: Object.keys(baseline.missions) };
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('Loop Caverns preserves every prior world, chapter, mission, exercise, lesson and reference exactly', () => {
  for (const [name, items] of Object.entries({ worlds, chapters, missions, exercises, lessons, spellbook: spellbookEntries })) {
    for (const [id, expected] of Object.entries(baseline[name])) assert.equal(hash(items.find(v => v.id === id)), expected, id);
    assert.deepEqual(items.filter(v => Object.hasOwn(baseline[name], v.id)).map(v => v.id), Object.keys(baseline[name]));
  }
  for (const [id, entry] of Object.entries(baseline.spellbookLinks)) assert.equal(exerciseSpellbookEntryIds[id], entry);
  assert.deepEqual([Object.keys(baseline.exercises).length, Object.keys(baseline.missions).length], [54, 12]);
  assert.equal(getTotalEarnedXp(oldComplete), 640);
});

test('The foundation retains its two three-tap missions within the expanded registry', () => {
  assert.deepEqual([worlds.length, chapters.length, missions.length, exercises.length, lessons.length, spellbookEntries.length], [4, 23, 23, 89, 46, 25]);
  assert.equal(exercises.filter(isChoiceExercise).length, 75);
  assert.equal(exercises.filter(e => !isChoiceExercise(e) && e.type !== 'code-builder').length, 2);
  assert.deepEqual(missions.filter(m => !Object.hasOwn(baseline.missions, m.id)), [...cavernMissions, ...archipelagoMissions]);
  assert.deepEqual(foundationMissions.map(m => [m.title, m.exerciseIds.length, m.xpReward]), [['The Repeating Road', 3, 30], ['Lanterns of Range', 3, 30]]);
  assert.equal(foundationExercises.length, 6);
  assert.equal(cavernExercises.length, 23);
  assert.ok(foundationExercises.every(isChoiceExercise));
  assert.ok(cavernMissions.slice(0, 6).every(m => !isBossMission(m.id)));
  assert.ok(isBossMission(cavernMissions[6].id));
  const ids = [...worlds, ...chapters, ...missions, ...exercises, ...lessons, ...spellbookEntries, ...exercises.filter(isChoiceExercise).flatMap(e => e.options)].map(v => v.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(missions.reduce((sum, m) => sum + m.xpReward, 0), 1100);
  assert.equal(loopCaverns.xpReward, 320);
  assert.deepEqual(loopCaverns.chapterIds, cavernChapters.map(c => c.id));
});

test('All six Valley missions including Keeper gate World 3; locked map and mission deep links cannot enter', () => {
  const valleyIds = missions.filter(m => valleyOfDecisions.chapterIds.includes(m.chapterId)).map(m => m.id);
  assert.deepEqual(loopCaverns.prerequisiteMissionIds, valleyIds);
  assert.ok(valleyIds.includes('python-valley-decision-keeper-01'));
  assert.equal(isWorldUnlocked(oldComplete, loopCaverns.id), true);
  for (const missing of valleyIds) {
    const progress = { completedMissionIds: oldComplete.completedMissionIds.filter(id => id !== missing) };
    assert.equal(isWorldUnlocked(progress, loopCaverns.id), false);
    assert.deepEqual(getAccessibleMapChapters(progress, loopCaverns.id), []);
    for (const mission of cavernMissions) {
      assert.equal(getPlayableMission(progress, mission.id), null);
      assert.equal(startMissionAttempt(progress, mission.id), null);
      assert.equal(completeMission(progress, mission.id).xpAwarded, 0);
      const forged = { missionId: mission.id, exerciseIndex: 0, solvedExerciseIds: [], phase: 'answering', result: null };
      assert.equal(submitMissionAnswer(progress, forged, cavernExercises[0].validation.correctOptionId).status, 'unavailable');
    }
  }
  assert.deepEqual(getAccessibleMapChapters(oldComplete, loopCaverns.id), cavernChapters);
  assert.equal(isMissionUnlocked(oldComplete, cavernMissions[0].id), true);
  assert.equal(isMissionUnlocked(oldComplete, cavernMissions[1].id), false);
  assert.equal(startMissionAttempt(oldComplete, cavernMissions[1].id), null);
  assert.deepEqual(cavernChapters[1].prerequisiteMissionIds, [cavernMissions[0].id]);
  assert.deepEqual(getAccessibleMapChapters(oldComplete, 'missing'), []);
});

// Independent authored review: no player or Python source is executed.
const reviewed = [
  ['for pulse in range(2):\n    print("Echo")', 'b', 'Echo\nEcho'],
  ['____ turn in range(4):\n    print("Lift")', 'c', 'for'],
  ['for beat in range(3):\n    print("Ping")\nprint("Ready")', 'a', 'Ping\nPing\nPing\nReady'],
  ['for spark in range(4):\n    print(spark)', 'c', '0\n1\n2\n3'],
  ['for lamp in range(____):\n    print(lamp)', 'a', '5'],
  ['for lamp in range(2, 5):\n    print(lamp)', 'b', '2\n3\n4'],
];

test('Reviewed Python questions accept exactly one stable option ID and reject wrong, foreign and display-label answers', () => {
  foundationExercises.forEach((e, index) => {
    const [code, letter, label] = reviewed[index];
    assert.equal(e.code, code);
    assert.equal(e.validation.correctOptionId, `${e.id}-${letter}`);
    assert.equal(e.options.find(o => o.id === e.validation.correctOptionId).label, label);
    assert.equal(e.options.filter(o => isExerciseAnswerCorrect(e, o.id)).length, 1);
    assert.equal(new Set(e.options.map(o => o.label)).size, e.options.length);
    for (const o of e.options) {
      assert.equal(isExerciseAnswerCorrect(e, o.id), o.id === e.validation.correctOptionId);
      assert.equal(isExerciseAnswerCorrect(e, o.label), false);
      assert.ok(o.feedback.length > 30);
      if (o.id !== e.validation.correctOptionId) assert.equal(getIncorrectAnswerFeedback(e, o.id), o.feedback);
    }
    for (const invalid of ['', 'unknown', 'toString', ` ${e.validation.correctOptionId}`, ...foundationExercises.filter(v => v !== e).map(v => v.validation.correctOptionId)]) assert.equal(isExerciseAnswerCorrect(e, invalid), false);
    assert.ok(e.code.split('\n').every(line => line.length <= 25), 'compact source for small screens');
  });
  const repeat = (word, count) => Array(count).fill(word).join('\n');
  const range = (start, stop) => Array.from({ length: stop - start }, (_, i) => start + i).join('\n');
  assert.equal(repeat('Echo', 2), reviewed[0][2]);
  assert.equal(repeat('Ping', 3) + '\nReady', reviewed[2][2]);
  assert.equal(range(0, 4), reviewed[3][2]);
  assert.equal(range(0, 5), '0\n1\n2\n3\n4');
  assert.equal(range(2, 5), reviewed[5][2]);
});

test('Four concise lessons precede unfamiliar concepts, use different examples, and review/replay preserves the attempt', () => {
  const lessonIds = ['python-lesson-loop-repeat', 'python-lesson-loop-body', 'python-lesson-range-zero', 'python-lesson-range-bounds'];
  const expected = [
    ['for step in range(3):\n    print("Walk")', 'Walk\nWalk\nWalk'],
    ['for flash in range(2):\n    print("Glow")\nprint("Done")', 'Glow\nGlow\nDone'],
    ['for number in range(3):\n    print(number)', '0\n1\n2'],
    ['for number in range(1, 4):\n    print(number)', '1\n2\n3'],
  ];
  lessonIds.forEach((id, i) => {
    const lesson = lessons.find(l => l.id === id);
    assert.deepEqual([lesson.codeExample, lesson.expectedOutput], expected[i]);
    assert.ok([lesson.explanation, lesson.whyItWorks, lesson.importantRule].join(' ').split(/\s+/).length < 125);
  });
  foundationMissions.forEach(mission => {
    let session = initialLessonSession;
    const targets = mission.exerciseIds.map(id => exercises.find(e => e.id === id));
    targets.forEach((e, i) => {
      const lesson = getLessonForExercise(e);
      assert.equal(lesson.id, lessonIds[(mission === cavernMissions[0] ? 0 : 2) + (i === 2 ? 1 : 0)]);
      assert.equal(!!getVisibleLesson(e, 'answering', false, session), i !== 1);
      assert.ok(!cavernExercises.some(item => item.code === lesson.codeExample));
      session = lessonSessionReducer(session, { type: 'continue', lessonId: lesson.id });
      assert.equal(getVisibleLesson(e, 'answering', false, session), null);
      assert.equal(getVisibleLesson(e, 'answering', true, initialLessonSession), null);
      const snapshot = structuredClone(session);
      assert.equal(getVisibleLesson(e, 'solved', false, lessonSessionReducer(session, { type: 'review' })).lesson, lesson);
      assert.deepEqual(lessonSessionReducer(lessonSessionReducer(session, { type: 'review' }), { type: 'close' }), snapshot);
    });
  });
});

function play(progress, mission, expectedReward) {
  let attempt = startMissionAttempt(progress, mission.id);
  const targets = getPlayableMission(progress, mission.id).exercises;
  for (const [index, e] of targets.entries()) {
    const wrong = submitMissionAnswer(progress, attempt, e.options.find(o => o.id !== e.validation.correctOptionId).id);
    assert.equal(wrong.status, 'incorrect');
    assert.equal(wrong.attempt, attempt); assert.equal(wrong.progress, progress); assert.equal(wrong.xpAwarded, 0);
    const right = submitMissionAnswer(progress, attempt, e.validation.correctOptionId);
    assert.equal(right.status, 'correct'); assert.equal(right.attempt.phase, 'solved');
    assert.equal(right.xpAwarded, index === 2 ? expectedReward : 0);
    if (index < 2) { assert.equal(right.progress, progress); assert.equal(right.attempt.result, null); }
    assert.equal(getBossHp(right.attempt), null);
    for (let tap = 0; tap < 5; tap++) {
      const duplicate = submitMissionAnswer(right.progress, right.attempt, e.validation.correctOptionId);
      assert.equal(duplicate.status, 'ignored'); assert.equal(duplicate.xpAwarded, 0);
      assert.equal(duplicate.attempt, right.attempt); assert.equal(duplicate.progress, right.progress);
    }
    progress = right.progress;
    attempt = continueMissionAttempt(right.attempt, targets.length);
    assert.equal(attempt.phase, index === 2 ? 'complete' : 'answering');
  }
  assert.equal(attempt.result.xpAwarded, expectedReward);
  return { progress, attempt };
}

test('Each three-spell mission pays 30 XP only after its last answer; replay pays zero and World 3 has no final clear', () => {
  const road = play(oldComplete, cavernMissions[0], 30);
  assert.deepEqual(road.attempt.result.newlyUnlockedChapterIds, [cavernChapters[1].id]);
  assert.equal(getTotalEarnedXp(road.progress), 670);
  assert.deepEqual(getWorldProgress(road.progress, loopCaverns.id), { completed: 1, total: 7, percent: 14 });
  assert.equal(play(road.progress, cavernMissions[0], 0).progress, road.progress);
  const lanterns = play(road.progress, cavernMissions[1], 30);
  assert.equal(getTotalEarnedXp(lanterns.progress), 700);
  assert.deepEqual(lanterns.attempt.result.newlyUnlockedChapterIds, ['python-caverns-echo-bridge']);
  assert.equal(play(lanterns.progress, cavernMissions[1], 0).progress, lanterns.progress);
  assert.deepEqual(getWorldProgress(lanterns.progress, loopCaverns.id), { completed: 2, total: 7, percent: 29 });
  assert.equal(isWorldCleared(lanterns.progress, loopCaverns.id), false);
  for (const world of [forestOfVariables, valleyOfDecisions]) {
    assert.equal(isWorldCleared(lanterns.progress, world.id), true);
    assert.deepEqual(getWorldProgress(lanterns.progress, world.id), { completed: 6, total: 6, percent: 100 });
  }
});

test('Every old save keeps XP and profile data; new saves retain 670/700 XP and stable notes without migrations', async () => {
  const xp = [0, 20, 50, 90, 140, 200, 300, 370, 450, 480, 510, 540, 640, 670, 700, 740, 780, 820, 860, 960, 990, 1020, 1060, 1100];
  const counts = [0, 5, 10, 15, 20, 25, 30, 35, 40, 43, 46, 49, 54, 57, 60, 63, 66, 69, 72, 77, 80, 83, 86, 89];
  const profile = JSON.stringify({ version: 1, nickname: 'Crystal Mage', avatarId: 'wizard' });
  assert.equal(parseSavedProfile(profile).profile.nickname, 'Crystal Mage');
  for (let n = 0; n <= missions.length; n++) {
    const raw = JSON.stringify({ version: 1, completedMissionIds: missions.slice(0, n).map(m => m.id) });
    const loaded = parseSavedProgression(raw);
    assert.equal(loaded.status, 'ready');
    const stats = getPlayerStatistics(loaded.progression);
    assert.deepEqual([stats.totalXp, stats.completedExercises, stats.completedMissions, stats.defeatedBosses], [xp[n], counts[n], n, n >= 19 ? 3 : n >= 12 ? 2 : n >= 6 ? 1 : 0]);
    assert.equal(isWorldUnlocked(loaded.progression, loopCaverns.id), n >= 12);
    if (n >= 13) {
      assert.equal(stats.currentWorld, n >= 20 ? 'List Archipelago' : 'Loop Caverns');
      assert.deepEqual(getAchievements(loaded.progression), getAchievements(oldComplete));
    }
    const data = new Map([[PROGRESSION_STORAGE_KEY, raw], ['devquest.profile.v1', profile], ['devquest.audio.v1', 'audio-sentinel']]);
    const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
    await createProgressionStore(storage).save(loaded.progression);
    assert.deepEqual(await createProgressionStore(storage).load(), loaded);
    assert.equal(data.get(PROGRESSION_STORAGE_KEY), raw);
    assert.equal(data.get('devquest.profile.v1'), profile);
    assert.equal(data.get('devquest.audio.v1'), 'audio-sentinel');
  }
  let notes = {};
  for (const e of exercises) {
    assert.ok(getSpellbookEntryForExercise(e.id)); assert.ok(getLessonForExercise(e));
    notes = setExerciseNote(notes, e.id, `Remember ${e.id}`);
  }
  const data = new Map();
  const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
  await createNotesStore(storage).save(notes);
  assert.deepEqual((await createNotesStore(storage).load()).notes, notes);
});

test('New references explain exact outputs and map/mission routes keep each world and existing audio policy', () => {
  const loop = spellbookEntries.find(e => e.id === 'python-for-loops');
  const range = spellbookEntries.find(e => e.id === 'python-range');
  assert.deepEqual([loop.codeExample, loop.expectedOutput], ['for bell in range(2):\n    print("Ring")', 'Ring\nRing']);
  assert.deepEqual([range.codeExample, range.expectedOutput], ['for rune in range(2):\n    print(rune)\nfor rune in range(5, 7):\n    print(rune)', '0\n1\n5\n6']);
  assert.deepEqual(foundationExercises.map(e => getSpellbookEntryForExercise(e.id).id), ['python-for-loops', 'python-for-loops', 'python-for-loops', 'python-range', 'python-range', 'python-range']);
  for (const m of missions) {
    const worldId = chapters.find(c => c.id === m.chapterId).worldId;
    assert.deepEqual(worldMapForMission(m.id), { pathname: '/world-map', params: { worldId } });
    assert.equal(trackForRoute(`/mission/${m.id}`), 'battle');
  }
  assert.equal(resolveMapWorld(loopCaverns.id), loopCaverns);
  assert.equal(resolveMapWorld('unknown'), forestOfVariables);
  assert.equal(trackForRoute('/world-map'), 'forest');
});
