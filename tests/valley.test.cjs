const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};
const { worlds, chapters, missions, exercises, forestOfVariables, forestMissions, valleyOfDecisions } = require('../src/game/worldContent.ts');
const valley = require('../src/game/valleyContent.ts');
// Keep the original ten-exercise progression/validator regression scenarios.
const valleyChapters = valley.valleyChapters.slice(0, 2);
const valleyMissions = valley.valleyMissions.slice(0, 2);
const valleyExercises = valley.valleyExercises.slice(0, 10);
const { completeMission, initialProgressionState, isWorldUnlocked, isChapterUnlocked, getTotalEarnedXp, getWorldProgress } = require('../src/game/progression.ts');
const { startMissionAttempt, getPlayableMission, submitMissionAnswer, continueMissionAttempt } = require('../src/game/worldMission.ts');
const { isExerciseAnswerCorrect } = require('../src/game/exerciseValidation.ts');
const { createProgressionStore, parseSavedProgression, PROGRESSION_STORAGE_KEY } = require('../src/game/progressionStorage.ts');
const { getPlayerStatistics, getAchievements } = require('../src/game/profile.ts');
const { getSpellbookEntryForExercise } = require('../src/game/spellbookContent.ts');
const { isValidExerciseId } = require('../src/game/notesStorage.ts');
const { isGoblinKingMission } = require('../src/game/boss.ts');
const { trackForRoute } = require('../src/game/audioController.ts');
const legacy = require('./fixtures/forest-complete-v1.json');
const { legacyCodeExercises } = require('./fixtures/final-assessment-compatibility.json');
const forestComplete = { completedMissionIds: legacy.completedMissionIds };
// Independently reviewed answers, not generated from validator metadata.
const answers = [
  ['python-valley-crossroads-boolean-c', 'python-valley-crossroads-equality-d', 'python-valley-crossroads-difference-b', 'python-valley-crossroads-boundary-a', 'python-valley-crossroads-threshold-c'],
  ['python-valley-guardian-if-b', 'python-valley-guardian-indent-c', 'python-valley-guardian-skip-b', 'python-valley-guardian-else-a', 'python-valley-guardian-branch-b'],
];

function play(progress, missionIndex) {
  const mission = valleyMissions[missionIndex];
  let attempt = startMissionAttempt(progress, mission.id);
  assert.ok(attempt);
  for (let index = 0; index < 5; index++) {
    const wrong = submitMissionAnswer(progress, attempt, 'not a solution');
    assert.equal(wrong.status, 'incorrect');
    assert.equal(wrong.progress, progress);
    const result = submitMissionAnswer(progress, attempt, answers[missionIndex][index]);
    assert.equal(result.status, 'correct');
    assert.equal(result.attempt.phase, 'solved', 'explanation must precede Continue');
    if (index < 4) { assert.equal(result.xpAwarded, 0); assert.equal(result.progress, progress); }
    const duplicate = submitMissionAnswer(result.progress, result.attempt, answers[missionIndex][index]);
    assert.equal(duplicate.status, 'ignored');
    assert.equal(duplicate.xpAwarded, 0);
    progress = result.progress;
    attempt = continueMissionAttempt(result.attempt, 5);
  }
  assert.equal(attempt.phase, 'complete');
  return { progress, result: attempt.result };
}

test('Two worlds contain unique linked IDs, exactly ten new exercises and five per new chapter', () => {
  assert.equal(worlds.length, 3);
  assert.equal(valleyChapters.length, 2);
  assert.equal(valleyMissions.length, 2);
  assert.equal(valleyExercises.length, 10);
  for (const items of [worlds, chapters, missions, exercises]) assert.equal(new Set(items.map(x => x.id)).size, items.length);
  assert.deepEqual(valleyOfDecisions.chapterIds.slice(0, 2), valleyChapters.map(c => c.id));
  assert.deepEqual(new Set(valleyOfDecisions.prerequisiteMissionIds), new Set(forestMissions.map(m => m.id)));
  for (const chapter of valleyChapters) {
    assert.equal(chapter.worldId, valleyOfDecisions.id);
    const mission = valleyMissions.find(m => chapter.missionIds.includes(m.id));
    assert.equal(mission.chapterId, chapter.id);
    assert.equal(mission.exerciseIds.length, 5);
    assert.equal(mission.xpReward, chapter.xpReward);
    assert.equal(new Set(mission.exerciseIds).size, 5);
    for (const id of mission.exerciseIds) assert.equal(valleyExercises.find(e => e.id === id)?.chapterId, chapter.id);
  }
  assert.equal(valleyOfDecisions.xpReward, 340);
  assert.equal(valleyMissions.reduce((sum, m) => sum + m.xpReward, 0), 150);
});

