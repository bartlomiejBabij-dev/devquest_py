const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
const { worlds, chapters, missions, exercises } = require('../src/game/worldContent.ts');
const { lessons, getLessonForExercise } = require('../src/game/lessonContent.ts');
const { initialLessonSession, getVisibleLesson, lessonSessionReducer } = require('../src/game/lessonSession.ts');
const { isChoiceExercise, isExerciseAnswerCorrect, getIncorrectAnswerFeedback } = require('../src/game/exerciseValidation.ts');
const { getPlayableMission, startMissionAttempt, submitMissionAnswer, continueMissionAttempt } = require('../src/game/worldMission.ts');
const { getTotalEarnedXp, isMissionCompleted, isMissionUnlocked, isWorldUnlocked } = require('../src/game/progression.ts');
const { createProgressionStore, parseSavedProgression } = require('../src/game/progressionStorage.ts');
const { getPlayerStatistics, getAchievements } = require('../src/game/profile.ts');
const { exerciseSpellbookEntryIds, getSpellbookEntryForExercise } = require('../src/game/spellbookContent.ts');
const { createNotesStore, setExerciseNote } = require('../src/game/notesStorage.ts');
const baseline = require('./fixtures/strings-debugging-compatibility.json');
const targetIds = ['python-forest-talking-trees-01', 'python-forest-broken-spells-01'];
const targetMissions = targetIds.map(id => missions.find(m => m.id === id));
const targetExercises = targetMissions.flatMap(m => m.exerciseIds.map(id => exercises.find(e => e.id === id)));
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const find = suffix => exercises.find(e => e.id === `python-forest-${suffix}`);

// Independent curriculum review: code, intended choice, and every distractor.
const reviewed = [
  ['talking-trees-output', 'b', 'Hello, Pyromancer', 'greeting = "Hello"\nname = "Pyromancer"\nprint(greeting + ", " + name)', ['HelloPyromancer', 'greeting, name', 'Hello,Pyromancer']],
  ['talking-trees-variable', 'c', 'Oak', 'tree = "Oak"\nprint(tree)', ['tree', '"Oak"']],
  ['talking-trees-repeat', 'b', 'hahaha', 'print("ha" * 3)', ['ha ha ha', 'ha3', '6']],
  ['talking-trees-length', 'c', '6', 'print(len("forest"))', ['8', 'forest']],
  ['talking-trees-repair', 'c', '"3"', 'word = "Moon"\nprint(word + ____)', ['3', 'word']],
  ['broken-spells-name', 'c', 'print(energy)', 'energy = 7\nprint(enrgy)', ['print("energy")', 'print(enrgy)']],
  ['broken-spells-parenthesis', 'b', ')', 'print("Start"', ['"', '(']],
  ['broken-spells-quotes', 'a', 'print("Fire")', 'print(Fire)', ['print(Fire)', 'print("Fire)']],
  ['broken-spells-assignment', 'c', 'mana = 5', 'mana == 5\nprint(mana)', ['mana == 5', 'mana = "5"']],
  ['broken-spells-debug', 'b', 'print(power)', 'power = 3\nprint("power")', ['print("power")', 'print(power + 1)']],
];

test('Strings/debugging preserve every world, chapter, mission, reward, other exercise and previous lesson', () => {
  assert.equal(hash(worlds), baseline.worlds);
  assert.equal(hash(chapters), baseline.chapters);
  assert.equal(hash(missions), baseline.missions);
  assert.equal(hash(exerciseSpellbookEntryIds), baseline.spellbookLinks);
  assert.deepEqual(new Set(Object.keys(baseline.unchangedExercises)), new Set(exercises.filter(e => !targetExercises.includes(e)).map(e => e.id)));
  assert.equal(Object.keys(baseline.unchangedExercises).length, 30);
  for (const [id, expected] of Object.entries(baseline.unchangedExercises)) assert.equal(hash(exercises.find(e => e.id === id)), expected, id);
  for (const [id, expected] of Object.entries(baseline.existingLessons)) assert.equal(hash(lessons.find(l => l.id === id)), expected, id);
  assert.equal(Object.keys(baseline.existingLessons).length, 11);
  assert.deepEqual(targetMissions.map(m => m.xpReward), [50, 60]);
  assert.deepEqual(targetMissions.map(m => m.exerciseIds.length), [5, 5]);
  assert.deepEqual(targetExercises.map(e => e.id), reviewed.map(r => `python-forest-${r[0]}`));
  assert.ok(targetExercises.every(isChoiceExercise), 'all ten questions require taps, not a keyboard');
  assert.equal(targetExercises.slice(0, 5).filter(e => e.type === 'output-choice').length, 4);
  assert.equal(targetExercises.slice(0, 5).filter(e => e.type === 'missing-token').length, 1);
  assert.equal(targetExercises.slice(5).filter(e => e.type === 'multiple-choice').length, 4);
});

