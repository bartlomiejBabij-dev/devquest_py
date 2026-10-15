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
];

export function getLessonForExercise(exercise: Exercise): LessonContent | null {
  return lessons.find((lesson) => lesson.id === exercise.lessonId) ?? null;
}
