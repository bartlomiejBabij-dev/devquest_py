const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
const { builderExercises } = require('../src/game/cavernBuilderContent.ts');
const { editBuilderAnswer, readFragmentIds, assembledCode } = require('../src/game/codeBuilder.ts');

// Render the real controlled component to a host-element tree without a native runtime.
// This tests controls and remounts, not Android layout, gestures or hardware Back.
const filename = path.resolve(__dirname, '../src/components/CodeBuilder.tsx');
const compiled = new Module(filename, module);
compiled.filename = filename;
compiled.require = id => {
  if (id === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
  if (id === 'react-native') return { Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View', StyleSheet: { create: s => s } };
  if (id === './GameButton') return { GameButton: 'GameButton' };
  if (id === '@/theme') return require('../src/theme.ts');
  if (id === '@/game/codeBuilder') return require('../src/game/codeBuilder.ts');
  throw new Error(`Unexpected component dependency: ${id}`);
};
compiled._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
}).outputText, filename);
const { CodeBuilder } = compiled.exports;
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.props?.children)];
}
const text = tree => Array.isArray(tree) ? tree.map(text).join('') : typeof tree === 'string' || typeof tree === 'number' ? String(tree) : text(tree?.props?.children ?? []);

test('Real CodeBuilder controls build/undo/reset explicitly; partial drafts survive unmount/remount for help', () => {
  const exercise = builderExercises.find(e => e.type === 'code-builder');
  let answer = '', submissions = 0, incorrect = false;
  const render = () => CodeBuilder({ exercise, answer, incorrect, onEdit: action => { answer = editBuilderAnswer(exercise, answer, action); incorrect = false; }, onSubmit: () => { submissions++; } });
  const button = label => nodes(render()).find(n => n.type === 'Pressable' && text(n) === label);
  const cast = () => nodes(render()).find(n => n.type === 'GameButton');
  assert.equal(cast().props.disabled, true);
  assert.equal(button('Undo Last').props.disabled, true);
  assert.equal(button('Reset').props.disabled, true);
  assert.equal(nodes(render()).some(n => n.type === 'TextInput'), false);
  const add = () => nodes(render()).filter(n => n.type === 'Pressable' && n.props.accessibilityLabel?.startsWith('Add '));
  assert.equal(add().length, 2);
  assert.ok(add()[0].props.accessibilityLabel.includes('indented line'));
  add()[0].props.onPress(); // Start deliberately in the wrong order.
  assert.equal(submissions, 0, 'selecting never submits');
  assert.equal(add().length, 1);
  const retainedDraft = answer;
  // Hiding the exercise for Review Lesson or Spellbook discards its rendered subtree only.
  for (const overlay of ['Review Lesson', 'Spellbook']) {
    const remounted = render();
    assert.equal(answer, retainedDraft, overlay);
    assert.ok(text(remounted).includes('    print("Step")'), 'leading spaces preserved');
    assert.equal(cast().props.disabled, true);
  }
  add()[0].props.onPress();
  assert.equal(cast().props.disabled, false);
  cast().props.onPress(); assert.equal(submissions, 1);
  incorrect = true;
  assert.ok(text(render()).includes('Not quite. Your spell is still here.'));
  assert.equal(readFragmentIds(exercise, answer).length, 2);
  button('Undo Last').props.onPress();
  assert.equal(readFragmentIds(exercise, answer).length, 1);
  assert.equal(incorrect, false);
  button('Reset').props.onPress();
  assert.equal(answer, ''); assert.equal(add().length, 2);
  for (const id of exercise.validation.expectedFragmentIds) {
    const fragment = exercise.fragments.find(f => f.id === id);
    add().find(n => n.props.accessibilityLabel.endsWith(fragment.code.trim())).props.onPress();
  }
  assert.equal(assembledCode(exercise, answer), 'for step in range(2):\n    print("Step")');
  assert.equal(submissions, 1, 'rebuilding does not auto-submit');
  cast().props.onPress(); assert.equal(submissions, 2);
  const solved = CodeBuilder({ exercise, answer, incorrect: false, solved: true, onEdit: () => assert.fail('solved edit'), onSubmit: () => assert.fail('solved submit') });
  assert.equal(nodes(solved).filter(n => n.type === 'Pressable' || n.type === 'GameButton').length, 0);
  assert.ok(text(solved).includes(assembledCode(exercise, answer)));
  // The mission's existing Continue/replay paths clear the parent answer.
  answer = '';
  assert.equal(cast().props.disabled, true);
  assert.equal(readFragmentIds(exercise, answer).length, 0);
});
