import { valleyChapters, valleyExercises, valleyMissions, valleyOfDecisions } from './valleyContent';
import type { Chapter, Exercise, Mission, World } from './worldTypes';

export const forestOfVariables: World = {
  id: 'python-forest-of-variables',
  languageId: 'python',
  title: 'Forest of Variables',
  description: 'Learn the first Python spells while exploring a forest of curious creatures.',
  chapterIds: [
    'python-forest-awakening',
    'python-forest-fire-essence',
    'python-forest-mana-stones',
    'python-forest-talking-trees',
    'python-forest-broken-spells',
    'python-forest-goblin-king',
  ],
  prerequisiteMissionIds: [],
  xpReward: 300,
};

export const worlds: readonly World[] = [forestOfVariables, valleyOfDecisions];

export const forestChapters: readonly Chapter[] = [
  { id: 'python-forest-awakening', worldId: forestOfVariables.id, title: 'The Awakening', description: 'Speak your first command aloud.', learningObjective: 'Use print() to display text.', missionIds: ['python-forest-awakening-01'], prerequisiteMissionIds: [], xpReward: 20 },
  { id: 'python-forest-fire-essence', worldId: forestOfVariables.id, title: 'Fire Essence', description: 'Give a name to a spark of power.', learningObjective: 'Assign an integer value to a variable.', missionIds: ['python-forest-fire-essence-01'], prerequisiteMissionIds: ['python-forest-awakening-01'], xpReward: 30 },
  { id: 'python-forest-mana-stones', worldId: forestOfVariables.id, title: 'Mana Stones', description: 'Count the energy left after a spell.', learningObjective: 'Use integer arithmetic and the subtraction operator.', missionIds: ['python-forest-mana-stones-01'], prerequisiteMissionIds: ['python-forest-fire-essence-01'], xpReward: 40 },
  { id: 'python-forest-talking-trees', worldId: forestOfVariables.id, title: 'Talking Trees', description: 'Join words to answer the forest.', learningObjective: 'Join strings with the + operator and predict their output.', missionIds: ['python-forest-talking-trees-01'], prerequisiteMissionIds: ['python-forest-mana-stones-01'], xpReward: 50 },
  { id: 'python-forest-broken-spells', worldId: forestOfVariables.id, title: 'Broken Spells', description: 'Repair a misspelled variable name.', learningObjective: 'Identify and correct a beginner Python name error.', missionIds: ['python-forest-broken-spells-01'], prerequisiteMissionIds: ['python-forest-talking-trees-01'], xpReward: 60 },
  { id: 'python-forest-goblin-king', worldId: forestOfVariables.id, title: "Goblin King's Lair", description: 'Combine your first Python skills in a final trial.', learningObjective: 'Trace variables, strings, arithmetic, and print() together.', missionIds: ['python-forest-goblin-king-01'], prerequisiteMissionIds: ['python-forest-broken-spells-01'], xpReward: 100 },
];

export const forestMissions: readonly Mission[] = [
  { id: 'python-forest-awakening-01', chapterId: 'python-forest-awakening', title: 'A Voice in the Forest', description: 'Call out a greeting with print().', exerciseIds: ['python-forest-awakening-print', 'python-forest-awakening-literal', 'python-forest-awakening-number', 'python-forest-awakening-output', 'python-forest-awakening-repair'], prerequisiteMissionIds: [], xpReward: 20 },
  { id: 'python-forest-fire-essence-01', chapterId: 'python-forest-fire-essence', title: 'Bottle the Flame', description: 'Store a value in the mana variable.', exerciseIds: ['python-forest-fire-essence-assignment', 'python-forest-fire-essence-read', 'python-forest-fire-essence-update', 'python-forest-fire-essence-print', 'python-forest-fire-essence-name'], prerequisiteMissionIds: [], xpReward: 30 },
  { id: 'python-forest-mana-stones-01', chapterId: 'python-forest-mana-stones', title: 'Count the Stones', description: 'Choose the operation that spends mana.', exerciseIds: ['python-forest-mana-stones-operator', 'python-forest-mana-stones-addition', 'python-forest-mana-stones-multiplication', 'python-forest-mana-stones-precedence', 'python-forest-mana-stones-damage'], prerequisiteMissionIds: [], xpReward: 40 },
  { id: 'python-forest-talking-trees-01', chapterId: 'python-forest-talking-trees', title: 'The Tree Speaks', description: 'Predict the message made from two strings.', exerciseIds: ['python-forest-talking-trees-output', 'python-forest-talking-trees-variable', 'python-forest-talking-trees-repeat', 'python-forest-talking-trees-length', 'python-forest-talking-trees-repair'], prerequisiteMissionIds: [], xpReward: 50 },
  { id: 'python-forest-broken-spells-01', chapterId: 'python-forest-broken-spells', title: 'Mend the Rune', description: 'Find the misspelled variable.', exerciseIds: ['python-forest-broken-spells-name', 'python-forest-broken-spells-parenthesis', 'python-forest-broken-spells-quotes', 'python-forest-broken-spells-assignment', 'python-forest-broken-spells-debug'], prerequisiteMissionIds: [], xpReward: 60 },
  { id: 'python-forest-goblin-king-01', chapterId: 'python-forest-goblin-king', title: "The King's Test", description: 'Trace a short spell from start to finish.', exerciseIds: ['python-forest-goblin-king-output', 'python-forest-goblin-king-variable', 'python-forest-goblin-king-string', 'python-forest-goblin-king-arithmetic', 'python-forest-goblin-king-debug'], prerequisiteMissionIds: [], xpReward: 100 },
];

