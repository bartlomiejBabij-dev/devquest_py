const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  module._compile(compiled.outputText, filename);
};

const { continueMissionAttempt, getPlayableMission, startMissionAttempt, submitMissionAnswer } = require('../src/game/worldMission.ts');
const { initialProgressionState, getChapterProgress, getTotalEarnedXp, getWorldProgress, isChapterUnlocked } = require('../src/game/progression.ts');
const { forestChapters: chapters, forestExercises: exercises, forestOfVariables, forestMissions: missions } = require('../src/game/worldContent.ts');
const { battleReducer, initialBattleState } = require('../src/game/battle.ts');
const { challenges } = require('../src/game/challenges.ts');

function answerCurrent(progress, attempt) {
  const playable = getPlayableMission(progress, attempt.missionId);
  const exercise = playable.exercises[attempt.exerciseIndex];
  return submitMissionAnswer(progress, attempt, exercise.validation.acceptedAnswers[0]);
}

test('All six missions load five playable exercises in their defined order', () => {
  let progress = initialProgressionState;
  for (const mission of missions) {
    const playable = getPlayableMission(progress, mission.id);
    assert.ok(playable);
    assert.equal(playable.exercises.length, 5);
    assert.deepEqual(playable.exercises.map((exercise) => exercise.id), mission.exerciseIds);
    progress = { completedMissionIds: [...progress.completedMissionIds, mission.id] };
  }
});

test('Locked and invalid missions cannot start or accept a forged attempt', () => {
  for (const id of [missions[1].id, 'not-a-mission']) {
    assert.equal(startMissionAttempt(initialProgressionState, id), null);
    assert.equal(getPlayableMission(initialProgressionState, id), null);
    const forged = { missionId: id, exerciseIndex: 0, phase: 'answering', solvedExerciseIds: [], result: null };
    const submission = submitMissionAnswer(initialProgressionState, forged, 'print');
    assert.equal(submission.status, 'unavailable');
    assert.strictEqual(submission.progress, initialProgressionState);
    assert.equal(submission.xpAwarded, 0);
  }
});

test('A fabricated jump to the fifth exercise cannot award XP', () => {
  const skipped = { missionId: missions[0].id, exerciseIndex: 4, phase: 'answering', solvedExerciseIds: [], result: null };
  const finalAnswer = exercises.find((exercise) => exercise.id === missions[0].exerciseIds[4]).validation.acceptedAnswers[0];
  const submission = submitMissionAnswer(initialProgressionState, skipped, finalAnswer);
  assert.equal(submission.status, 'unavailable');
  assert.equal(submission.xpAwarded, 0);
  assert.strictEqual(submission.progress, initialProgressionState);
});

test('Wrong answers and duplicate submissions cannot advance or award XP', () => {
  const attempt = startMissionAttempt(initialProgressionState, missions[0].id);
  const wrong = submitMissionAnswer(initialProgressionState, attempt, 'definitely wrong');
  assert.equal(wrong.status, 'incorrect');
  assert.strictEqual(wrong.attempt, attempt);
  assert.strictEqual(wrong.progress, initialProgressionState);
  const correct = answerCurrent(initialProgressionState, attempt);
  assert.equal(correct.status, 'correct');
  assert.equal(correct.attempt.phase, 'solved');
  assert.equal(correct.attempt.exerciseIndex, 0);
  assert.equal(correct.xpAwarded, 0);
  const duplicate = answerCurrent(initialProgressionState, correct.attempt);
  assert.equal(duplicate.status, 'ignored');
  assert.strictEqual(duplicate.attempt, correct.attempt);
  assert.strictEqual(continueMissionAttempt(attempt, 5), attempt);
  const next = continueMissionAttempt(correct.attempt, 5);
  assert.equal(next.phase, 'answering');
  assert.equal(next.exerciseIndex, 1);
  assert.equal(next.result, null);
});

test('Exercises 1–4 award no XP; fifth correct answer completes and unlocks the next chapter', () => {
  let progress = initialProgressionState;
  let attempt = startMissionAttempt(progress, missions[0].id);
  for (let index = 0; index < 5; index++) {
    const submission = answerCurrent(progress, attempt);
    assert.equal(submission.status, 'correct');
    assert.equal(submission.attempt.exerciseIndex, index);
    assert.equal(submission.attempt.phase, 'solved');
    assert.equal(submission.xpAwarded, index === 4 ? missions[0].xpReward : 0);
    progress = submission.progress;
    assert.equal(getTotalEarnedXp(progress), index === 4 ? missions[0].xpReward : 0);
    if (index < 4) assert.equal(isChapterUnlocked(progress, chapters[1].id), false);
    attempt = continueMissionAttempt(submission.attempt, 5);
    assert.equal(attempt.phase, index === 4 ? 'complete' : 'answering');
  }
  assert.equal(attempt.result.totalXp, missions[0].xpReward);
  assert.deepEqual(attempt.result.newlyUnlockedChapterIds, [chapters[1].id]);
  assert.equal(isChapterUnlocked(progress, chapters[1].id), true);
  assert.deepEqual(getChapterProgress(progress, chapters[0].id), { completed: 1, total: 1, percent: 100 });
  assert.deepEqual(getWorldProgress(progress, forestOfVariables.id), { completed: 1, total: 6, percent: 17 });
});

test('Exiting after four spells restarts from one and cannot award XP', () => {
  let attempt = startMissionAttempt(initialProgressionState, missions[0].id);
  for (let index = 0; index < 4; index++) {
    const submission = answerCurrent(initialProgressionState, attempt);
    assert.equal(submission.xpAwarded, 0);
    assert.strictEqual(submission.progress, initialProgressionState);
    attempt = continueMissionAttempt(submission.attempt, 5);
  }
  assert.equal(attempt.exerciseIndex, 4);
  const restarted = startMissionAttempt(initialProgressionState, missions[0].id);
  assert.equal(restarted.exerciseIndex, 0);
  assert.equal(restarted.result, null);
  assert.equal(getTotalEarnedXp(initialProgressionState), 0);
});

test('All 30 exercises complete in order; each mission pays once and replay pays zero', () => {
  assert.deepEqual(new Set(exercises.map((exercise) => exercise.type)), new Set(['fill-blank', 'choose-operator', 'predict-output', 'fix-mistake']));
  let progress = initialProgressionState;
  let earned = 0;
  for (const mission of missions) {
    let attempt = startMissionAttempt(progress, mission.id);
    assert.ok(attempt);
    for (let index = 0; index < 5; index++) {
      const submission = answerCurrent(progress, attempt);
      assert.equal(submission.status, 'correct');
      assert.equal(submission.xpAwarded, index === 4 ? mission.xpReward : 0);
      progress = submission.progress;
      attempt = continueMissionAttempt(submission.attempt, 5);
    }
    assert.equal(attempt.phase, 'complete');
    earned += mission.xpReward;
    assert.equal(attempt.result.totalXp, earned);
    let replay = startMissionAttempt(progress, mission.id);
    for (let index = 0; index < 5; index++) {
      const submission = answerCurrent(progress, replay);
      assert.equal(submission.xpAwarded, 0);
      assert.strictEqual(submission.progress, progress);
      replay = continueMissionAttempt(submission.attempt, 5);
    }
    assert.equal(replay.result.xpAwarded, 0);
    assert.equal(replay.result.totalXp, earned);
    assert.deepEqual(replay.result.newlyUnlockedChapterIds, []);
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
