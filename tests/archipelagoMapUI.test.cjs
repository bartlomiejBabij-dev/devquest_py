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
    if (id === '@/components/ForgeScenery') return loadComponent('components/ForgeScenery.tsx');
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

test('Real map renders five wrapping tabs, rejects locked chapter access and switches back to the existing three themes', () => {
  progress = { completedMissionIds: missions.slice(0, 18).map(m => m.id) }; // Warden still missing.
  worldId = listArchipelago.id;
  let tree = render();
  const tabs = nodes(tree).filter(n => n.props?.accessibilityRole === 'tab');
  assert.equal(tabs.length, 5);
  const picker = nodes(tree).find(n => n.props?.accessibilityRole === 'tablist');
  assert.equal(picker.props.style.flexWrap, 'wrap');
  assert.equal(tabs[0].props.style({ pressed: false })[0].minHeight >= 48, true);
  assert.match(text(tree), /WORLD LOCKED/);
  assert.ok(text(tree).includes(listArchipelago.unlockRequirement));
  assert.equal(nodes(tree).filter(n => n.props?.accessibilityHint === 'Opens chapter details').length, 0);
  const expected = ['Variables', 'Decisions', 'Caverns', 'Archipelago', 'Forge'];
  for (const i of [0, 1, 2, 3, 4, 0, 3]) {
    nodes(render()).filter(n => n.props?.accessibilityRole === 'tab')[i].props.onPress();
    tree = render(); assert.equal(worldId, worlds[i].id); assert.ok(text(tree).includes(expected[i]));
    assert.equal(nodes(tree).filter(n => n.props?.accessibilityRole === 'tab' && n.props.accessibilityState.selected).length, 1);
  }
  nodes(tree).find(n => n.type === 'NavigationButton').props.onPress(); assert.equal(returned, '/');
  returned = null; backHandler(); assert.equal(returned, '/');
});

test('Real Archipelago map shows seven chapters, preserves XP, and clears World 4 only after the Guardian', () => {
  worldId = listArchipelago.id;
  for (const n of [19, 20, 21, 22, 23, 24, 25, 26]) {
    progress = { completedMissionIds: missions.slice(0, n).map(m => m.id) };
    const snapshot = JSON.stringify(progress), xp = getTotalEarnedXp(progress), tree = render();
    assert.ok(!text(tree).includes('WORLD LOCKED'));
    const chapterNodes = nodes(tree).filter(v => v.props?.accessibilityHint === 'Opens chapter details');
    assert.equal(chapterNodes.length, 7);
    assert.match(chapterNodes[0].props.accessibilityLabel, n === 19 ? /available/ : /completed/);
    assert.match(chapterNodes[1].props.accessibilityLabel, n === 19 ? /locked/ : n === 20 ? /available/ : /completed/);
    for (const i of [2, 3, 4, 5, 6]) assert.match(chapterNodes[i].props.accessibilityLabel, n > 19 + i ? /completed/ : n === 19 + i ? /available/ : /locked/);
    if (n === 21) assert.match(text(tree), /2\s+\/\s+7/);
    if (n === 23) assert.match(text(tree), /4\s+\/\s+7/);
    if (n === 24) assert.match(text(tree), /5\s+\/\s+7/);
    if (n === 25) assert.match(text(tree), /6\s+\/\s+7/);
    const tab = nodes(tree).find(v => v.props?.accessibilityRole === 'tab' && v.props.accessibilityState.selected);
    if (n === 26) { assert.match(text(tab), /CLEARED/); assert.match(text(tree), /GUARDIAN DEFEATED/); assert.match(text(tree), /7\s+\/\s+7/); } else { assert.ok(!text(tab).includes('CLEARED')); }
    assert.ok(!text(tab).includes('UP TO DATE')); assert.ok(!text(tree).includes('AVAILABLE CHAPTERS COMPLETE'));
    if (n === 25) assert.match(text(tree), /FACE THE GUARDIAN/);
    assert.equal(JSON.stringify(progress), snapshot); assert.equal(getTotalEarnedXp(progress), xp);
  }
});

test('Function Forge uses the wrapping five-world picker, guards locked links and finishes available chapters without a world clear', () => {
  const forge = worlds[4]; worldId = forge.id;
  for (const n of [25, 26, 27, 28]) {
    progress = { completedMissionIds: missions.slice(0, n).map(m => m.id) };
    const snapshot = JSON.stringify(progress), tree = render();
    assert.match(text(tree), /Function\s+Forge/);
    assert.ok(nodes(tree).some(v => v.props?.accessibilityLabel?.includes('glowing golden anvil')));
    const tabs = nodes(tree).filter(v => v.props?.accessibilityRole === 'tab');
    assert.equal(tabs.length, 5);
    assert.equal(nodes(tree).find(v => v.props?.accessibilityRole === 'tablist').props.style.flexWrap, 'wrap');
    assert.equal(tabs[4].props.style({ pressed: false })[0].flexBasis, '45%');
    assert.equal(tabs[4].props.style({ pressed: false })[0].minWidth, 130);
    const stops = nodes(tree).filter(v => v.props?.accessibilityHint === 'Opens chapter details');
    if (n === 25) { assert.equal(stops.length, 0); assert.match(text(tree), /WORLD LOCKED/); assert.ok(text(tree).includes(forge.unlockRequirement)); }
    else {
      assert.equal(stops.length, 2);
      assert.match(stops[0].props.accessibilityLabel, n === 26 ? /available/ : /completed/);
      assert.match(stops[1].props.accessibilityLabel, n === 26 ? /locked/ : n === 27 ? /available/ : /completed/);
      assert.match(text(tree), /2\s+CHAPTERS AVAILABLE/); assert.match(text(tree), /6\s+PYTHON SPELLS/);
    }
    assert.ok(!text(tabs[4]).includes('CLEARED'));
    if (n === 28) { assert.match(text(tabs[4]), /UP TO DATE/); assert.match(text(tree), /AVAILABLE CHAPTERS COMPLETE/); }
    else assert.ok(!text(tabs[4]).includes('UP TO DATE'));
    assert.equal(JSON.stringify(progress), snapshot);
    nodes(tree).find(v => v.type === 'NavigationButton').props.onPress(); assert.equal(returned, '/');
    backHandler(); assert.equal(returned, '/');
  }
});
