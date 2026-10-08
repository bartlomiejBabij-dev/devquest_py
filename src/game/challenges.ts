import type { Challenge } from './types';

export const challenges: readonly Challenge[] = [
  { id: 1, title: 'Name the flame', mission: 'Print the damage value to spark your first spell.', code: 'damage = 10\nprint(____)', answer: 'damage', hint: 'Use the variable holding 10, without quotation marks.' },
  { id: 2, title: 'Spend your mana', mission: 'Lower your mana from 20 to 15, then print what remains.', code: 'mana = 20\nmana = mana - ____\nprint(mana)', answer: '5', hint: 'What amount takes 20 down to 15?' },
  { id: 3, title: 'Multiply the power', mission: 'Combine two fireballs with their power.', code: 'fireballs = 2\npower = 5\ndamage = fireballs ____ power', answer: '*', hint: 'Think of the Python operator for equal groups.' },
];
