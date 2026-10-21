const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
const { worlds, chapters, missions, exercises, forestOfVariables, valleyOfDecisions } = require('../src/game/worldContent.ts');
const { lessons, getLessonForExercise } = require('../src/game/lessonContent.ts');
const { getVisibleLesson, initialLessonSession, lessonSessionReducer } = require('../src/game/lessonSession.ts');
const { isChoiceExercise, isExerciseAnswerCorrect, getIncorrectAnswerFeedback } = require('../src/game/exerciseValidation.ts');
const { getPlayableMission, startMissionAttempt, submitMissionAnswer, continueMissionAttempt } = require('../src/game/worldMission.ts');
const { completeMission, getTotalEarnedXp, getWorldProgress, isMissionUnlocked } = require('../src/game/progression.ts');
const { getPlayerStatistics, getAchievements } = require('../src/game/profile.ts');
const { parseSavedProgression, createProgressionStore, PROGRESSION_STORAGE_KEY } = require('../src/game/progressionStorage.ts');
const { createNotesStore, setExerciseNote, NOTES_STORAGE_KEY } = require('../src/game/notesStorage.ts');
const { spellbookEntries, exerciseSpellbookEntryIds, getSpellbookEntryForExercise } = require('../src/game/spellbookContent.ts');
const { goblinKingMissionId, getGoblinKingHp } = require('../src/game/boss.ts');
const { worldMapForMission } = require('../src/navigation/worldRoutes.ts');
const { trackForRoute } = require('../src/game/audioController.ts');
const baseline = require('./fixtures/mirror-compatibility.json');
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const id = 'python-valley-mirror-of-truth-01';
const chapterId = 'python-valley-mirror-of-truth';
const mission = missions.find(m => m.id === id);
const targets = mission.exerciseIds.map(id => exercises.find(e => e.id === id));
const before = { completedMissionIds: Object.keys(baseline.missions) };

test('Mirror only appends content: ten prior missions, 46 exercises, 24 lessons, 17 references and old links retain exact data and order', () => {
  for (const [name, items] of Object.entries({ chapters, missions, exercises, lessons, spellbook: spellbookEntries })) {
    for (const [id, expected] of Object.entries(baseline[name])) assert.equal(hash(items.find(v => v.id === id)), expected, id);
    assert.deepEqual(items.filter(v => Object.hasOwn(baseline[name], v.id)).map(v => v.id), Object.keys(baseline[name]));
  }
  for (const [id, entry] of Object.entries(baseline.spellbookLinks)) assert.equal(exerciseSpellbookEntryIds[id], entry);
  assert.deepEqual(forestOfVariables, baseline.worlds[0]);
  assert.deepEqual(valleyOfDecisions, { ...baseline.worlds[1], chapterIds: [...baseline.worlds[1].chapterIds, chapterId, 'python-valley-decision-keeper'], xpReward: 340 });
});

test('Registry adds exactly one three-tap mission with unique IDs, 30 XP and accurate totals', () => {
  assert.deepEqual([worlds.length, chapters.length, missions.length, exercises.length, lessons.length, spellbookEntries.length], [3, 18, 18, 72, 37, 21]);
  assert.equal(exercises.filter(isChoiceExercise).length, 64);
  assert.equal(exercises.filter(e => !isChoiceExercise(e) && e.type !== 'code-builder').length, 2);
  assert.deepEqual(missions.filter(m => !Object.hasOwn(baseline.missions, m.id)).map(m => m.id), [id, 'python-valley-decision-keeper-01', 'python-caverns-repeating-road-01', 'python-caverns-lanterns-of-range-01', 'python-caverns-echo-bridge-01', 'python-caverns-counting-tower-01', 'python-caverns-endless-echo-01', 'python-caverns-stopping-crystal-01']);
  assert.equal(mission.title, 'Mirror of Truth');
  assert.equal(mission.xpReward, 30);
  assert.equal(mission.chapterId, chapterId);
  assert.deepEqual(targets.map(e => e.id), ['python-valley-mirror-reversal', 'python-valley-mirror-keyword', 'python-valley-mirror-passage']);
  assert.deepEqual(targets.map(e => e.type), ['output-choice', 'missing-token', 'output-choice']);
  assert.ok(targets.every(e => isChoiceExercise(e) && e.chapterId === chapterId));
  const allIds = [...worlds, ...chapters, ...missions, ...exercises, ...lessons, ...spellbookEntries, ...exercises.filter(isChoiceExercise).flatMap(e => e.options)].map(v => v.id);
  assert.equal(new Set(allIds).size, allIds.length);
  assert.equal(missions.reduce((sum, m) => sum + m.xpReward, 0), 860);
  assert.equal(missions.filter(m => valleyOfDecisions.chapterIds.includes(m.chapterId)).reduce((sum, m) => sum + m.xpReward, 0), valleyOfDecisions.xpReward);
});

