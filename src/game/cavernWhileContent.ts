import type { Chapter, Exercise, Mission } from './worldTypes';

export const whileChapters: readonly Chapter[] = [
  {
    id: 'python-caverns-endless-echo', worldId: 'python-loop-caverns', title: 'The Endless Echo',
    description: 'Guide a crystal echo with a condition that tells it when to repeat.',
    learningObjective: 'Read while conditions before each turn and update a counter so repetition stops.',
    missionIds: ['python-caverns-endless-echo-01'], prerequisiteMissionIds: ['python-caverns-counting-tower-01'], xpReward: 40,
  },
  {
    id: 'python-caverns-stopping-crystal', worldId: 'python-loop-caverns', title: 'The Stopping Crystal',
    description: 'Restore a stopping crystal by finding the update that brings a spell to rest.',
    learningObjective: 'Recognize missing or incorrect updates and compare finite for and while loops.',
    missionIds: ['python-caverns-stopping-crystal-01'], prerequisiteMissionIds: ['python-caverns-endless-echo-01'], xpReward: 40,
  },
];

export const whileMissions: readonly Mission[] = [
  {
    id: 'python-caverns-endless-echo-01', chapterId: 'python-caverns-endless-echo', title: 'The Endless Echo',
    description: 'Read the condition, notice when it is False, and build a finite echo spell.',
    exerciseIds: ['python-caverns-echo-while-output', 'python-caverns-echo-zero', 'python-caverns-echo-while-build'],
    prerequisiteMissionIds: [], xpReward: 40,
  },
  {
    id: 'python-caverns-stopping-crystal-01', chapterId: 'python-caverns-stopping-crystal', title: 'The Stopping Crystal',
    description: 'Find a missing update, assemble a countdown, and repair the final counting spell.',
    exerciseIds: ['python-caverns-crystal-missing-update', 'python-caverns-crystal-build', 'python-caverns-crystal-repair'],
    prerequisiteMissionIds: [], xpReward: 40,
  },
];