test('Legacy Stage 3F saves preserve every completion, XP and Forest unlock for all seven progress points', () => {
  assert.equal(PROGRESSION_STORAGE_KEY, 'devquest.progression');
  for (let count = 0; count <= 6; count++) {
    const ids = legacy.completedMissionIds.slice(0, count);
    const loaded = parseSavedProgression(JSON.stringify({ version: 1, completedMissionIds: ids }));
    assert.equal(loaded.status, 'ready');
    assert.deepEqual(loaded.progression.completedMissionIds, ids);
    assert.equal(getTotalEarnedXp(loaded.progression), [0,20,50,90,140,200,300][count]);
    assert.equal(isWorldUnlocked(loaded.progression, valleyOfDecisions.id), count === 6);
    for (const id of ids) assert.equal(completeMission(loaded.progression, id).xpAwarded, 0);
  }
});

test('World 2 requires every Forest mission, including the actual King; locked deep links cannot submit', () => {
  for (const missing of legacy.completedMissionIds) {
    const progress = { completedMissionIds: legacy.completedMissionIds.filter(id => id !== missing) };
    assert.equal(isWorldUnlocked(progress, valleyOfDecisions.id), false);
    assert.equal(startMissionAttempt(progress, valleyMissions[0].id), null);
    assert.equal(getPlayableMission(progress, valleyMissions[0].id), null);
    assert.equal(completeMission(progress, valleyMissions[0].id).progress, progress);
    const attempt = { missionId: valleyMissions[0].id, exerciseIndex: 0, phase: 'answering', solvedExerciseIds: [], result: null };
    assert.equal(submitMissionAnswer(progress, attempt, 'True').status, 'unavailable');
  }
  assert.equal(isWorldUnlocked(initialProgressionState, 'unknown'), false);
  assert.equal(isChapterUnlocked(forestComplete, valleyChapters[0].id), true);
  assert.equal(isChapterUnlocked(forestComplete, valleyChapters[1].id), false);
  const injected = parseSavedProgression(JSON.stringify({ version: 1, completedMissionIds: valleyMissions.map(m => m.id) }));
  assert.deepEqual(injected.progression, initialProgressionState);
});

test('All ten exercises contain teaching content, reviewed answers and valid Spellbook/note associations', () => {
  valleyMissions.forEach((mission, m) => mission.exerciseIds.forEach((id, i) => {
    const exercise = valleyExercises.find(e => e.id === id);
    for (const field of ['concept','prompt','code','hint','explanation']) assert.ok(exercise[field].trim(), `${id}: ${field}`);
    assert.equal(isExerciseAnswerCorrect(exercise, answers[m][i]), true, id);
    assert.equal(isExerciseAnswerCorrect(exercise, ''), false, id);
    assert.equal(isExerciseAnswerCorrect(exercise, 'anything ' + answers[m][i]), false, id);
    assert.ok(getSpellbookEntryForExercise(id));
    assert.equal(isValidExerciseId(id), true);
  }));
});

test('Code repair accepts harmless spacing, CRLF, blank lines and equivalent quotes while preserving indentation', () => {
  // Keep exercising the unchanged strict validator with the original code-entry definition.
  const exercise = legacyCodeExercises.find(e => e.id === 'python-valley-guardian-branch');
  for (const width of [1,2,4,8]) {
    const spaces = ' '.repeat(width);
    assert.equal(isExerciseAnswerCorrect(exercise, `\r\nmana=2  \r\nif mana<3 :\r\n${spaces}print ( 'Rest' )\r\n\r\nelse :\r\n${spaces}print('Cast')\r\n`), true);
  }
});

test('Code repair rejects misleading outputs, incorrect operators/branches, bad indentation and extra Python', () => {
  // Keep exercising the unchanged strict validator with the original code-entry definition.
  const exercise = legacyCodeExercises.find(e => e.id === 'python-valley-guardian-branch');
  const answer = 'mana = 2\nif mana < 3:\n    print("Rest")\nelse:\n    print("Cast")';
  const invalid = [
    'Rest', 'print("Rest")', answer.replace('<', '<='), answer.replace('<', '>='), answer.replace('<', '!='),
    answer.replace('Rest', 'Cast'), answer.replace('if mana', 'ifmana'), answer.replace('mana = 2', 'mana == 2'),
    answer.replace('    print("Rest")', 'print("Rest")'), answer.replace('else:', '    else:'),
    answer.replace('    print("Rest")', '  print("Rest")'), answer.replaceAll('    ', '\t'),
    ' '+answer, answer.replaceAll('    ', '         '), answer.replace(':', ''), answer.replace('Rest', 'Rest '),
    answer+'\nprint("Rest")', answer+'\n# Rest', answer+'; print("Rest")', answer.replace('if mana < 3:', 'if True:'),
    answer.replace('mana = 2', 'import os'), answer.replace('print("Rest")', '__import__("os")'), 'x'.repeat(2001),
  ];
  for (const value of invalid) assert.equal(isExerciseAnswerCorrect(exercise, value), false, value);
});