// Independent authored-answer review, not a snapshot generated from the new data.
const reviewed = [
  ['ward_active = True\nprint(not ward_active)', 'b', 'False', ['True', 'not True']],
  ['has_shield = False\nif ____ has_shield:\n    print("Raise shield")\nelse:\n    print("Ready")', 'a', 'not', ['and', 'or']],
  ['seal_intact = False\nif not seal_intact:\n    print("Mirror cleared!")\nelse:\n    print("Break the seal")', 'c', 'Mirror cleared!', ['Break the seal', 'Mirror cleared!\nBreak the seal']],
];
test('Reviewed Python code has one correct choice per question; wrong/foreign IDs, labels and transformed IDs fail', () => {
  targets.forEach((e, i) => {
    const [code, letter, label, wrong] = reviewed[i];
    assert.equal(e.code, code);
    assert.equal(e.validation.correctOptionId, `${e.id}-${letter}`);
    assert.equal(e.options.find(o => o.id === e.validation.correctOptionId).label, label);
    assert.deepEqual(e.options.filter(o => o.id !== e.validation.correctOptionId).map(o => o.label), wrong);
    assert.equal(e.options.filter(o => isExerciseAnswerCorrect(e, o.id)).length, 1);
    assert.equal(new Set(e.options.map(o => o.label)).size, e.options.length);
    for (const option of e.options) {
      assert.equal(isExerciseAnswerCorrect(e, option.id), option.id === e.validation.correctOptionId);
      assert.equal(isExerciseAnswerCorrect(e, option.label), false);
      assert.ok(option.feedback.length > 35);
      if (option.id !== e.validation.correctOptionId) assert.equal(getIncorrectAnswerFeedback(e, option.id), option.feedback);
    }
    for (const invalid of ['', 'not', 'toString', 'python-valley-twin-runes-or-a', ...targets.filter(t => t !== e).map(t => t.validation.correctOptionId), ` ${e.validation.correctOptionId}`, e.validation.correctOptionId.toUpperCase()]) assert.equal(isExerciseAnswerCorrect(e, invalid), false);
    assert.equal(isExerciseAnswerCorrect({ ...e, options: [...e.options].reverse() }, e.validation.correctOptionId), true);
    assert.ok(e.code.split('\n').every(line => line.length <= 32));
  });
  // Fixed Boolean truth-table/branch review; no Python or player input is executed.
  assert.deepEqual([true, false].map(v => !v), [false, true]);
  assert.equal(!false ? 'Raise shield' : 'Ready', 'Raise shield');
  assert.equal(!false ? 'Mirror cleared!' : 'Break the seal', 'Mirror cleared!');
  assert.match(targets[0].explanation, /not True becomes False/);
  assert.match(targets[2].explanation, /not False is True.*skips else/);
});

