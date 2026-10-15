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
    "id": "python-valley-crossroads-boolean",
    "chapterId": "python-valley-crossroads",
    "languageId": "python",
    "difficulty": "intro",
    "type": "missing-token",
    "concept": "Boolean values",
    "prompt": "The path is open. Choose a Boolean value to record that fact.",
    "code": "path_open = ____\nprint(path_open)",
    "hint": "Use the yes-or-no value for a true statement. Boolean values have no quotes.",
    "explanation": "True records that the path is open. \"True\" would be text instead of a Boolean. Python spells the Boolean with a capital T.",
    "lessonId": "python-lesson-booleans",
    "options": [
      {
        "id": "python-valley-crossroads-boolean-a",
        "label": "\"True\"",
        "feedback": "Quotes turn this into text. We need a Boolean value."
      },
      {
        "id": "python-valley-crossroads-boolean-b",
        "label": "False",
        "feedback": "False would mean the statement “the path is open” is not true."
      },
      {
        "id": "python-valley-crossroads-boolean-c",
        "label": "True",
        "feedback": "True is a Boolean value, with a capital T and no quotes."
      }
    ],
    "validation": {
      "kind": "option-id",
      "correctOptionId": "python-valley-crossroads-boolean-c"
    }
  },
  {
    "id": "python-valley-crossroads-equality",
    "chapterId": "python-valley-crossroads",
    "languageId": "python",
    "difficulty": "practice",
    "type": "missing-token",
    "concept": "equality comparison",
    "prompt": "Which operator checks whether the rune counts are equal?",
    "code": "runes = 4\nprint(runes ____ 4)",
    "hint": "Use a comparison, not the sign that stores a value.",
    "explanation": "== compares the values. Since 4 equals 4, print() displays True. A single = is used to assign a value.",
    "lessonId": "python-lesson-comparisons",
    "options": [
      {
        "id": "python-valley-crossroads-equality-a",
        "label": "=",
        "feedback": "One = stores a value. This blank needs a comparison."
      },
      {
        "id": "python-valley-crossroads-equality-b",
        "label": "!=",
        "feedback": "!= checks whether values differ. The question asks whether they are equal."
      },
      {
        "id": "python-valley-crossroads-equality-c",
        "label": ">",
        "feedback": "> checks whether the left value is greater, not whether both values are equal."
      },
      {
        "id": "python-valley-crossroads-equality-d",
        "label": "==",
        "feedback": "Two equals signs compare values for equality."
      }
    ],
    "validation": {
      "kind": "option-id",
      "correctOptionId": "python-valley-crossroads-equality-d"
    }
  },
  {
    "id": "python-valley-crossroads-difference",
    "chapterId": "python-valley-crossroads",
    "languageId": "python",
    "difficulty": "practice",
    "type": "output-choice",
    "concept": "not equal and greater than",
    "prompt": "Choose the two output lines, in order.",
    "code": "print(3 != 5)\nprint(3 > 5)",
    "hint": "First check whether the numbers differ. Then check whether 3 is greater than 5.",
    "explanation": "3 != 5 is True because the numbers differ. 3 > 5 is False because 3 is smaller. Each print() writes its own line.",
    "lessonId": "python-lesson-ordering",
    "options": [
      {
        "id": "python-valley-crossroads-difference-a",
        "label": "True\nTrue",
        "feedback": "The numbers differ, but 3 is not greater than 5. Check the second line."
      },
      {
        "id": "python-valley-crossroads-difference-b",
        "label": "True\nFalse",
        "feedback": "The numbers differ, and 3 is not greater than 5."
      },
      {
        "id": "python-valley-crossroads-difference-c",
        "label": "False\nTrue",
        "feedback": "!= asks whether the numbers differ. > asks whether the left number is greater."
      },
      {
        "id": "python-valley-crossroads-difference-d",
        "label": "False\nFalse",
        "feedback": "3 and 5 are different, so the first comparison is true."
      }
    ],
    "validation": {
      "kind": "option-id",
      "correctOptionId": "python-valley-crossroads-difference-b"
    }
  },
  {
    "id": "python-valley-crossroads-boundary",
    "chapterId": "python-valley-crossroads",
    "languageId": "python",
    "difficulty": "practice",
    "type": "output-choice",
    "concept": "less than and inclusive boundaries",
    "prompt": "Choose the two output lines. Remember that <= allows equality.",
    "code": "print(2 < 6)\nprint(6 <= 6)",
    "hint": "Check the second comparison at the boundary: the two values are equal.",
    "explanation": "Both lines print True. 2 is less than 6, and <= accepts equal values such as 6 and 6.",
    "lessonId": "python-lesson-ordering",
    "options": [
      {
        "id": "python-valley-crossroads-boundary-a",
        "label": "True\nTrue",
        "feedback": "Both comparisons are true; <= accepts equality."
      },
      {
        "id": "python-valley-crossroads-boundary-b",
        "label": "True\nFalse",
        "feedback": "<= includes equality. Equal values do pass that comparison."
      },
      {
        "id": "python-valley-crossroads-boundary-c",
        "label": "False\nTrue",
        "feedback": "2 is less than 6, so the first comparison is true."
      }
    ],
    "validation": {
      "kind": "option-id",
      "correctOptionId": "python-valley-crossroads-boundary-a"
    }
  },
  {
    "id": "python-valley-crossroads-threshold",
    "chapterId": "python-valley-crossroads",
    "languageId": "python",
    "difficulty": "practice",
    "type": "multiple-choice",
    "concept": "greater than or equal",
    "prompt": "The gate needs at least 8 mana. Which condition accepts 8 and every larger value?",
    "code": "mana = 8",
    "hint": "“At least” includes the boundary and everything above it.",
    "explanation": "mana >= 8 accepts 8, 9 and larger values. > would reject 8; == would reject larger values; <= would allow values below 8.",
    "lessonId": "python-lesson-ordering",
    "options": [
      {
        "id": "python-valley-crossroads-threshold-a",
        "label": "mana > 8",
        "feedback": "> accepts values above 8, but leaves out exactly 8."
      },
      {
        "id": "python-valley-crossroads-threshold-b",
        "label": "mana == 8",
        "feedback": "== accepts exactly 8, but rejects larger amounts."
      },
      {
        "id": "python-valley-crossroads-threshold-c",
        "label": "mana >= 8",
        "feedback": ">= includes the boundary and larger values."
      },
      {
        "id": "python-valley-crossroads-threshold-d",
        "label": "mana <= 8",
        "feedback": "<= accepts values below 8. The gate needs at least 8."
      }
    ],
    "validation": {
      "kind": "option-id",
      "correctOptionId": "python-valley-crossroads-threshold-c"
    }
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
