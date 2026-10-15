import type { Chapter, Exercise, Mission, World } from './worldTypes';

export const valleyOfDecisions: World = {
  id: 'python-valley-of-decisions', languageId: 'python', title: 'Valley of Decisions',
  description: 'Beyond the forest, ancient gates respond to your choices. Turn conditions into Python spells.',
  chapterIds: ['python-valley-crossroads', 'python-valley-guardian'],
  prerequisiteMissionIds: [
    'python-forest-awakening-01', 'python-forest-fire-essence-01', 'python-forest-mana-stones-01',
    'python-forest-talking-trees-01', 'python-forest-broken-spells-01', 'python-forest-goblin-king-01',
  ],
  xpReward: 150,
  unlockRequirement: 'Complete all six chapters of Forest of Variables, including the Goblin King.',
};

export const valleyChapters: readonly Chapter[] = [
  {
    id: 'python-valley-crossroads', worldId: valleyOfDecisions.id, title: 'The Crossroads',
    description: 'Two glowing paths divide the valley. Read their conditions to find your way.',
    learningObjective: 'Recognize True and False and compare values with ==, !=, >, <, >= and <=.',
    missionIds: ['python-valley-crossroads-01'], prerequisiteMissionIds: [], xpReward: 70,
  },
  {
    id: 'python-valley-guardian', worldId: valleyOfDecisions.id, title: "The Guardian's Choice",
    description: 'A patient rune guardian watches the gate. Show how your code chooses when to act.',
    learningObjective: 'Use if, else and indentation to run the right block when a condition is true or false.',
    missionIds: ['python-valley-guardian-01'], prerequisiteMissionIds: ['python-valley-crossroads-01'], xpReward: 80,
  },
];

export const valleyMissions: readonly Mission[] = [
  {
    id: 'python-valley-crossroads-01', chapterId: 'python-valley-crossroads', title: 'Read the Runes',
    description: 'Solve five comparison spells to open the path to the guardian.',
    exerciseIds: ['python-valley-crossroads-boolean', 'python-valley-crossroads-equality', 'python-valley-crossroads-difference', 'python-valley-crossroads-boundary', 'python-valley-crossroads-threshold'],
    prerequisiteMissionIds: [], xpReward: 70,
  },
  {
    id: 'python-valley-guardian-01', chapterId: 'python-valley-guardian', title: 'The Conditional Gate',
    description: 'Earn the guardian’s trust with five spells that choose the right action.', encounter: 'guardian',
    exerciseIds: ['python-valley-guardian-if', 'python-valley-guardian-indent', 'python-valley-guardian-skip', 'python-valley-guardian-else', 'python-valley-guardian-branch'],
    prerequisiteMissionIds: [], xpReward: 80,
  },
];

