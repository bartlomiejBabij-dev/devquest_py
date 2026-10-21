import type { Chapter, Exercise, Mission } from './worldTypes';

export const eternalLoopChapter: Chapter = {
  id: 'python-caverns-eternal-loop', worldId: 'python-loop-caverns', title: 'The Eternal Loop',
  description: 'The Loop Warden guards the crystal heart. Five precise spells will bring its ancient mechanisms to rest.',
  learningObjective: 'Master repetition, range boundaries, indentation and finite while loops.',
  missionIds: ['python-caverns-eternal-loop-01'], prerequisiteMissionIds: ['python-caverns-stopping-crystal-01'], xpReward: 100,
};

export const eternalLoopMission: Mission = {
  id: 'python-caverns-eternal-loop-01', chapterId: eternalLoopChapter.id, title: 'The Eternal Loop',
  description: 'Face The Loop Warden with five loop spells. Review the optional recap whenever you need it.',
  exerciseIds: ['python-caverns-warden-rune', 'python-caverns-warden-path', 'python-caverns-warden-counter', 'python-caverns-warden-echo', 'python-caverns-warden-final'],
  prerequisiteMissionIds: [], xpReward: 100, encounter: 'loop-warden',
};

/** Display-only Python. Validators compare choice/fragment IDs and never run code. */
export const eternalLoopExercises: readonly Exercise[] = [
  {
    id: 'python-caverns-warden-rune', chapterId: eternalLoopChapter.id, languageId: 'python',
    difficulty: 'challenge', type: 'output-choice', concept: 'The Repeating Rune', lessonId: 'python-lesson-caverns-mastery',
    prompt: 'The first rune flashes once for each value. What does this spell print?',
    code: 'for mark in range(2, 6):\n    print(mark)',
    hint: 'Start at 2, increase by one, and stop before 6. Each value gets one turn.',
    explanation: 'range(2, 6) supplies 2, 3, 4 and 5: four turns. The stop value 6 is excluded. Each turn prints the current mark, weakening the first rune.',
    options: [
      { id: 'python-caverns-warden-rune-a', label: '2\n3\n4\n5\n6', feedback: 'The stop value is excluded. Including 6 would add a fifth turn that this range does not contain.' },
      { id: 'python-caverns-warden-rune-b', label: '2\n3\n4\n5', feedback: 'The four values start at 2 and end just before 6.' },
      { id: 'python-caverns-warden-rune-c', label: '0\n1\n2\n3\n4\n5', feedback: 'The first argument sets the start to 2. This range does not begin at zero.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-caverns-warden-rune-b' },
  },
  {
    id: 'python-caverns-warden-path', chapterId: eternalLoopChapter.id, languageId: 'python',
    difficulty: 'challenge', type: 'code-builder', concept: 'The Crystal Path', lessonId: 'python-lesson-caverns-mastery',
    prompt: 'Build a spell that prints Path three times, then Cross once. Use all three fragments.',
    code: '', expectedOutput: 'Path\nPath\nPath\nCross',
    hint: 'Put the for header before its indented Path body. Cross is outside the loop and must come after it.',
    explanation: 'The indented Path line repeats three times. Only then does the unindented Cross line run once. Your assembled spell opens a crack in the stone armor.',
    fragments: [
      { id: 'python-caverns-warden-path-end', code: 'print("Cross")' },
      { id: 'python-caverns-warden-path-body', code: '    print("Path")' },
      { id: 'python-caverns-warden-path-header', code: 'for glow in range(3):' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-caverns-warden-path-header', 'python-caverns-warden-path-body', 'python-caverns-warden-path-end'] },
  },
  {
    id: 'python-caverns-warden-counter', chapterId: eternalLoopChapter.id, languageId: 'python',
    difficulty: 'challenge', type: 'output-choice', concept: 'The Vanishing Counter', lessonId: 'python-lesson-caverns-mastery',
    prompt: 'The core loses charge after each print. Which values appear before the loop stops?',
    code: 'charge = 5\nwhile charge > 2:\n    print(charge)\n    charge = charge - 1',
    hint: 'Check before each turn, print the current charge, then subtract one. Does 2 > 2 pass?',
    explanation: 'The loop prints 5, 4 and 3, reducing charge after each print. At 2 the next condition is False, so 2 is never printed. The update brings the loop to a stop.',
    options: [
      { id: 'python-caverns-warden-counter-a', label: '5\n4\n3', feedback: 'Each printed value is greater than 2. The next check fails at 2.' },
      { id: 'python-caverns-warden-counter-b', label: '5\n4\n3\n2', feedback: 'The condition is checked before printing. Two is not greater than two, so the body is skipped then.' },
      { id: 'python-caverns-warden-counter-c', label: '4\n3\n2', feedback: 'print(charge) comes before the update. The first output is 5, and the last is 3.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-caverns-warden-counter-a' },
  },
  {
    id: 'python-caverns-warden-echo', chapterId: eternalLoopChapter.id, languageId: 'python',
    difficulty: 'challenge', type: 'missing-token', concept: 'The Broken Echo', lessonId: 'python-lesson-caverns-mastery',
    prompt: 'Read this broken spell as text. Choose the update that prints Ring three times, then makes the condition False.',
    code: 'echo = 1\nwhile echo < 4:\n    print("Ring")\n    ____',
    hint: 'Move echo from 1 toward 4 after each print. Resetting or decreasing it would keep the condition True.',
    explanation: 'echo = echo + 1 advances through 1, 2 and 3, printing Ring on each turn. It then reaches 4 and stops. The other updates would keep echo below 4. None of these snippets is executed by the game.',
    options: [
      { id: 'python-caverns-warden-echo-a', label: 'echo = 1', feedback: 'Resetting echo to 1 repeats the same True check forever. It never reaches the stopping value.' },
      { id: 'python-caverns-warden-echo-b', label: 'echo = echo - 1', feedback: 'Subtracting moves echo away from 4. It would stay below the limit instead of stopping.' },
      { id: 'python-caverns-warden-echo-c', label: 'echo = echo + 1', feedback: 'Increasing echo reaches 4 after three turns, making echo < 4 False.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-caverns-warden-echo-c' },
  },
  {
    id: 'python-caverns-warden-final', chapterId: eternalLoopChapter.id, languageId: 'python',
    difficulty: 'challenge', type: 'code-builder', concept: 'The Final Loop', lessonId: 'python-lesson-caverns-mastery',
    prompt: 'Release the last seal: begin at 2, print 2, 3 and 4, then stop. Assemble all four fragments.',
    code: '', expectedOutput: '2\n3\n4',
    hint: 'Initialize seal before the while header. Inside it, print before updating. The update must stay indented to reach the stopping point.',
    explanation: 'seal starts at 2. Each turn prints it and adds 1. After printing 4, seal becomes 5 and 5 < 5 is False. You built a complete finite loop and freed the crystal heart!',
    fragments: [
      { id: 'python-caverns-warden-final-update', code: '    seal = seal + 1' },
      { id: 'python-caverns-warden-final-header', code: 'while seal < 5:' },
      { id: 'python-caverns-warden-final-body', code: '    print(seal)' },
      { id: 'python-caverns-warden-final-start', code: 'seal = 2' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-caverns-warden-final-start', 'python-caverns-warden-final-header', 'python-caverns-warden-final-body', 'python-caverns-warden-final-update'] },
  },
];
