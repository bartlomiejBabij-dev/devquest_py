import type { CodeBuilderExercise, Exercise } from './worldTypes';

export function isCodeBuilderExercise(exercise: Exercise): exercise is CodeBuilderExercise {
  return exercise.type === 'code-builder';
}

/** A JSON array of stable IDs uses the existing string-answer submission channel.
 * It is an in-memory draft, never a program to execute or persisted progress. */
export function readFragmentIds(exercise: CodeBuilderExercise, answer: string): readonly string[] | null {
  if (answer === '') return [];
  try {
    const ids: unknown = JSON.parse(answer);
    if (!Array.isArray(ids) || ids.length > exercise.fragments.length
      || ids.some(id => typeof id !== 'string' || !exercise.fragments.some(fragment => fragment.id === id))
      || new Set(ids).size !== ids.length) return null;
    return ids;
  } catch { return null; }
}

export function isCodeBuilderAnswerCorrect(exercise: CodeBuilderExercise, answer: string): boolean {
  const ids = readFragmentIds(exercise, answer);
  const expected = exercise.validation.expectedFragmentIds;
  return expected.length > 0 && new Set(expected).size === expected.length
    && ids !== null && ids.length === expected.length && ids.every((id, index) => id === expected[index]);
}

export type BuilderAction = { type: 'add'; id: string } | { type: 'undo' } | { type: 'reset' };

/** Pure edits: repeated taps cannot select the same fragment twice. */
export function editBuilderAnswer(exercise: CodeBuilderExercise, answer: string, action: BuilderAction): string {
  if (action.type === 'reset') return '';
  const ids = readFragmentIds(exercise, answer);
  if (!ids) return answer;
  const next = action.type === 'undo' ? ids.slice(0, -1)
    : exercise.fragments.some(fragment => fragment.id === action.id) && !ids.includes(action.id) ? [...ids, action.id] : ids;
  return next.length ? JSON.stringify(next) : '';
}

export function assembledCode(exercise: CodeBuilderExercise, answer: string): string {
  return (readFragmentIds(exercise, answer) ?? []).map(id => exercise.fragments.find(fragment => fragment.id === id)!.code).join('\n');
}
