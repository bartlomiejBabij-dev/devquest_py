/** Beginner reference material. Mission answers and validation remain in worldContent.ts. */
export interface SpellbookEntry {
  id: string;
  title: string;
  explanation: string;
  codeExample: string;
  expectedOutput?: string;
  whyItWorks?: string;
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
  {
    id: 'python-booleans', title: 'Boolean values',
    explanation: 'True and False represent yes-or-no values. Write them with capital initials and no quotes. A comparison also produces a Boolean.',
    codeExample: 'sealed = False\nready = True\nprint(sealed)\nprint(ready)', expectedOutput: 'False\nTrue',
    commonMistake: 'Writing true in lowercase, or "True" as text instead of the Boolean True.', chapterId: 'python-valley-crossroads',
  },
  {
    id: 'python-comparisons', title: 'Comparison operators',
    explanation: '== checks equality; != checks difference. > and < compare sizes. >= and <= also accept equal values. A comparison returns True or False.',
    codeExample: 'print(9 == 9)\nprint(9 < 4)\nprint(4 <= 4)', expectedOutput: 'True\nFalse\nTrue',
    commonMistake: 'Using = to compare. One = stores a value; == compares two values.', chapterId: 'python-valley-crossroads',
  },
  {
    id: 'python-if', title: 'if statements',
    explanation: 'if checks a condition and runs its indented block only when that condition is true. End the condition with a colon. Code outside the block continues afterward.',
    codeExample: 'keys = 2\nif keys > 0:\n    print("Gate opens")', expectedOutput: 'Gate opens',
    commonMistake: 'Forgetting the colon or expecting a false condition to run its block.', chapterId: 'python-valley-guardian',
  },
  {
    id: 'python-else', title: 'else statements',
    explanation: 'else provides an alternative when the if condition is false. Align else with if, add a colon, and indent its block. Exactly one of these two blocks runs.',
    codeExample: 'keys = 0\nif keys > 0:\n    print("Enter")\nelse:\n    print("Find a key")', expectedOutput: 'Find a key',
    commonMistake: 'Adding a condition after else or indenting else inside the if block.', chapterId: 'python-valley-guardian',
  },
  {
    id: 'python-indentation', title: 'Python indentation',
    explanation: 'Spaces at the start of a line define which block it belongs to. Use four spaces per level, consistently. Moving back to the left edge ends the block.',
    codeExample: 'if True:\n    print("Inside")\nprint("Outside")', expectedOutput: 'Inside\nOutside',
    commonMistake: 'Leaving a block unindented or mixing tabs and spaces. These exercises accept spaces only.', chapterId: 'python-valley-guardian',
  },
  {
    id: 'python-elif', title: 'elif and multiple branches', chapterId: 'python-valley-three-gates',
    explanation: 'Use elif to add another condition after if. Check conditions from top to bottom. Only the first matching branch runs; else handles the case where none match.',
    codeExample: 'level = 2\nif level >= 5:\n    print("Gold")\nelif level >= 2:\n    print("Bronze")\nelse:\n    print("Wood")', expectedOutput: 'Bronze',
    whyItWorks: '2 is below 5 but at least 2. The elif branch matches and prints Bronze, so else is skipped.',
    commonMistake: 'Using separate if statements when only one branch should run, or expecting later matching branches to run too.',
  },
  {
    id: 'python-and', title: 'and: both conditions', chapterId: 'python-valley-twin-runes',
    explanation: 'and requires both conditions to be True. If either is False, the combined condition is False.',
    codeExample: 'has_rope = True\nhas_torch = False\nif has_rope and has_torch:\n    print("Cross")\nelse:\n    print("Prepare")', expectedOutput: 'Prepare',
    whyItWorks: 'The rope is ready but the torch is missing. Both are required, so the condition is False and the alternative prints Prepare.',
    commonMistake: 'Thinking one True condition is enough for and. Check both requirements.',
  },
  {
    id: 'python-or', title: 'or: at least one condition', chapterId: 'python-valley-twin-runes',
    explanation: 'or accepts either condition or both. It is False only when both conditions are False.',
    codeExample: 'has_pass = False\nknows_rune = True\nif has_pass or knows_rune:\n    print("Passage")\nelse:\n    print("Search")', expectedOutput: 'Passage',
    whyItWorks: 'Knowing the rune is enough, even without a pass. The condition is True, so Passage prints once.',
    commonMistake: 'Treating or as exactly one. Both True is allowed and still runs the block only once.',
  },
  {
    id: 'python-not', title: 'not: reverse a Boolean', chapterId: 'python-valley-mirror-of-truth',
    explanation: 'not reverses a Boolean: not True is False, and not False is True. Put it before a value, including in an if condition, to check that something is absent.',
    codeExample: 'has_lantern = False\nif not has_lantern:\n    print("Pack a lantern")\nelse:\n    print("Light the path")', expectedOutput: 'Pack a lantern',
    whyItWorks: 'The lantern is missing, so has_lantern is False. not False becomes True and the if block prints the reminder. The else block is skipped.',
    commonMistake: 'Thinking not changes the variable itself. It produces the opposite Boolean for this expression; has_lantern still stores False.',
  },
];

/** Every exercise links to reference material, never to its answer. */
export const exerciseSpellbookEntryIds: Readonly<Record<string, string>> = {
  'python-valley-mirror-reversal': 'python-not',
  'python-valley-mirror-keyword': 'python-not',
  'python-valley-mirror-passage': 'python-not',
  'python-valley-three-gates-output': 'python-elif',
  'python-valley-three-gates-keyword': 'python-elif',
  'python-valley-three-gates-first': 'python-elif',
  'python-valley-twin-runes-and': 'python-and',
  'python-valley-twin-runes-operator': 'python-or',
  'python-valley-twin-runes-or': 'python-or',
  'python-valley-crossroads-boolean': 'python-booleans',
  'python-valley-crossroads-equality': 'python-comparisons',
  'python-valley-crossroads-difference': 'python-comparisons',
  'python-valley-crossroads-boundary': 'python-comparisons',
  'python-valley-crossroads-threshold': 'python-comparisons',
  'python-valley-guardian-if': 'python-if',
  'python-valley-guardian-indent': 'python-indentation',
  'python-valley-guardian-skip': 'python-if',
  'python-valley-guardian-else': 'python-else',
  'python-valley-guardian-branch': 'python-else',
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