test('Two concise lessons teach each concept before practice, use different examples and do not repeat after every answer', () => {
  const reviewedLessons = [
    ['python-lesson-not-reversal', 'has_key = False\nprint(not has_key)', 'True'],
    ['python-lesson-not-condition', 'door_open = True\nif not door_open:\n    print("Unlock")\nelse:\n    print("Step inside")', 'Step inside'],
  ];
  for (const [id, code, output] of reviewedLessons) {
    const lesson = lessons.find(l => l.id === id);
    assert.equal(lesson.codeExample, code);
    assert.equal(lesson.expectedOutput, output);
    for (const field of ['title', 'explanation', 'whyItWorks', 'importantRule']) assert.ok(lesson[field].trim());
    assert.ok([lesson.explanation, lesson.whyItWorks, lesson.importantRule].join(' ').split(/\s+/).length <= 110);
  }
  assert.equal(String(!false), 'true');
  assert.equal(!true ? 'Unlock' : 'Step inside', 'Step inside');
  let session = initialLessonSession;
  const introductions = [];
  targets.forEach((e, index) => {
    assert.equal(e.lessonId, reviewedLessons[index === 0 ? 0 : 1][0]);
    const lesson = getLessonForExercise(e);
    assert.notEqual(lesson.codeExample, e.code);
    const view = getVisibleLesson(e, 'answering', false, session);
    if (view) {
      assert.equal(view.introduction, true);
      introductions.push(index);
      session = lessonSessionReducer(session, { type: 'continue', lessonId: lesson.id });
    }
    assert.equal(getVisibleLesson(e, 'answering', false, session), null);
    assert.equal(getVisibleLesson(e, 'solved', false, session), null);
    assert.equal(getVisibleLesson(e, 'answering', true, initialLessonSession), null, 'completed replays skip introductions');
    const review = lessonSessionReducer(session, { type: 'review' });
    assert.equal(getVisibleLesson(e, 'answering', true, review).lesson, lesson);
    assert.deepEqual(lessonSessionReducer(review, { type: 'close' }), session);
  });
  assert.deepEqual(introductions, [0, 1]);
  assert.equal(getTotalEarnedXp(before), 510);
});

test('Twin Runes is the prerequisite; locked entry, forged attempts and unsupported saved shortcuts fail', () => {
  const chapter = chapters.find(c => c.id === chapterId);
  assert.deepEqual(chapter.prerequisiteMissionIds, ['python-valley-twin-runes-01']);
  assert.deepEqual(chapter.missionIds, [id]);
  assert.equal(isMissionUnlocked(before, id), true);
  for (let count = 0; count < before.completedMissionIds.length; count++) {
    const locked = { completedMissionIds: before.completedMissionIds.slice(0, count) };
    assert.equal(isMissionUnlocked(locked, id), false);
    assert.equal(getPlayableMission(locked, id), null);
    assert.equal(startMissionAttempt(locked, id), null);
    assert.equal(submitMissionAnswer(locked, startMissionAttempt(before, id), targets[0].validation.correctOptionId).status, 'unavailable');
    assert.deepEqual(completeMission(locked, id), { progress: locked, xpAwarded: 0 });
  }
  assert.deepEqual(parseSavedProgression(JSON.stringify({ version: 1, completedMissionIds: [id] })).progression.completedMissionIds, []);
  assert.deepEqual(worldMapForMission(id), { pathname: '/world-map', params: { worldId: valleyOfDecisions.id } });
  assert.equal(trackForRoute(`/mission/${id}`), 'battle');
  assert.equal(trackForRoute('/world-map'), 'forest');
});

