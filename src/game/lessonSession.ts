import { getLessonForExercise, lessons } from './lessonContent';
import type { Exercise } from './worldTypes';

/** Local teaching UI only. Neither progression nor persisted attempts are stored here. */
export interface LessonSession { seenLessonIds: readonly string[]; reviewing: boolean }
export const initialLessonSession: LessonSession = { seenLessonIds: [], reviewing: false };
export type LessonAction = { type: 'continue'; lessonId: string } | { type: 'review' } | { type: 'close' } | { type: 'reset' };

export function lessonSessionReducer(session: LessonSession, action: LessonAction): LessonSession {
  switch (action.type) {
    case 'continue':
      if (!lessons.some((lesson) => lesson.id === action.lessonId)) return session;
      return { seenLessonIds: session.seenLessonIds.includes(action.lessonId) ? session.seenLessonIds : [...session.seenLessonIds, action.lessonId], reviewing: false };
    case 'review': return { ...session, reviewing: true };
    case 'close': return { ...session, reviewing: false };
    case 'reset': return initialLessonSession;
  }
}

export function getVisibleLesson(exercise: Exercise, phase: 'answering' | 'solved' | 'complete', missionCompleted: boolean, session: LessonSession) {
  const lesson = getLessonForExercise(exercise);
  if (!lesson || phase === 'complete') return null;
  const introduction = !lesson.optionalReview && phase === 'answering' && !missionCompleted && !session.seenLessonIds.includes(lesson.id);
  return introduction || session.reviewing ? { lesson, introduction } : null;
}