/** All programs, including intentionally nonterminating examples, are display-only text. */
export const whileExercises: readonly Exercise[] = [
  {
    id: 'python-caverns-echo-while-output', chapterId: 'python-caverns-endless-echo', languageId: 'python',
    difficulty: 'intro', type: 'output-choice', concept: 'check before every repetition', lessonId: 'python-lesson-while-condition',
    prompt: 'Each pulse is printed before its value increases. Which numbers appear?',
    code: 'pulse = 2\nwhile pulse < 4:\n    print(pulse)\n    pulse = pulse + 1',
    hint: 'Check 2 < 4, print 2, then increase pulse. Check the condition again before each new turn.',
    explanation: 'The loop prints 2, updates pulse to 3, then prints 3 and updates to 4. Now 4 < 4 is False. The body stops, so 4 never prints.',
    options: [
      { id: 'python-caverns-echo-while-output-a', label: '2\n3\n4', feedback: 'The condition is checked before printing. At 4 it is False, so 4 does not print.' },
      { id: 'python-caverns-echo-while-output-b', label: '2\n3', feedback: 'Two and three pass the condition. Four fails the next check, ending the loop.' },
      { id: 'python-caverns-echo-while-output-c', label: '3\n4', feedback: 'print(pulse) comes before the update. The first printed value is 2, and 4 fails the condition.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-caverns-echo-while-output-b' },
  },
  {
    id: 'python-caverns-echo-zero', chapterId: 'python-caverns-endless-echo', languageId: 'python',
    difficulty: 'practice', type: 'missing-token', concept: 'a loop can run zero times', lessonId: 'python-lesson-while-zero',
    prompt: 'The seal is already at 6. Choose the condition that is False immediately, so no Echo is printed.',
    code: 'seal = 6\nwhile ____:\n    print("Echo")\n    seal = seal + 1',
    hint: 'The first check happens before the body. Is six smaller than the chosen limit?',
    explanation: '6 < 6 is False on the very first check. Neither indented line runs: no Echo prints, and seal stays at 6. A while loop does not promise even one turn.',
    options: [
      { id: 'python-caverns-echo-zero-a', label: 'seal < 6', feedback: 'Six is not smaller than six, so the loop body is skipped completely.' },
      { id: 'python-caverns-echo-zero-b', label: 'seal < 7', feedback: 'Six is smaller than seven. This condition allows one Echo before the update makes it False.' },
      { id: 'python-caverns-echo-zero-c', label: 'seal < 8', feedback: 'Six is smaller than eight. This condition allows two turns, instead of zero.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-caverns-echo-zero-a' },
  },
  {
    id: 'python-caverns-echo-while-build', chapterId: 'python-caverns-endless-echo', languageId: 'python',
    difficulty: 'challenge', type: 'code-builder', concept: 'build a finite while loop', lessonId: 'python-lesson-while-condition',
    prompt: 'Final spell: start rune at 4, print 4, 5 and 6, then stop. Put all four fragments in order.',
    code: '', expectedOutput: '4\n5\n6',
    hint: 'Set rune first, then check it with while. Inside the loop, print the current value before increasing it.',
    explanation: 'rune starts at 4. Each turn prints it and adds 1. After printing 6, the update makes rune 7; 7 < 7 is False. Without the update, the condition would stay True.',
    fragments: [
      { id: 'python-caverns-echo-while-build-update', code: '    rune = rune + 1' },
      { id: 'python-caverns-echo-while-build-body', code: '    print(rune)' },
      { id: 'python-caverns-echo-while-build-header', code: 'while rune < 7:' },
      { id: 'python-caverns-echo-while-build-start', code: 'rune = 4' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-caverns-echo-while-build-start', 'python-caverns-echo-while-build-header', 'python-caverns-echo-while-build-body', 'python-caverns-echo-while-build-update'] },
  },
  {
    id: 'python-caverns-crystal-missing-update', chapterId: 'python-caverns-stopping-crystal', languageId: 'python',
    difficulty: 'intro', type: 'multiple-choice', concept: 'notice a missing update', lessonId: 'python-lesson-while-stop',
    prompt: 'Read this spell without running it. Why would it keep printing Hum instead of stopping?',
    code: 'gem = 2\nwhile gem < 5:\n    print("Hum")',
    hint: 'Look for a statement that changes gem. Does printing a message change the counter?',
    explanation: 'gem never changes from 2. The condition 2 < 5 stays True, so the loop would keep repeating. print() only displays text. An update toward the limit is needed. This example is text only; DevQuest never runs it.',
    options: [
      { id: 'python-caverns-crystal-missing-update-a', label: 'print() increases gem too slowly.', feedback: 'print() does not update gem at all. It only displays Hum.' },
      { id: 'python-caverns-crystal-missing-update-b', label: 'The loop stops automatically after five turns.', feedback: 'Five is a comparison limit, not a turn limit. Without changing gem, the condition stays True.' },
      { id: 'python-caverns-crystal-missing-update-c', label: 'gem never changes, so gem < 5 stays True.', feedback: 'The counter stays at two, and the same True condition is checked repeatedly.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-caverns-crystal-missing-update-c' },
  },
  {
    id: 'python-caverns-crystal-build', chapterId: 'python-caverns-stopping-crystal', languageId: 'python',
    difficulty: 'practice', type: 'code-builder', concept: 'update toward the stopping point', lessonId: 'python-lesson-while-stop',
    prompt: 'Repair the crystal countdown: start power at 4, print 4, 3 and 2, then stop. Use all four fragments.',
    code: '', expectedOutput: '4\n3\n2',
    hint: 'Set power first. While it is greater than 1, print it, then subtract 1 inside the loop.',
    explanation: 'The update reduces power after each print. It takes the values 4, 3 and 2 during the body. After the last update power is 1, and 1 > 1 is False. The crystal comes to rest.',
    fragments: [
      { id: 'python-caverns-crystal-build-body', code: '    print(power)' },
      { id: 'python-caverns-crystal-build-update', code: '    power = power - 1' },
      { id: 'python-caverns-crystal-build-start', code: 'power = 4' },
      { id: 'python-caverns-crystal-build-header', code: 'while power > 1:' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-caverns-crystal-build-start', 'python-caverns-crystal-build-header', 'python-caverns-crystal-build-body', 'python-caverns-crystal-build-update'] },
  },
  {
    id: 'python-caverns-crystal-repair', chapterId: 'python-caverns-stopping-crystal', languageId: 'python',
    difficulty: 'challenge', type: 'missing-token', concept: 'repair a matching counting loop', lessonId: 'python-lesson-for-while',
    prompt: 'Final spell: match a for loop over range(3, 5), which prints 3 then 4. Which update repairs this while loop so it prints those values and stops?',
    code: 'tick = 3\nwhile tick < 5:\n    print(tick)\n    ____',
    hint: 'Move tick toward 5 after printing. Do not leave it at 3 or move it farther below the limit.',
    explanation: 'tick = tick + 1 changes 3 to 4, then 4 to 5. The next check is False. This prints 3 and 4, just like for tick in range(3, 5). Resetting or decreasing tick would keep this condition True.',
    options: [
      { id: 'python-caverns-crystal-repair-a', label: 'tick = tick - 1', feedback: 'Decreasing tick moves it away from 5. The condition would stay True rather than reach the stopping point.' },
      { id: 'python-caverns-crystal-repair-b', label: 'tick = tick + 1', feedback: 'This advances tick through 3 and 4, then reaches 5 where the condition becomes False.' },
      { id: 'python-caverns-crystal-repair-c', label: 'tick = 3', feedback: 'Resetting tick to three leaves the same True condition each time. The loop would not stop.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-caverns-crystal-repair-b' },
  },
];