function play(progress, reward) {
  let attempt = startMissionAttempt(progress, id);
  targets.forEach((e, index) => {
    assert.equal(continueMissionAttempt(attempt, 3), attempt, 'cannot Continue before solving');
    for (const answer of [...e.options.filter(o => o.id !== e.validation.correctOptionId).map(o => o.id), 'foreign-id']) {
      const wrong = submitMissionAnswer(progress, attempt, answer);
      assert.equal(wrong.status, 'incorrect');
      assert.equal(wrong.attempt, attempt);
      assert.equal(wrong.progress, progress);
      assert.equal(wrong.xpAwarded, 0);
      assert.equal(wrong.attempt.solvedExerciseIds.length, index);
    }
    const correct = submitMissionAnswer(progress, attempt, e.validation.correctOptionId);
    assert.equal(correct.status, 'correct');
    assert.equal(correct.attempt.phase, 'solved');
    assert.equal(correct.attempt.solvedExerciseIds.length, index + 1);
    assert.equal(correct.xpAwarded, index === 2 ? reward : 0);
    if (index < 2) { assert.equal(correct.progress, progress); assert.equal(correct.attempt.result, null); }
    for (let tap = 0; tap < 5; tap++) {
      const duplicate = submitMissionAnswer(correct.progress, correct.attempt, e.validation.correctOptionId);
      assert.equal(duplicate.status, 'ignored');
      assert.equal(duplicate.attempt, correct.attempt);
      assert.equal(duplicate.progress, correct.progress);
      assert.equal(duplicate.xpAwarded, 0);
    }
    progress = correct.progress;
    attempt = continueMissionAttempt(correct.attempt, 3);
    assert.equal(attempt.phase, index === 2 ? 'complete' : 'answering');
    assert.equal(continueMissionAttempt(attempt, 3), attempt);
  });
  assert.equal(attempt.result.xpAwarded, reward);
  return { progress, attempt };
}

test('All three spells are required; wrong answers and duplicate taps do nothing; first completion pays 30 and replay zero', () => {
  const completed = play(before, 30);
  assert.equal(completed.attempt.result.totalXp, 540);
  assert.deepEqual(completed.progress.completedMissionIds, [...before.completedMissionIds, id]);
  assert.deepEqual(play(completed.progress, 0).progress, completed.progress);
  assert.deepEqual(getWorldProgress(before, valleyOfDecisions.id), { completed: 4, total: 6, percent: 67 });
  assert.deepEqual(getWorldProgress(completed.progress, valleyOfDecisions.id), { completed: 5, total: 6, percent: 83 });
  assert.equal(getPlayerStatistics(before).completedExercises, 46);
  const stats = getPlayerStatistics(completed.progress);
  assert.equal(stats.completedExercises, 49);
  assert.equal(stats.completedMissions, 11);
  assert.equal(stats.totalXp, 540);
  assert.equal(stats.level, 6);
  assert.deepEqual(getAchievements(completed.progress), getAchievements(before));
});

test('Two-answer exit and review retain zero extra XP; a fabricated last-question jump cannot complete', () => {
  let attempt = startMissionAttempt(before, id);
  for (const e of targets.slice(0, 2)) {
    const result = submitMissionAnswer(before, attempt, e.validation.correctOptionId);
    assert.equal(result.progress, before);
    assert.equal(result.xpAwarded, 0);
    attempt = continueMissionAttempt(result.attempt, 3);
  }
  assert.equal(attempt.result, null);
  assert.equal(attempt.solvedExerciseIds.length, 2);
  const snapshot = structuredClone(attempt);
  const review = lessonSessionReducer(initialLessonSession, { type: 'review' });
  assert.ok(getVisibleLesson(targets[2], attempt.phase, false, review));
  assert.equal(getSpellbookEntryForExercise(targets[2].id).id, 'python-not');
  assert.deepEqual(attempt, snapshot);
  const restarted = startMissionAttempt(before, id);
  assert.equal(restarted.exerciseIndex, 0);
  assert.deepEqual(restarted.solvedExerciseIds, []);
  assert.equal(submitMissionAnswer(before, { ...restarted, exerciseIndex: 2 }, targets[2].validation.correctOptionId).status, 'unavailable');
  assert.equal(getTotalEarnedXp(before), 510);
});

