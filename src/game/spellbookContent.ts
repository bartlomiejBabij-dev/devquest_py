/** Beginner reference material. Mission answers and validation remain in worldContent.ts. */
export interface SpellbookEntry {
  id: string;
  title: string;
  explanation: string;
  codeExample: string;
  expectedOutput?: string;
  commonMistake: string;
  chapterId: string;
}

export const spellbookEntries: readonly SpellbookEntry[] = [
  {
    id: 'python-print',
    title: 'print() and output',
    explanation: 'Use print() to show a value on the screen. Put the value between the parentheses. Text needs matching quotes.',
    codeExample: 'print("The gate is open")',
    expectedOutput: 'The gate is open',
    commonMistake: 'Forgetting the closing parenthesis or one of the quotation marks.',
    chapterId: 'python-forest-awakening',
  },
  {
    id: 'python-variables',
    title: 'Variables and assignments',
    explanation: 'A variable is a name for a value. Use one = to store a value, then use the name to read it. Assigning again replaces the old value.',
    codeExample: 'lanterns = 2\nlanterns = lanterns + 1\nprint(lanterns)',
    expectedOutput: '3',
    commonMistake: 'Using == to assign a value. Two equals signs compare values; one equals sign stores a value.',
    chapterId: 'python-forest-fire-essence',
  },
  {
    id: 'python-integers',
    title: 'Integers and arithmetic',
    explanation: 'Integers are whole numbers, such as 2 and 9. Python can add, subtract, and multiply them to calculate a new integer.',
    codeExample: 'crystals = 9 + 2\nprint(crystals)',
    expectedOutput: '11',
    commonMistake: 'Putting the numbers in quotes when you want to calculate: "9" is text, not the integer 9.',
    chapterId: 'python-forest-mana-stones',
  },
  {
    id: 'python-operators',
    title: 'Python operators',
    explanation: '+ adds numbers, - subtracts, and * multiplies. Python performs multiplication before addition unless parentheses change the order.',
    codeExample: 'steps = 9 - 1\nprint(steps)',
    expectedOutput: '8',
    commonMistake: 'Using + when a value should decrease, or using x instead of * to multiply.',
    chapterId: 'python-forest-mana-stones',
  },
  {
    id: 'python-strings',
    title: 'Strings',
    explanation: 'A string is text inside matching quotes. Store a string in a variable, print it, or repeat it with * and a whole number.',
    codeExample: 'call = "Go!"\nprint(call * 2)',
    expectedOutput: 'Go!Go!',
    commonMistake: 'Leaving text unquoted makes Python look for a variable with that name.',
    chapterId: 'python-forest-talking-trees',
  },
  {
    id: 'python-concatenation',
    title: 'Joining strings',
    explanation: 'Use + to join strings. Python does not add a space for you, so include one in a string when you need it.',
    codeExample: 'first = "Silver"\nsecond = " leaf"\nprint(first + second)',
    expectedOutput: 'Silver leaf',
    commonMistake: 'Joining text directly to an integer. Convert the number to a string first, or use two strings.',
    chapterId: 'python-forest-talking-trees',
  },
  {
    id: 'python-length',
    title: 'len() and string length',
    explanation: 'len() counts the characters in a string. Spaces and punctuation count too.',
    codeExample: 'print(len("rune"))',
    expectedOutput: '4',
    commonMistake: 'Counting only letters when the string also contains spaces or punctuation.',
    chapterId: 'python-forest-talking-trees',
  },
  {
    id: 'python-syntax',
    title: 'Common syntax mistakes',
    explanation: 'Python needs matching quotes and parentheses. Check that each opening symbol has the right closing symbol.',
    codeExample: 'print("Open sesame")',
    expectedOutput: 'Open sesame',
    commonMistake: 'Writing an opening quote or parenthesis without closing it.',
    chapterId: 'python-forest-broken-spells',
  },
  {
    id: 'python-debugging',
    title: 'Basic debugging',
    explanation: 'When a spell fails, compare the names you assigned with the names you used. Python treats every letter as important.',
    codeExample: 'gem_count = 11\nprint(gem_count)',
    expectedOutput: '11',
    commonMistake: 'Typing a variable name differently later, or putting quotes around its name when you wanted its value.',
    chapterId: 'python-forest-broken-spells',
  },
];

/** Every Forest exercise links to reference material, never to its answer. */
export const exerciseSpellbookEntryIds: Readonly<Record<string, string>> = {
  'python-forest-awakening-print': 'python-print',
  'python-forest-awakening-literal': 'python-strings',
  'python-forest-awakening-number': 'python-integers',
  'python-forest-awakening-output': 'python-print',
  'python-forest-awakening-repair': 'python-debugging',
  'python-forest-fire-essence-assignment': 'python-variables',
  'python-forest-fire-essence-read': 'python-variables',
  'python-forest-fire-essence-update': 'python-variables',
  'python-forest-fire-essence-print': 'python-print',
  'python-forest-fire-essence-name': 'python-debugging',
  'python-forest-mana-stones-operator': 'python-operators',
  'python-forest-mana-stones-addition': 'python-integers',
  'python-forest-mana-stones-multiplication': 'python-operators',
  'python-forest-mana-stones-precedence': 'python-operators',
  'python-forest-mana-stones-damage': 'python-integers',
  'python-forest-talking-trees-output': 'python-concatenation',
  'python-forest-talking-trees-variable': 'python-strings',
  'python-forest-talking-trees-repeat': 'python-strings',
  'python-forest-talking-trees-length': 'python-length',
  'python-forest-talking-trees-repair': 'python-concatenation',
  'python-forest-broken-spells-name': 'python-debugging',
  'python-forest-broken-spells-parenthesis': 'python-syntax',
  'python-forest-broken-spells-quotes': 'python-syntax',
  'python-forest-broken-spells-assignment': 'python-variables',
  'python-forest-broken-spells-debug': 'python-debugging',
  'python-forest-goblin-king-output': 'python-print',
  'python-forest-goblin-king-variable': 'python-variables',
  'python-forest-goblin-king-string': 'python-concatenation',
  'python-forest-goblin-king-arithmetic': 'python-operators',
  'python-forest-goblin-king-debug': 'python-debugging',
};

export function getSpellbookEntryForExercise(exerciseId: string): SpellbookEntry | null {
  const entryId = Object.prototype.hasOwnProperty.call(exerciseSpellbookEntryIds, exerciseId)
    ? exerciseSpellbookEntryIds[exerciseId]
    : undefined;
  return spellbookEntries.find((entry) => entry.id === entryId) ?? null;
}
