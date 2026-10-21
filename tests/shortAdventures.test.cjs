const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
const { worlds, chapters, missions, exercises, forestOfVariables, valleyOfDecisions } = require('../src/game/worldContent.ts');
const { lessons, getLessonForExercise } = require('../src/game/lessonContent.ts');
const { initialLessonSession, getVisibleLesson, lessonSessionReducer } = require('../src/game/lessonSession.ts');
const { isChoiceExercise, isExerciseAnswerCorrect, getIncorrectAnswerFeedback } = require('../src/game/exerciseValidation.ts');
const { getPlayableMission, startMissionAttempt, submitMissionAnswer, continueMissionAttempt } = require('../src/game/worldMission.ts');
const { getGoblinKingHp, goblinKingMissionId } = require('../src/game/boss.ts');
const { isWorldUnlocked, isMissionUnlocked, getTotalEarnedXp, getWorldProgress } = require('../src/game/progression.ts');
const { createProgressionStore, parseSavedProgression, PROGRESSION_STORAGE_KEY } = require('../src/game/progressionStorage.ts');
const { getPlayerStatistics, getAchievements } = require('../src/game/profile.ts');
const { spellbookEntries, exerciseSpellbookEntryIds, getSpellbookEntryForExercise } = require('../src/game/spellbookContent.ts');
const { createNotesStore, setExerciseNote } = require('../src/game/notesStorage.ts');
const { worldMapForMission } = require('../src/navigation/worldRoutes.ts');
const { trackForRoute } = require('../src/game/audioController.ts');
const baseline = require('./fixtures/short-adventures-compatibility.json');
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const oldIds = Object.keys(baseline.missions);
const gatesId = 'python-valley-three-gates-01';
const runesId = 'python-valley-twin-runes-01';
const newMissions = [gatesId, runesId].map(id => missions.find(m => m.id === id));
const newExercises = newMissions.flatMap(m => m.exerciseIds.map(id => exercises.find(e => e.id === id)));
const allOldComplete = { completedMissionIds: oldIds };

// Independent review of literal source, intended choice and every distractor.
const reviewed = [
  ['three-gates-output', 'b', 'Sapphire', 'crystals = 7\nif crystals >= 12:\n    print("Ruby")\nelif crystals >= 6:\n    print("Sapphire")\nelse:\n    print("Pebble")', ['Ruby', 'Sapphire\nPebble']],
  ['three-gates-keyword', 'c', 'elif', 'mana = 3\nif mana >= 8:\n    print("Fire")\n____ mana >= 2:\n    print("Frost")\nelse:\n    print("Rest")', ['if', 'else']],
  ['three-gates-first', 'a', 'The if branch: Crown', 'power = 10\nif power >= 8:\n    print("Crown")\nelif power >= 4:\n    print("Staff")\nelse:\n    print("Twig")', ['The elif branch: Staff', 'Both branches: Crown then Staff']],
  ['twin-runes-and', 'c', 'Heal', 'mana = 6\nhealth = 4\nif mana >= 5 and health >= 10:\n    print("Cast")\nelse:\n    print("Heal")', ['Cast', 'Cast\nHeal']],
  ['twin-runes-operator', 'b', 'or', 'has_key = False\nknows_spell = True\nif has_key ____ knows_spell:\n    print("Enter")\nelse:\n    print("Wait")', ['and', '==']],
  ['twin-runes-or', 'a', 'Explore', 'has_map = True\nhas_compass = True\nif has_map or has_compass:\n    print("Explore")\nelse:\n    print("Camp")', ['Camp', 'Explore\nExplore']],
];
const find = suffix => exercises.find(e => e.id === `python-valley-${suffix}`);

