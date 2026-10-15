import type { Exercise } from './worldTypes';
import { matchesPythonLines } from './pythonLinesValidation';

export function isExerciseAnswerCorrect(exercise: Exercise, answer: string): boolean {
  if (exercise.validation.kind === 'python-lines') return matchesPythonLines(answer, exercise.validation.acceptedAnswers);
  const normalize = (value: string) => {
    const trimmed = value.replace(/\r\n/g, '\n').trim();
    return exercise.validation.caseSensitive ? trimmed : trimmed.toLowerCase();
  };
  const submitted = normalize(answer);
  return submitted.length > 0 && exercise.validation.acceptedAnswers.some((accepted) => normalize(accepted) === submitted);
}
