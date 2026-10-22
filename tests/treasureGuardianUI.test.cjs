const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
const { treasureGuardianMission: mission, treasureGuardianExercises: questions } = require('../src/game/archipelagoBossContent.ts');
const { missions } = require('../src/game/worldContent.ts');
const { completeMission, getTotalEarnedXp } = require('../src/game/progression.ts');
const { getPlayerStatistics } = require('../src/game/profile.ts');

// Execute the real screen handlers against host hooks, not a native renderer.
let slots = [], cursor = 0, progress, returned, back, effects = [], runEffects = false, cleanups = [], animations = [];
const slot = init => { const i = cursor++; if (!(i in slots)) slots[i] = init(); return i; };
const react = {
  useState: initial => { const i = slot(() => typeof initial === 'function' ? initial() : initial); return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
  useRef: initial => slots[slot(() => ({ current: initial }))],
  useReducer: (reduce, initial) => { const i = slot(() => initial); return [slots[i], action => { slots[i] = reduce(slots[i], action); }]; },
  useEffect: fn => { if (runEffects) { const cleanup = fn(); if (cleanup) cleanups.push(cleanup); } },
};
class Value { constructor(value) { this.value = value; } setValue(value) { this.value = value; } interpolate(config) { return { value: this.value, ...config }; } }
const animated = {
  Value, View: 'Animated.View', Text: 'Animated.Text',
  timing: (value, config) => { const animation = { config, stopped: false, start: () => value.setValue(config.toValue), stop() { this.stopped = true; } }; animations.push(animation); return animation; },
  parallel: items => ({ start: () => items.forEach(a => a.start()), stop: () => items.forEach(a => a.stop()) }),
  sequence: items => ({ start: () => items.forEach(a => a.start()), stop: () => items.forEach(a => a.stop()) }),
};
const native = { View: 'View', Text: 'Text', Pressable: 'Pressable', Modal: 'Modal', TextInput: 'TextInput', Animated: animated,
  StyleSheet: { create: s => s }, Keyboard: { dismiss() {} }, Alert: { alert() {} }, Easing: { out: v => v, cubic: 'cubic' } };
function load(relative) {
  const filename = path.resolve(__dirname, '../src', relative), m = new Module(filename, module);
  m.require = id => {
    if (id === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: 'Fragment' };
    if (id === 'react') return react;
    if (id === 'react-native') return native;
    if (id === 'react-native-safe-area-context') return { SafeAreaView: 'SafeAreaView' };
    if (id === 'react-native-reanimated') return { useReducedMotion: () => true };
    if (id === 'expo-router') return { useLocalSearchParams: () => ({ missionId: mission.id }), useNavigation: () => ({ dispatch() {} }) };
    if (id === 'expo-router/react-navigation') return { usePreventRemove() {} };
    if (id === '@/navigation/useScreenNavigation') return { useScreenNavigation: () => ({ returnTo: route => { returned = route; }, reset() {} }), useScreenBack: fn => { back = fn; } };
    if (id === '@/audio/AudioProvider') return { useGameAudio: () => ({ playEffect: effect => effects.push(effect) }) };
    if (id === '@/game/GameContext') return { useGame: () => ({ progression: progress, dispatchProgression: action => { progress = completeMission(progress, action.missionId).progress; } }) };
    if (id.startsWith('@/components/')) { const name = id.split('/').at(-1); return { [name]: name }; }
    if (id.startsWith('@/game/') || id.startsWith('@/navigation/') || id === '@/theme') return require(path.resolve(__dirname, '../src', id.slice(2) + '.ts'));
    throw new Error(`Unexpected dependency ${id}`);
  };
  m._compile('const setTimeout = fn => { fn(); return 0; }; const clearTimeout = () => {};\n' + ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, filename);
  return m.exports;
}
const Screen = load('app/mission/[missionId].tsx').default;
const Encounter = load('components/TreasureGuardianEncounter.tsx').TreasureGuardianEncounter;
const nodes = tree => Array.isArray(tree) ? tree.flatMap(nodes) : !tree || typeof tree !== 'object' ? [] : [tree, ...nodes(tree.props?.children), ...nodes(tree.props?.header)];
const text = tree => Array.isArray(tree) ? tree.map(text).join(' ') : typeof tree === 'string' || typeof tree === 'number' ? String(tree) : text(tree?.props?.children ?? []);
const render = () => { cursor = 0; return Screen(); };
const find = type => nodes(render()).find(n => n.type === type);
const press = label => nodes(render()).find(n => n.props?.accessibilityLabel === label).props.onPress();
const hp = () => find('TreasureGuardianEncounter').props.hp;

test('Real mission screen guards locked entry and retains feedback/drafts through recap and Spellbook; victory/replay render actual XP', () => {
  progress = { completedMissionIds: missions.slice(0, 24).map(m => m.id) };
  assert.match(text(render()), /Mission locked/); assert.equal(find('TreasureGuardianEncounter'), undefined);
  slots = []; progress = { completedMissionIds: missions.slice(0, 25).map(m => m.id) }; effects = [];
  assert.equal(hp(), 100); assert.equal(find('LessonCard'), undefined, 'recap is optional');
  const returnRoute = { pathname: '/world-map', params: { worldId: 'python-list-archipelago' } };
  for (const reward of [100, 0]) {
    for (const [i, e] of questions.entries()) {
      assert.equal(hp(), 100 - 20 * i);
      if (e.type === 'code-builder') {
        const reversed = [...e.validation.expectedFragmentIds].reverse();
        for (const id of reversed) find('CodeBuilder').props.onEdit({ type: 'add', id });
        const draft = find('CodeBuilder').props.answer; assert.equal(hp(), 100 - 20 * i);
        find('CodeBuilder').props.onSubmit(); assert.equal(find('CodeBuilder').props.incorrect, true);
        press('Review Lesson'); assert.equal(find('LessonCard').props.reviewing, true);
        find('LessonCard').props.onContinue();
        assert.equal(find('CodeBuilder').props.answer, draft); assert.equal(find('CodeBuilder').props.incorrect, true);
        press('Open Spellbook for this exercise'); assert.equal(find('SpellbookEntryView').props.exerciseId, e.id);
        find('SpellbookEntryView').props.onClose();
        assert.equal(find('CodeBuilder').props.answer, draft); assert.equal(find('CodeBuilder').props.incorrect, true);
        find('CodeBuilder').props.onEdit({ type: 'undo' }); assert.equal(hp(), 100 - 20 * i);
        find('CodeBuilder').props.onEdit({ type: 'reset' }); assert.equal(hp(), 100 - 20 * i);
        for (const id of e.validation.expectedFragmentIds) find('CodeBuilder').props.onEdit({ type: 'add', id });
        const submit = find('CodeBuilder').props.onSubmit; submit(); submit();
      } else {
        const wrong = e.options.find(o => o.id !== e.validation.correctOptionId).id;
        find('AnswerChoices').props.onSelect(wrong); assert.equal(hp(), 100 - 20 * i);
        press('Review Lesson'); find('LessonCard').props.onContinue();
        assert.equal(find('AnswerChoices').props.selectedId, wrong); assert.equal(find('AnswerChoices').props.incorrect, true);
        const submit = find('AnswerChoices').props.onSelect; submit(e.validation.correctOptionId); submit(e.validation.correctOptionId);
      }
      assert.equal(hp(), 80 - i * 20); assert.ok(text(render()).includes(e.explanation));
      assert.equal(getTotalEarnedXp(progress), reward === 100 && i < 4 ? 1180 : 1280);
      const next = nodes(render()).find(n => n.type === 'GameButton' && ['Continue', 'See Mission Result'].includes(n.props.label));
      assert.ok(next); assert.equal(next.props.disabled, false); next.props.onPress();
    }
    const result = text(render()); assert.match(result, /WORLD\s+4\s+CLEARED!/); assert.match(result, /THE TREASURE GUARDIAN DEFEATED!/);
    assert.match(result, new RegExp(`\\+ ${reward}|\\+${reward}`)); assert.match(result, /1280/);
    if (!reward) assert.match(result, /XP was already earned/);
    assert.equal(getPlayerStatistics(progress).defeatedBosses, 4);
    nodes(render()).find(n => n.type === 'GameButton' && n.props.label === 'Return to World Map').props.onPress(); assert.deepEqual(returned, returnRoute);
    back(); assert.deepEqual(returned, returnRoute);
    if (reward) { press('Replay Mission'); assert.equal(hp(), 100); assert.equal(find('LessonCard'), undefined); }
  }
  assert.equal(effects.filter(e => e === 'correct').length, 10); assert.equal(effects.filter(e => e === 'bossVictory').length, 2);
});

test('Original Guardian art exposes exact health, damage and defeat; motion is bounded, cancellable and optional', () => {
  runEffects = true;
  for (const reducedMotion of [false, true]) {
    slots = []; animations = []; cleanups = [];
    const draw = (hp, hitCount, showDamage) => { cursor = 0; return Encounter({ hp, hitCount, showDamage, reducedMotion }); };
    let tree = draw(100, 0, false);
    assert.equal(nodes(tree).find(n => n.props?.accessibilityRole === 'progressbar').props.accessibilityValue.now, 100);
    assert.equal(animations.length, 0);
    tree = draw(80, 1, true); assert.match(text(tree), /−\s*20\s+HP/);
    tree = draw(0, 5, true); assert.match(text(tree), /GUARDIAN DEFEATED/);
    assert.ok(nodes(tree).some(n => n.props?.accessibilityLabel?.includes('vault opens')));
    assert.equal(nodes(tree).find(n => n.props?.accessibilityRole === 'progressbar').props.accessibilityValue.now, 0);
    if (reducedMotion) assert.equal(animations.length, 0);
    else { assert.ok(animations.every(a => a.config.duration <= 780)); cleanups.forEach(fn => fn()); assert.ok(animations.every(a => a.stopped)); }
  }
  runEffects = false;
});
