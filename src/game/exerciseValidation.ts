import type { ChoiceExercise, Exercise } from './worldTypes';
import { matchesPythonLines } from './pythonLinesValidation';

export function isChoiceExercise(exercise: Exercise): exercise is ChoiceExercise {
  return exercise.type === 'multiple-choice' || exercise.type === 'missing-token' || exercise.type === 'output-choice';
}

export function isExerciseAnswerCorrect(exercise: Exercise, answer: string): boolean {
  if (isChoiceExercise(exercise)) {
    return exercise.options.some((option) => option.id === answer) && answer === exercise.validation.correctOptionId;
  }
  if (exercise.validation.kind === 'python-lines') return matchesPythonLines(answer, exercise.validation.acceptedAnswers);
  const normalize = (value: string) => {
    const trimmed = value.replace(/\r\n/g, '\n').trim();
    return exercise.validation.caseSensitive ? trimmed : trimmed.toLowerCase();
  };
  const submitted = normalize(answer);
  return submitted.length > 0 && exercise.validation.acceptedAnswers.some((accepted) => normalize(accepted) === submitted);
}

export function getIncorrectAnswerFeedback(exercise: Exercise, answer: string): string {
  if (isChoiceExercise(exercise)) {
    const option = exercise.options.find((item) => item.id === answer);
    if (option && option.id !== exercise.validation.correctOptionId) return option.feedback;
  }
  return exercise.hint;
}
