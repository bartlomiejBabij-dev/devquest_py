import { archipelagoMissions } from './archipelagoContent';
import type { Chapter, Exercise, Mission, World } from './worldTypes';

export const functionForge: World = {
  id: 'python-function-forge', languageId: 'python', title: 'Function Forge',
  description: 'Awaken an ancient workshop and forge reusable spells with Python functions.',
  chapterIds: ['python-forge-silent-anvil', 'python-forge-rune-engraver'],
  prerequisiteMissionIds: archipelagoMissions.map(mission => mission.id),
  unlockRequirement: 'Complete all seven List Archipelago chapters, including The Treasure Guardian.', xpReward: 60,
};

export const forgeChapters: readonly Chapter[] = [
  { id: 'python-forge-silent-anvil', worldId: functionForge.id, title: 'The Silent Anvil',
    description: 'A spell waits silently in the anvil until you call its name.',
    learningObjective: 'Define a reusable function, indent its body and call it to run its instructions.',
    missionIds: ['python-forge-silent-anvil-01'], prerequisiteMissionIds: [], xpReward: 30 },
  { id: 'python-forge-rune-engraver', worldId: functionForge.id, title: 'The Rune Engraver',
    description: 'Give one engraved spell different values to create different effects.',
    learningObjective: 'Use one parameter to receive an argument and reuse a function with different values.',
    missionIds: ['python-forge-rune-engraver-01'], prerequisiteMissionIds: ['python-forge-silent-anvil-01'], xpReward: 30 },
];
export const forgeMissions: readonly Mission[] = [
  { id: 'python-forge-silent-anvil-01', chapterId: forgeChapters[0].id, title: 'The Silent Anvil',
    description: 'Forge and call your first function with three spells.',
    exerciseIds: ['python-forge-anvil-silence', 'python-forge-anvil-definition', 'python-forge-anvil-build'], prerequisiteMissionIds: [], xpReward: 30 },
  { id: 'python-forge-rune-engraver-01', chapterId: forgeChapters[1].id, title: 'The Rune Engraver',
    description: 'Pass a value into your reusable spell with three rune challenges.',
    exerciseIds: ['python-forge-rune-output', 'python-forge-rune-parameter', 'python-forge-rune-build'], prerequisiteMissionIds: [], xpReward: 30 },
];