test('Expansion preserves all 40 exercises, eight missions, old chapters, 21 lessons, 14 references and links byte-for-byte as data', () => {
  const groups = { chapters, missions, exercises, lessons, spellbook: spellbookEntries };
  for (const [name, items] of Object.entries(groups)) {
    for (const [id, expected] of Object.entries(baseline[name])) assert.equal(hash(items.find(item => item.id === id)), expected, id);
    assert.deepEqual(items.filter(item => Object.hasOwn(baseline[name], item.id)).map(item => item.id), Object.keys(baseline[name]), `${name}: old order`);
  }
  for (const [id, entry] of Object.entries(baseline.spellbookLinks)) assert.equal(exerciseSpellbookEntryIds[id], entry);
  assert.deepEqual(forestOfVariables, baseline.worlds[0]);
  assert.deepEqual(valleyOfDecisions, { ...baseline.worlds[1], chapterIds: [...baseline.worlds[1].chapterIds, 'python-valley-three-gates', 'python-valley-twin-runes', 'python-valley-mirror-of-truth', 'python-valley-decision-keeper'], xpReward: 340 });
  assert.deepEqual(missions.filter(m => oldIds.includes(m.id)).map(m => m.exerciseIds.length), Array(8).fill(5));
  assert.deepEqual(missions.filter(m => oldIds.includes(m.id)).map(m => m.xpReward), [20, 30, 40, 50, 60, 100, 70, 80]);
});

test('The original two short adventures retain their order, six unique tap exercises and 30 XP each', () => {
  assert.equal(worlds.length, 4);
  assert.equal(chapters.length, 23);
  assert.equal(missions.length, 23);
  assert.equal(exercises.length, 89);
  for (const items of [worlds, chapters, missions, exercises, lessons, spellbookEntries]) assert.equal(new Set(items.map(item => item.id)).size, items.length);
  assert.deepEqual(missions.filter(m => !oldIds.includes(m.id)).map(m => m.id), [gatesId, runesId, 'python-valley-mirror-of-truth-01', 'python-valley-decision-keeper-01', 'python-caverns-repeating-road-01', 'python-caverns-lanterns-of-range-01', 'python-caverns-echo-bridge-01', 'python-caverns-counting-tower-01', 'python-caverns-endless-echo-01', 'python-caverns-stopping-crystal-01', 'python-caverns-eternal-loop-01', 'python-archipelago-treasure-inventory-01', 'python-archipelago-index-island-01', 'python-archipelago-growing-chest-01', 'python-archipelago-smiths-exchange-01']);
  assert.deepEqual(newMissions.map(m => m.title), ['The Three Gates', 'The Twin Runes']);
  assert.deepEqual(newMissions.map(m => m.xpReward), [30, 30]);
  assert.deepEqual(newMissions.map(m => m.exerciseIds.length), [3, 3]);
  assert.deepEqual(newExercises.map(e => e.id), reviewed.map(row => `python-valley-${row[0]}`));
  assert.ok(newExercises.every(isChoiceExercise));
  assert.deepEqual(newExercises.map(e => e.type), ['output-choice', 'missing-token', 'multiple-choice', 'output-choice', 'missing-token', 'output-choice']);
  for (const m of newMissions) {
    const chapter = chapters.find(c => c.id === m.chapterId);
    assert.equal(chapter.worldId, valleyOfDecisions.id);
    assert.deepEqual(chapter.missionIds, [m.id]);
    for (const id of m.exerciseIds) assert.equal(exercises.find(e => e.id === id).chapterId, chapter.id);
  }
  assert.equal(missions.filter(m => valleyOfDecisions.chapterIds.includes(m.chapterId)).reduce((xp, m) => xp + m.xpReward, 0), 340);
});

test('Every new question matches reviewed source/choices, accepts exactly one stable ID and rejects labels, invalid IDs and other options', () => {
  for (const [suffix, letter, label, code, distractors] of reviewed) {
    const e = find(suffix), id = `${e.id}-${letter}`;
    assert.equal(e.code, code);
    assert.equal(e.validation.correctOptionId, id);
    assert.equal(e.options.find(o => o.id === id).label, label);
    assert.deepEqual(e.options.filter(o => o.id !== id).map(o => o.label), distractors);
    assert.equal(new Set(e.options.map(o => o.id)).size, e.options.length);
    assert.equal(new Set(e.options.map(o => o.label)).size, e.options.length);
    assert.equal(e.options.filter(o => isExerciseAnswerCorrect(e, o.id)).length, 1);
    for (const option of e.options) {
      assert.equal(isExerciseAnswerCorrect(e, option.id), option.id === id);
      assert.equal(isExerciseAnswerCorrect(e, option.label), false);
      assert.ok(option.feedback.length > 30);
      if (option.id !== id) assert.equal(getIncorrectAnswerFeedback(e, option.id), option.feedback);
    }
    for (const invalid of ['', 'toString', 'missing', ` ${id}`, `${id} `, id.toUpperCase(), 'python-valley-guardian-if-b']) assert.equal(isExerciseAnswerCorrect(e, invalid), false);
    assert.equal(isExerciseAnswerCorrect({ ...e, options: [...e.options].reverse() }, id), true);
    assert.equal(isExerciseAnswerCorrect({ ...e, options: e.options.filter(o => o.id !== id) }, id), false);
  }
});

