const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');
const { StackActions, StackRouter } = require('../node_modules/expo-router/build/react-navigation/routers/StackRouter.js');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  module._compile(compiled.outputText, filename);
};

const { createNavigationGate, hasUnfinishedMissionProgress } = require('../src/navigation/navigationActions.ts');
const { initialProgressionState } = require('../src/game/progression.ts');
const { startMissionAttempt, submitMissionAnswer } = require('../src/game/worldMission.ts');
const { getPlayableMission } = require('../src/game/worldMission.ts');

const routeNames = ['index', 'world-map', 'mission/[missionId]', 'spellbook', 'profile'];
const routeParamList = Object.fromEntries(routeNames.map((name) => [name, undefined]));
const stackRouter = StackRouter({ initialRouteName: 'index' });
const actionOptions = { routeParamList, routeGetIdList: {} };

function startStack() {
  return stackRouter.getInitialState({ routeNames, routeParamList });
}

function apply(state, action) {
  const next = stackRouter.getStateForAction(state, action, actionOptions);
  assert.ok(next, `Unrecognized navigation action: ${action.type}`);
  return next;
}

function names(state) {
  return state.routes.map((route) => route.name);
}

test('Old mission REPLACE path leaves a duplicate World Map behind', () => {
  let state = startStack();
  state = apply(state, StackActions.push('world-map'));
  state = apply(state, StackActions.push('mission/[missionId]', { missionId: 'python-forest-awakening-01' }));
  state = apply(state, StackActions.replace('world-map'));
  assert.deepEqual(names(state), ['index', 'world-map', 'world-map']);
  state = apply(state, StackActions.pop(1));
  assert.deepEqual(names(state), ['index', 'world-map']);
});

test('POP_TO returns from a mission to the existing World Map, then Home, across three trips', () => {
  let state = startStack();
  for (let trip = 0; trip < 3; trip++) {
    state = apply(state, StackActions.push('world-map'));
    state = apply(state, StackActions.push('mission/[missionId]', { missionId: 'python-forest-awakening-01' }));
    state = apply(state, StackActions.popTo('world-map'));
    assert.deepEqual(names(state), ['index', 'world-map'], `trip ${trip + 1}: map`);
    state = apply(state, StackActions.popTo('index'));
    assert.deepEqual(names(state), ['index'], `trip ${trip + 1}: home`);
  }
});

test('POP_TO replaces the current route when the destination is missing', () => {
  let state = startStack();
  state = apply(state, StackActions.push('mission/[missionId]', { missionId: 'python-forest-awakening-01' }));
  state = apply(state, StackActions.popTo('world-map'));
  assert.deepEqual(names(state), ['index', 'world-map']);

  let deepLinkedState = stackRouter.getInitialState({ routeNames, routeParamList });
  deepLinkedState = apply(deepLinkedState, StackActions.replace('mission/[missionId]', { missionId: 'python-forest-awakening-01' }));
  deepLinkedState = apply(deepLinkedState, StackActions.popTo('world-map'));
  assert.deepEqual(names(deepLinkedState), ['world-map']);
});

test('A rapid route guard runs one navigation until reset', () => {
  const gate = createNavigationGate();
  const events = [];
  assert.equal(gate.run(() => events.push('first')), true);
  assert.equal(gate.run(() => events.push('duplicate')), false);
  assert.deepEqual(events, ['first']);
  gate.reset();
  assert.equal(gate.run(() => events.push('next')), true);
  assert.deepEqual(events, ['first', 'next']);
});

test('Profile round trips and rapid repeated taps leave a single Home route', () => {
  let state = startStack();
  const gate = createNavigationGate();
  for (let visit = 0; visit < 3; visit++) {
    gate.reset();
    const open = () => { state = apply(state, { type: 'NAVIGATE', payload: { name: 'profile' } }); };
    assert.equal(gate.run(open), true);
    assert.equal(gate.run(open), false);
    assert.deepEqual(names(state), ['index', 'profile']);
    state = apply(state, StackActions.popTo('index'));
    assert.deepEqual(names(state), ['index']);
  }
});

test('Only an unfinished mission attempt with progress or a typed answer needs confirmation', () => {
  const missionId = 'python-forest-awakening-01';
  const attempt = startMissionAttempt(initialProgressionState, missionId);
  assert.ok(attempt);
  assert.equal(hasUnfinishedMissionProgress(null, 'unfinished'), false);
  assert.equal(hasUnfinishedMissionProgress(attempt, ''), false);
  assert.equal(hasUnfinishedMissionProgress(attempt, ' \n  '), false);
  assert.equal(hasUnfinishedMissionProgress(attempt, 'print'), true);

  const exercise = getPlayableMission(initialProgressionState, missionId).exercises[0];
  const submission = submitMissionAnswer(initialProgressionState, attempt, (exercise.validation.correctOptionId ?? exercise.validation.acceptedAnswers[0]));
  assert.equal(submission.status, 'correct');
  assert.equal(hasUnfinishedMissionProgress(submission.attempt, ''), true);
  assert.equal(hasUnfinishedMissionProgress({ ...submission.attempt, phase: 'complete' }, 'answer'), false);
  assert.equal(hasUnfinishedMissionProgress({ ...submission.attempt, result: { xpAwarded: 20, totalXp: 20, newlyUnlockedChapterIds: [] } }, 'answer'), false);
});

const { resolveMapWorld, worldMapForMission } = require('../src/navigation/worldRoutes.ts');
const { valleyOfDecisions, forestOfVariables, missions: allMissions } = require('../src/game/worldContent.ts');

test('World selection changes map params in place; mission returns retain the owning world without duplicate maps', () => {
  let state = apply(startStack(), StackActions.push('world-map'));
  for (const worldId of [valleyOfDecisions.id, forestOfVariables.id, valleyOfDecisions.id]) {
    state = apply(state, { type: 'SET_PARAMS', payload: { params: { worldId } } });
    assert.deepEqual(names(state), ['index', 'world-map']);
    assert.equal(state.routes.at(-1).params.worldId, worldId);
    const mission = allMissions.find(m => worldMapForMission(m.id).params.worldId === worldId);
    state = apply(state, StackActions.push('mission/[missionId]', { missionId: mission.id }));
    const destination = worldMapForMission(mission.id);
    state = apply(state, StackActions.popTo('world-map', destination.params));
    assert.deepEqual(names(state), ['index', 'world-map']);
    assert.equal(state.routes.at(-1).params.worldId, worldId);
  }
  state = apply(state, StackActions.popTo('index'));
  assert.deepEqual(names(state), ['index']);
  assert.equal(resolveMapWorld('missing').id, forestOfVariables.id);
  assert.equal(resolveMapWorld([valleyOfDecisions.id]).id, forestOfVariables.id);
  assert.equal(worldMapForMission('missing').params.worldId, forestOfVariables.id);
});
