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
  xpReward: 300,
};

export const worlds: readonly World[] = [forestOfVariables];

export const chapters: readonly Chapter[] = [
  { id: 'python-forest-awakening', worldId: forestOfVariables.id, title: 'The Awakening', description: 'Speak your first command aloud.', learningObjective: 'Use print() to display text.', missionIds: ['python-forest-awakening-01'], prerequisiteMissionIds: [], xpReward: 20 },
  { id: 'python-forest-fire-essence', worldId: forestOfVariables.id, title: 'Fire Essence', description: 'Give a name to a spark of power.', learningObjective: 'Assign an integer value to a variable.', missionIds: ['python-forest-fire-essence-01'], prerequisiteMissionIds: ['python-forest-awakening-01'], xpReward: 30 },
  { id: 'python-forest-mana-stones', worldId: forestOfVariables.id, title: 'Mana Stones', description: 'Count the energy left after a spell.', learningObjective: 'Use integer arithmetic and the subtraction operator.', missionIds: ['python-forest-mana-stones-01'], prerequisiteMissionIds: ['python-forest-fire-essence-01'], xpReward: 40 },
  { id: 'python-forest-talking-trees', worldId: forestOfVariables.id, title: 'Talking Trees', description: 'Join words to answer the forest.', learningObjective: 'Join strings with the + operator and predict their output.', missionIds: ['python-forest-talking-trees-01'], prerequisiteMissionIds: ['python-forest-mana-stones-01'], xpReward: 50 },
  { id: 'python-forest-broken-spells', worldId: forestOfVariables.id, title: 'Broken Spells', description: 'Repair a misspelled variable name.', learningObjective: 'Identify and correct a beginner Python name error.', missionIds: ['python-forest-broken-spells-01'], prerequisiteMissionIds: ['python-forest-talking-trees-01'], xpReward: 60 },
  { id: 'python-forest-goblin-king', worldId: forestOfVariables.id, title: "Goblin King's Lair", description: 'Combine your first Python skills in a final trial.', learningObjective: 'Trace variables, strings, arithmetic, and print() together.', missionIds: ['python-forest-goblin-king-01'], prerequisiteMissionIds: ['python-forest-broken-spells-01'], xpReward: 100 },
];

export const missions: readonly Mission[] = [
  { id: 'python-forest-awakening-01', chapterId: 'python-forest-awakening', title: 'A Voice in the Forest', description: 'Call out a greeting with print().', exerciseIds: ['python-forest-awakening-print'], prerequisiteMissionIds: [], xpReward: 20 },
  { id: 'python-forest-fire-essence-01', chapterId: 'python-forest-fire-essence', title: 'Bottle the Flame', description: 'Store a value in the mana variable.', exerciseIds: ['python-forest-fire-essence-assignment'], prerequisiteMissionIds: [], xpReward: 30 },
  { id: 'python-forest-mana-stones-01', chapterId: 'python-forest-mana-stones', title: 'Count the Stones', description: 'Choose the operation that spends mana.', exerciseIds: ['python-forest-mana-stones-operator'], prerequisiteMissionIds: [], xpReward: 40 },
  { id: 'python-forest-talking-trees-01', chapterId: 'python-forest-talking-trees', title: 'The Tree Speaks', description: 'Predict the message made from two strings.', exerciseIds: ['python-forest-talking-trees-output'], prerequisiteMissionIds: [], xpReward: 50 },
  { id: 'python-forest-broken-spells-01', chapterId: 'python-forest-broken-spells', title: 'Mend the Rune', description: 'Find the misspelled variable.', exerciseIds: ['python-forest-broken-spells-name'], prerequisiteMissionIds: [], xpReward: 60 },
  { id: 'python-forest-goblin-king-01', chapterId: 'python-forest-goblin-king', title: "The King's Test", description: 'Trace a short spell from start to finish.', exerciseIds: ['python-forest-goblin-king-output'], prerequisiteMissionIds: [], xpReward: 100 },
];

export const exercises: readonly Exercise[] = [
  { id: 'python-forest-awakening-print', languageId: 'python', type: 'fill-blank', concept: 'print() and basic output', prompt: 'Fill in the function name that displays the greeting.', code: '____("Welcome to DevQuest")', hint: 'Python uses a four-letter function to display text.', explanation: 'print() displays the value inside its parentheses.', validation: { kind: 'exact', acceptedAnswers: ['print'], caseSensitive: true } },
  { id: 'python-forest-fire-essence-assignment', languageId: 'python', type: 'fill-blank', concept: 'variables and assignments', prompt: 'Store ten points of mana in the variable.', code: 'mana = ____', hint: 'Enter the integer value shown in the mission.', explanation: 'The = sign assigns the integer 10 to the name mana.', validation: { kind: 'exact', acceptedAnswers: ['10'], caseSensitive: true } },
  { id: 'python-forest-mana-stones-operator', languageId: 'python', type: 'choose-operator', concept: 'integer subtraction', prompt: 'Which operator leaves 15 mana after spending 5?', code: 'mana = 20\nremaining = mana ____ 5', options: ['+', '-', '*', '/'], hint: 'Spending mana makes the number smaller.', explanation: 'The - operator subtracts 5 from 20, leaving 15.', validation: { kind: 'exact', acceptedAnswers: ['-'], caseSensitive: true } },
  { id: 'python-forest-talking-trees-output', languageId: 'python', type: 'predict-output', concept: 'string concatenation', prompt: 'What exact line does this spell print?', code: 'greeting = "Hello"\nname = "Pyromancer"\nprint(greeting + ", " + name)', hint: 'The + operator joins all three strings in order.', explanation: 'Joining the strings preserves the comma and space, producing Hello, Pyromancer.', validation: { kind: 'exact', acceptedAnswers: ['Hello, Pyromancer'], caseSensitive: true } },
  { id: 'python-forest-broken-spells-name', languageId: 'python', type: 'fix-mistake', concept: 'variable name errors', prompt: 'Replace the misspelled name inside print().', code: 'energy = 7\nprint(enrgy)', hint: 'Compare the name in print() with the name assigned above it.', explanation: 'Python variable names must match exactly: energy is defined, but enrgy is not.', validation: { kind: 'exact', acceptedAnswers: ['energy'], caseSensitive: true } },
  { id: 'python-forest-goblin-king-output', languageId: 'python', type: 'predict-output', concept: 'combined output, variables, and arithmetic', prompt: 'What two lines does this spell print?', code: 'hero = "Pyro"\nspells = 2 * 3\nprint(hero)\nprint(spells)', hint: 'First print the text stored in hero, then multiply 2 by 3.', explanation: 'hero contains Pyro and spells contains 6, so print() displays them on separate lines.', validation: { kind: 'exact', acceptedAnswers: ['Pyro\n6'], caseSensitive: true } },
];