test('Reviewed Python outcomes follow first-match chains and Boolean combinations, including both-True and both-False cases', () => {
  // Fixed independent calculations; no Python source or player answer is executed.
  assert.equal(7 >= 12 ? 'Ruby' : 7 >= 6 ? 'Sapphire' : 'Pebble', 'Sapphire');
  assert.equal(3 >= 8 ? 'Fire' : 3 >= 2 ? 'Frost' : 'Rest', 'Frost');
  assert.equal(10 >= 8 ? 'Crown' : 10 >= 4 ? 'Staff' : 'Twig', 'Crown');
  assert.equal(6 >= 5 && 4 >= 10 ? 'Cast' : 'Heal', 'Heal');
  assert.equal(false || true ? 'Enter' : 'Wait', 'Enter');
  assert.equal(true || true ? 'Explore' : 'Camp', 'Explore');
  const pairs = [[false, false], [false, true], [true, false], [true, true]];
  assert.deepEqual(pairs.map(([a, b]) => a && b), [false, false, false, true]);
  assert.deepEqual(pairs.map(([a, b]) => a || b), [false, true, true, true]);
  assert.notEqual(false === false, false || false, 'equality is not an entry rule requiring at least one True');
  assert.match(find('three-gates-keyword').prompt, /same chain.*only if/);
  assert.match(find('three-gates-keyword').options[0].feedback, /independent decision/);
  assert.match(find('three-gates-first').explanation, /skips the remaining branches/);
  assert.match(find('twin-runes-or').options[1].feedback, /does not require exactly one/);
  for (const e of newExercises) {
    assert.ok(!/\bnot\b|\b(and|or)\b.*\b(and|or)\b/.test(e.code));
    assert.ok(e.code.split('\n').every(line => line.length <= 32));
  }
});

const reviewedLessons = [
  ['elif-paths', 'rank = 6\nif rank >= 9:\n    print("Sky")\nelif rank >= 4:\n    print("River")\nelse:\n    print("Trail")', 'River'],
  ['both-runes', 'lanterns = 2\nrope = 1\nif lanterns >= 1 and rope >= 1:\n    print("Equipped")\nelse:\n    print("Prepare")', 'Equipped'],
  ['either-rune', 'has_map = True\nsees_tower = False\nif has_map or sees_tower:\n    print("Travel")\nelse:\n    print("Scout")', 'Travel'],
];
test('Three concise lessons teach concepts before assessment and use correct examples distinct from the challenges', () => {
  for (const [suffix, code, output] of reviewedLessons) {
    const lesson = lessons.find(l => l.id === `python-lesson-${suffix}`);
    assert.equal(lesson.codeExample, code);
    assert.equal(lesson.expectedOutput, output);
    for (const key of ['title', 'explanation', 'codeExample', 'expectedOutput', 'whyItWorks', 'importantRule']) assert.ok(lesson[key].trim());
    assert.ok([lesson.explanation, lesson.whyItWorks, lesson.importantRule].join(' ').split(/\s+/).length <= 110);
  }
  const expected = [['elif-paths', 'elif-paths', 'elif-paths'], ['both-runes', 'either-rune', 'either-rune']];
  newMissions.forEach((mission, m) => {
    let session = initialLessonSession;
    const introductions = [];
    mission.exerciseIds.forEach((id, index) => {
      const e = exercises.find(e => e.id === id);
      assert.equal(e.lessonId, `python-lesson-${expected[m][index]}`);
      const lesson = getLessonForExercise(e);
      assert.notEqual(lesson.codeExample, e.code);
      assert.notEqual(lesson.expectedOutput, e.options.find(o => o.id === e.validation.correctOptionId).label);
      const view = getVisibleLesson(e, 'answering', false, session);
      if (view) {
        assert.equal(view.introduction, true);
        introductions.push(index);
        session = lessonSessionReducer(session, { type: 'continue', lessonId: lesson.id });
      }
      assert.ok(session.seenLessonIds.includes(lesson.id));
      assert.equal(getVisibleLesson(e, 'answering', false, session), null);
      assert.equal(getVisibleLesson(e, 'answering', true, initialLessonSession), null);
    });
    assert.deepEqual(introductions, m === 0 ? [0] : [0, 1]);
  });
});

