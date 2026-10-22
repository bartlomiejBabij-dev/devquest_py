const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
const { worlds, missions, listArchipelago } = require('../src/game/worldContent.ts');
const { getTotalEarnedXp } = require('../src/game/progression.ts');
let progress, worldId, backHandler, returned;
const jsx = (type, props) => ({ type, props });
const native = {
  View: 'View', Text: 'Text', Pressable: 'Pressable', Modal: 'Modal', ScrollView: 'ScrollView',
  StyleSheet: { create: s => s, absoluteFill: {} },
  Animated: { Value: class { constructor(value) { this.value = value; } }, Text: 'Animated.Text', View: 'Animated.View' },
};
function loadComponent(relative) {
  const filename = path.resolve(__dirname, '../src', relative);
  const compiled = new Module(filename, module);
  compiled.require = id => {
    if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'Fragment' };
    if (id === 'react') return { useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}], useEffect: () => {} };
    if (id === 'react-native') return native;
    if (id === 'react-native-safe-area-context') return { SafeAreaView: 'SafeAreaView' };
    if (id === 'react-native-reanimated') return { useReducedMotion: () => true };
    if (id === 'expo-router') return { useLocalSearchParams: () => ({ worldId }), useRouter: () => ({ setParams: params => { worldId = params.worldId; } }) };
    if (id === '@/game/GameContext') return { useGame: () => ({ progression: progress }) };
    if (id === '@/navigation/useScreenNavigation') return {
      useScreenNavigation: () => ({ returnTo: route => { returned = route; } }), useScreenBack: handler => { backHandler = handler; },
    };
    if (id === '@/components/GameScreen') return { GameScreen: 'GameScreen' };
    if (id === '@/components/NavigationButton') return { NavigationButton: 'NavigationButton' };
    if (id === '@/components/ArchipelagoScenery') return loadComponent('components/ArchipelagoScenery.tsx');
    if (id.startsWith('@/game/') || id.startsWith('@/navigation/') || id === '@/theme') return require(path.resolve(__dirname, '../src', id.slice(2) + '.ts'));
    throw new Error(`Unexpected dependency ${id}`);
  };
  compiled._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, filename);
  return compiled.exports;
}
const MapScreen = loadComponent('app/world-map.tsx').default;
function expand(tree) {
  if (Array.isArray(tree)) return tree.map(expand);
  if (!tree || typeof tree !== 'object') return tree;
  if (typeof tree.type === 'function') return expand(tree.type(tree.props));
  return { ...tree, props: { ...tree.props, children: expand(tree.props?.children), header: expand(tree.props?.header) } };
}
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.props?.children), ...nodes(tree.props?.header)];
}
const text = tree => Array.isArray(tree) ? tree.map(text).join(' ') : typeof tree === 'string' || typeof tree === 'number' ? String(tree) : text(tree?.props?.children ?? []);
const render = () => expand(MapScreen());

test('Real map renders four wrapping tabs, rejects locked chapter access and switches back to the existing three themes', () => {
  progress = { completedMissionIds: missions.slice(0, 18).map(m => m.id) }; // Warden still missing.
  worldId = listArchipelago.id;
  let tree = render();
  const tabs = nodes(tree).filter(n => n.props?.accessibilityRole === 'tab');
  assert.equal(tabs.length, 4);
  const picker = nodes(tree).find(n => n.props?.accessibilityRole === 'tablist');
  assert.equal(picker.props.style.flexWrap, 'wrap');
  assert.equal(tabs[0].props.style({ pressed: false })[0].minHeight >= 48, true);
  assert.match(text(tree), /WORLD LOCKED/);
  assert.ok(text(tree).includes(listArchipelago.unlockRequirement));
  assert.equal(nodes(tree).filter(n => n.props?.accessibilityHint === 'Opens chapter details').length, 0);
  const expected = ['Variables', 'Decisions', 'Caverns', 'Archipelago'];
  for (const i of [0, 1, 2, 3, 0, 3]) {
    nodes(render()).filter(n => n.props?.accessibilityRole === 'tab')[i].props.onPress();
    tree = render(); assert.equal(worldId, worlds[i].id); assert.ok(text(tree).includes(expected[i]));
    assert.equal(nodes(tree).filter(n => n.props?.accessibilityRole === 'tab' && n.props.accessibilityState.selected).length, 1);
  }
  nodes(tree).find(n => n.type === 'NavigationButton').props.onPress(); assert.equal(returned, '/');
  returned = null; backHandler(); assert.equal(returned, '/');
});

test('Real Archipelago map shows six chapters, preserves XP when viewed, and displays UP TO DATE rather than CLEARED', () => {
  worldId = listArchipelago.id;
  for (const n of [19, 20, 21, 22, 23, 24, 25]) {
    progress = { completedMissionIds: missions.slice(0, n).map(m => m.id) };
    const snapshot = JSON.stringify(progress), xp = getTotalEarnedXp(progress), tree = render();
    assert.ok(!text(tree).includes('WORLD LOCKED'));
    const chapterNodes = nodes(tree).filter(v => v.props?.accessibilityHint === 'Opens chapter details');
    assert.equal(chapterNodes.length, 6);
    assert.match(chapterNodes[0].props.accessibilityLabel, n === 19 ? /available/ : /completed/);
    assert.match(chapterNodes[1].props.accessibilityLabel, n === 19 ? /locked/ : n === 20 ? /available/ : /completed/);
    for (const i of [2, 3, 4, 5]) assert.match(chapterNodes[i].props.accessibilityLabel, n > 19 + i ? /completed/ : n === 19 + i ? /available/ : /locked/);
    if (n === 21) assert.match(text(tree), /2\s+\/\s+6/);
    if (n === 23) assert.match(text(tree), /4\s+\/\s+6/);
    if (n === 24) assert.match(text(tree), /5\s+\/\s+6/);
    if (n === 25) assert.match(text(tree), /6\s+\/\s+6/);
    const tab = nodes(tree).find(v => v.props?.accessibilityRole === 'tab' && v.props.accessibilityState.selected);
    assert.ok(!text(tab).includes('CLEARED'));
    if (n === 25) { assert.match(text(tab), /UP TO DATE/); assert.match(text(tree), /AVAILABLE CHAPTERS COMPLETE/); }
    else { assert.ok(!text(tab).includes('UP TO DATE')); assert.ok(!text(tree).includes('AVAILABLE CHAPTERS COMPLETE')); }
    assert.equal(JSON.stringify(progress), snapshot); assert.equal(getTotalEarnedXp(progress), xp);
  }
});
