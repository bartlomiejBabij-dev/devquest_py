import type { Chapter, Exercise, Mission } from './worldTypes';

export const builderChapters: readonly Chapter[] = [
  {
    id: 'python-caverns-echo-bridge', worldId: 'python-loop-caverns', title: 'Echo Bridge',
    description: 'Assemble repeating spells to raise a bridge of crystal echoes.',
    learningObjective: 'Build a loop header and indented body, then place instructions before and after the loop.',
    missionIds: ['python-caverns-echo-bridge-01'], prerequisiteMissionIds: ['python-caverns-lanterns-of-range-01'], xpReward: 40,
  },
  {
    id: 'python-caverns-counting-tower', worldId: 'python-loop-caverns', title: 'Counting Tower',
    description: 'Light numbered steps by assembling precise counting spells.',
    learningObjective: 'Trace range boundaries and build a counting loop with an excluded stop.',
    missionIds: ['python-caverns-counting-tower-01'], prerequisiteMissionIds: ['python-caverns-echo-bridge-01'], xpReward: 40,
  },
];

export const builderMissions: readonly Mission[] = [
  {
    id: 'python-caverns-echo-bridge-01', chapterId: 'python-caverns-echo-bridge', title: 'Echo Bridge',
    description: 'Read one spell, then build two of your own to cross the echo bridge.',
    exerciseIds: ['python-caverns-bridge-output', 'python-caverns-bridge-build', 'python-caverns-bridge-crossing'],
    prerequisiteMissionIds: [], xpReward: 40,
  },
  {
    id: 'python-caverns-counting-tower-01', chapterId: 'python-caverns-counting-tower', title: 'Counting Tower',
    description: 'Read the range, assemble your code, and awaken the numbered tower.',
    exerciseIds: ['python-caverns-tower-boundary', 'python-caverns-tower-build', 'python-caverns-tower-summit'],
    prerequisiteMissionIds: [], xpReward: 40,
  },
];

