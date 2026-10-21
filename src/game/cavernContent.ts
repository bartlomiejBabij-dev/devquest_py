import { valleyMissions } from './valleyContent';
import { builderChapters, builderExercises, builderMissions } from './cavernBuilderContent';
import { whileChapters, whileExercises, whileMissions } from './cavernWhileContent';
import { eternalLoopChapter, eternalLoopExercises, eternalLoopMission } from './cavernBossContent';
import type { Chapter, Exercise, Mission, World } from './worldTypes';

export const loopCaverns: World = {
  id: 'python-loop-caverns', languageId: 'python', title: 'Loop Caverns',
  description: 'Blue crystals pulse beneath the valley. Use repeating Python spells to awaken ancient mechanisms.',
  chapterIds: ['python-caverns-repeating-road', 'python-caverns-lanterns-of-range', ...builderChapters.map(chapter => chapter.id), ...whileChapters.map(chapter => chapter.id), eternalLoopChapter.id],
  prerequisiteMissionIds: valleyMissions.map(mission => mission.id),
  unlockRequirement: 'Complete all six chapters of Valley of Decisions, including The Decision Keeper.',
  xpReward: 320,
};

export const cavernChapters: readonly Chapter[] = [
  {
    id: 'python-caverns-repeating-road', worldId: loopCaverns.id, title: 'The Repeating Road',
    description: 'A crystal road wakes with each echo. Let a loop repeat the steps of your spell.',
    learningObjective: 'Repeat instructions with for and recognize the indented loop body.',
    missionIds: ['python-caverns-repeating-road-01'], prerequisiteMissionIds: [], xpReward: 30,
  },
  {
    id: 'python-caverns-lanterns-of-range', worldId: loopCaverns.id, title: 'Lanterns of Range',
    description: 'Numbered lanterns light the tunnel. Follow each value in a range to reveal the path.',
    learningObjective: 'Trace changing loop values and remember that range excludes its stop value.',
    missionIds: ['python-caverns-lanterns-of-range-01'],
    prerequisiteMissionIds: ['python-caverns-repeating-road-01'], xpReward: 30,
  },
  ...builderChapters,
  ...whileChapters,
  eternalLoopChapter,
];

export const cavernMissions: readonly Mission[] = [
  {
    id: 'python-caverns-repeating-road-01', chapterId: 'python-caverns-repeating-road', title: 'The Repeating Road',
    description: 'Awaken the crystal road with three repeating spells.',
    exerciseIds: ['python-caverns-road-echo', 'python-caverns-road-keyword', 'python-caverns-road-body'],
    prerequisiteMissionIds: [], xpReward: 30,
  },
  {
    id: 'python-caverns-lanterns-of-range-01', chapterId: 'python-caverns-lanterns-of-range', title: 'Lanterns of Range',
    description: 'Light the numbered lanterns with three range spells.',
    exerciseIds: ['python-caverns-range-zero', 'python-caverns-range-stop', 'python-caverns-range-start'],
    prerequisiteMissionIds: [], xpReward: 30,
  },
  ...builderMissions,
  ...whileMissions,
  eternalLoopMission,
];

