import type { Exercise } from './worldTypes';

export function isExerciseAnswerCorrect(exercise: Exercise, answer: string): boolean {
  const normalize = (value: string) => {
    const trimmed = value.replace(/\r\n/g, '\n').trim();
    return exercise.validation.caseSensitive ? trimmed : trimmed.toLowerCase();
  };
  const submitted = normalize(answer);
  return submitted.length > 0 && exercise.validation.acceptedAnswers.some((accepted) => normalize(accepted) === submitted);
}
