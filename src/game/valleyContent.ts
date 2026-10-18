import type { Chapter, Exercise, Mission, World } from './worldTypes';

export const valleyOfDecisions: World = {
  id: 'python-valley-of-decisions', languageId: 'python', title: 'Valley of Decisions',
  description: 'Beyond the forest, ancient gates respond to your choices. Turn conditions into Python spells.',
  chapterIds: ['python-valley-crossroads', 'python-valley-guardian', 'python-valley-three-gates', 'python-valley-twin-runes', 'python-valley-mirror-of-truth'],
  prerequisiteMissionIds: [
    'python-forest-awakening-01', 'python-forest-fire-essence-01', 'python-forest-mana-stones-01',
    'python-forest-talking-trees-01', 'python-forest-broken-spells-01', 'python-forest-goblin-king-01',
  ],
  xpReward: 240,
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
  {
    id: 'python-valley-three-gates', worldId: valleyOfDecisions.id, title: 'The Three Gates',
    description: 'Three magical gates offer different paths. Read their conditions to choose the first open route.',
    learningObjective: 'Use elif to check several conditions in order and follow the first match.',
    missionIds: ['python-valley-three-gates-01'], prerequisiteMissionIds: ['python-valley-guardian-01'], xpReward: 30,
  },
  {
    id: 'python-valley-twin-runes', worldId: valleyOfDecisions.id, title: 'The Twin Runes',
    description: 'Paired runes guard the next passage. Discover when both must glow and when either will do.',
    learningObjective: 'Combine conditions with and for both, or with or for at least one.',
    missionIds: ['python-valley-twin-runes-01'], prerequisiteMissionIds: ['python-valley-three-gates-01'], xpReward: 30,
  },
  {
    id: 'python-valley-mirror-of-truth', worldId: valleyOfDecisions.id, title: 'Mirror of Truth',
    description: 'An enchanted mirror reverses the glow of ancient seals. Read what is missing to reveal the passage.',
    learningObjective: 'Use not to reverse True and False and check when something is absent.',
    missionIds: ['python-valley-mirror-of-truth-01'], prerequisiteMissionIds: ['python-valley-twin-runes-01'], xpReward: 30,
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
  {
    id: 'python-valley-three-gates-01', chapterId: 'python-valley-three-gates', title: 'The Three Gates',
    description: 'Choose a path through three quick elif spells.', encounter: 'guardian',
    exerciseIds: ['python-valley-three-gates-output', 'python-valley-three-gates-keyword', 'python-valley-three-gates-first'],
    prerequisiteMissionIds: [], xpReward: 30,
  },
  {
    id: 'python-valley-twin-runes-01', chapterId: 'python-valley-twin-runes', title: 'The Twin Runes',
    description: 'Light the paired runes with three spells using and and or.', encounter: 'guardian',
    exerciseIds: ['python-valley-twin-runes-and', 'python-valley-twin-runes-operator', 'python-valley-twin-runes-or'],
    prerequisiteMissionIds: [], xpReward: 30,
  },
  {
    id: 'python-valley-mirror-of-truth-01', chapterId: 'python-valley-mirror-of-truth', title: 'Mirror of Truth',
    description: 'Cast three reversal spells with not to clear the enchanted mirror.', encounter: 'guardian',
    exerciseIds: ['python-valley-mirror-reversal', 'python-valley-mirror-keyword', 'python-valley-mirror-passage'],
    prerequisiteMissionIds: [], xpReward: 30,
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
    "id": "python-valley-guardian-if",
    "chapterId": "python-valley-guardian",
    "languageId": "python",
    "difficulty": "intro",
    "type": "missing-token",
    "concept": "if statements",
    "prompt": "Choose the keyword that runs the indented line only when the condition is True.",
    "code": "mana = 5\n____ mana >= 3:\n    print(\"Cast\")",
    "hint": "A condition asks a yes-or-no question. Which keyword checks it?",
    "explanation": "if checks mana >= 3. Since 5 >= 3 is True, Python runs the indented line and displays Cast.",
    "lessonId": "python-lesson-if-block",
    "options": [
      {
        "id": "python-valley-guardian-if-a",
        "label": "else",
        "feedback": "else needs an earlier if and has no condition of its own. This line must check a condition."
      },
      {
        "id": "python-valley-guardian-if-b",
        "label": "if",
        "feedback": "if checks the condition and runs its indented block only when it is True."
      },
      {
        "id": "python-valley-guardian-if-c",
        "label": "print",
        "feedback": "print() displays a value. It does not begin a conditional block."
      }
    ],
    "validation": {
      "kind": "option-id",
      "correctOptionId": "python-valley-guardian-if-b"
    }
  },
  {
    "id": "python-valley-guardian-indent",
    "chapterId": "python-valley-guardian",
    "languageId": "python",
    "difficulty": "practice",
    "type": "multiple-choice",
    "concept": "Python indentation",
    "prompt": "Choose the repaired spell. Keep mana and if at the left edge; indent print() four spaces inside the if block.",
    "code": "mana = 5\nif mana >= 3:\nprint(\"Cast\")",
    "hint": "Spaces at the start group instructions. The line controlled by if must be moved inward.",
    "explanation": "The four spaces put print() inside the if block. The condition is True, so Cast is printed. Leaving print() at the left edge gives a syntax error because if needs an indented block.",
    "lessonId": "python-lesson-if-block",
    "optionFormat": "code",
    "options": [
      {
        "id": "python-valley-guardian-indent-a",
        "label": "mana = 5\nif mana >= 3:\nprint(\"Cast\")",
        "feedback": "The print line has no indentation. Python needs an indented block after if."
      },
      {
        "id": "python-valley-guardian-indent-b",
        "label": "mana = 5\n    if mana >= 3:\n    print(\"Cast\")",
        "feedback": "if is unexpectedly indented, and print is not farther in than if. Keep if at the left edge."
      },
      {
        "id": "python-valley-guardian-indent-c",
        "label": "mana = 5\nif mana >= 3:\n    print(\"Cast\")",
        "feedback": "Only print is moved four spaces inward, so it belongs to the if block."
      }
    ],
    "validation": {
      "kind": "option-id",
      "correctOptionId": "python-valley-guardian-indent-c"
    }
  },
  {
    "id": "python-valley-guardian-skip",
    "chapterId": "python-valley-guardian",
    "languageId": "python",
    "difficulty": "practice",
    "type": "output-choice",
    "concept": "conditional execution",
    "prompt": "Which output appears? Notice where the final print() begins.",
    "code": "mana = 1\nif mana >= 3:\n    print(\"Cast\")\nprint(\"Ready\")",
    "hint": "Check the condition, then compare the starting positions of the two print lines.",
    "explanation": "1 >= 3 is False, so the indented Cast line is skipped. Ready still prints because its line is outside the if block.",
    "lessonId": "python-lesson-skipping-blocks",
    "options": [
      {
        "id": "python-valley-guardian-skip-a",
        "label": "Cast\nReady",
        "feedback": "The final line runs, but the false condition skips the indented Cast line."
      },
      {
        "id": "python-valley-guardian-skip-b",
        "label": "Ready",
        "feedback": "Only the print outside the block runs when this condition is False."
      },
      {
        "id": "python-valley-guardian-skip-c",
        "label": "Cast",
        "feedback": "The false condition skips Cast. The unindented print still runs and shows Ready."
      }
    ],
    "validation": {
      "kind": "option-id",
      "correctOptionId": "python-valley-guardian-skip-b"
    }
  },
  {
    "id": "python-valley-guardian-else",
    "chapterId": "python-valley-guardian",
    "languageId": "python",
    "difficulty": "practice",
    "type": "missing-token",
    "concept": "else statements",
    "prompt": "Choose the keyword for the alternative block when the if condition is False.",
    "code": "mana = 1\nif mana >= 3:\n    print(\"Cast\")\n____:\n    print(\"Rest\")",
    "hint": "The alternative begins level with if and needs no new condition.",
    "explanation": "else selects the alternative when the if condition is False. Here 1 is below 3, so Python prints Rest and skips Cast.",
    "lessonId": "python-lesson-else-branches",
    "options": [
      {
        "id": "python-valley-guardian-else-a",
        "label": "else",
        "feedback": "else runs its indented block when the preceding if condition is False."
      },
      {
        "id": "python-valley-guardian-else-b",
        "label": "if",
        "feedback": "A new if would need another condition. This blank is the alternative to the existing if."
      },
      {
        "id": "python-valley-guardian-else-c",
        "label": "False",
        "feedback": "False is a Boolean value, not a keyword that begins an alternative block."
      }
    ],
    "validation": {
      "kind": "option-id",
      "correctOptionId": "python-valley-guardian-else-a"
    }
  },
  {
    "id": "python-valley-guardian-branch",
    "chapterId": "python-valley-guardian",
    "languageId": "python",
    "difficulty": "challenge",
    "type": "multiple-choice",
    "concept": "choosing the correct branch",
    "prompt": "Repair only the comparison. Choose the spell that prints Rest for mana below 3, and Cast for 3 or more. It must work at the boundary too.",
    "code": "mana = 2\nif mana >= 3:\n    print(\"Rest\")\nelse:\n    print(\"Cast\")",
    "hint": "Test the rule with both 2 and exactly 3. Keep else level with if.",
    "explanation": "mana < 3 sends low mana to Rest. At exactly 3 or above, that condition is False and else prints Cast. Only one branch runs each time.",
    "lessonId": "python-lesson-else-branches",
    "optionFormat": "code",
    "options": [
      {
        "id": "python-valley-guardian-branch-a",
        "label": "mana = 2\nif mana <= 3:\n    print(\"Rest\")\nelse:\n    print(\"Cast\")",
        "feedback": "<= would also send exactly 3 to Rest. The rule requires Cast at 3."
      },
      {
        "id": "python-valley-guardian-branch-b",
        "label": "mana = 2\nif mana < 3:\n    print(\"Rest\")\nelse:\n    print(\"Cast\")",
        "feedback": "< selects Rest below 3. At 3 and above, the alternative selects Cast."
      },
      {
        "id": "python-valley-guardian-branch-c",
        "label": "mana = 2\nif mana >= 3:\n    print(\"Rest\")\nelse:\n    print(\"Cast\")",
        "feedback": "This reverses the rule: low mana prints Cast, while 3 or more prints Rest."
      }
    ],
    "validation": {
      "kind": "option-id",
      "correctOptionId": "python-valley-guardian-branch-b"
    }
  },

  {
    id: 'python-valley-three-gates-output', chapterId: 'python-valley-three-gates', languageId: 'python', difficulty: 'intro',
    type: 'output-choice', concept: 'following an elif chain', lessonId: 'python-lesson-elif-paths',
    prompt: 'Which gate name appears? Check the conditions from top to bottom.',
    code: 'crystals = 7\nif crystals >= 12:\n    print("Ruby")\nelif crystals >= 6:\n    print("Sapphire")\nelse:\n    print("Pebble")',
    hint: 'Try the first comparison before the second. Stop once a branch matches.',
    explanation: '7 >= 12 is False, so Python checks elif. 7 >= 6 is True, so it prints Sapphire. The else branch is skipped.',
    options: [
      { id: 'python-valley-three-gates-output-a', label: 'Ruby', feedback: 'Seven crystals do not meet the first requirement of at least twelve. Check the next condition.' },
      { id: 'python-valley-three-gates-output-b', label: 'Sapphire', feedback: 'The first condition fails and the elif condition matches, so only Sapphire prints.' },
      { id: 'python-valley-three-gates-output-c', label: 'Sapphire\nPebble', feedback: 'else runs only if every earlier condition fails. The elif branch matched, so Pebble is skipped.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-valley-three-gates-output-b' },
  },
  {
    id: 'python-valley-three-gates-keyword', chapterId: 'python-valley-three-gates', languageId: 'python', difficulty: 'practice',
    type: 'missing-token', concept: 'continuing one conditional chain', lessonId: 'python-lesson-elif-paths',
    prompt: 'Continue the same chain. Which keyword checks this second condition only if the first one was False?',
    code: 'mana = 3\nif mana >= 8:\n    print("Fire")\n____ mana >= 2:\n    print("Frost")\nelse:\n    print("Rest")',
    hint: 'The next check must belong to the original if, rather than start a separate decision.',
    explanation: 'elif adds another condition to the same chain. Here 3 is below 8 but at least 2, so only Frost prints. A separate if could run even after the first branch matched.',
    options: [
      { id: 'python-valley-three-gates-keyword-a', label: 'if', feedback: 'Another if starts an independent decision. It would still check its condition after the first branch matched.' },
      { id: 'python-valley-three-gates-keyword-b', label: 'else', feedback: 'else is the fallback without a condition. This line has a comparison to check.' },
      { id: 'python-valley-three-gates-keyword-c', label: 'elif', feedback: 'elif checks another condition only when earlier branches in this chain did not match.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-valley-three-gates-keyword-c' },
  },
  {
    id: 'python-valley-three-gates-first', chapterId: 'python-valley-three-gates', languageId: 'python', difficulty: 'practice',
    type: 'multiple-choice', concept: 'only the first matching branch', lessonId: 'python-lesson-elif-paths',
    prompt: 'Both comparisons would be True. Which branch actually runs in this chain?',
    code: 'power = 10\nif power >= 8:\n    print("Crown")\nelif power >= 4:\n    print("Staff")\nelse:\n    print("Twig")',
    hint: 'Python stops choosing as soon as one condition in this chain matches.',
    explanation: 'The first condition, 10 >= 8, is True. Python prints Crown and skips the remaining branches, even though 10 >= 4 would also be True.',
    options: [
      { id: 'python-valley-three-gates-first-a', label: 'The if branch: Crown', feedback: 'The first condition matches. Its branch runs and the rest of this chain is skipped.' },
      { id: 'python-valley-three-gates-first-b', label: 'The elif branch: Staff', feedback: 'The earlier if already matched. Python does not continue looking for another matching branch.' },
      { id: 'python-valley-three-gates-first-c', label: 'Both branches: Crown then Staff', feedback: 'An if/elif/else chain chooses just one branch. Separate if statements would be different.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-valley-three-gates-first-a' },
  },
  {
    id: 'python-valley-twin-runes-and', chapterId: 'python-valley-twin-runes', languageId: 'python', difficulty: 'intro',
    type: 'output-choice', concept: 'both conditions with and', lessonId: 'python-lesson-both-runes',
    prompt: 'Which message appears when the spell needs enough mana and enough health?',
    code: 'mana = 6\nhealth = 4\nif mana >= 5 and health >= 10:\n    print("Cast")\nelse:\n    print("Heal")',
    hint: 'Check each comparison. Does and accept just one True condition?',
    explanation: 'The mana comparison is True, but the health comparison is False. and needs both to be True, so the combined condition is False and else prints Heal.',
    options: [
      { id: 'python-valley-twin-runes-and-a', label: 'Cast', feedback: 'Mana is high enough, but health is too low. and requires both comparisons to be True.' },
      { id: 'python-valley-twin-runes-and-b', label: 'Cast\nHeal', feedback: 'The combined condition chooses one branch. It does not run a branch for each comparison.' },
      { id: 'python-valley-twin-runes-and-c', label: 'Heal', feedback: 'One comparison is False, so and is False and the alternative prints Heal.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-valley-twin-runes-and-c' },
  },
  {
    id: 'python-valley-twin-runes-operator', chapterId: 'python-valley-twin-runes', languageId: 'python', difficulty: 'practice',
    type: 'missing-token', concept: 'at least one condition with or', lessonId: 'python-lesson-either-rune',
    prompt: 'Choose the operator that allows entry with a key, a known spell, or both. It must work for every combination.',
    code: 'has_key = False\nknows_spell = True\nif has_key ____ knows_spell:\n    print("Enter")\nelse:\n    print("Wait")',
    hint: 'At least one way to enter must be True; two ways should work too.',
    explanation: 'or accepts at least one True condition, including when both are True. Here the known spell is enough, so Enter prints. and would require both ways.',
    options: [
      { id: 'python-valley-twin-runes-operator-a', label: 'and', feedback: 'and requires a key and a spell together. The rule allows either one on its own.' },
      { id: 'python-valley-twin-runes-operator-b', label: 'or', feedback: 'or accepts either condition or both. It fails only when both conditions are False.' },
      { id: 'python-valley-twin-runes-operator-c', label: '==', feedback: '== compares the Boolean values. It would wrongly allow entry when both are False because they are equal.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-valley-twin-runes-operator-b' },
  },
  {
    id: 'python-valley-twin-runes-or', chapterId: 'python-valley-twin-runes', languageId: 'python', difficulty: 'practice',
    type: 'output-choice', concept: 'or also accepts both conditions', lessonId: 'python-lesson-either-rune',
    prompt: 'Both tools are available. What does this or condition print?',
    code: 'has_map = True\nhas_compass = True\nif has_map or has_compass:\n    print("Explore")\nelse:\n    print("Camp")',
    hint: 'At least one includes both. A matching condition runs its block once.',
    explanation: 'or is True when one or both conditions are True. The if block runs once and prints Explore. It does not run twice because two tools are available.',
    options: [
      { id: 'python-valley-twin-runes-or-a', label: 'Explore', feedback: 'Both conditions are True, which satisfies or. The chosen block runs once.' },
      { id: 'python-valley-twin-runes-or-b', label: 'Camp', feedback: 'or includes the case where both conditions are True. It does not require exactly one.' },
      { id: 'python-valley-twin-runes-or-c', label: 'Explore\nExplore', feedback: 'The two conditions choose one block. They do not each run a separate copy of print().' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-valley-twin-runes-or-a' },
  },
  {
    id: 'python-valley-mirror-reversal', chapterId: 'python-valley-mirror-of-truth', languageId: 'python', difficulty: 'intro',
    type: 'output-choice', concept: 'reversing a Boolean', lessonId: 'python-lesson-not-reversal',
    prompt: 'The ward is active. What Boolean does its reflection print?',
    code: 'ward_active = True\nprint(not ward_active)',
    hint: 'Read the stored value first, then reverse it with not.',
    explanation: 'ward_active holds True. not True becomes False, so False prints. The expression does not change the stored value of ward_active.',
    options: [
      { id: 'python-valley-mirror-reversal-a', label: 'True', feedback: 'True is the stored value, but not reverses it before print() displays the result.' },
      { id: 'python-valley-mirror-reversal-b', label: 'False', feedback: 'not reverses the Boolean True to False. That is the value print() displays.' },
      { id: 'python-valley-mirror-reversal-c', label: 'not True', feedback: 'Python evaluates not rather than printing the code as text. It displays the resulting Boolean.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-valley-mirror-reversal-b' },
  },
  {
    id: 'python-valley-mirror-keyword', chapterId: 'python-valley-mirror-of-truth', languageId: 'python', difficulty: 'practice',
    type: 'missing-token', concept: 'checking for a missing shield', lessonId: 'python-lesson-not-condition',
    prompt: 'Raise a shield only when one is missing. Which keyword reverses has_shield?',
    code: 'has_shield = False\nif ____ has_shield:\n    print("Raise shield")\nelse:\n    print("Ready")',
    hint: 'You need one operator that turns False into True, not an operator joining two conditions.',
    explanation: 'not has_shield becomes not False, which is True. The if block prints Raise shield. Checking what is missing helps the player prepare.',
    options: [
      { id: 'python-valley-mirror-keyword-a', label: 'not', feedback: 'not reverses False to True, so the shield reminder runs when a shield is missing.' },
      { id: 'python-valley-mirror-keyword-b', label: 'and', feedback: 'and joins two conditions and needs both. There is no condition to its left here; use an operator that reverses one Boolean.' },
      { id: 'python-valley-mirror-keyword-c', label: 'or', feedback: 'or joins two conditions; it does not reverse this value. This blank needs an operator for one Boolean.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-valley-mirror-keyword-a' },
  },
  {
    id: 'python-valley-mirror-passage', chapterId: 'python-valley-mirror-of-truth', languageId: 'python', difficulty: 'practice',
    type: 'output-choice', concept: 'opening a path when a seal is gone', lessonId: 'python-lesson-not-condition',
    prompt: 'Final spell: the seal is gone. Which message reveals the path through the mirror?',
    code: 'seal_intact = False\nif not seal_intact:\n    print("Mirror cleared!")\nelse:\n    print("Break the seal")',
    hint: 'Evaluate not False before deciding between if and else.',
    explanation: 'The seal is no longer intact: seal_intact is False. not False is True, so the if branch prints Mirror cleared! and skips else. Your final reversal spell reveals the passage.',
    options: [
      { id: 'python-valley-mirror-passage-a', label: 'Break the seal', feedback: 'That is the else branch. The condition includes not, so the stored False becomes a True condition.' },
      { id: 'python-valley-mirror-passage-b', label: 'Mirror cleared!\nBreak the seal', feedback: 'Only one branch runs. Once the True condition chooses if, Python skips the else block.' },
      { id: 'python-valley-mirror-passage-c', label: 'Mirror cleared!', feedback: 'not False is True. The if branch runs once, revealing the clear passage.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-valley-mirror-passage-c' },
  },
];