test('Reviewed choices have one correct stable ID, unique answers and specific feedback; raw text never passes', () => {
  for (const [suffix, letter, label, code, distractors] of reviewed) {
    const exercise = find(suffix);
    const correctId = `${exercise.id}-${letter}`;
    assert.equal(exercise.code, code);
    assert.equal(exercise.validation.correctOptionId, correctId);
    assert.equal(exercise.options.find(o => o.id === correctId).label, label);
    assert.deepEqual(exercise.options.filter(o => o.id !== correctId).map(o => o.label), distractors);
    assert.equal(new Set(exercise.options.map(o => o.id)).size, exercise.options.length);
    assert.equal(new Set(exercise.options.map(o => o.label)).size, exercise.options.length);
    assert.ok(exercise.options.length >= 3 && exercise.options.length <= 4);
    assert.equal(exercise.options.filter(o => isExerciseAnswerCorrect(exercise, o.id)).length, 1);
    for (const option of exercise.options) {
      assert.equal(isExerciseAnswerCorrect(exercise, option.id), option.id === correctId);
      assert.equal(isExerciseAnswerCorrect(exercise, option.label), false);
      assert.ok(option.feedback.length > 30);
      if (option.id !== correctId) assert.equal(getIncorrectAnswerFeedback(exercise, option.id), option.feedback);
    }
    for (const invalid of ['', 'unknown', 'toString', `${correctId} `, correctId.toUpperCase(), 'python-forest-awakening-print-b']) assert.equal(isExerciseAnswerCorrect(exercise, invalid), false);
    assert.equal(isExerciseAnswerCorrect({ ...exercise, options: [...exercise.options].reverse() }, correctId), true);
    assert.equal(isExerciseAnswerCorrect({ ...exercise, options: exercise.options.filter(o => o.id !== correctId) }, correctId), false);
  }
});

test('String output preserves exact spaces, quotes and repeated text; len counts characters, not quote marks', () => {
  // These fixed ASCII calculations independently check the reviewed snippets above.
  // No content or player input is executed as Python or JavaScript.
  const outputs = [
    ['talking-trees-output', 'Hello' + ', ' + 'Pyromancer'],
    ['talking-trees-variable', 'Oak'],
    ['talking-trees-repeat', 'ha'.repeat(3)],
    ['talking-trees-length', String('forest'.length)],
  ];
  for (const [suffix, output] of outputs) {
    const exercise = find(suffix);
    assert.equal(exercise.options.find(o => o.id === exercise.validation.correctOptionId).label, output);
    assert.equal(exercise.options.filter(o => o.label === output).length, 1);
  }
  assert.notEqual('Hello, Pyromancer', 'Hello,Pyromancer');
  assert.notEqual('Hello, Pyromancer', 'Hello,  Pyromancer');
  assert.equal('Moon' + '3', 'Moon3');
  assert.match(find('talking-trees-repair').explanation, /fails.*string and a number/);
});

test('Broken examples distinguish syntax errors, undefined names and valid code with unwanted output', () => {
  // Frozen, manually reviewed Python outcomes. Tests bind each outcome to its
  // exact authored snippet/fix instead of executing arbitrary strings.
  const repairs = [
    ['broken-spells-name', 'energy = 7\nprint(energy)', '7', 'undefined-name'],
    ['broken-spells-parenthesis', 'print("Start")', 'Start', 'syntax'],
    ['broken-spells-quotes', 'print("Fire")', 'Fire', 'undefined-name'],
    ['broken-spells-assignment', 'mana = 5\nprint(mana)', '5', 'undefined-name'],
    ['broken-spells-debug', 'power = 3\nprint(power)', '3', 'unwanted-output'],
  ];
  for (const [suffix, fixed, output, problem] of repairs) {
    const exercise = find(suffix);
    const selected = exercise.options.find(o => o.id === exercise.validation.correctOptionId).label;
    const lines = exercise.code.split('\n');
    let repair;
    if (suffix === 'broken-spells-parenthesis') repair = exercise.code + selected;
    else if (suffix === 'broken-spells-assignment') repair = [selected, lines[1]].join('\n');
    else repair = [...lines.slice(0, -1), selected].join('\n');
    assert.equal(repair, fixed);
    if (problem === 'syntax') assert.match(exercise.explanation, /syntax error/);
    if (problem === 'undefined-name') assert.match(exercise.explanation, /undefined/);
    if (problem === 'unwanted-output') {
      assert.match(exercise.explanation, /valid Python/);
      assert.match(exercise.explanation, /not a syntax error/);
    }
    assert.ok(exercise.explanation.includes(output), `${suffix}: explanation should identify the reviewed result`);
  }
  assert.match(find('broken-spells-assignment').prompt, /number 5/, 'quoted 5 prints the same text but fails the stated numeric-storage goal');
  assert.match(find('broken-spells-assignment').options[1].feedback, /runs, but stores text/);
  assert.match(find('broken-spells-quotes').options[2].feedback, /never closes its quote/);
  assert.match(find('broken-spells-debug').options[2].feedback, /adds one and displays 4/);
  assert.match(find('broken-spells-name').prompt, /Only energy has been defined/);
  assert.match(find('broken-spells-quotes').prompt, /not a defined variable/);
});