export const builderExercises: readonly Exercise[] = [
  {
    id: 'python-caverns-bridge-output', chapterId: 'python-caverns-echo-bridge', languageId: 'python',
    difficulty: 'intro', type: 'output-choice', concept: 'which instructions repeat', lessonId: 'python-lesson-build-echo',
    prompt: 'Two bells test the bridge. What does this spell print?',
    code: 'for bell in range(2):\n    print("Bell")\nprint("Safe")',
    hint: 'Bell is indented and repeats twice. Safe is outside the loop.',
    explanation: 'The body prints Bell for each of two turns. Once the loop ends, the unindented line prints Safe once.',
    options: [
      { id: 'python-caverns-bridge-output-a', label: 'Bell\nSafe\nBell\nSafe', feedback: 'Safe is not indented. It runs once after both bells, not during each turn.' },
      { id: 'python-caverns-bridge-output-b', label: 'Bell\nBell\nSafe', feedback: 'Two loop turns print two bells, followed by the outside instruction.' },
      { id: 'python-caverns-bridge-output-c', label: 'Safe\nBell\nBell', feedback: 'Python reaches Safe after finishing the loop above it. It cannot print Safe first here.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-caverns-bridge-output-b' },
  },
  {
    id: 'python-caverns-bridge-build', chapterId: 'python-caverns-echo-bridge', languageId: 'python',
    difficulty: 'practice', type: 'code-builder', concept: 'assemble a loop', lessonId: 'python-lesson-build-echo',
    prompt: 'Build a spell that prints Step twice. Use both fragments.', code: '', expectedOutput: 'Step\nStep',
    hint: 'Put the for header first. The indented print belongs directly beneath it.',
    explanation: 'The header starts two turns. Its indented body prints Step on each turn. Your first assembled loop raises the bridge!',
    fragments: [
      { id: 'python-caverns-bridge-build-body', code: '    print("Step")' },
      { id: 'python-caverns-bridge-build-header', code: 'for step in range(2):' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-caverns-bridge-build-header', 'python-caverns-bridge-build-body'] },
  },
  {
    id: 'python-caverns-bridge-crossing', chapterId: 'python-caverns-echo-bridge', languageId: 'python',
    difficulty: 'challenge', type: 'code-builder', concept: 'before, inside and after a loop', lessonId: 'python-lesson-build-echo',
    prompt: 'Final spell: announce Ready, repeat Cross three times, then announce Done. Use all four fragments.', code: '',
    expectedOutput: 'Ready\nCross\nCross\nCross\nDone',
    hint: 'Ready runs before the loop. Keep the header and indented Cross together. Done runs after the loop.',
    explanation: 'Python prints Ready once, then repeats the indented Cross three times. The unindented Done finishes the spell once. The order of the outside lines matters too!',
    fragments: [
      { id: 'python-caverns-bridge-crossing-end', code: 'print("Done")' },
      { id: 'python-caverns-bridge-crossing-body', code: '    print("Cross")' },
      { id: 'python-caverns-bridge-crossing-start', code: 'print("Ready")' },
      { id: 'python-caverns-bridge-crossing-header', code: 'for step in range(3):' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-caverns-bridge-crossing-start', 'python-caverns-bridge-crossing-header', 'python-caverns-bridge-crossing-body', 'python-caverns-bridge-crossing-end'] },
  },
  {
    id: 'python-caverns-tower-boundary', chapterId: 'python-caverns-counting-tower', languageId: 'python',
    difficulty: 'intro', type: 'output-choice', concept: 'trace the excluded stop', lessonId: 'python-lesson-build-range',
    prompt: 'Which numbered steps light up? Read both range boundaries.',
    code: 'for n in range(4, 7):\n    print(n)',
    hint: 'Start at 4, include each next integer, and stop before 7.',
    explanation: 'n is 4 on the first turn, 5 on the second and 6 on the third. The stop 7 is excluded, so exactly three steps light up.',
    options: [
      { id: 'python-caverns-tower-boundary-a', label: '4\n5\n6\n7', feedback: 'Seven is the stop value. range excludes it, so the final printed number is six.' },
      { id: 'python-caverns-tower-boundary-b', label: '5\n6', feedback: 'The start value is included. The first turn prints four, not five.' },
      { id: 'python-caverns-tower-boundary-c', label: '4\n5\n6', feedback: 'The start is included, and the stop is excluded.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-caverns-tower-boundary-c' },
  },
  {
    id: 'python-caverns-tower-build', chapterId: 'python-caverns-counting-tower', languageId: 'python',
    difficulty: 'practice', type: 'code-builder', concept: 'build a counting loop', lessonId: 'python-lesson-build-range',
    prompt: 'Build a counting spell that prints 5, 6 and 7 on separate lines. Use both fragments.', code: '', expectedOutput: '5\n6\n7',
    hint: 'Start with the range header. print(n) belongs inside the loop so it displays each changing value.',
    explanation: 'range(5, 8) supplies 5, 6 and 7. The body prints the current n each time. Eight is excluded, so the spell lights exactly three steps.',
    fragments: [
      { id: 'python-caverns-tower-build-body', code: '    print(n)' },
      { id: 'python-caverns-tower-build-header', code: 'for n in range(5, 8):' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-caverns-tower-build-header', 'python-caverns-tower-build-body'] },
  },
  {
    id: 'python-caverns-tower-summit', chapterId: 'python-caverns-counting-tower', languageId: 'python',
    difficulty: 'challenge', type: 'code-builder', concept: 'finish a counting spell', lessonId: 'python-lesson-build-range',
    prompt: 'Final spell: print 6 and 7, then print Top once after counting. Use all three fragments.', code: '', expectedOutput: '6\n7\nTop',
    hint: 'The indented line prints n during each turn. The unindented Top message goes after the loop.',
    explanation: 'range(6, 8) makes n take 6, then 7. The body prints both values; 8 is excluded. Top runs once after the loop, lighting the tower summit!',
    fragments: [
      { id: 'python-caverns-tower-summit-end', code: 'print("Top")' },
      { id: 'python-caverns-tower-summit-body', code: '    print(n)' },
      { id: 'python-caverns-tower-summit-header', code: 'for n in range(6, 8):' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-caverns-tower-summit-header', 'python-caverns-tower-summit-body', 'python-caverns-tower-summit-end'] },
  },
];