export const valleyExercises: readonly Exercise[] = [
  {
    id: 'python-valley-crossroads-boolean', chapterId: 'python-valley-crossroads', languageId: 'python', difficulty: 'intro', type: 'fill-blank',
    concept: 'Boolean values', prompt: 'The path is open. Fill in the Boolean value True, without quotes. Python uses True and False for yes-or-no conditions.',
    code: 'path_open = ____\nprint(path_open)', hint: 'Start True with a capital T. It is a value, not a quoted string.',
    explanation: 'True and False are Boolean values. path_open stores True, so print() displays True.',
    validation: { kind: 'exact', acceptedAnswers: ['True'], caseSensitive: true },
  },
  {
    id: 'python-valley-crossroads-equality', chapterId: 'python-valley-crossroads', languageId: 'python', difficulty: 'intro', type: 'choose-operator',
    concept: 'equality comparison', prompt: 'Choose the operator that checks whether the two rune counts are equal.',
    code: 'runes = 4\nprint(runes ____ 4)', options: ['=', '==', '!=', '>'], hint: 'One = assigns; two equals signs compare.',
    explanation: '== compares values. Since 4 equals 4, this comparison prints True.',
    validation: { kind: 'exact', acceptedAnswers: ['=='], caseSensitive: true },
  },
  {
    id: 'python-valley-crossroads-difference', chapterId: 'python-valley-crossroads', languageId: 'python', difficulty: 'practice', type: 'predict-output',
    concept: 'not equal and greater than', prompt: 'Predict both lines. != means “not equal” and > means “greater than”.',
    code: 'print(3 != 5)\nprint(3 > 5)', hint: '3 differs from 5, but is it greater than 5? Enter True or False on each line.',
    explanation: '3 != 5 is True because the numbers differ. 3 > 5 is False because 3 is smaller.',
    validation: { kind: 'exact', acceptedAnswers: ['True\nFalse'], caseSensitive: true },
  },
  {
    id: 'python-valley-crossroads-boundary', chapterId: 'python-valley-crossroads', languageId: 'python', difficulty: 'practice', type: 'predict-output',
    concept: 'less than and inclusive boundaries', prompt: 'Predict both lines. < means “less than”; <= also allows equality.',
    code: 'print(2 < 6)\nprint(6 <= 6)', hint: '2 is smaller than 6. The <= operator accepts equal values too.',
    explanation: 'Both lines print True: 2 is less than 6, and 6 is less than or equal to itself.',
    validation: { kind: 'exact', acceptedAnswers: ['True\nTrue'], caseSensitive: true },
  },
  {
    id: 'python-valley-crossroads-threshold', chapterId: 'python-valley-crossroads', languageId: 'python', difficulty: 'challenge', type: 'choose-operator',
    concept: 'greater than or equal', prompt: 'The gate needs at least 8 mana. Choose the operator that accepts 8 and every larger value.',
    code: 'mana = 8\nprint(mana ____ 8)', options: ['>', '>=', '==', '<='], hint: '“At least” includes the boundary and all values above it.',
    explanation: '>= means greater than or equal to. It accepts 8 as well as 9, 10 and larger values; > would reject 8.',
    validation: { kind: 'exact', acceptedAnswers: ['>='], caseSensitive: true },
  },
  {
    id: 'python-valley-guardian-if', chapterId: 'python-valley-guardian', languageId: 'python', difficulty: 'intro', type: 'fill-blank',
    concept: 'if statements', prompt: 'Fill in the keyword that runs the indented spell only when the condition is True.',
    code: 'mana = 5\n____ mana >= 3:\n    print("Cast")', hint: 'Use the two-letter keyword if. The colon starts its block.',
    explanation: 'if checks a condition. Since 5 >= 3 is True, the indented print() runs and displays Cast.',
    validation: { kind: 'exact', acceptedAnswers: ['if'], caseSensitive: true },
  },
  {
    id: 'python-valley-guardian-indent', chapterId: 'python-valley-guardian', languageId: 'python', difficulty: 'practice', type: 'fix-mistake',
    concept: 'Python indentation', prompt: 'Rewrite all three lines, indenting print() inside the if block. Use four spaces before print(); keep the other lines at the left edge.',
    code: 'mana = 5\nif mana >= 3:\nprint("Cast")', hint: 'Indent only the last line. Spaces at the start tell Python which statements belong to if.',
    explanation: 'Indentation defines a block in Python. With print() inside the if block, it runs only when mana >= 3 is True.',
    validation: { kind: 'python-lines', acceptedAnswers: ['mana = 5\nif mana >= 3:\n    print("Cast")'], caseSensitive: true },
  },
  {
    id: 'python-valley-guardian-skip', chapterId: 'python-valley-guardian', languageId: 'python', difficulty: 'practice', type: 'predict-output',
    concept: 'conditional execution', prompt: 'What single word is printed? The last line is outside the if block.',
    code: 'mana = 1\nif mana >= 3:\n    print("Cast")\nprint("Ready")', hint: '1 >= 3 is False, so skip the indented line. The unindented print() still runs.',
    explanation: 'The condition is False, so Cast is skipped. Ready is printed because that statement is outside the block.',
    validation: { kind: 'exact', acceptedAnswers: ['Ready'], caseSensitive: true },
  },
  {
    id: 'python-valley-guardian-else', chapterId: 'python-valley-guardian', languageId: 'python', difficulty: 'practice', type: 'fill-blank',
    concept: 'else statements', prompt: 'Fill in the keyword that selects the alternative block when the if condition is False.',
    code: 'mana = 1\nif mana >= 3:\n    print("Cast")\n____:\n    print("Rest")', hint: 'Use else, aligned with if. It does not need another condition.',
    explanation: 'else runs when the if condition is False. With only 1 mana, this spell prints Rest.',
    validation: { kind: 'exact', acceptedAnswers: ['else'], caseSensitive: true },
  },
  {
    id: 'python-valley-guardian-branch', chapterId: 'python-valley-guardian', languageId: 'python', difficulty: 'challenge', type: 'fix-mistake',
    concept: 'choosing the correct branch', prompt: 'Rewrite all five lines. Change only the comparison so mana below 3 prints Rest, and mana of 3 or more prints Cast. Keep both print lines indented.',
    code: 'mana = 2\nif mana >= 3:\n    print("Rest")\nelse:\n    print("Cast")', hint: 'Use < to test “below 3”. Align else with if and indent both print lines equally.',
    explanation: 'if mana < 3 selects Rest for low mana. Otherwise, else selects Cast. At exactly 3, the else branch runs.',
    validation: { kind: 'python-lines', acceptedAnswers: ['mana = 2\nif mana < 3:\n    print("Rest")\nelse:\n    print("Cast")'], caseSensitive: true },
  },
];