const lessonReview = [
  ['joining-text', 'greeting = "Welcome, "\nhero = "Ranger"\nprint(greeting + hero)', 'Welcome, Ranger', /adds no spaces/],
  ['repeat-count-text', 'print("Ho" * 2)\nprint(len("Hi!"))', 'HoHo\n3', /len\(\) first/],
  ['text-versus-number', 'print("Rune" + "2")\nprint(4 + 2)', 'Rune2\n6', /two strings/],
  ['debug-names', 'spark = 9\nprint(spark)', '9', /Debugging means finding and fixing/],
  ['debug-pairs', 'print("Lantern lit")', 'Lantern lit', /syntax error/],
  ['debug-values', 'charge = 6\nprint(charge)\nprint("charge")', '6\ncharge', /== compares values and does not store/],
];

test('Six lessons have accurate reviewed examples, short explanations and no copied question answers', () => {
  for (const [suffix, code, output, concept] of lessonReview) {
    const lesson = lessons.find(l => l.id === `python-lesson-${suffix}`);
    assert.ok(lesson);
    assert.equal(lesson.codeExample, code);
    assert.equal(lesson.expectedOutput, output);
    const prose = [lesson.explanation, lesson.whyItWorks, lesson.importantRule].join(' ');
    assert.match(prose, concept);
    assert.ok(prose.split(/\s+/).length <= 110);
    for (const field of ['title', 'explanation', 'codeExample', 'expectedOutput', 'whyItWorks', 'importantRule']) assert.ok(lesson[field].trim());
  }
  const newIds = new Set(lessonReview.map(r => `python-lesson-${r[0]}`));
  for (const exercise of exercises) assert.equal(newIds.has(exercise.lessonId), targetExercises.includes(exercise));
  for (const exercise of targetExercises) {
    const lesson = getLessonForExercise(exercise);
    assert.notEqual(lesson.codeExample, exercise.code);
    assert.notEqual(lesson.expectedOutput, exercise.options.find(o => o.id === exercise.validation.correctOptionId).label);
  }
});

test('Concepts are introduced before assessment using three cards per mission, with optional review on replay', () => {
  const sequence = [
    ['joining-text', 'joining-text', 'repeat-count-text', 'repeat-count-text', 'text-versus-number'],
    ['debug-names', 'debug-pairs', 'debug-pairs', 'debug-values', 'debug-values'],
  ];
  targetMissions.forEach((mission, index) => {
    let session = initialLessonSession;
    const introduced = [];
    mission.exerciseIds.forEach((id, exerciseIndex) => {
      const exercise = exercises.find(e => e.id === id);
      assert.equal(exercise.lessonId, `python-lesson-${sequence[index][exerciseIndex]}`);
      const view = getVisibleLesson(exercise, 'answering', false, session);
      if (view) {
        assert.equal(view.introduction, true);
        introduced.push(exerciseIndex);
        session = lessonSessionReducer(session, { type: 'continue', lessonId: view.lesson.id });
      }
      assert.ok(session.seenLessonIds.includes(exercise.lessonId));
      assert.equal(getVisibleLesson(exercise, 'answering', false, session), null);
      assert.equal(getVisibleLesson(exercise, 'answering', true, initialLessonSession), null);
      const review = lessonSessionReducer(session, { type: 'review' });
      assert.equal(getVisibleLesson(exercise, 'answering', true, review)?.lesson.id, exercise.lessonId);
      assert.equal(getVisibleLesson(exercise, 'solved', true, review)?.introduction, false);
      assert.equal(getVisibleLesson(exercise, 'answering', true, lessonSessionReducer(review, { type: 'close' })), null);
    });
    assert.deepEqual(introduced, index === 0 ? [0, 2, 4] : [0, 1, 3]);
  });
});