test('Version-1 saves keep all old XP and records; Mirror persists across storage instances and still replays for zero', async () => {
  assert.equal(PROGRESSION_STORAGE_KEY, 'devquest.progression');
  const xp = [0, 20, 50, 90, 140, 200, 300, 370, 450, 480, 510, 540, 640, 670, 700, 740, 780, 820, 860];
  const exerciseCounts = [0, 5, 10, 15, 20, 25, 30, 35, 40, 43, 46, 49, 54, 57, 60, 63, 66, 69, 72];
  for (let count = 0; count <= missions.length; count++) {
    const completedMissionIds = missions.slice(0, count).map(m => m.id);
    const payload = { version: 1, completedMissionIds };
    const loaded = parseSavedProgression(JSON.stringify(payload));
    assert.equal(loaded.status, 'ready');
    assert.deepEqual(loaded.progression.completedMissionIds, completedMissionIds);
    assert.equal(getTotalEarnedXp(loaded.progression), xp[count]);
    assert.equal(getPlayerStatistics(loaded.progression).completedExercises, exerciseCounts[count]);
    const data = new Map([['unrelated', 'untouched']]);
    const storage = { getItem: async key => data.get(key) ?? null, setItem: async (key, value) => { data.set(key, value); } };
    await createProgressionStore(storage).save(loaded.progression);
    const restored = await createProgressionStore(storage).load();
    assert.deepEqual(restored, loaded);
    assert.deepEqual(JSON.parse(data.get(PROGRESSION_STORAGE_KEY)), payload);
    assert.equal(data.get('unrelated'), 'untouched');
    if (count === 11) assert.equal(play(restored.progression, 0).attempt.result.xpAwarded, 0);
  }
});

test('Spellbook teaches not accurately and all lesson/reference/note links remain valid', async () => {
  const entry = spellbookEntries.find(e => e.id === 'python-not');
  assert.equal(entry.chapterId, chapterId);
  assert.equal(entry.codeExample, 'has_lantern = False\nif not has_lantern:\n    print("Pack a lantern")\nelse:\n    print("Light the path")');
  assert.equal(entry.expectedOutput, 'Pack a lantern');
  assert.equal(!false ? 'Pack a lantern' : 'Light the path', entry.expectedOutput);
  assert.match(entry.explanation, /not True is False.*not False is True/);
  assert.match(entry.whyItWorks, /not False becomes True/);
  assert.match(entry.commonMistake, /still stores False/);
  assert.ok(targets.every(e => getSpellbookEntryForExercise(e.id) === entry));
  let notes = {};
  for (const e of exercises) {
    assert.ok(getLessonForExercise(e), e.id);
    assert.ok(getSpellbookEntryForExercise(e.id), e.id);
    notes = setExerciseNote(notes, e.id, `My reminder for ${e.id}`);
  }
  const data = new Map();
  const storage = { getItem: async key => data.get(key) ?? null, setItem: async (key, value) => { data.set(key, value); } };
  await createNotesStore(storage).save(notes);
  assert.equal(NOTES_STORAGE_KEY, 'devquest.notes.v1');
  assert.deepEqual((await createNotesStore(storage).load()).notes, notes);
});

test('Goblin King remains five spells, 100 HP, 20 per correct answer, 100 XP once and zero on replay', () => {
  const boss = missions.find(m => m.id === goblinKingMissionId);
  assert.equal(boss.exerciseIds.length, 5);
  let progress = { completedMissionIds: before.completedMissionIds.slice(0, 5) };
  for (let replay = 0; replay < 2; replay++) {
    let attempt = startMissionAttempt(progress, boss.id);
    assert.equal(getGoblinKingHp(attempt), 100);
    boss.exerciseIds.forEach((id, index) => {
      const e = exercises.find(e => e.id === id);
      assert.equal(getGoblinKingHp(submitMissionAnswer(progress, attempt, 'wrong').attempt), 100 - index * 20);
      const answer = isChoiceExercise(e) ? e.validation.correctOptionId : e.validation.acceptedAnswers[0];
      const correct = submitMissionAnswer(progress, attempt, answer);
      assert.equal(getGoblinKingHp(correct.attempt), 80 - index * 20);
      assert.equal(correct.xpAwarded, index === 4 && replay === 0 ? 100 : 0);
      assert.equal(getGoblinKingHp(submitMissionAnswer(correct.progress, correct.attempt, answer).attempt), 80 - index * 20);
      progress = correct.progress;
      attempt = continueMissionAttempt(correct.attempt, 5);
    });
    assert.equal(attempt.phase, 'complete');
  }
  assert.equal(getTotalEarnedXp(progress), 300);
  assert.deepEqual(getWorldProgress(progress, forestOfVariables.id), { completed: 6, total: 6, percent: 100 });
});
