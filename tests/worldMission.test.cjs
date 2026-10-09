const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  module._compile(compiled.outputText, filename);
};

const { getPlayableMission, submitWorldMission } = require('../src/game/worldMission.ts');
const { initialProgressionState, getChapterProgress, getTotalEarnedXp, getWorldProgress, isChapterUnlocked } = require('../src/game/progression.ts');
const { chapters, exercises, forestOfVariables, missions } = require('../src/game/worldContent.ts');
const { battleReducer, initialBattleState } = require('../src/game/battle.ts');
const { challenges } = require('../src/game/challenges.ts');

test('Available mission opens with its linked exercise; locked and invalid routes do not', () => {
  assert.equal(getPlayableMission(initialProgressionState, missions[0].id).exercise.id, missions[0].exerciseIds[0]);
  assert.equal(getPlayableMission(initialProgressionState, missions[1].id), null);
  assert.equal(getPlayableMission(initialProgressionState, 'not-a-mission'), null);
});

test('Wrong, locked, and invalid submissions cannot change XP or progress', () => {
  for (const [id, answer, status] of [
    [missions[0].id, 'wrong', 'incorrect'],
    [missions[1].id, exercises[1].validation.acceptedAnswers[0], 'unavailable'],
    ['not-a-mission', 'print', 'unavailable'],
  ]) {
    const result = submitWorldMission(initialProgressionState, id, answer);
    assert.equal(result.status, status);
    assert.equal(result.xpAwarded, 0);
    assert.strictEqual(result.progress, initialProgressionState);
    assert.equal(getTotalEarnedXp(result.progress), 0);
  }
});

test('Correct answer awards configured XP once, updates progress, and unlocks the next chapter', () => {
  const first = submitWorldMission(initialProgressionState, missions[0].id, exercises[0].validation.acceptedAnswers[0]);
  assert.equal(first.status, 'correct');
  assert.equal(first.xpAwarded, missions[0].xpReward);
  assert.equal(first.totalXp, missions[0].xpReward);
  assert.deepEqual(first.newlyUnlockedChapterIds, [chapters[1].id]);
  assert.equal(isChapterUnlocked(first.progress, chapters[1].id), true);
  assert.deepEqual(getChapterProgress(first.progress, chapters[0].id), { completed: 1, total: 1, percent: 100 });
  assert.deepEqual(getWorldProgress(first.progress, forestOfVariables.id), { completed: 1, total: 6, percent: 17 });

  const duplicate = submitWorldMission(first.progress, missions[0].id, exercises[0].validation.acceptedAnswers[0]);
  assert.equal(getPlayableMission(first.progress, missions[0].id)?.mission.id, missions[0].id);
  assert.equal(duplicate.status, 'correct');
  assert.equal(duplicate.xpAwarded, 0);
  assert.equal(duplicate.totalXp, first.totalXp);
  assert.deepEqual(duplicate.newlyUnlockedChapterIds, []);
  assert.strictEqual(duplicate.progress, first.progress);
});

test('All six existing exercises can complete missions in sequence with expected XP', () => {
  assert.deepEqual(new Set(exercises.map((exercise) => exercise.type)), new Set(['fill-blank', 'choose-operator', 'predict-output', 'fix-mistake']));
  let progress = initialProgressionState;
  let earned = 0;
  for (const mission of missions) {
    const exercise = exercises.find((item) => item.id === mission.exerciseIds[0]);
    assert.equal(getPlayableMission(progress, mission.id)?.exercise.id, exercise.id);
    const wrong = submitWorldMission(progress, mission.id, 'definitely wrong');
    assert.equal(wrong.status, 'incorrect');
    assert.strictEqual(wrong.progress, progress);
    const result = submitWorldMission(progress, mission.id, exercise.validation.acceptedAnswers[0]);
    assert.equal(result.status, 'correct');
    assert.equal(result.xpAwarded, mission.xpReward);
    earned += mission.xpReward;
    assert.equal(result.totalXp, earned);
    progress = result.progress;
  }
  assert.equal(earned, forestOfVariables.xpReward);
  assert.deepEqual(getWorldProgress(progress, forestOfVariables.id), { completed: 6, total: 6, percent: 100 });
});

test('Original Goblin prototype still validates, wins, and resets independently', () => {
  let battle = initialBattleState;
  battle = battleReducer(battle, { type: 'submit', answer: 'wrong' });
  assert.equal(battle.result, 'incorrect');
  for (let i = 0; i < challenges.length; i++) {
    battle = battleReducer(battle, { type: 'submit', answer: challenges[i].answer });
    if (i < challenges.length - 1) battle = battleReducer(battle, { type: 'advance' });
  }
  assert.equal(battle.enemyHp, 0);
  assert.deepEqual(battleReducer(battle, { type: 'reset' }), initialBattleState);
});