test('Wrong answers and help preserve state; correct answers solve once, require Continue and pay 50/60 XP only once', () => {
  targetMissions.forEach((mission, index) => {
    assert.equal(startMissionAttempt({ completedMissionIds: [] }, mission.id), null);
    let progress = { completedMissionIds: missions.slice(0, index + 3).map(m => m.id) };
    for (let replay = 0; replay < 2; replay++) {
      let attempt = startMissionAttempt(progress, mission.id);
      let earned = 0;
      for (const exercise of getPlayableMission(progress, mission.id).exercises) {
        const answer = exercise.validation.correctOptionId;
        for (const option of exercise.options.filter(o => o.id !== answer)) {
          const wrong = submitMissionAnswer(progress, attempt, option.id);
          assert.equal(wrong.status, 'incorrect');
          assert.equal(wrong.attempt, attempt);
          assert.equal(wrong.progress, progress);
          assert.equal(wrong.xpAwarded, 0);
          const before = JSON.stringify({ attempt, progress, selection: option.id });
          const review = lessonSessionReducer(initialLessonSession, { type: 'review' });
          assert.ok(getVisibleLesson(exercise, 'answering', replay === 1, review));
          assert.ok(getSpellbookEntryForExercise(exercise.id));
          lessonSessionReducer(review, { type: 'continue', lessonId: exercise.lessonId });
          assert.equal(JSON.stringify({ attempt, progress, selection: option.id }), before);
        }
        const solved = submitMissionAnswer(progress, attempt, answer);
        assert.equal(solved.status, 'correct');
        assert.equal(solved.attempt.phase, 'solved');
        assert.equal(solved.attempt.solvedExerciseIds.length, attempt.solvedExerciseIds.length + 1);
        assert.equal(solved.xpAwarded, replay === 0 && attempt.exerciseIndex === 4 ? [50, 60][index] : 0);
        const duplicate = submitMissionAnswer(solved.progress, solved.attempt, answer);
        assert.equal(duplicate.status, 'ignored');
        assert.equal(duplicate.attempt, solved.attempt);
        assert.equal(duplicate.xpAwarded, 0);
        earned += solved.xpAwarded;
        progress = solved.progress;
        attempt = continueMissionAttempt(solved.attempt, 5);
        assert.equal(continueMissionAttempt(attempt, 5), attempt);
      }
      assert.equal(attempt.phase, 'complete');
      assert.equal(earned, replay === 0 ? [50, 60][index] : 0);
      assert.equal(getTotalEarnedXp(progress), [140, 200][index]);
    }
  });
});

test('Legacy completion records restore unchanged XP, stats, achievements and prerequisites at every completion point', async () => {
  for (let count = 0; count <= missions.length; count++) {
    const ids = missions.slice(0, count).map(m => m.id);
    const loaded = parseSavedProgression(JSON.stringify({ version: 1, completedMissionIds: ids }));
    assert.equal(loaded.status, 'ready');
    assert.deepEqual(loaded.progression.completedMissionIds, ids);
    assert.equal(getTotalEarnedXp(loaded.progression), [0, 20, 50, 90, 140, 200, 300, 370, 450][count]);
    assert.equal(getPlayerStatistics(loaded.progression).completedExercises, count * 5);
    assert.equal(isWorldUnlocked(loaded.progression, 'python-valley-of-decisions'), count >= 6);
    assert.equal(getAchievements(loaded.progression).find(a => a.id === 'goblin-slayer').unlocked, count >= 6);
    assert.equal(isMissionUnlocked(loaded.progression, targetIds[0]), count >= 3);
    assert.equal(isMissionUnlocked(loaded.progression, targetIds[1]), count >= 4);
    for (const id of ids) assert.equal(isMissionCompleted(loaded.progression, id), true);
    const data = new Map();
    const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
    await createProgressionStore(storage).save(loaded.progression);
    assert.deepEqual((await createProgressionStore(storage).load()).progression, loaded.progression);
  }
});

test('Every existing Spellbook link and exercise note survives the strings/debugging conversion', async () => {
  const links = ['python-concatenation', 'python-strings', 'python-strings', 'python-length', 'python-concatenation', 'python-debugging', 'python-syntax', 'python-syntax', 'python-variables', 'python-debugging'];
  let notes = {};
  targetExercises.forEach((exercise, index) => {
    assert.equal(getSpellbookEntryForExercise(exercise.id)?.id, links[index]);
    notes = setExerciseNote(notes, exercise.id, `Saved reminder ${index}`);
  });
  const data = new Map();
  const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
  await createNotesStore(storage).save(notes);
  assert.deepEqual((await createNotesStore(storage).load()).notes, notes);
});