export const forestExercises: readonly Exercise[] = [
  {
    "id": "python-forest-awakening-print",
    "chapterId": "python-forest-awakening",
    "languageId": "python",
    "difficulty": "intro",
    "type": "missing-token",
    "concept": "print() and basic output",
    "prompt": "Tap the function name that will show this greeting.",
    "code": "____(\"Welcome to DevQuest\")",
    "hint": "The function name is lowercase and goes before the parentheses.",
    "explanation": "print() shows the greeting on screen. The message goes inside the parentheses, between matching quotes.",
    "lessonId": "python-lesson-first-output",
    "options": [
      {
        "id": "python-forest-awakening-print-a",
        "label": "show",
        "feedback": "Python does not have a built-in show() function for this. Think of the function from the example."
      },
      {
        "id": "python-forest-awakening-print-b",
        "label": "print",
        "feedback": "print() displays a value on the screen."
      },
      {
        "id": "python-forest-awakening-print-c",
        "label": "\"print\"",
        "feedback": "Quotes make text. Here we need a function name, without quotes."
      },
      {
        "id": "python-forest-awakening-print-d",
        "label": "Print",
        "feedback": "Python notices uppercase letters. The display function starts with a lowercase p."
      }
    ],
    "validation": {
      "kind": "option-id",
      "correctOptionId": "python-forest-awakening-print-b"
    }
  },
  {
    id: 'python-forest-fire-essence-assignment', chapterId: 'python-forest-fire-essence', languageId: 'python', difficulty: 'intro',
    type: 'missing-token', concept: 'variables and assignments', lessonId: 'python-lesson-variables',
    prompt: 'Store ten mana as a number, ready for calculations.', code: 'mana = ____',
    hint: 'Numbers go on the right of = without quotation marks.',
    explanation: 'mana = 10 stores the number 10 under the name mana. "10" would store text instead. One = assigns the value; == would compare values.',
    options: [
      { id: 'python-forest-fire-essence-assignment-a', label: '"10"', feedback: 'Quotes make this text. To calculate with mana, store a number without quotes.' },
      { id: 'python-forest-fire-essence-assignment-b', label: '10', feedback: '10 is a number, so the assignment stores ten mana for calculations.' },
      { id: 'python-forest-fire-essence-assignment-c', label: '1', feedback: 'This stores one point of mana. The spell needs ten.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-forest-fire-essence-assignment-b' },
  },
  {
    id: 'python-forest-mana-stones-operator', chapterId: 'python-forest-mana-stones', languageId: 'python', difficulty: 'intro',
    type: 'missing-token', concept: 'integer subtraction', lessonId: 'python-lesson-add-subtract',
    prompt: 'Spend 5 of your 20 mana. Which operator calculates what remains?', code: 'mana = 20\nremaining = mana ____ 5',
    hint: 'Spending takes away from a supply. Choose the subtraction sign.',
    explanation: 'The - operator calculates 20 - 5, so remaining stores 15. mana stays 20 because the result was assigned to a different name.',
    options: [
      { id: 'python-forest-mana-stones-operator-a', label: '+', feedback: '+ adds 5, giving 25. Spending mana should subtract it.' },
      { id: 'python-forest-mana-stones-operator-b', label: '-', feedback: '- subtracts the cost of 5 from 20, leaving 15.' },
      { id: 'python-forest-mana-stones-operator-c', label: '=', feedback: '= assigns a value. It does not subtract the cost from your mana.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-forest-mana-stones-operator-b' },
  },
  { id: 'python-forest-talking-trees-output', chapterId: 'python-forest-talking-trees', languageId: 'python', difficulty: 'intro', type: 'predict-output', concept: 'string concatenation', prompt: 'What exact line does this spell print?', code: 'greeting = "Hello"\nname = "Pyromancer"\nprint(greeting + ", " + name)', hint: 'The + operator joins all three strings in order.', explanation: 'Joining the strings preserves the comma and space, producing Hello, Pyromancer.', validation: { kind: 'exact', acceptedAnswers: ['Hello, Pyromancer'], caseSensitive: true } },
  { id: 'python-forest-broken-spells-name', chapterId: 'python-forest-broken-spells', languageId: 'python', difficulty: 'intro', type: 'fix-mistake', concept: 'variable name errors', prompt: 'Replace the misspelled name inside print().', code: 'energy = 7\nprint(enrgy)', hint: 'Compare the name in print() with the name assigned above it.', explanation: 'Python variable names must match exactly: energy is defined, but enrgy is not.', validation: { kind: 'exact', acceptedAnswers: ['energy'], caseSensitive: true } },
  { id: 'python-forest-goblin-king-output', chapterId: 'python-forest-goblin-king', languageId: 'python', difficulty: 'challenge', type: 'predict-output', concept: 'combined output, variables, and arithmetic', prompt: 'What two lines does this spell print?', code: 'hero = "Pyro"\nspells = 2 * 3\nprint(hero)\nprint(spells)', hint: 'First print the text stored in hero, then multiply 2 by 3.', explanation: 'hero contains Pyro and spells contains 6, so print() displays them on separate lines.', validation: { kind: 'exact', acceptedAnswers: ['Pyro\n6'], caseSensitive: true } },

  // Additional exercises are ordered by each mission's exerciseIds. The original six remain first for Stage 3C.1 gameplay.
  {
    "id": "python-forest-awakening-literal",
    "chapterId": "python-forest-awakening",
    "languageId": "python",
    "difficulty": "practice",
    "type": "missing-token",
    "concept": "string literals",
    "prompt": "Choose the text that makes this spell display Forest.",
    "code": "print(____)",
    "hint": "Text needs matching quotes. The quotes mark the text; they are not printed.",
    "explanation": "\"Forest\" is a string: a piece of text. print() displays Forest without the quotation marks.",
    "lessonId": "python-lesson-text-numbers",
    "options": [
      {
        "id": "python-forest-awakening-literal-a",
        "label": "Forest",
        "feedback": "Without quotes, Python looks for a name called Forest. We want to provide text directly."
      },
      {
        "id": "python-forest-awakening-literal-b",
        "label": "\"forest\"",
        "feedback": "Text keeps its uppercase and lowercase letters. The requested word begins with a capital F."
      },
      {
        "id": "python-forest-awakening-literal-c",
        "label": "\"Forest\"",
        "feedback": "Matching quotes mark the text to display."
      }
    ],
    "validation": {
      "kind": "option-id",
      "correctOptionId": "python-forest-awakening-literal-c"
    }
  },
  {
    "id": "python-forest-awakening-number",
    "chapterId": "python-forest-awakening",
    "languageId": "python",
    "difficulty": "practice",
    "type": "multiple-choice",
    "concept": "printing numbers",
    "prompt": "Why can this spell use 7 without quotation marks?",
    "code": "print(7)",
    "hint": "Compare how the lesson writes text and numbers.",
    "explanation": "Numbers can go directly inside print(). This displays 7. Quoting \"7\" would make it text, even though it looks the same on screen.",
    "lessonId": "python-lesson-text-numbers",
    "options": [
      {
        "id": "python-forest-awakening-number-a",
        "label": "Numbers can go directly inside print().",
        "feedback": "A number does not need quotation marks."
      },
      {
        "id": "python-forest-awakening-number-b",
        "label": "Quotation marks are never used in Python.",
        "feedback": "Text uses quotes. Numbers can be written without them."
      },
      {
        "id": "python-forest-awakening-number-c",
        "label": "7 is the name of a variable.",
        "feedback": "A digit is a number here, not a variable name."
      }
    ],
    "validation": {
      "kind": "option-id",
      "correctOptionId": "python-forest-awakening-number-a"
    }
  },
  {
    "id": "python-forest-awakening-output",
    "chapterId": "python-forest-awakening",
    "languageId": "python",
    "difficulty": "practice",
    "type": "output-choice",
    "concept": "understanding output",
    "prompt": "What appears on the screen?",
    "code": "print(\"Spark\")",
    "hint": "The quotation marks surround the text in code, but do not appear in its output.",
    "explanation": "The output is Spark. print() displays the text inside the quotes; it does not display its own name or the quote marks.",
    "lessonId": "python-lesson-first-output",
    "options": [
      {
        "id": "python-forest-awakening-output-a",
        "label": "\"Spark\"",
        "feedback": "Quotes mark where text starts and ends in code. They are not shown by this print() call."
      },
      {
        "id": "python-forest-awakening-output-b",
        "label": "print",
        "feedback": "print is the instruction. It displays the value inside its parentheses."
      },
      {
        "id": "python-forest-awakening-output-c",
        "label": "Nothing",
        "feedback": "This line calls print(), so it does display the message."
      },
      {
        "id": "python-forest-awakening-output-d",
        "label": "Spark",
        "feedback": "The message appears without quotes."
      }
    ],
    "validation": {
      "kind": "option-id",
      "correctOptionId": "python-forest-awakening-output-d"
    }
  },
  { id: 'python-forest-awakening-repair', chapterId: 'python-forest-awakening', languageId: 'python', difficulty: 'practice', type: 'fix-mistake', lessonId: 'python-lesson-first-output', concept: 'fixing a print statement', prompt: 'Replace the misspelled function name prnt with the correct one.', code: 'prnt("Ready")', hint: 'The function that displays a value has an i after pr.', explanation: 'Python calls the display function print(), so prnt is an undefined name.', validation: { kind: 'exact', acceptedAnswers: ['print'], caseSensitive: true } },

  {
    id: 'python-forest-fire-essence-read', chapterId: 'python-forest-fire-essence', languageId: 'python', difficulty: 'intro',
    type: 'multiple-choice', concept: 'reading variable values', lessonId: 'python-lesson-variables',
    prompt: 'Why does this show 10 instead of the word mana?', code: 'mana = 10\nprint(mana)',
    hint: 'A variable name lets Python read a stored value. Quoted text works differently.',
    explanation: 'mana is a name for the stored number 10. print(mana) reads that number. Using variables lets a game remember and reuse values.',
    options: [
      { id: 'python-forest-fire-essence-read-a', label: 'print() always shows 10.', feedback: 'print() shows the value it receives. A different stored number would give different output.' },
      { id: 'python-forest-fire-essence-read-b', label: 'mana is quoted text.', feedback: 'There are no quotes around mana in print(). Python reads the variable, not the word.' },
      { id: 'python-forest-fire-essence-read-c', label: 'mana is a name for the stored number 10.', feedback: 'The name mana lets print() read the number stored by the assignment.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-forest-fire-essence-read-c' },
  },
  {
    id: 'python-forest-fire-essence-update', chapterId: 'python-forest-fire-essence', languageId: 'python', difficulty: 'practice',
    type: 'output-choice', concept: 'updating variables', lessonId: 'python-lesson-variable-update',
    prompt: 'You refill your mana. What number appears?', code: 'mana = 4\nmana = mana + 3\nprint(mana)',
    hint: 'Read the old mana value on the right, add 3, then store the result.',
    explanation: 'Python reads the old value 4, adds 3 and stores 7 back in mana. This replaces 4. print(mana) then displays the new value, 7.',
    options: [
      { id: 'python-forest-fire-essence-update-a', label: '4', feedback: '4 was the old value. The next assignment replaces it with the result of adding 3.' },
      { id: 'python-forest-fire-essence-update-b', label: '7', feedback: 'The old value 4 plus 3 becomes the new value 7.' },
      { id: 'python-forest-fire-essence-update-c', label: '3', feedback: '3 is the amount added. Python stores the result of 4 + 3, not just the extra amount.' },
      { id: 'python-forest-fire-essence-update-d', label: '43', feedback: 'These are numbers without quotes. + adds their values; it does not place their digits side by side.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-forest-fire-essence-update-b' },
  },
  {
    id: 'python-forest-fire-essence-print', chapterId: 'python-forest-fire-essence', languageId: 'python', difficulty: 'practice',
    type: 'output-choice', concept: 'printing variables', lessonId: 'python-lesson-variable-text',
    prompt: 'Your hero has a name. What does this spell display?', code: 'hero = "Mage"\nprint(hero)',
    hint: 'Without quotes around hero, Python reads the text stored in it.',
    explanation: 'hero stores the string Mage. print(hero) displays that value without quotation marks. print("hero") would display the word hero instead.',
    options: [
      { id: 'python-forest-fire-essence-print-a', label: 'Mage', feedback: 'print(hero) reads the stored text and displays Mage without quotes.' },
      { id: 'python-forest-fire-essence-print-b', label: 'hero', feedback: 'The word hero would appear if print() received "hero" in quotes. Here it reads a variable.' },
      { id: 'python-forest-fire-essence-print-c', label: '"Mage"', feedback: 'The quotes mark the text in code. They are not part of the stored message or its output.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-forest-fire-essence-print-a' },
  },
  {
    id: 'python-forest-fire-essence-name', chapterId: 'python-forest-fire-essence', languageId: 'python', difficulty: 'practice',
    type: 'missing-token', concept: 'debugging variable names', lessonId: 'python-lesson-variables',
    prompt: 'Choose the name that reads the stored flame value.', code: 'flame = 8\nprint(____)',
    hint: 'Match the name on the first line exactly, without quotation marks.',
    explanation: 'flame is the defined name, so print(flame) displays 8. flmae is misspelled. "flame" is text, not a request to read the variable.',
    options: [
      { id: 'python-forest-fire-essence-name-a', label: 'flmae', feedback: 'Two letters are swapped. Python needs the exact name flame from the assignment.' },
      { id: 'python-forest-fire-essence-name-b', label: '"flame"', feedback: 'Quotes would display the word flame instead of reading the stored number.' },
      { id: 'python-forest-fire-essence-name-c', label: 'flame', feedback: 'This matches the defined name and reads its stored value, 8.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-forest-fire-essence-name-c' },
  },

  {
    id: 'python-forest-mana-stones-addition', chapterId: 'python-forest-mana-stones', languageId: 'python', difficulty: 'intro',
    type: 'output-choice', concept: 'integer addition', lessonId: 'python-lesson-add-subtract',
    prompt: 'You collect two groups of stones. How many are printed?', code: 'stones = 3 + 4\nprint(stones)',
    hint: 'Add the two numbers before storing the result in stones.',
    explanation: 'Python adds 3 and 4 to get 7, stores 7 in stones and then prints it. Numbers are added, not joined as written digits.',
    options: [
      { id: 'python-forest-mana-stones-addition-a', label: '34', feedback: '3 and 4 are numbers. + adds their values; it does not join the written digits.' },
      { id: 'python-forest-mana-stones-addition-b', label: '4', feedback: 'Python calculates the whole right side, 3 + 4, before storing the result.' },
      { id: 'python-forest-mana-stones-addition-c', label: '7', feedback: 'Adding 3 and 4 gives 7, the value stored and printed.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-forest-mana-stones-addition-c' },
  },
  {
    id: 'python-forest-mana-stones-multiplication', chapterId: 'python-forest-mana-stones', languageId: 'python', difficulty: 'practice',
    type: 'missing-token', concept: 'integer multiplication', lessonId: 'python-lesson-multiply',
    prompt: 'Two spells have 5 power each. Which Python operator gives their total power?', code: 'power = 2 ____ 5',
    hint: 'Equal groups call for multiplication. Use the Python symbol from the lesson.',
    explanation: 'Python uses * to multiply. 2 * 5 gives 10, the power of two spells with 5 power each. x is not the multiplication operator.',
    options: [
      { id: 'python-forest-mana-stones-multiplication-a', label: '+', feedback: '+ gives 2 + 5 = 7. Two groups of 5 need multiplication.' },
      { id: 'python-forest-mana-stones-multiplication-b', label: 'x', feedback: 'x is a letter in Python, not its multiplication operator. Use the star symbol.' },
      { id: 'python-forest-mana-stones-multiplication-c', label: '*', feedback: '* multiplies the group count by the power per group: 2 * 5 gives 10.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-forest-mana-stones-multiplication-c' },
  },
  {
    id: 'python-forest-mana-stones-precedence', chapterId: 'python-forest-mana-stones', languageId: 'python', difficulty: 'practice',
    type: 'output-choice', concept: 'order of operations', lessonId: 'python-lesson-calculation-order',
    prompt: 'What number does this mixed calculation print?', code: 'print(2 + 3 * 4)',
    hint: 'Do the multiplication first, then add the remaining number.',
    explanation: 'Python calculates 3 * 4 first to get 12, then adds 2. The output is 14, not 20: addition does not happen first.',
    options: [
      { id: 'python-forest-mana-stones-precedence-a', label: '14', feedback: 'Multiplication gives 12, then adding 2 gives 14.' },
      { id: 'python-forest-mana-stones-precedence-b', label: '20', feedback: '20 comes from adding 2 + 3 first. Python does the multiplication before that addition.' },
      { id: 'python-forest-mana-stones-precedence-c', label: '9', feedback: '9 adds all three numbers, but * means multiply. Calculate 3 * 4 before adding 2.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-forest-mana-stones-precedence-a' },
  },
  {
    id: 'python-forest-mana-stones-damage', chapterId: 'python-forest-mana-stones', languageId: 'python', difficulty: 'challenge',
    type: 'output-choice', concept: 'calculating damage', lessonId: 'python-lesson-calculation-order',
    prompt: 'Read the stored values. How much damage does your spell print?', code: 'power = 6\nbonus = 2\ndamage = power * bonus + 1\nprint(damage)',
    hint: 'Use the numbers stored in power and bonus. Multiply, then add the extra point.',
    explanation: 'power supplies 6 and bonus supplies 2. Python calculates 6 * 2 = 12, then adds 1. damage stores 13, which print(damage) displays.',
    options: [
      { id: 'python-forest-mana-stones-damage-a', label: '18', feedback: '18 adds the extra point to bonus before multiplying. Python multiplies 6 * 2 first.' },
      { id: 'python-forest-mana-stones-damage-b', label: '13', feedback: '6 * 2 gives 12, then the extra point makes 13.' },
      { id: 'python-forest-mana-stones-damage-c', label: '12', feedback: '12 is the multiplication result. There is still one extra point to add.' },
    ],
    validation: { kind: 'option-id', correctOptionId: 'python-forest-mana-stones-damage-b' },
  },

  { id: 'python-forest-talking-trees-variable', chapterId: 'python-forest-talking-trees', languageId: 'python', difficulty: 'intro', type: 'predict-output', concept: 'string variables', prompt: 'What exact word does the tree print?', code: 'tree = "Oak"\nprint(tree)', hint: 'The name tree stores the text Oak.', explanation: 'print(tree) displays the string stored in tree: Oak.', validation: { kind: 'exact', acceptedAnswers: ['Oak'], caseSensitive: true } },
  { id: 'python-forest-talking-trees-repeat', chapterId: 'python-forest-talking-trees', languageId: 'python', difficulty: 'practice', type: 'predict-output', concept: 'string repetition', prompt: 'What exact text is printed?', code: 'print("ha" * 3)', hint: 'Repeat ha three times with no spaces added.', explanation: 'Multiplying a string by 3 repeats it three times, producing hahaha.', validation: { kind: 'exact', acceptedAnswers: ['hahaha'], caseSensitive: true } },
  { id: 'python-forest-talking-trees-length', chapterId: 'python-forest-talking-trees', languageId: 'python', difficulty: 'practice', type: 'predict-output', concept: 'string length', prompt: 'What number does len() print for forest?', code: 'print(len("forest"))', hint: 'Count each letter in forest.', explanation: 'len() counts the six characters in forest, so the output is 6.', validation: { kind: 'exact', acceptedAnswers: ['6'], caseSensitive: true } },
  { id: 'python-forest-talking-trees-repair', chapterId: 'python-forest-talking-trees', languageId: 'python', difficulty: 'challenge', type: 'fix-mistake', concept: 'fixing string operations', prompt: 'Replace the integer 3 with a quoted string so the spell prints Moon3.', code: 'word = "Moon"\nprint(word + 3)', hint: 'Both values joined with + need to be strings.', explanation: 'A string cannot be joined directly to an integer; quoting 3 makes it text.', validation: { kind: 'exact', acceptedAnswers: ['"3"', "'3'"], caseSensitive: true } },

  { id: 'python-forest-broken-spells-parenthesis', chapterId: 'python-forest-broken-spells', languageId: 'python', difficulty: 'intro', type: 'fill-blank', concept: 'syntax mistakes', prompt: 'Fill the blank with the one character that closes this print call.', code: 'print("Start"____', hint: 'The opening ( needs a matching closing character.', explanation: 'A closing parenthesis completes the print() call.', validation: { kind: 'exact', acceptedAnswers: [')'], caseSensitive: true } },
  { id: 'python-forest-broken-spells-quotes', chapterId: 'python-forest-broken-spells', languageId: 'python', difficulty: 'practice', type: 'fix-mistake', concept: 'missing quotation marks', prompt: 'Replace Fire with a quoted string literal so the spell prints Fire.', code: 'print(Fire)', hint: 'Without quotes, Python looks for a variable named Fire.', explanation: 'Putting Fire inside matching quotes makes it a string literal.', validation: { kind: 'exact', acceptedAnswers: ['"Fire"', "'Fire'"], caseSensitive: true } },
  { id: 'python-forest-broken-spells-assignment', chapterId: 'python-forest-broken-spells', languageId: 'python', difficulty: 'practice', type: 'fix-mistake', concept: 'incorrect operators', prompt: 'Replace == with the assignment operator to store 5 in mana.', code: 'mana == 5\nprint(mana)', hint: 'One equals sign assigns a value; two compare values.', explanation: '= assigns 5 to mana. == only compares values and leaves mana undefined here.', validation: { kind: 'exact', acceptedAnswers: ['='], caseSensitive: true } },
  { id: 'python-forest-broken-spells-debug', chapterId: 'python-forest-broken-spells', languageId: 'python', difficulty: 'challenge', type: 'fix-mistake', concept: 'simple debugging', prompt: 'Replace "power" in print() with the variable name so the spell prints the number 3.', code: 'power = 3\nprint("power")', hint: 'Remove the quotes to use the stored value instead of the word.', explanation: 'print("power") displays the word; print(power) displays the value 3.', validation: { kind: 'exact', acceptedAnswers: ['power'], caseSensitive: true } },

  { id: 'python-forest-goblin-king-variable', chapterId: 'python-forest-goblin-king', languageId: 'python', difficulty: 'practice', type: 'predict-output', concept: 'mixed variable updates', prompt: 'What number does the final line print?', code: 'flame = 4\nflame = flame + 1\nprint(flame)', hint: 'The second assignment changes flame before print() runs.', explanation: 'flame starts at 4, increases by 1, and prints 5.', validation: { kind: 'exact', acceptedAnswers: ['5'], caseSensitive: true } },
  { id: 'python-forest-goblin-king-string', chapterId: 'python-forest-goblin-king', languageId: 'python', difficulty: 'practice', type: 'predict-output', concept: 'mixed string operations', prompt: 'What exact word is printed when the two strings join?', code: 'print("Fire" + "ball")', hint: 'The + operator joins the words without adding a space.', explanation: 'The two strings join directly to produce Fireball.', validation: { kind: 'exact', acceptedAnswers: ['Fireball'], caseSensitive: true } },
  { id: 'python-forest-goblin-king-arithmetic', chapterId: 'python-forest-goblin-king', languageId: 'python', difficulty: 'challenge', type: 'choose-operator', concept: 'mixed arithmetic', prompt: 'Choose the operator that makes damage equal 12.', code: 'damage = 3 ____ 4\nprint(damage)', options: ['+', '-', '*', '/'], hint: 'Think of three groups of four.', explanation: '* multiplies 3 and 4 to make 12 damage.', validation: { kind: 'exact', acceptedAnswers: ['*'], caseSensitive: true } },
  { id: 'python-forest-goblin-king-debug', chapterId: 'python-forest-goblin-king', languageId: 'python', difficulty: 'challenge', type: 'fix-mistake', concept: 'mixed debugging', prompt: 'Replace powr with the defined name so the spell prints 6.', code: 'power = 3\nprint(powr * 2)', hint: 'The assigned name contains an e before r.', explanation: 'power is defined as 3; using power * 2 prints 6.', validation: { kind: 'exact', acceptedAnswers: ['power'], caseSensitive: true } },
];

export { valleyOfDecisions };
export const chapters: readonly Chapter[] = [...forestChapters, ...valleyChapters];
export const missions: readonly Mission[] = [...forestMissions, ...valleyMissions];
export const exercises: readonly Exercise[] = [...forestExercises, ...valleyExercises];