test('Guardian unlocks Three Gates, which unlocks Twin Runes; locked deep links and forged saved completions fail safely', () => {
  const beforeGuardian = { completedMissionIds: oldIds.slice(0, 7) };
  assert.equal(isMissionUnlocked(beforeGuardian, gatesId), false);
  assert.equal(isMissionUnlocked(allOldComplete, gatesId), true);
  assert.equal(isMissionUnlocked(allOldComplete, runesId), false);
  const afterGates = { completedMissionIds: [...oldIds, gatesId] };
  assert.equal(isMissionUnlocked(afterGates, runesId), true);
  for (const [progress, id] of [[beforeGuardian, gatesId], [allOldComplete, runesId]]) {
    assert.equal(getPlayableMission(progress, id), null);
    assert.equal(startMissionAttempt(progress, id), null);
    const forged = { missionId: id, exerciseIndex: 0, phase: 'answering', solvedExerciseIds: [], result: null };
    assert.equal(submitMissionAnswer(progress, forged, newExercises[0].validation.correctOptionId).status, 'unavailable');
  }
  assert.deepEqual(parseSavedProgression(JSON.stringify({ version: 1, completedMissionIds: [gatesId, runesId] })).progression, { completedMissionIds: [] });
});

function play(progress, missionId, reward) {
  const playable = getPlayableMission(progress, missionId);
  let attempt = startMissionAttempt(progress, missionId);
  for (const [index, e] of playable.exercises.entries()) {
    const wrong = submitMissionAnswer(progress, attempt, 'wrong');
    assert.equal(wrong.status, 'incorrect');
    assert.equal(wrong.attempt, attempt);
    assert.equal(wrong.progress, progress);
    assert.equal(wrong.xpAwarded, 0);
    const answer = e.validation.correctOptionId ?? e.validation.acceptedAnswers[0];
    const correct = submitMissionAnswer(progress, attempt, answer);
    assert.equal(correct.status, 'correct');
    assert.equal(correct.attempt.phase, 'solved', 'retain the explanation before Continue');
    assert.equal(correct.xpAwarded, index === playable.exercises.length - 1 ? reward : 0);
    if (index < playable.exercises.length - 1) {
      assert.equal(correct.progress, progress);
      assert.equal(correct.attempt.result, null);
    }
    const duplicate = submitMissionAnswer(correct.progress, correct.attempt, answer);
    assert.equal(duplicate.status, 'ignored');
    assert.equal(duplicate.attempt, correct.attempt);
    assert.equal(duplicate.xpAwarded, 0);
    progress = correct.progress;
    attempt = continueMissionAttempt(correct.attempt, playable.exercises.length);
    assert.equal(continueMissionAttempt(attempt, playable.exercises.length), attempt);
    assert.equal(attempt.phase, index === playable.exercises.length - 1 ? 'complete' : 'answering');
  }
  assert.equal(attempt.result.xpAwarded, reward);
  return { progress, attempt };
}

