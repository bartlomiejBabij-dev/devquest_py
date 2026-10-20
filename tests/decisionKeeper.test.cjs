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
const { goblinKingMissionId, getGoblinKingHp, decisionKeeperMissionId, getBossHp, getBossEncounter, isBossMission, isWorldCleared } = require('../src/game/boss.ts');
const { worldMapForMission } = require('../src/navigation/worldRoutes.ts');
const { trackForRoute } = require('../src/game/audioController.ts');
const baseline = require('./fixtures/decision-keeper-compatibility.json');
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const id = 'python-valley-decision-keeper-01';
const chapterId = 'python-valley-decision-keeper';
const mission = missions.find(m => m.id === id);
const targets = mission.exerciseIds.map(id => exercises.find(e => e.id === id));
const before = { completedMissionIds: Object.keys(baseline.missions) };

test('Keeper preserves all 49 previous exercises, eleven missions, 26 lessons, 18 references and their IDs/order/rewards', () => {
  for (const [name, items] of Object.entries({ chapters, missions, exercises, lessons, spellbook: spellbookEntries })) {
    for (const [id, expected] of Object.entries(baseline[name])) assert.equal(hash(items.find(v => v.id === id)), expected, id);
    assert.deepEqual(items.filter(v => Object.hasOwn(baseline[name], v.id)).map(v => v.id), Object.keys(baseline[name]));
  }
  for (const [id, entry] of Object.entries(baseline.spellbookLinks)) assert.equal(exerciseSpellbookEntryIds[id], entry);
  assert.deepEqual(forestOfVariables, baseline.worlds[0]);
  assert.deepEqual(valleyOfDecisions, { ...baseline.worlds[1], chapterIds: [...baseline.worlds[1].chapterIds, chapterId], xpReward: 340 });
});

