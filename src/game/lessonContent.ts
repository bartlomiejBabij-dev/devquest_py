import type { Exercise, LessonContent } from './worldTypes';

export const lessons: readonly LessonContent[] = [
  {
    id: 'python-lesson-first-output', title: 'Make Python speak',
    explanation: 'Code is a set of instructions for a computer. In Python, print() tells it to show something on the screen. This is useful for messages and checking your work.',
    codeExample: 'print("A lantern glows")', expectedOutput: 'A lantern glows',
    whyItWorks: 'The parentheses hold what to show. The quotes mark the beginning and end of the message. The result on screen is called output.',
    importantRule: 'Write print in lowercase. Keep both parentheses and both quotes; the quotes are not part of the output.',
  },
  {
    id: 'python-lesson-text-numbers', title: 'Text or number?',
    explanation: 'Text inside quotes is called a string. Numbers can go directly inside print(). You can display either one to tell your player what is happening.',
    codeExample: 'print("Lanterns")\nprint(4)', expectedOutput: 'Lanterns\n4',
    whyItWorks: 'The first instruction displays text. The second displays a number. Python follows the instructions from top to bottom, printing each on a new line.',
    importantRule: 'Text needs matching quotes: "Lanterns" or \'Lanterns\'. A number such as 4 does not need quotes.',
  },
  {
    id: 'python-lesson-booleans', title: 'A yes-or-no value',
    explanation: 'A Boolean is a value with just two possibilities: True or False. Use it to remember whether a gate is open or a spell is ready.',
    codeExample: 'gate_closed = False\nprint(gate_closed)', expectedOutput: 'False',
    whyItWorks: 'The = sign stores False in gate_closed. print() reads that stored value. False means the statement “the gate is closed” is not true.',
    importantRule: 'Use a capital T or F and no quotes. "False" is text; False is a Boolean.',
  },
  {
    id: 'python-lesson-comparisons', title: 'Ask Python to compare',
    explanation: 'A comparison asks a yes-or-no question about two values. Its result is True or False. Games use comparisons to check scores, supplies and whether you have enough magic.',
    codeExample: 'print(6 == 2)\nprint(6 != 2)', expectedOutput: 'False\nTrue',
    whyItWorks: '== asks “are they equal?”; != asks “are they different?”. Six and two differ, so the first result is False and the second is True.',
    importantRule: 'One = stores a value. Two equals signs, ==, compare values. != asks whether the values are different.',
  },
  {
    id: 'python-lesson-ordering', title: 'Enough magic to act?',
    explanation: 'Use > for “greater than” and < for “less than”. Add = when the boundary should count too: >= means “at least”, and <= means “at most”. These checks help decide whether a player has enough supplies.',
    codeExample: 'print(5 > 9)\nprint(5 >= 5)', expectedOutput: 'False\nTrue',
    whyItWorks: 'Five is not greater than nine, so the first line prints False. Five is equal to five, which >= allows, so the second line prints True.',
    importantRule: '> and < exclude equal values. >= and <= include them. Read each comparison from left to right.',
  },
  {
    id: 'python-lesson-variables', title: 'Give a value a name',
    explanation: 'A variable is a name for a stored value. It lets your game remember things such as health or mana. Use one = to assign a value, then use the name to read it.',
    codeExample: 'health = 100\nprint(health)', expectedOutput: '100',
    whyItWorks: 'The first line stores the number 100 under the name health. print(health) reads that value and displays it. print("health") would display the word instead.',
    importantRule: 'Names must match exactly. Numbers need no quotes. One = assigns; == compares two values, so it cannot replace = here.',
  },
  {
    id: 'python-lesson-variable-update', title: 'Refill your mana',
    explanation: 'A variable can change as your adventure continues. Assigning again replaces its old value. The + sign adds numbers, so you can use it to refill a supply.',
    codeExample: 'mana = 10\nmana = mana + 5\nprint(mana)', expectedOutput: '15',
    whyItWorks: 'Python reads the old mana value, 10, adds 5, then stores 15 in mana. The last line reads the new value. Instructions run from top to bottom.',
    importantRule: 'Calculate the right side of = first, then store the result in the name on the left.',
  },
  {
    id: 'python-lesson-variable-text', title: 'Remember a name',
    explanation: 'Variables can store text as well as numbers. Text inside matching quotes is called a string. Use a string variable to remember a hero name or a spell message.',
    codeExample: 'hero = "Ranger"\nprint(hero)', expectedOutput: 'Ranger',
    whyItWorks: 'hero stores the text Ranger. Without quotes around hero, print() reads its stored value. The quotes around Ranger mark the text and are not printed.',
    importantRule: 'print(hero) shows the value; print("hero") shows the word hero. Use the exact variable name to read its value.',
  },
  {
    id: 'python-lesson-add-subtract', title: 'Count your supplies',
    explanation: 'Integers are whole numbers, such as 2 and 9. Use + to add supplies and - to subtract what you spend. Calculations can use variable values too.',
    codeExample: 'crystals = 9\nremaining = crystals - 3\nprint(remaining)', expectedOutput: '6',
    whyItWorks: 'Python reads 9 from crystals, subtracts 3 and stores 6 in remaining. The original crystals value stays 9. Using + instead would add 3 and give 12.',
    importantRule: 'Calculate with numbers, not quoted text. The result is stored only in the variable on the left of =.',
  },
  {
    id: 'python-lesson-multiply', title: 'Power in groups',
    explanation: 'Multiplication counts equal groups quickly. In Python, * means multiply. You can use it to calculate the total power of several identical spells.',
    codeExample: 'damage = 4 * 3\nprint(damage)', expectedOutput: '12',
    whyItWorks: 'There are four groups of 3: 3 + 3 + 3 + 3 makes 12. Python calculates 4 * 3, stores 12 in damage and then prints it.',
    importantRule: 'Use the star * in Python code, not x or the multiplication sign ×.',
  },
  {
    id: 'python-lesson-calculation-order', title: 'Which step comes first?',
    explanation: 'When a calculation mixes * with + or -, Python multiplies first. This lets you combine repeated damage and an extra bonus in one calculation.',
    codeExample: 'power = 3\nbonus = 2\nprint(1 + power * bonus)', expectedOutput: '7',
    whyItWorks: 'Read power as 3 and bonus as 2. First multiply 3 * 2 to get 6. Then add 1 to get 7. A variable supplies its number wherever its name appears.',
    importantRule: 'Do not simply calculate from left to right: multiplication comes before addition and subtraction.',
  },
  {
    id: 'python-lesson-joining-text', title: 'Let the trees speak',
    explanation: 'A string is text inside matching quotes. Store it in a variable to reuse a message. The + sign joins strings in order, letting your game build a greeting from smaller pieces.',
    codeExample: 'greeting = "Welcome, "\nhero = "Ranger"\nprint(greeting + hero)', expectedOutput: 'Welcome, Ranger',
    whyItWorks: 'Python reads both stored strings and joins them. The comma and space belong to greeting. print() shows the joined text without its quote marks.',
    importantRule: 'Joining adds no spaces automatically. print(hero) reads a value; print("hero") shows the word hero.',
  },
  {
    id: 'python-lesson-repeat-count-text', title: 'Echoes and letter counts',
    explanation: 'Use * with a string and a whole number to repeat a chant. Use len() to count its characters: letters, spaces and punctuation. These tools help make repeated messages and measure their size.',
    codeExample: 'print("Ho" * 2)\nprint(len("Hi!"))', expectedOutput: 'HoHo\n3',
    whyItWorks: 'The first line repeats Ho twice without adding spaces. The second counts H, i and !. Python calculates len() first, then print() displays its number on a new line.',
    importantRule: 'Quote marks mark the text in code; they are not characters in this string. Repetition adds no extra spaces.',
  },
  {
    id: 'python-lesson-text-versus-number', title: 'A digit can be text',
    explanation: 'A digit inside quotes is text, not a number for arithmetic. Use text when adding a number to a label, such as a rune name. Joining with + needs two strings.',
    codeExample: 'print("Rune" + "2")\nprint(4 + 2)', expectedOutput: 'Rune2\n6',
    whyItWorks: 'The first line joins two strings. The second adds two numbers. "Rune" + 2 has readable syntax, but fails when it runs because it tries to join text and a number.',
    importantRule: 'To join a written digit to text, quote the digit. To calculate with numbers, leave the numbers unquoted.',
  },
  {
    id: 'python-lesson-debug-names', title: 'Find the broken rune',
    explanation: 'A bug is a mistake in code. Debugging means finding and fixing the mistake. If Python says a name is not defined, compare that name with the one you stored.',
    codeExample: 'spark = 9\nprint(spark)', expectedOutput: '9',
    whyItWorks: 'The names match, so print() reads 9. Writing spakr instead would ask for an unknown name and stop the spell. Quoting "spark" would run, but print a word instead of the number.',
    importantRule: 'An undefined name causes an error when the code runs. Check spelling and uppercase letters before changing the value.',
  },
  {
    id: 'python-lesson-debug-pairs', title: 'Close the magic circle',
    explanation: 'Python needs matching quotation marks around text and matching parentheses around what print() displays. A missing closing mark causes a syntax error: Python cannot read the instructions.',
    codeExample: 'print("Lantern lit")', expectedOutput: 'Lantern lit',
    whyItWorks: 'Both quotes and both parentheses are present. Quotes make Lantern lit a string. A single word without quotes is read as a name instead of text.',
    importantRule: 'Match each opening mark with its closing mark. Single or double quotes work if they match. An unquoted, undefined name is a name error, not a missing-parenthesis error.',
  },
  {
    id: 'python-lesson-debug-values', title: 'Make the spell mean it',
    explanation: 'Some bugs use valid Python but do the wrong thing. Check what each line means: one = stores a value, while == compares values and does not store them.',
    codeExample: 'charge = 6\nprint(charge)\nprint("charge")', expectedOutput: '6\ncharge',
    whyItWorks: 'The assignment stores 6. The next line reads that number. The last line runs too, but prints the word charge. Using charge == 6 before defining charge would fail because that name has no value yet.',
    importantRule: 'Use = to assign. Use an unquoted name to read its value. Compare the actual output with the result you wanted.',
  },
];

export function getLessonForExercise(exercise: Exercise): LessonContent | null {
  return lessons.find((lesson) => lesson.id === exercise.lessonId) ?? null;
}
