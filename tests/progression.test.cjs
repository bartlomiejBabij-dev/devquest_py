const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  module._compile(compiled.outputText, filename);
};

const { forestChapters: chapters, forestExercises: exercises, forestOfVariables, forestMissions: missions } = require('../src/game/worldContent.ts');
const { isExerciseAnswerCorrect } = require('../src/game/exerciseValidation.ts');
const {
  completeMission, getChapterProgress, getTotalEarnedXp, getUnlockedChapterIds, getWorldProgress,
  initialProgressionState, isChapterCompleted, isChapterUnlocked, isMissionCompleted, isMissionUnlocked,
  isWorldCompleted, progressionReducer,
} = require('../src/game/progression.ts');
const { battleReducer, initialBattleState } = require('../src/game/battle.ts');
const { challenges } = require('../src/game/challenges.ts');

test('World 1 content has six linked chapters and missions with 30 unique exercises', () => {
  assert.equal(chapters.length, 6);
  assert.equal(missions.length, 6);
  assert.equal(exercises.length, 30);
  for (const items of [chapters, missions, exercises]) assert.equal(new Set(items.map((item) => item.id)).size, items.length);
  assert.deepEqual(forestOfVariables.chapterIds, chapters.map((chapter) => chapter.id));
  for (const chapter of chapters) {
    const chapterMissions = chapter.missionIds.map((id) => missions.find((mission) => mission.id === id));
    assert.ok(chapterMissions.every(Boolean));
    assert.equal(chapter.xpReward, chapterMissions.reduce((sum, mission) => sum + mission.xpReward, 0));
  }
  assert.equal(forestOfVariables.xpReward, missions.reduce((sum, mission) => sum + mission.xpReward, 0));
  for (const mission of missions) assert.ok(mission.exerciseIds.every((id) => exercises.some((exercise) => exercise.id === id)));
});

test('Chapter 1 starts unlocked and later chapters start locked', () => {
  assert.equal(isChapterUnlocked(initialProgressionState, chapters[0].id), true);
  assert.deepEqual(getUnlockedChapterIds(initialProgressionState, forestOfVariables.id), [chapters[0].id]);
  for (const chapter of chapters.slice(1)) assert.equal(isChapterUnlocked(initialProgressionState, chapter.id), false);
});

test('Completing a required mission awards XP and unlocks the next chapter', () => {
  const result = completeMission(initialProgressionState, missions[0].id);
  assert.equal(result.xpAwarded, missions[0].xpReward);
  assert.equal(isMissionCompleted(result.progress, missions[0].id), true);
  assert.equal(isChapterCompleted(result.progress, chapters[0].id), true);
  assert.equal(isChapterUnlocked(result.progress, chapters[1].id), true);
  assert.equal(isMissionUnlocked(result.progress, missions[1].id), true);
  assert.deepEqual(getChapterProgress(result.progress, chapters[0].id), { completed: 1, total: 1, percent: 100 });
});

test('Replaying a completed mission is idempotent and awards no additional XP', () => {
  const first = completeMission(initialProgressionState, missions[0].id);
  const second = completeMission(first.progress, missions[0].id);
  assert.equal(second.xpAwarded, 0);
  assert.strictEqual(second.progress, first.progress);
  assert.equal(getTotalEarnedXp(second.progress), missions[0].xpReward);
});

test('Locked and invalid missions cannot change progression', () => {
  for (const id of [missions[1].id, 'missing-mission']) {
    const result = completeMission(initialProgressionState, id);
    assert.strictEqual(result.progress, initialProgressionState);
    assert.equal(result.xpAwarded, 0);
  }
  assert.equal(isMissionUnlocked(initialProgressionState, 'missing-mission'), false);
  assert.equal(isMissionCompleted({ completedMissionIds: ['missing-mission'] }, 'missing-mission'), false);
  assert.equal(getTotalEarnedXp({ completedMissionIds: ['missing-mission'] }), 0);
});

test('XP and chapter/world completion are derived once from completed mission IDs', () => {
  let progress = initialProgressionState;
  for (const mission of missions) progress = progressionReducer(progress, { type: 'completeMission', missionId: mission.id });
  assert.equal(getTotalEarnedXp(progress), forestOfVariables.xpReward);
  assert.deepEqual(getWorldProgress(progress, forestOfVariables.id), { completed: 6, total: 6, percent: 100 });
  assert.equal(isWorldCompleted(progress, forestOfVariables.id), true);
  assert.deepEqual(getUnlockedChapterIds(progress, forestOfVariables.id), chapters.map((chapter) => chapter.id));
  assert.equal(getTotalEarnedXp({ completedMissionIds: [...progress.completedMissionIds, missions[0].id] }), forestOfVariables.xpReward);
});

test('Every new exercise uses deterministic, exact validation', () => {
  for (const exercise of exercises) {
    assert.ok(isExerciseAnswerCorrect(exercise, exercise.validation.acceptedAnswers[0]));
    assert.equal(isExerciseAnswerCorrect(exercise, ''), false);
    assert.equal(isExerciseAnswerCorrect(exercise, 'definitely wrong'), false);
  }
  assert.equal(isExerciseAnswerCorrect(exercises[5], 'Pyro\r\n6'), true);
  assert.equal(isExerciseAnswerCorrect(exercises[3], 'hello, Pyromancer'), false);
});

test('Existing three-challenge battle still validates, advances, wins, and resets', () => {
  assert.deepEqual(challenges.map((challenge) => challenge.answer), ['damage', '5', '*']);
  let battle = battleReducer(initialBattleState, { type: 'submit', answer: 'wrong' });
  assert.equal(battle.enemyHp, 30);
  assert.equal(battle.result, 'incorrect');
  for (const [index, answer] of challenges.map((challenge) => challenge.answer).entries()) {
    battle = battleReducer(battle, { type: 'submit', answer });
    assert.equal(battle.enemyHp, 30 - (index + 1) * 10);
    assert.deepEqual(battleReducer(battle, { type: 'submit', answer }), battle);
    if (index < challenges.length - 1) battle = battleReducer(battle, { type: 'advance' });
  }
  assert.equal(battle.enemyHp, 0);
  assert.deepEqual(battleReducer(battle, { type: 'reset' }), initialBattleState);
});