test('Registry adds just one five-tap final boss and one recap with unique IDs and correct totals', () => {
  assert.deepEqual([worlds.length, chapters.length, missions.length, exercises.length, lessons.length, spellbookEntries.length], [3, 16, 16, 66, 33, 20]);
  assert.equal(exercises.filter(isChoiceExercise).length, 60);
  assert.equal(exercises.filter(e => !isChoiceExercise(e) && e.type !== 'code-builder').length, 2);
  assert.deepEqual(missions.filter(m => !Object.hasOwn(baseline.missions, m.id)), [mission, ...missions.filter(m => m.chapterId.startsWith('python-caverns-'))]);
  assert.equal(decisionKeeperMissionId, id);
  assert.equal(mission.title, 'The Decision Keeper');
  assert.equal(mission.xpReward, 100);
  assert.equal(mission.encounter, 'decision-keeper');
  assert.equal(targets.length, 5);
  assert.ok(targets.every(e => isChoiceExercise(e) && e.chapterId === chapterId));
  assert.deepEqual(targets.map(e => e.id), ['comparison', 'branch', 'runes', 'mirror', 'mastery'].map(s => `python-valley-keeper-${s}`));
  const ids = [...worlds, ...chapters, ...missions, ...exercises, ...lessons, ...spellbookEntries, ...exercises.filter(isChoiceExercise).flatMap(e => e.options)].map(v => v.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(missions.reduce((sum, m) => sum + m.xpReward, 0), 780);
  assert.equal(valleyOfDecisions.chapterIds.length, 6);
  assert.equal(isBossMission(id), true);
  assert.equal(isBossMission('python-valley-guardian-01'), false);
  assert.equal(getBossEncounter(id).kind, 'decision-keeper');
  assert.equal(getBossHp(startMissionAttempt({ completedMissionIds: [] }, missions[0].id)), null);
});

const reviewed = [
  ['crystals = 4\nif crystals >= 4:\n    print("Ready")\nelse:\n    print("Gather")', 'b', 'Ready', ['Gather', 'True']],
  ['power = 8\nif power >= 6:\n    print("Emerald")\nelif power >= 3:\n    print("Amber")\nelse:\n    print("Stone")', 'a', 'Emerald', ['Amber', 'Emerald\nAmber']],
  ['has_key = False\nknows_rune = True\nprint(has_key and knows_rune)\nprint(has_key or knows_rune)', 'c', 'False\nTrue', ['True\nFalse', 'True\nTrue']],
  ['shield_active = True\nif not shield_active:\n    print("Raise shield")\nprint("Advance")', 'b', 'Advance', ['Raise shield\nAdvance', 'No output']],
  ['mp = 5\nshut = False', 'c', 'if mp>=5 and(not shut):\n    print("Free!")', [
    'if mp>=5 or (not shut):\n    print("Free!")',
    'if mp>=5 and(not shut):\nprint("Free!")',
    'if mp>5 and(not shut):\n    print("Free!")',
  ]],
];

test('All five reviewed snippets have one correct stable choice; wrong, foreign, raw-label and altered IDs are rejected', () => {
  targets.forEach((e, index) => {
    const [code, letter, label, wrong] = reviewed[index];
    assert.equal(e.code, code);
    assert.equal(e.validation.correctOptionId, `${e.id}-${letter}`);
    assert.equal(e.options.find(o => o.id === e.validation.correctOptionId).label, label);
    assert.deepEqual(e.options.filter(o => o.id !== e.validation.correctOptionId).map(o => o.label), wrong);
    assert.equal(e.options.filter(o => isExerciseAnswerCorrect(e, o.id)).length, 1);
    assert.equal(new Set(e.options.map(o => o.label)).size, e.options.length);
    for (const o of e.options) {
      assert.equal(isExerciseAnswerCorrect(e, o.id), o.id === e.validation.correctOptionId);
      assert.equal(isExerciseAnswerCorrect(e, o.label), false);
      assert.ok(o.feedback.length > 35);
      if (o.id !== e.validation.correctOptionId) assert.equal(getIncorrectAnswerFeedback(e, o.id), o.feedback);
    }
    for (const invalid of ['', 'toString', 'unknown', 'python-valley-mirror-passage-c', ...targets.filter(t => t !== e).map(t => t.validation.correctOptionId), ` ${e.validation.correctOptionId}`, e.validation.correctOptionId.toUpperCase()]) assert.equal(isExerciseAnswerCorrect(e, invalid), false);
    assert.equal(isExerciseAnswerCorrect({ ...e, options: [...e.options].reverse() }, e.validation.correctOptionId), true);
    assert.ok(e.code.split('\n').every(line => line.length <= 32));
  });
  assert.equal(targets[4].optionFormat, 'code');
  assert.ok(targets[4].options.every(o => o.label.split('\n').every(line => line.length <= 23)));
});

test('Python outcomes and distractors match boundary, first-branch, Boolean and indentation semantics', () => {
  // Fixed independent review; no Python source or player input is executed.
  assert.equal(4 >= 4 ? 'Ready' : 'Gather', 'Ready');
  assert.equal(8 >= 6 ? 'Emerald' : 8 >= 3 ? 'Amber' : 'Stone', 'Emerald');
  assert.deepEqual([false && true, false || true], [false, true]);
  assert.equal(!true, false, 'skip only the shield block; Advance is outside it');
  assert.match(targets[3].code, /\n    print\("Raise shield"\)\nprint\("Advance"\)$/);
  const valid = (mana, locked) => mana >= 5 && !locked;
  assert.deepEqual([[4, false], [5, false], [6, false], [5, true], [6, true]].map(([m, l]) => valid(m, l)), [false, true, true, false, false]);
  assert.equal(4 >= 5 || !false, true, 'or wrongly accepts low mana');
  assert.equal(5 > 5 && !false, false, 'strict > wrongly excludes the boundary');
  assert.match(targets[4].options[1].feedback, /indented block.*syntax error/);
  assert.match(targets[4].prompt, /any values/);
});

test('Mirror gates Keeper; locked deep links, shortcut saves and forged exercise jumps fail safely', () => {
  const chapter = chapters.find(c => c.id === chapterId);
  assert.deepEqual(chapter.prerequisiteMissionIds, ['python-valley-mirror-of-truth-01']);
  assert.deepEqual(chapter.missionIds, [id]);
  assert.equal(isMissionUnlocked(before, id), true);
  for (let n = 0; n < before.completedMissionIds.length; n++) {
    const locked = { completedMissionIds: before.completedMissionIds.slice(0, n) };
    assert.equal(startMissionAttempt(locked, id), null);
    assert.equal(getPlayableMission(locked, id), null);
    assert.deepEqual(completeMission(locked, id), { progress: locked, xpAwarded: 0 });
    const denied = submitMissionAnswer(locked, startMissionAttempt(before, id), targets[0].validation.correctOptionId);
    assert.equal(denied.status, 'unavailable'); assert.equal(denied.xpAwarded, 0);
  }
  assert.deepEqual(parseSavedProgression(JSON.stringify({ version: 1, completedMissionIds: [id] })).progression.completedMissionIds, []);
  const fresh = startMissionAttempt(before, id);
  for (const exerciseIndex of [-1, 1, 4, 5, 0.5]) assert.equal(submitMissionAnswer(before, { ...fresh, exerciseIndex }, targets[4].validation.correctOptionId).status, 'unavailable');
  assert.equal(submitMissionAnswer(before, { ...fresh, exerciseIndex: 1, solvedExerciseIds: ['foreign'] }, targets[1].validation.correctOptionId).status, 'unavailable');
});

function play(progress, missionId, reward) {
  let attempt = startMissionAttempt(progress, missionId);
  const playable = getPlayableMission(progress, missionId);
  assert.equal(getBossHp(attempt), 100);
  playable.exercises.forEach((e, index) => {
    const wrongAnswers = isChoiceExercise(e) ? e.options.filter(o => o.id !== e.validation.correctOptionId).map(o => o.id) : ['wrong'];
    for (const answer of [...wrongAnswers, 'foreign-id']) {
      const wrong = submitMissionAnswer(progress, attempt, answer);
      assert.equal(wrong.status, 'incorrect');
      assert.equal(wrong.attempt, attempt); assert.equal(wrong.progress, progress); assert.equal(wrong.xpAwarded, 0);
      assert.equal(getBossHp(wrong.attempt), 100 - index * 20);
    }
    const answer = isChoiceExercise(e) ? e.validation.correctOptionId : e.validation.acceptedAnswers[0];
    const correct = submitMissionAnswer(progress, attempt, answer);
    assert.equal(correct.status, 'correct');
    assert.equal(correct.attempt.phase, 'solved', 'explanation stays before Continue');
    assert.equal(getBossHp(correct.attempt), 80 - index * 20);
    assert.equal(correct.xpAwarded, index === 4 ? reward : 0);
    if (index < 4) { assert.equal(correct.progress, progress); assert.equal(correct.attempt.result, null); }
    for (let tap = 0; tap < 5; tap++) {
      const duplicate = submitMissionAnswer(correct.progress, correct.attempt, answer);
      assert.equal(duplicate.status, 'ignored'); assert.equal(duplicate.xpAwarded, 0);
      assert.equal(duplicate.attempt, correct.attempt); assert.equal(duplicate.progress, correct.progress);
      assert.equal(getBossHp(duplicate.attempt), 80 - index * 20);
    }
    progress = correct.progress;
    attempt = continueMissionAttempt(correct.attempt, 5);
    assert.equal(attempt.phase, index === 4 ? 'complete' : 'answering');
    assert.equal(continueMissionAttempt(attempt, 5), attempt);
  });
  assert.equal(attempt.result.xpAwarded, reward);
  assert.equal(getBossHp(attempt), 0);
  return { progress, attempt };
}

test('Keeper takes five 20-damage spells, pays 100 XP once, replays for zero and clears World 2 only after the finale', () => {
  assert.deepEqual(getWorldProgress(before, valleyOfDecisions.id), { completed: 5, total: 6, percent: 83 });
  assert.equal(isWorldCleared(before, valleyOfDecisions.id), false);
  assert.equal(isWorldCleared(before, forestOfVariables.id), true);
  const won = play(before, id, 100);
  assert.equal(won.attempt.result.totalXp, 640);
  assert.deepEqual(getWorldProgress(won.progress, valleyOfDecisions.id), { completed: 6, total: 6, percent: 100 });
  assert.equal(isWorldCleared(won.progress, valleyOfDecisions.id), true);
  assert.equal(isWorldCleared(won.progress, 'unknown-world'), false);
  for (const missing of before.completedMissionIds.slice(6)) assert.equal(isWorldCleared({ completedMissionIds: won.progress.completedMissionIds.filter(v => v !== missing) }, valleyOfDecisions.id), false);
  assert.equal(play(won.progress, id, 0).progress, won.progress);
  const stats = getPlayerStatistics(won.progress);
  assert.deepEqual([stats.totalXp, stats.completedMissions, stats.completedExercises, stats.defeatedBosses, stats.level], [640, 12, 54, 2, 7]);
  assert.deepEqual(getAchievements(won.progress), getAchievements(before));
});

test('Optional recap remains optional on first attempts and replays, preserves attempts and teaches reviewed examples', () => {
  const recap = lessons.find(l => l.id === 'python-lesson-valley-mastery');
  assert.equal(recap.optionalReview, true);
  assert.equal(recap.codeExample, 'charge = 3\nsealed = True\nif charge >= 4:\n    print("Strong")\nelif (charge == 3) and sealed:\n    print("Steady")\nelse:\n    print("Rest")');
  assert.equal(recap.expectedOutput, 'Steady');
  assert.equal(3 >= 4 ? 'Strong' : 3 === 3 && true ? 'Steady' : 'Rest', 'Steady');
  assert.ok([recap.explanation, recap.whyItWorks, recap.importantRule].join(' ').split(/\s+/).length <= 125);
  for (const operator of ['==', '!=', '<', '>', '<=', '>=']) assert.ok(recap.explanation.includes(operator));
  let attempt = startMissionAttempt(before, id);
  targets.forEach(e => {
    assert.equal(getLessonForExercise(e), recap);
    for (const replay of [true, false]) assert.equal(getVisibleLesson(e, 'answering', replay, initialLessonSession), null);
    const snapshot = structuredClone(attempt);
    const reviewed = lessonSessionReducer(initialLessonSession, { type: 'review' });
    assert.equal(getVisibleLesson(e, attempt.phase, false, reviewed).lesson, recap);
    assert.deepEqual(lessonSessionReducer(reviewed, { type: 'close' }), initialLessonSession);
    assert.deepEqual(attempt, snapshot);
    const correct = submitMissionAnswer(before, attempt, e.validation.correctOptionId);
    attempt = continueMissionAttempt(correct.attempt, 5);
  });
  assert.equal(getTotalEarnedXp(before), 540);
});

test('Old saves and new boss completion survive reload with accurate XP, profile counts, achievements and stable notes', async () => {
  assert.equal(PROGRESSION_STORAGE_KEY, 'devquest.progression');
  const xp = [0, 20, 50, 90, 140, 200, 300, 370, 450, 480, 510, 540, 640, 670, 700, 740, 780];
  const countExercises = [0, 5, 10, 15, 20, 25, 30, 35, 40, 43, 46, 49, 54, 57, 60, 63, 66];
  for (let count = 0; count <= missions.length; count++) {
    const completedMissionIds = missions.slice(0, count).map(m => m.id);
    const raw = JSON.stringify({ version: 1, completedMissionIds });
    const loaded = parseSavedProgression(raw);
    assert.equal(loaded.status, 'ready'); assert.deepEqual(loaded.progression.completedMissionIds, completedMissionIds);
    const stats = getPlayerStatistics(loaded.progression);
    assert.deepEqual([stats.totalXp, stats.completedExercises, stats.defeatedBosses], [xp[count], countExercises[count], count >= 12 ? 2 : count >= 6 ? 1 : 0]);
    assert.equal(isWorldCleared(loaded.progression, valleyOfDecisions.id), count >= 12);
    const data = new Map([[PROGRESSION_STORAGE_KEY, raw], ['unrelated', 'keep']]);
    const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
    await createProgressionStore(storage).save(loaded.progression);
    assert.deepEqual(await createProgressionStore(storage).load(), loaded);
    assert.equal(data.get(PROGRESSION_STORAGE_KEY), raw); assert.equal(data.get('unrelated'), 'keep');
    if (count === 12) assert.equal(play(loaded.progression, id, 0).attempt.result.totalXp, 640);
  }
  let notes = {};
  for (const e of exercises) {
    assert.ok(getLessonForExercise(e)); assert.ok(getSpellbookEntryForExercise(e.id));
    notes = setExerciseNote(notes, e.id, `Reminder for ${e.id}`);
  }
  assert.deepEqual(targets.map(e => getSpellbookEntryForExercise(e.id).id), ['python-comparisons', 'python-elif', 'python-and', 'python-not', 'python-and']);
  const data = new Map();
  const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
  await createNotesStore(storage).save(notes);
  assert.equal(NOTES_STORAGE_KEY, 'devquest.notes.v1');
  assert.deepEqual((await createNotesStore(storage).load()).notes, notes);
});

test('Shared boss selection preserves Goblin HP/reward/replay and owning-world navigation/audio routes', () => {
  const forestBeforeBoss = { completedMissionIds: before.completedMissionIds.slice(0, 5) };
  const won = play(forestBeforeBoss, goblinKingMissionId, 100);
  assert.equal(getGoblinKingHp(won.attempt), 0);
  assert.equal(getBossEncounter(goblinKingMissionId).kind, 'goblin-king');
  assert.equal(getTotalEarnedXp(won.progress), 300);
  assert.equal(isWorldCleared(won.progress, forestOfVariables.id), true);
  assert.equal(play(won.progress, goblinKingMissionId, 0).progress, won.progress);
  assert.equal(missions.find(m => m.id === goblinKingMissionId).exerciseIds.length, 5);
  assert.equal(getGoblinKingHp(startMissionAttempt(before, id)), null);
  assert.deepEqual(worldMapForMission(id), { pathname: '/world-map', params: { worldId: valleyOfDecisions.id } });
  assert.deepEqual(worldMapForMission(goblinKingMissionId), { pathname: '/world-map', params: { worldId: forestOfVariables.id } });
  assert.equal(trackForRoute(`/mission/${id}`), 'battle'); assert.equal(trackForRoute('/world-map'), 'forest');
});