/** Display-only Python; validation compares authored option and fragment IDs. */
export const forgeExercises: readonly Exercise[] = [
  {
    id: 'python-forge-anvil-silence', chapterId: forgeChapters[0].id, languageId: 'python', difficulty: 'intro',
    type: 'output-choice', concept: 'A spell waiting to be called', lessonId: 'python-lesson-function-call',
    prompt: 'This is the whole program. What appears when only this definition is read?',
    code: 'def spark():\n    print("Zap!")',
    hint: 'Look for a spark() call outside the definition. Without a call, the body waits.',
    explanation: 'No output appears. def creates spark, but its indented print does not run yet. A later spark() call would run the body and print Zap!.',
    options: [
      { id: 'python-forge-anvil-silence-a', label: 'Zap!', feedback: 'That would appear after calling spark(). Defining it alone does not run its body.' },
      { id: 'python-forge-anvil-silence-b', label: 'No output', feedback: 'The function is defined but never called.' },
      { id: 'python-forge-anvil-silence-c', label: 'spark', feedback: 'A function name is not automatically printed. Nothing here calls the function.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-forge-anvil-silence-b' },
  },
  {
    id: 'python-forge-anvil-definition', chapterId: forgeChapters[0].id, languageId: 'python', difficulty: 'practice',
    type: 'missing-token', concept: 'Forge the function header', lessonId: 'python-lesson-function-shape',
    prompt: 'Which keyword begins the function definition?', code: '____ shine():\n    print("Glow")\nshine()',
    hint: 'A function definition starts with the keyword taught in the lesson, followed by its name.',
    explanation: 'def shine(): defines the function named shine. Empty parentheses mean this function takes no arguments. The indented body belongs to it, and the unindented shine() call prints Glow.',
    options: [
      { id: 'python-forge-anvil-definition-a', label: 'for', feedback: 'for repeats over values. Use the keyword that defines a function.' },
      { id: 'python-forge-anvil-definition-b', label: 'if', feedback: 'if checks a condition. This header needs to define a named function.' },
      { id: 'python-forge-anvil-definition-c', label: 'def', feedback: 'def starts a function definition.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-forge-anvil-definition-c' },
  },
  {
    id: 'python-forge-anvil-build', chapterId: forgeChapters[0].id, languageId: 'python', difficulty: 'practice',
    type: 'code-builder', concept: 'Sound the anvil', lessonId: 'python-lesson-function-shape',
    prompt: 'Define chime with its indented body, then call it once. Use all three fragments.', code: '', expectedOutput: 'Ding',
    hint: 'Place def first, its indented print next, and the unindented call last.',
    explanation: 'def chime(): creates the function. The indented print is its body. Only the final chime() call runs that body, printing Ding once.',
    fragments: [
      { id: 'python-forge-anvil-build-call', code: 'chime()' },
      { id: 'python-forge-anvil-build-body', code: '    print("Ding")' },
      { id: 'python-forge-anvil-build-def', code: 'def chime():' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-forge-anvil-build-def', 'python-forge-anvil-build-body', 'python-forge-anvil-build-call'] },
  },
  {
    id: 'python-forge-rune-output', chapterId: forgeChapters[1].id, languageId: 'python', difficulty: 'intro',
    type: 'output-choice', concept: 'Give the rune a value', lessonId: 'python-lesson-function-parameter',
    prompt: 'What does this call display?', code: 'def stamp(mark):\n    print(mark)\nstamp("Sun")',
    hint: 'The argument Sun becomes the value of mark during the call.',
    explanation: 'mark is the parameter name. "Sun" is the argument supplied to stamp. Inside this call, print(mark) displays Sun, not the literal word mark.',
    options: [
      { id: 'python-forge-rune-output-a', label: 'Sun', feedback: 'The body prints the argument received through mark.' },
      { id: 'python-forge-rune-output-b', label: 'mark', feedback: 'mark is a variable name here, without quotes. Its value for this call is Sun.' },
      { id: 'python-forge-rune-output-c', label: 'No output', feedback: 'The final stamp("Sun") line calls the function, so its body does run.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-forge-rune-output-a' },
  },
  {
    id: 'python-forge-rune-parameter', chapterId: forgeChapters[1].id, languageId: 'python', difficulty: 'practice',
    type: 'missing-token', concept: 'One engraving, different values', lessonId: 'python-lesson-function-reuse',
    prompt: 'Choose the name that makes the two calls print Oak, then Ash.',
    code: 'def show(rune):\n    print(____)\nshow("Oak")\nshow("Ash")',
    hint: 'Use the parameter without quotes to print whichever argument this call supplies.',
    explanation: 'rune receives Oak for the first call and Ash for the second. print(rune) uses the current supplied value. One definition can serve both calls without changing its body.',
    options: [
      { id: 'python-forge-rune-parameter-a', label: '"rune"', feedback: 'Quotes make fixed text. This would print rune twice, ignoring the supplied values.' },
      { id: 'python-forge-rune-parameter-b', label: 'rune', feedback: 'The parameter holds the argument for each call: Oak, then Ash.' },
      { id: 'python-forge-rune-parameter-c', label: '"Oak"', feedback: 'A fixed string would print Oak twice. Use the parameter to respond to each argument.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-forge-rune-parameter-b' },
  },
  {
    id: 'python-forge-rune-build', chapterId: forgeChapters[1].id, languageId: 'python', difficulty: 'practice',
    type: 'code-builder', concept: 'Complete the lunar seal', lessonId: 'python-lesson-function-reuse',
    prompt: 'Define seal with one parameter and a body that prints it. Then call seal with Moon. Use all three fragments.',
    code: '', expectedOutput: 'Moon',
    hint: 'Define seal(sign) first. Indent the print using sign. Call seal("Moon") after the body, without indentation.',
    explanation: 'sign is the parameter in the definition; "Moon" is the argument in the call. print(sign) displays Moon when that call runs. The definition alone would stay silent.',
    fragments: [
      { id: 'python-forge-rune-build-body', code: '    print(sign)' },
      { id: 'python-forge-rune-build-call', code: 'seal("Moon")' },
      { id: 'python-forge-rune-build-def', code: 'def seal(sign):' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-forge-rune-build-def', 'python-forge-rune-build-body', 'python-forge-rune-build-call'] },
  },
];