export const cavernExercises: readonly Exercise[] = [
  {
    id: 'python-caverns-road-echo', chapterId: 'python-caverns-repeating-road', languageId: 'python',
    difficulty: 'intro', type: 'output-choice', concept: 'repeating an instruction', lessonId: 'python-lesson-loop-repeat',
    prompt: 'The crystal answers each time the loop runs. What appears?',
    code: 'for pulse in range(2):\n    print("Echo")',
    hint: 'range(2) gives the loop two turns. The indented print runs on each turn.',
    explanation: 'The loop runs twice. Each turn prints Echo on a new line, so there are two echoes.',
    options: [
      { id: 'python-caverns-road-echo-a', label: 'Echo', feedback: 'That is one turn. range(2) repeats the indented instruction twice.' },
      { id: 'python-caverns-road-echo-b', label: 'Echo\nEcho', feedback: 'Two turns each print one Echo, producing two lines.' },
      { id: 'python-caverns-road-echo-c', label: 'Echo\nEcho\nEcho', feedback: 'This has three turns. The 2 in range(2) asks for two turns.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-caverns-road-echo-b' },
  },
  {
    id: 'python-caverns-road-keyword', chapterId: 'python-caverns-repeating-road', languageId: 'python',
    difficulty: 'practice', type: 'missing-token', concept: 'starting a for loop', lessonId: 'python-lesson-loop-repeat',
    prompt: 'Which keyword makes the mechanism repeat Lift four times?',
    code: '____ turn in range(4):\n    print("Lift")',
    hint: 'Choose the keyword that starts a loop through a sequence of values.',
    explanation: 'for starts the loop. range(4) supplies four turns, and the indented print displays Lift on each one.',
    options: [
      { id: 'python-caverns-road-keyword-a', label: 'if', feedback: 'if checks a condition once. It does not start this repeating loop.' },
      { id: 'python-caverns-road-keyword-b', label: 'print', feedback: 'print() displays a value; it cannot start this loop header.' },
      { id: 'python-caverns-road-keyword-c', label: 'for', feedback: 'for takes each value in range(4) and runs the body four times.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-caverns-road-keyword-c' },
  },
  {
    id: 'python-caverns-road-body', chapterId: 'python-caverns-repeating-road', languageId: 'python',
    difficulty: 'practice', type: 'output-choice', concept: 'inside and outside the loop', lessonId: 'python-lesson-loop-body',
    prompt: 'Final spell: three pings unlock the road. Which output includes the message after the loop?',
    code: 'for beat in range(3):\n    print("Ping")\nprint("Ready")',
    hint: 'Only Ping is indented. Ready runs once when the loop has finished.',
    explanation: 'Ping is inside the loop and prints three times. Ready is outside it and prints once afterward. The road opens!',
    options: [
      { id: 'python-caverns-road-body-a', label: 'Ping\nPing\nPing\nReady', feedback: 'The indented instruction repeats three times, then the unindented line runs once.' },
      { id: 'python-caverns-road-body-b', label: 'Ping\nReady\nPing\nReady\nPing\nReady', feedback: 'Ready is not indented, so it is outside the loop. It does not repeat with Ping.' },
      { id: 'python-caverns-road-body-c', label: 'Ping\nReady', feedback: 'The body runs for all three turns, not just the first one.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-caverns-road-body-a' },
  },
  {
    id: 'python-caverns-range-zero', chapterId: 'python-caverns-lanterns-of-range', languageId: 'python',
    difficulty: 'intro', type: 'output-choice', concept: 'range starts at zero', lessonId: 'python-lesson-range-zero',
    prompt: 'Each lantern shows the current loop value. Which numbers appear?',
    code: 'for spark in range(4):\n    print(spark)',
    hint: 'Start at zero, increase by one, and stop before four.',
    explanation: 'spark takes the values 0, 1, 2 and 3 in order. print(spark) shows its current value each turn. Four is excluded.',
    options: [
      { id: 'python-caverns-range-zero-a', label: '1\n2\n3\n4', feedback: 'With one argument, range starts at 0, not 1. Its stop value is excluded.' },
      { id: 'python-caverns-range-zero-b', label: '0\n1\n2\n3\n4', feedback: 'The stop value 4 is not included. There are four values, ending at 3.' },
      { id: 'python-caverns-range-zero-c', label: '0\n1\n2\n3', feedback: 'The variable changes each turn from zero up to, but not including, four.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-caverns-range-zero-c' },
  },
  {
    id: 'python-caverns-range-stop', chapterId: 'python-caverns-lanterns-of-range', languageId: 'python',
    difficulty: 'practice', type: 'missing-token', concept: 'choosing an excluded stop', lessonId: 'python-lesson-range-zero',
    prompt: 'Light lanterns numbered 0, 1, 2, 3 and 4. Which stop value belongs in the blank?',
    code: 'for lamp in range(____):\n    print(lamp)',
    hint: 'The stop must be one beyond the last number you want.',
    explanation: 'range(5) supplies 0, 1, 2, 3 and 4. The excluded stop is 5, so five numbered lanterns light up.',
    options: [
      { id: 'python-caverns-range-stop-a', label: '5', feedback: 'Five is excluded, so the last printed number is four.' },
      { id: 'python-caverns-range-stop-b', label: '4', feedback: 'range(4) ends at 3. It would leave lantern 4 unlit.' },
      { id: 'python-caverns-range-stop-c', label: '6', feedback: 'range(6) also includes 5, lighting one lantern beyond the requested set.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-caverns-range-stop-a' },
  },
  {
    id: 'python-caverns-range-start', chapterId: 'python-caverns-lanterns-of-range', languageId: 'python',
    difficulty: 'practice', type: 'output-choice', concept: 'range with a starting value', lessonId: 'python-lesson-range-bounds',
    prompt: 'Final spell: the tunnel begins at lantern 2. Which lantern numbers does this spell reveal?',
    code: 'for lamp in range(2, 5):\n    print(lamp)',
    hint: 'Include the first argument, 2. Exclude the second argument, 5.',
    explanation: 'The first turn sets lamp to 2, the next to 3, and the last to 4. Each value prints once. Python stops before 5, revealing three lanterns.',
    options: [
      { id: 'python-caverns-range-start-a', label: '2\n3\n4\n5', feedback: 'The starting value is included, but the stop value 5 is excluded.' },
      { id: 'python-caverns-range-start-b', label: '2\n3\n4', feedback: 'The loop starts at two and stops before five, printing three values.' },
      { id: 'python-caverns-range-start-c', label: '0\n1\n2\n3\n4', feedback: 'Zero is the default only when no start is given. Here the first argument sets the start to 2.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-caverns-range-start-b' },
  },
  ...builderExercises,
  ...whileExercises,
  ...eternalLoopExercises,
];