test('Three-spell missions require three validated answers, pay 30 XP once, replay for zero and update real world/profile counts', () => {
  let progress = allOldComplete;
  assert.deepEqual(getWorldProgress(progress, valleyOfDecisions.id), { completed: 2, total: 6, percent: 33 });
  newMissions.forEach((mission, index) => {
    const completed = play(progress, mission.id, 30);
    assert.equal(completed.attempt.solvedExerciseIds.length, 3);
    assert.equal(completed.attempt.exerciseIndex, 2);
    progress = completed.progress;
    assert.equal(getTotalEarnedXp(progress), 480 + index * 30);
    assert.deepEqual(getWorldProgress(progress, valleyOfDecisions.id), { completed: 3 + index, total: 6, percent: index === 0 ? 50 : 67 });
    const stats = getPlayerStatistics(progress);
    assert.equal(stats.completedExercises, 43 + index * 3);
    assert.equal(stats.completedMissions, 9 + index);
    assert.equal(stats.level, index === 0 ? 5 : 6);
    assert.deepEqual(play(progress, mission.id, 0).progress, progress);
    assert.equal(trackForRoute(`/mission/${mission.id}`), 'battle');
    assert.deepEqual(worldMapForMission(mission.id), { pathname: '/world-map', params: { worldId: valleyOfDecisions.id } });
  });
  assert.equal(trackForRoute('/world-map'), 'forest');
});

test('Leaving after two answers restarts at zero with no XP; review and Spellbook do not mutate the attempt', () => {
  let attempt = startMissionAttempt(allOldComplete, gatesId);
  for (const e of newExercises.slice(0, 2)) {
    const solved = submitMissionAnswer(allOldComplete, attempt, e.validation.correctOptionId);
    assert.equal(solved.progress, allOldComplete);
    assert.equal(solved.xpAwarded, 0);
    attempt = continueMissionAttempt(solved.attempt, 3);
  }
  assert.equal(attempt.solvedExerciseIds.length, 2);
  assert.equal(attempt.result, null);
  const e = newExercises[2], selected = e.options[1].id;
  const snapshot = structuredClone({ attempt, progress: allOldComplete, selected });
  const session = lessonSessionReducer(initialLessonSession, { type: 'review' });
  assert.equal(getVisibleLesson(e, 'answering', true, session).lesson.id, e.lessonId);
  assert.ok(getSpellbookEntryForExercise(e.id));
  lessonSessionReducer(session, { type: 'close' });
  assert.deepEqual({ attempt, progress: allOldComplete, selected }, snapshot);
  const restarted = startMissionAttempt(allOldComplete, gatesId);
  assert.equal(restarted.exerciseIndex, 0);
  assert.deepEqual(restarted.solvedExerciseIds, []);
  assert.equal(getTotalEarnedXp(allOldComplete), 450);
  const forged = { ...restarted, exerciseIndex: 2 };
  assert.equal(submitMissionAnswer(allOldComplete, forged, e.validation.correctOptionId).status, 'unavailable');
});

test('The same engine supports an authored four-exercise fixture without adding a production mission', () => {
  // This test process owns its module objects. Register one fixture synchronously
  // and always remove it; no app content or saved progress is changed.
  const originalLength = missions.length;
  const fixture = { ...missions[0], id: 'test-only-four-spells', exerciseIds: missions[0].exerciseIds.slice(0, 4) };
  missions.push(fixture);
  try {
    const completed = play({ completedMissionIds: [] }, fixture.id, 20);
    assert.equal(completed.attempt.exerciseIndex, 3);
    assert.equal(completed.attempt.solvedExerciseIds.length, 4);
    assert.equal(play(completed.progress, fixture.id, 0).attempt.result.xpAwarded, 0);
  } finally { missions.splice(originalLength); }
  assert.equal(missions.length, originalLength);
});

test('Goblin King still requires five spells at 20 HP each and all six Forest missions still gate Valley', () => {
  const boss = missions.find(m => m.id === goblinKingMissionId);
  assert.equal(boss.exerciseIds.length, 5);
  assert.equal(boss.xpReward, 100);
  let progress = { completedMissionIds: oldIds.slice(0, 5) };
  let attempt = startMissionAttempt(progress, boss.id);
  assert.equal(getGoblinKingHp(attempt), 100);
  boss.exerciseIds.forEach((id, index) => {
    assert.equal(getGoblinKingHp(submitMissionAnswer(progress, attempt, 'wrong').attempt), 100 - index * 20);
    const e = exercises.find(e => e.id === id);
    const solved = submitMissionAnswer(progress, attempt, e.validation.correctOptionId ?? e.validation.acceptedAnswers[0]);
    assert.equal(getGoblinKingHp(solved.attempt), 80 - index * 20);
    assert.equal(solved.xpAwarded, index === 4 ? 100 : 0);
    assert.equal(isWorldUnlocked(solved.progress, valleyOfDecisions.id), index === 4);
    progress = solved.progress;
    attempt = continueMissionAttempt(solved.attempt, 5);
  });
  assert.equal(attempt.phase, 'complete');
  assert.equal(getTotalEarnedXp(progress), 300);
  assert.equal(getWorldProgress(progress, forestOfVariables.id).percent, 100);
  for (const missing of oldIds.slice(0, 6)) assert.equal(isWorldUnlocked({ completedMissionIds: oldIds.slice(0, 6).filter(id => id !== missing) }, valleyOfDecisions.id), false);
});

