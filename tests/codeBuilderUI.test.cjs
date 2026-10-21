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
const { eternalLoopExercises } = require('../src/game/cavernBossContent.ts');
const { archipelagoExercises } = require('../src/game/archipelagoContent.ts');
const { whileExercises } = require('../src/game/cavernWhileContent.ts');
const { isExerciseAnswerCorrect } = require('../src/game/exerciseValidation.ts');
const { getVisibleLesson, initialLessonSession, lessonSessionReducer } = require('../src/game/lessonSession.ts');
const { getSpellbookEntryForExercise } = require('../src/game/spellbookContent.ts');
const { setExerciseNote } = require('../src/game/notesStorage.ts');
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

for (const exercise of [...whileExercises, ...eternalLoopExercises, ...archipelagoExercises].filter(e => e.type === 'code-builder')) {
  test(`${exercise.id}: real fragment controls retain drafts for help and notes, recover from wrong order, and never open a text input`, () => {
    let answer = '', incorrect = false, casts = 0;
    const render = () => CodeBuilder({ exercise, answer, incorrect,
      onEdit: action => { answer = editBuilderAnswer(exercise, answer, action); incorrect = false; },
      onSubmit: () => { casts++; incorrect = !isExerciseAnswerCorrect(exercise, answer); } });
    const fragments = () => nodes(render()).filter(n => n.type === 'Pressable' && n.props.accessibilityLabel?.startsWith('Add '));
    const cast = () => nodes(render()).find(n => n.type === 'GameButton');
    const action = label => nodes(render()).find(n => n.type === 'Pressable' && text(n) === label).props.onPress();
    const add = id => fragments().find(n => n.props.accessibilityLabel.endsWith(exercise.fragments.find(f => f.id === id).code.trim())).props.onPress();
    assert.equal(fragments().length, exercise.fragments.length);
    assert.equal(nodes(render()).some(n => n.type === 'TextInput'), false);
    assert.equal(cast().props.disabled, true);
    add(exercise.fragments[0].id);
    const draft = answer;
    let lesson = lessonSessionReducer(initialLessonSession, { type: 'continue', lessonId: exercise.lessonId });
    lesson = lessonSessionReducer(lesson, { type: 'review' });
    assert.ok(getVisibleLesson(exercise, 'answering', false, lesson));
    lesson = lessonSessionReducer(lesson, { type: 'close' });
    assert.equal(getVisibleLesson(exercise, 'answering', false, lesson), null);
    assert.ok(getSpellbookEntryForExercise(exercise.id));
    const notes = setExerciseNote({}, exercise.id, 'Check, print, update.');
    assert.ok(notes[exercise.id]);
    assert.equal(answer, draft);
    assert.equal(fragments().length, exercise.fragments.length - 1, 'controlled remount still excludes the chosen fragment');
    assert.ok(text(render()).includes(exercise.fragments[0].code), 'spaces survive rendering');
    action('Reset');
    for (const id of [...exercise.validation.expectedFragmentIds].reverse()) add(id);
    assert.equal(casts, 0, 'choosing fragments never submits');
    assert.equal(cast().props.disabled, false);
    const wrongDraft = answer; cast().props.onPress();
    assert.equal(incorrect, true); assert.equal(answer, wrongDraft);
    assert.ok(text(render()).includes('Your spell is still here'));
    action('Undo Last'); assert.equal(readFragmentIds(exercise, answer).length, exercise.fragments.length - 1);
    assert.equal(fragments().length, 1); assert.equal(cast().props.disabled, true);
    action('Reset'); assert.equal(fragments().length, exercise.fragments.length);
    for (const id of exercise.validation.expectedFragmentIds) add(id);
    cast().props.onPress(); assert.equal(incorrect, false); assert.equal(casts, 2);
    assert.equal(assembledCode(exercise, answer).split('\n').length, exercise.fragments.length);
    assert.equal(assembledCode(exercise, answer).split('\n').filter(line => line.startsWith('    ')).length, exercise.fragments.filter(f => f.code.startsWith('    ')).length);
  });
}
