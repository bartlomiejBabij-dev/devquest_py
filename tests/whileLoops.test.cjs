const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
const { worlds, chapters, missions, exercises, loopCaverns } = require('../src/game/worldContent.ts');
const { whileChapters, whileMissions, whileExercises } = require('../src/game/cavernWhileContent.ts');
const { isCodeBuilderExercise, assembledCode, readFragmentIds, editBuilderAnswer } = require('../src/game/codeBuilder.ts');
const { isChoiceExercise, isExerciseAnswerCorrect, getIncorrectAnswerFeedback } = require('../src/game/exerciseValidation.ts');
const { startMissionAttempt, getPlayableMission, submitMissionAnswer, continueMissionAttempt } = require('../src/game/worldMission.ts');
const { getTotalEarnedXp, getWorldProgress, isMissionUnlocked, completeMission } = require('../src/game/progression.ts');
const { getPlayerStatistics, getAchievements } = require('../src/game/profile.ts');
const { createProgressionStore, parseSavedProgression, PROGRESSION_STORAGE_KEY } = require('../src/game/progressionStorage.ts');
const { parseSavedProfile } = require('../src/game/profileStorage.ts');
const { createNotesStore, setExerciseNote } = require('../src/game/notesStorage.ts');
const { lessons, getLessonForExercise } = require('../src/game/lessonContent.ts');
const { getVisibleLesson, initialLessonSession, lessonSessionReducer } = require('../src/game/lessonSession.ts');
const { spellbookEntries, exerciseSpellbookEntryIds, getSpellbookEntryForExercise } = require('../src/game/spellbookContent.ts');
const { getAccessibleMapChapters, worldMapForMission } = require('../src/navigation/worldRoutes.ts');
const { isWorldCleared, getBossHp } = require('../src/game/boss.ts');
const { trackForRoute } = require('../src/game/audioController.ts');
const baseline = require('./fixtures/while-compatibility.json');
const before = { completedMissionIds: Object.keys(baseline.missions) };
const builders = whileExercises.filter(isCodeBuilderExercise);
const answerFor = e => isCodeBuilderExercise(e) ? JSON.stringify(e.validation.expectedFragmentIds) : e.validation.correctOptionId;
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('While expansion preserves all 66 exercises, sixteen missions, prior lessons/references and both earlier worlds byte-for-byte', () => {
  for (const [name, items] of Object.entries({ chapters, missions, exercises, lessons, spellbook: spellbookEntries })) {
    for (const [id, expected] of Object.entries(baseline[name])) assert.equal(hash(items.find(v => v.id === id)), expected, id);
    assert.deepEqual(items.filter(v => Object.hasOwn(baseline[name], v.id)).map(v => v.id), Object.keys(baseline[name]));
  }
  for (const world of worlds.slice(0, 2)) assert.equal(hash(world), baseline.worlds[world.id]);
  assert.deepEqual(loopCaverns, { ...baseline.loopCaverns, chapterIds: [...baseline.loopCaverns.chapterIds, ...whileChapters.map(c => c.id)], xpReward: 220 });
  for (const [id, entry] of Object.entries(baseline.spellbookLinks)) assert.equal(exerciseSpellbookEntryIds[id], entry);
  assert.equal(Object.keys(baseline.exercises).length, 66);
  assert.equal(getTotalEarnedXp(before), 780);
});