test('Crossroads options cannot be passed using raw Boolean/operator/output text', () => {
  for (const [id, wrong] of [
    ['boolean', ['true', '"True"', '1', 'False']],
    ['equality', ['=', '!=', '>=', 'True']],
    ['difference', ['False\nTrue', 'True', 'print(True)\nprint(False)']],
    ['boundary', ['True\nFalse', 'False\nTrue']],
    ['threshold', ['>', '==', '<=', 'True']],
  ]) {
    const exercise = valleyExercises.find(e => e.id === `python-valley-crossroads-${id}`);
    for (const answer of wrong) assert.equal(isExerciseAnswerCorrect(exercise, answer), false);
  }
});

test('Both missions use existing explanations/Continue, unlock the next chapter, award XP once and replay for zero', () => {
  let progress = forestComplete;
  valleyMissions.forEach((mission, index) => {
    const played = play(progress, index);
    assert.equal(played.result.xpAwarded, mission.xpReward);
    assert.deepEqual(played.result.newlyUnlockedChapterIds, index === 0 ? [valleyChapters[1].id] : ['python-valley-three-gates']);
    progress = played.progress;
    const replay = play(progress, index);
    assert.equal(replay.result.xpAwarded, 0);
    assert.equal(replay.progress, progress);
    assert.deepEqual(getWorldProgress(progress, forestOfVariables.id), { completed: 6, total: 6, percent: 100 });
  });
  assert.equal(getTotalEarnedXp(progress), 450);
  assert.deepEqual(getWorldProgress(progress, valleyOfDecisions.id), { completed: 2, total: 6, percent: 33 });
});

test('A partial World 2 attempt grants nothing and restarts without altering saved Forest progress', () => {
  const attempt = startMissionAttempt(forestComplete, valleyMissions[0].id);
  const first = submitMissionAnswer(forestComplete, attempt, 'python-valley-crossroads-boolean-c');
  assert.equal(first.progress, forestComplete);
  assert.equal(first.xpAwarded, 0);
  assert.deepEqual(startMissionAttempt(first.progress, attempt.missionId), attempt);
});

test('New completions survive a fresh storage instance without changing other data or paying replay XP', async () => {
  const records = new Map([[PROGRESSION_STORAGE_KEY, JSON.stringify(legacy)], ['devquest.audio.v1', 'audio-sentinel'], ['devquest.notes.v1', 'notes-sentinel']]);
  const storage = { getItem: async k => records.get(k) ?? null, setItem: async (k,v) => records.set(k,v) };
  const store = createProgressionStore(storage);
  const loaded = await store.load();
  const one = play(loaded.progression, 0).progress;
  const two = play(one, 1).progress;
  await Promise.all([store.save(one), store.save(two)]);
  const relaunched = await createProgressionStore(storage).load();
  assert.deepEqual(relaunched.progression, two);
  assert.equal(getTotalEarnedXp(relaunched.progression), 450);
  assert.equal(play(relaunched.progression, 1).result.xpAwarded, 0);
  assert.equal(records.get('devquest.audio.v1'), 'audio-sentinel');
  assert.equal(records.get('devquest.notes.v1'), 'notes-sentinel');
  assert.equal(JSON.parse(records.get(PROGRESSION_STORAGE_KEY)).version, 1);
});

test('Profile counts real World 2 exercises while retaining Forest-only achievements and level formula', () => {
  const one = play(forestComplete, 0).progress;
  const two = play(one, 1).progress;
  for (const [progress, count, xp] of [[one,7,370],[two,8,450]]) {
    const stats = getPlayerStatistics(progress);
    assert.equal(stats.completedMissions, count);
    assert.equal(stats.completedExercises, count * 5);
    assert.equal(stats.totalXp, xp);
    assert.equal(stats.level, Math.floor(xp/100)+1);
    assert.equal(stats.defeatedBosses, 1);
    assert.equal(stats.currentWorld, valleyOfDecisions.title);
    assert.deepEqual(getAchievements(progress), getAchievements(forestComplete));
  }
  const onlyValley = { completedMissionIds: valleyMissions.map(m => m.id) };
  assert.equal(getPlayerStatistics(onlyValley).defeatedBosses, 0);
  assert.ok(getAchievements(onlyValley).every(a => !a.unlocked));
  assert.ok(valleyMissions.every(m => !isGoblinKingMission(m.id)));
});

test('World 2 uses the existing exploration and battle audio route selection', () => {
  assert.equal(trackForRoute('/world-map'), 'forest');
  for (const mission of valleyMissions) assert.equal(trackForRoute(`/mission/${mission.id}`), 'battle');
});