test('Old and new version-1 saves survive fresh storage instances with exact XP, exercise counts and unchanged Forest achievements', async () => {
  assert.equal(PROGRESSION_STORAGE_KEY, 'devquest.progression');
  const xp = [0, 20, 50, 90, 140, 200, 300, 370, 450, 480, 510, 540, 640, 670, 700, 740, 780, 820, 860, 960, 990, 1020, 1060, 1100];
  const counts = [0, 5, 10, 15, 20, 25, 30, 35, 40, 43, 46, 49, 54, 57, 60, 63, 66, 69, 72, 77, 80, 83, 86, 89];
  const completedAchievements = getAchievements(allOldComplete);
  for (let n = 0; n <= missions.length; n++) {
    const ids = missions.slice(0, n).map(m => m.id);
    const raw = JSON.stringify({ version: 1, completedMissionIds: ids });
    const loaded = parseSavedProgression(raw);
    assert.equal(loaded.status, 'ready');
    assert.deepEqual(loaded.progression.completedMissionIds, ids);
    assert.equal(getTotalEarnedXp(loaded.progression), xp[n]);
    assert.equal(getPlayerStatistics(loaded.progression).completedExercises, counts[n]);
    if (n >= 8) assert.deepEqual(getAchievements(loaded.progression), completedAchievements);
    const data = new Map([[PROGRESSION_STORAGE_KEY, raw], ['unrelated', 'keep']]);
    const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
    await createProgressionStore(storage).save(loaded.progression);
    assert.deepEqual((await createProgressionStore(storage).load()).progression, loaded.progression);
    assert.deepEqual(JSON.parse(data.get(PROGRESSION_STORAGE_KEY)), { version: 1, completedMissionIds: ids });
    assert.equal(data.get('unrelated'), 'keep');
    if (n >= 9) assert.equal(play(loaded.progression, gatesId, 0).attempt.result.xpAwarded, 0);
    if (n === 10) assert.equal(play(loaded.progression, runesId, 0).attempt.result.xpAwarded, 0);
  }
});

test('Three new Spellbook entries have reviewed examples and why-it-works text; all new and existing notes keep stable IDs', async () => {
  const references = [
    ['python-elif', 'level = 2\nif level >= 5:\n    print("Gold")\nelif level >= 2:\n    print("Bronze")\nelse:\n    print("Wood")', 'Bronze'],
    ['python-and', 'has_rope = True\nhas_torch = False\nif has_rope and has_torch:\n    print("Cross")\nelse:\n    print("Prepare")', 'Prepare'],
    ['python-or', 'has_pass = False\nknows_rune = True\nif has_pass or knows_rune:\n    print("Passage")\nelse:\n    print("Search")', 'Passage'],
  ];
  for (const [id, code, output] of references) {
    const entry = spellbookEntries.find(e => e.id === id);
    assert.equal(entry.codeExample, code);
    assert.equal(entry.expectedOutput, output);
    for (const field of ['explanation', 'commonMistake', 'whyItWorks']) assert.ok(entry[field].trim());
  }
  const expected = ['python-elif', 'python-elif', 'python-elif', 'python-and', 'python-or', 'python-or'];
  newExercises.forEach((e, i) => assert.equal(getSpellbookEntryForExercise(e.id).id, expected[i]));
  let notes = {};
  for (const e of exercises) notes = setExerciseNote(notes, e.id, `Reminder for ${e.id}`);
  const data = new Map();
  const storage = { getItem: async k => data.get(k) ?? null, setItem: async (k, v) => { data.set(k, v); } };
  await createNotesStore(storage).save(notes);
  assert.deepEqual((await createNotesStore(storage).load()).notes, notes);
});