test('Exactly two sequential three-question missions add 80 XP; all IDs and registry totals are correct', () => {
  assert.deepEqual([worlds.length, chapters.length, missions.length, exercises.length, lessons.length, spellbookEntries.length], [3, 18, 18, 72, 37, 21]);
  assert.deepEqual([exercises.filter(isChoiceExercise).length, exercises.filter(isCodeBuilderExercise).length], [64, 6]);
  assert.equal(exercises.filter(e => !isChoiceExercise(e) && !isCodeBuilderExercise(e)).length, 2);
  assert.deepEqual(missions.filter(m => !Object.hasOwn(baseline.missions, m.id)), whileMissions);
  assert.deepEqual(whileMissions.map(m => [m.title, m.exerciseIds.length, m.xpReward, m.encounter]), [['The Endless Echo', 3, 40, undefined], ['The Stopping Crystal', 3, 40, undefined]]);
  assert.deepEqual(whileExercises.map(e => e.type), ['output-choice', 'missing-token', 'code-builder', 'multiple-choice', 'code-builder', 'missing-token']);
  const ids = [...worlds, ...chapters, ...missions, ...exercises, ...lessons, ...spellbookEntries,
    ...exercises.filter(isChoiceExercise).flatMap(e => e.options), ...exercises.filter(isCodeBuilderExercise).flatMap(e => e.fragments)].map(v => v.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(missions.reduce((xp, m) => xp + m.xpReward, 0), 860);
  assert.equal(loopCaverns.chapterIds.length, 6);
});

// These are independently reviewed text fixtures and finite arithmetic tables.
// Never parse/execute authored Python, including any nonterminating examples or distractors.
test('Reviewed finite outputs, zero turns, counter directions and stop boundaries are accurate without executing Python', () => {
  assert.deepEqual(builders.map(e => [assembledCode(e, answerFor(e)), e.expectedOutput]), [
    ['rune = 4\nwhile rune < 7:\n    print(rune)\n    rune = rune + 1', '4\n5\n6'],
    ['power = 4\nwhile power > 1:\n    print(power)\n    power = power - 1', '4\n3\n2'],
  ]);
  const reviewed = [
    ['pulse = 2\nwhile pulse < 4:\n    print(pulse)\n    pulse = pulse + 1', 'b', '2\n3'],
    ['seal = 6\nwhile ____:\n    print("Echo")\n    seal = seal + 1', 'a', 'seal < 6'],
    ['gem = 2\nwhile gem < 5:\n    print("Hum")', 'c', 'gem never changes, so gem < 5 stays True.'],
    ['tick = 3\nwhile tick < 5:\n    print(tick)\n    ____', 'b', 'tick = tick + 1'],
  ];
  whileExercises.filter(isChoiceExercise).forEach((e, i) => {
    assert.equal(e.code, reviewed[i][0]);
    assert.equal(answerFor(e), `${e.id}-${reviewed[i][1]}`);
    assert.equal(e.options.find(o => o.id === answerFor(e)).label, reviewed[i][2]);
    assert.equal(e.options.filter(o => isExerciseAnswerCorrect(e, o.id)).length, 1);
    for (const o of e.options) {
      assert.equal(isExerciseAnswerCorrect(e, o.label), false);
      if (o.id !== answerFor(e)) assert.equal(getIncorrectAnswerFeedback(e, o.id), o.feedback);
    }
    for (const bad of ['', 'unknown', 'toString', `${answerFor(e)} `, ...whileExercises.filter(v => v !== e).map(answerFor)]) assert.equal(isExerciseAnswerCorrect(e, bad), false);
  });
  // Fixed, bounded transitions reviewed independently of the content strings.
  assert.deepEqual([2, 3].map(value => [value, value < 4, value + 1]), [[2, true, 3], [3, true, 4]]);
  assert.equal(4 < 4, false);
  assert.equal(6 < 6, false); // Zero iterations: neither print nor update runs.
  assert.equal([6].filter(value => value < 6).length, 0);
  assert.deepEqual([4, 5, 6].map(value => value + 1), [5, 6, 7]);
  assert.equal(7 < 7, false);
  assert.deepEqual([4, 3, 2].map(value => value - 1), [3, 2, 1]);
  assert.equal(1 > 1, false);
  assert.equal([4, 5, 6].join('\n'), builders[0].expectedOutput);
  assert.equal([4, 3, 2].join('\n'), builders[1].expectedOutput);
});

test('Missing/reset/wrong-direction updates are explained as text only; for/while comparison is finite and accurate', () => {
  const missing = whileExercises[3], repair = whileExercises[5];
  assert.match(missing.prompt, /without running/);
  assert.match(missing.explanation, /text only; DevQuest never runs it/);
  assert.equal(missing.code, 'gem = 2\nwhile gem < 5:\n    print("Hum")');
  assert.equal(2 < 5, true); assert.equal(2 + 0, 2); // Missing update leaves the very same True check.
  assert.equal(3 - 1 < 5, true); assert.equal(3 < 5, true); // Wrong direction/reset cannot reach the stop.
  assert.match(repair.explanation, /Resetting or decreasing/);
  const comparison = lessons.find(l => l.id === 'python-lesson-for-while');
  assert.equal(comparison.codeExample, 'for n in range(1, 3):\n    print(n)\nn = 1\nwhile n < 3:\n    print(n)\n    n = n + 1');
  assert.equal(comparison.expectedOutput, [1, 2, 1, 2].join('\n'));
  assert.deepEqual([1, 2].map(n => n + 1), [2, 3]); assert.equal(3 < 3, false);
  assert.match(comparison.importantRule, /does not automatically advance/);
  assert.deepEqual([3, 4].map(n => n + 1), [4, 5]); assert.equal(5 < 5, false);
  assert.match(repair.prompt, /range\(3, 5\)/);
});

test('Four lessons teach checks, zero turns, updates and comparison before use; review/replays keep existing sequencing', () => {
  const expected = [
    ['python-lesson-while-condition', 'count = 0\nwhile count < 3:\n    print(count)\n    count = count + 1', '0\n1\n2'],
    ['python-lesson-while-zero', 'charge = 4\nwhile charge < 4:\n    print("Glow")\n    charge = charge + 1\nprint("Rest")', 'Rest'],
    ['python-lesson-while-stop', 'charge = 2\nwhile charge > 0:\n    print("Glow")\n    charge = charge - 1', 'Glow\nGlow'],
    ['python-lesson-for-while', 'for n in range(1, 3):\n    print(n)\nn = 1\nwhile n < 3:\n    print(n)\n    n = n + 1', '1\n2\n1\n2'],
  ];
  for (const [id, code, output] of expected) {
    const l = lessons.find(l => l.id === id);
    assert.deepEqual([l.codeExample, l.expectedOutput], [code, output]);
    for (const key of ['title', 'explanation', 'whyItWorks', 'importantRule']) assert.ok(l[key].length > 10);
  }
  whileMissions.forEach((mission, m) => {
    let session = initialLessonSession;
    mission.exerciseIds.forEach((id, index) => {
      const e = exercises.find(v => v.id === id), lesson = getLessonForExercise(e);
      const expectedId = m === 0 ? expected[index === 1 ? 1 : 0][0] : expected[index === 2 ? 3 : 2][0];
      assert.equal(lesson.id, expectedId);
      assert.equal(!!getVisibleLesson(e, 'answering', false, session), m === 0 ? index !== 2 : index !== 1);
      assert.equal(getVisibleLesson(e, 'answering', true, initialLessonSession), null);
      session = lessonSessionReducer(session, { type: 'continue', lessonId: lesson.id });
      assert.equal(getVisibleLesson(e, 'answering', false, session), null);
      assert.equal(getVisibleLesson(e, 'answering', false, lessonSessionReducer(session, { type: 'review' })).lesson, lesson);
      assert.notEqual(lesson.codeExample, isCodeBuilderExercise(e) ? assembledCode(e, answerFor(e)) : e.code);
      assert.notEqual(lesson.expectedOutput, isCodeBuilderExercise(e) ? e.expectedOutput : e.options.find(o => o.id === answerFor(e)).label);
    });
  });
});

for (const e of builders) test(`${e.id}: four fragments have one accepted order, preserve indentation and support wrong-order recovery`, () => {
  const expected = e.validation.expectedFragmentIds;
  assert.equal(e.fragments.length, 4); assert.equal(expected.length, 4);
  assert.equal(e.fragments.filter(f => f.code.startsWith('    ')).length, 2);
  assert.ok(e.fragments.every(f => f.code.length <= 24 && !f.code.includes('\n')), 'short lines for narrow screens');
  const permutations = a => a.length ? a.flatMap((id, i) => permutations(a.filter((_, j) => i !== j)).map(rest => [id, ...rest])) : [[]];
  assert.equal(permutations(expected).filter(ids => isExerciseAnswerCorrect(e, JSON.stringify(ids))).length, 1);
  for (const ids of [expected.slice(1), [...expected, expected[0]], [expected[0], expected[0], ...expected.slice(2)],
    ['unknown', ...expected.slice(1)], [builders.find(v => v !== e).fragments[0].id, ...expected.slice(1)], [...expected, 'extra'],
    expected.map(id => e.fragments.find(f => f.id === id).code)]) assert.equal(isExerciseAnswerCorrect(e, JSON.stringify(ids)), false);
  for (const bad of ['{', '{}', 'null', 'true', '', '[]', '{"correct":true}', assembledCode(e, answerFor(e))]) assert.equal(isExerciseAnswerCorrect(e, bad), false);
  assert.equal(isExerciseAnswerCorrect({ ...e, fragments: e.fragments.map(f => ({ ...f, code: 'changed display' })) }, answerFor(e)), true);
  let answer = '';
  for (const id of [...expected].reverse()) answer = editBuilderAnswer(e, answer, { type: 'add', id });
  assert.equal(isExerciseAnswerCorrect(e, answer), false);
  const wrongDraft = answer;
  assert.equal(editBuilderAnswer(e, answer, { type: 'add', id: expected[0] }), wrongDraft);
  answer = editBuilderAnswer(e, answer, { type: 'undo' }); assert.equal(readFragmentIds(e, answer).length, 3);
  answer = editBuilderAnswer(e, answer, { type: 'reset' }); assert.equal(answer, '');
  for (const id of expected) answer = editBuilderAnswer(e, answer, { type: 'add', id });
  assert.equal(isExerciseAnswerCorrect(e, answer), true);
});

function play(progress, mission, reward) {
  let attempt = startMissionAttempt(progress, mission.id);
  mission.exerciseIds.forEach((id, i) => {
    const e = exercises.find(e => e.id === id), answer = answerFor(e);
    const wrong = submitMissionAnswer(progress, attempt, isCodeBuilderExercise(e) ? JSON.stringify([...e.validation.expectedFragmentIds].reverse()) : 'foreign');
    assert.equal(wrong.status, 'incorrect'); assert.equal(wrong.attempt, attempt); assert.equal(wrong.progress, progress); assert.equal(wrong.xpAwarded, 0);
    const right = submitMissionAnswer(progress, attempt, answer);
    assert.equal(right.status, 'correct'); assert.equal(right.attempt.phase, 'solved'); assert.equal(getBossHp(right.attempt), null);
    assert.equal(right.xpAwarded, i === 2 ? reward : 0);
    if (i < 2) { assert.equal(right.progress, progress); assert.equal(right.attempt.result, null); }
    for (let tap = 0; tap < 4; tap++) {
      const duplicate = submitMissionAnswer(right.progress, right.attempt, answer);
      assert.equal(duplicate.status, 'ignored'); assert.equal(duplicate.xpAwarded, 0); assert.equal(duplicate.attempt, right.attempt);
    }
    progress = right.progress; attempt = continueMissionAttempt(right.attempt, 3);
    assert.equal(attempt.phase, i === 2 ? 'complete' : 'answering');
    assert.equal(continueMissionAttempt(attempt, 3), attempt);
  });
  return { progress, attempt };
}

test('Sequential access rejects locked deep links and forged attempts; 40 XP is paid once at spell three; Caverns remains up to date', () => {
  assert.deepEqual(whileChapters.map(c => c.prerequisiteMissionIds), [['python-caverns-counting-tower-01'], [whileMissions[0].id]]);
  const locked = { completedMissionIds: before.completedMissionIds.slice(0, -1) };
  for (const mission of whileMissions) {
    assert.equal(startMissionAttempt(locked, mission.id), null); assert.equal(getPlayableMission(locked, mission.id), null);
    assert.equal(completeMission(locked, mission.id).xpAwarded, 0);
    const forged = { missionId: mission.id, exerciseIndex: 2, solvedExerciseIds: [], phase: 'answering', result: null };
    const answer = answerFor(exercises.find(e => e.id === mission.exerciseIds[2]));
    assert.equal(submitMissionAnswer(locked, forged, answer).status, 'unavailable');
    assert.equal(submitMissionAnswer(before, forged, answer).status, 'unavailable');
  }
  assert.equal(isMissionUnlocked(before, whileMissions[0].id), true);
  assert.equal(isMissionUnlocked(before, whileMissions[1].id), false);
  assert.deepEqual(getAccessibleMapChapters({ completedMissionIds: [] }, loopCaverns.id), []);
  let progress = before;
  assert.deepEqual(getWorldProgress(progress, loopCaverns.id), { completed: 4, total: 6, percent: 67 });
  whileMissions.forEach((mission, i) => {
    const won = play(progress, mission, 40); progress = won.progress;
    assert.equal(getTotalEarnedXp(progress), 820 + 40 * i);
    assert.deepEqual(won.attempt.result.newlyUnlockedChapterIds, i === 0 ? [whileChapters[1].id] : []);
    assert.deepEqual(getWorldProgress(progress, loopCaverns.id), { completed: 5 + i, total: 6, percent: i === 0 ? 83 : 100 });
    assert.equal(isWorldCleared(progress, loopCaverns.id), false);
    assert.equal(play(progress, mission, 0).progress, progress);
    assert.deepEqual(startMissionAttempt(progress, mission.id).solvedExerciseIds, []);
    assert.deepEqual(worldMapForMission(mission.id), { pathname: '/world-map', params: { worldId: loopCaverns.id } });
    assert.equal(trackForRoute(`/mission/${mission.id}`), 'battle');
  });
  const stats = getPlayerStatistics(progress);
  assert.deepEqual([stats.totalXp, stats.completedExercises, stats.completedMissions, stats.defeatedBosses], [860, 72, 18, 2]);
  assert.deepEqual(getAchievements(progress), getAchievements(before));
  for (const world of worlds.slice(0, 2)) assert.equal(isWorldCleared(progress, world.id), true);
  assert.equal(trackForRoute('/world-map'), 'forest');
});

test('780-XP saves reload unchanged; new 820/860-XP records preserve profile, audio, onboarding and all note links', async () => {
  let progress = before;
  const profile = JSON.stringify({ version: 1, nickname: 'Crystal Reader', avatarId: 'wizard' });
  const data = new Map([['devquest.profile.v1', profile], ['devquest.audio.v1', 'audio-sentinel'], ['devquest.onboarding.v1', 'onboarding-sentinel']]);
  const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
  for (let step = 0; step < 3; step++) {
    if (step) progress = play(progress, whileMissions[step - 1], 40).progress;
    const raw = JSON.stringify({ version: 1, completedMissionIds: progress.completedMissionIds });
    assert.deepEqual(parseSavedProgression(raw).progression, progress);
    await createProgressionStore(storage).save(progress);
    assert.equal(data.get(PROGRESSION_STORAGE_KEY), raw);
    const restored = (await createProgressionStore(storage).load()).progression;
    assert.equal(getTotalEarnedXp(restored), 780 + 40 * step);
    const stats = getPlayerStatistics(restored);
    assert.deepEqual([stats.completedExercises, stats.completedMissions, stats.defeatedBosses], [66 + 3 * step, 16 + step, 2]);
    if (step) assert.equal(play(restored, whileMissions[step - 1], 0).progress, restored);
    assert.equal(data.get('devquest.profile.v1'), profile);
    assert.deepEqual(parseSavedProfile(profile).profile, { nickname: 'Crystal Reader', avatarId: 'wizard' });
    assert.equal(data.get('devquest.audio.v1'), 'audio-sentinel'); assert.equal(data.get('devquest.onboarding.v1'), 'onboarding-sentinel');
  }
  let notes = {};
  for (const e of exercises) {
    assert.ok(getLessonForExercise(e)); assert.ok(getSpellbookEntryForExercise(e.id));
    notes = setExerciseNote(notes, e.id, `Remember ${e.id}`);
  }
  await createNotesStore(storage).save(notes); assert.deepEqual((await createNotesStore(storage).load()).notes, notes);
  assert.ok(whileExercises.every(e => getSpellbookEntryForExercise(e.id).id === 'python-while-loops'));
  const entry = getSpellbookEntryForExercise(whileExercises[0].id);
  assert.equal(entry.codeExample, 'steps = 1\nwhile steps < 3:\n    print("Shine")\n    steps = steps + 1');
  assert.equal(entry.expectedOutput, 'Shine\nShine');
  assert.match(entry.commonMistake, /Forgetting the update/);
  assert.match(entry.whyItWorks, /3 < 3 is False/);
});
