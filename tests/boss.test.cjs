const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  module._compile(compiled.outputText, filename);
};

const { GOBLIN_KING_DAMAGE, GOBLIN_KING_MAX_HP, getGoblinKingHp, goblinKingMissionId, isGoblinKingMission } = require('../src/game/boss.ts');
const { continueMissionAttempt, getPlayableMission, startMissionAttempt, submitMissionAnswer } = require('../src/game/worldMission.ts');
const { completeMission, getTotalEarnedXp, getWorldProgress, initialProgressionState } = require('../src/game/progression.ts');
const { forestChapters: chapters, forestOfVariables, forestMissions: missions } = require('../src/game/worldContent.ts');
const { battleReducer, initialBattleState } = require('../src/game/battle.ts');
const { challenges } = require('../src/game/challenges.ts');

function unlockedBossProgress() {
  return missions.slice(0, -1).reduce((progress, mission) => completeMission(progress, mission.id).progress, initialProgressionState);
}

function answerCurrent(progress, attempt) {
  const exercise = getPlayableMission(progress, attempt.missionId).exercises[attempt.exerciseIndex];
  return submitMissionAnswer(progress, attempt, exercise.validation.acceptedAnswers[0]);
}

test('Final boss uses the final chapter’s existing mission and stays locked until prerequisites', () => {
  const lastChapter = chapters.find((chapter) => chapter.id === forestOfVariables.chapterIds.at(-1));
  assert.equal(goblinKingMissionId, lastChapter.missionIds[0]);
  assert.equal(isGoblinKingMission(goblinKingMissionId), true);
  assert.equal(isGoblinKingMission(missions[0].id), false);
  assert.equal(startMissionAttempt(initialProgressionState, goblinKingMissionId), null);
  assert.equal(getPlayableMission(initialProgressionState, goblinKingMissionId), null);
  const forged = { missionId: goblinKingMissionId, exerciseIndex: 0, phase: 'answering', solvedExerciseIds: [], result: null };
  assert.equal(submitMissionAnswer(initialProgressionState, forged, 'Pyro\n6').status, 'unavailable');
});

test('Validated boss spells deal 20 damage each; wrong and duplicate answers deal zero', () => {
  let progress = unlockedBossProgress();
  let attempt = startMissionAttempt(progress, goblinKingMissionId);
  assert.ok(attempt);
  assert.equal(GOBLIN_KING_MAX_HP, 100);
  assert.equal(GOBLIN_KING_DAMAGE, 20);
  assert.equal(getGoblinKingHp(attempt), 100);
  for (let index = 0; index < 5; index++) {
    const wrong = submitMissionAnswer(progress, attempt, 'definitely wrong');
    assert.equal(wrong.status, 'incorrect');
    assert.equal(getGoblinKingHp(wrong.attempt), 100 - index * 20);
    assert.equal(wrong.xpAwarded, 0);
    const correct = answerCurrent(progress, attempt);
    assert.equal(correct.status, 'correct');
    assert.equal(getGoblinKingHp(correct.attempt), 100 - (index + 1) * 20);
    assert.equal(correct.attempt.phase, 'solved');
    const duplicate = answerCurrent(correct.progress, correct.attempt);
    assert.equal(duplicate.status, 'ignored');
    assert.equal(getGoblinKingHp(duplicate.attempt), getGoblinKingHp(correct.attempt));
    assert.equal(duplicate.xpAwarded, 0);
    assert.equal(correct.xpAwarded, index === 4 ? missions.at(-1).xpReward : 0);
    if (index < 4) assert.ok(getGoblinKingHp(correct.attempt) > 0);
    progress = correct.progress;
    attempt = continueMissionAttempt(correct.attempt, 5);
    assert.equal(attempt.phase, index === 4 ? 'complete' : 'answering');
  }
  assert.equal(getGoblinKingHp(attempt), 0);
  assert.equal(getWorldProgress(progress, forestOfVariables.id).percent, 100);
  assert.equal(getTotalEarnedXp(progress), forestOfVariables.xpReward);
});

test('Boss defeat grants existing mission XP once and replay grants zero', () => {
  let progress = unlockedBossProgress();
  let attempt = startMissionAttempt(progress, goblinKingMissionId);
  for (let index = 0; index < 5; index++) {
    const submission = answerCurrent(progress, attempt);
    progress = submission.progress;
    attempt = continueMissionAttempt(submission.attempt, 5);
  }
  assert.equal(attempt.result.xpAwarded, missions.at(-1).xpReward);
  assert.equal(attempt.result.totalXp, forestOfVariables.xpReward);
  const awardedProgress = progress;
  let replay = startMissionAttempt(progress, goblinKingMissionId);
  assert.equal(getGoblinKingHp(replay), 100);
  for (let index = 0; index < 5; index++) {
    const submission = answerCurrent(progress, replay);
    assert.equal(submission.xpAwarded, 0);
    assert.strictEqual(submission.progress, awardedProgress);
    replay = continueMissionAttempt(submission.attempt, 5);
  }
  assert.equal(replay.result.xpAwarded, 0);
  assert.equal(replay.result.totalXp, forestOfVariables.xpReward);
  assert.equal(getWorldProgress(progress, forestOfVariables.id).percent, 100);
});

test('Regular missions and original Goblin battle remain separate', () => {
  const regular = startMissionAttempt(initialProgressionState, missions[0].id);
  assert.equal(getGoblinKingHp(regular), null);
  const first = answerCurrent(initialProgressionState, regular);
  assert.equal(first.status, 'correct');
  assert.equal(first.xpAwarded, 0);
  let battle = initialBattleState;
  for (let index = 0; index < challenges.length; index++) {
    battle = battleReducer(battle, { type: 'submit', answer: challenges[index].answer });
    if (index < challenges.length - 1) battle = battleReducer(battle, { type: 'advance' });
  }
  assert.equal(battle.enemyHp, 0);
  assert.deepEqual(battleReducer(battle, { type: 'reset' }), initialBattleState);
});
