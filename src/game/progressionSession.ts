import { initialProgressionState, progressionReducer, type ProgressionAction } from './progression';
import type { ProgressionLoadResult } from './progressionStorage';
import type { ProgressionState } from './worldTypes';

export interface ProgressionSession {
  hydration: 'loading' | 'ready' | 'unavailable';
  progression: ProgressionState;
  revision: number;
  loadIssue: 'read-failed' | 'invalid-save' | 'unsupported-version' | null;
}

export const initialProgressionSession: ProgressionSession = {
  hydration: 'loading', progression: initialProgressionState, revision: 0, loadIssue: null,
};

export type ProgressionSessionAction = ProgressionAction | { type: 'hydrate'; result: ProgressionLoadResult };

export function progressionSessionReducer(session: ProgressionSession, action: ProgressionSessionAction): ProgressionSession {
  if (action.type === 'hydrate') {
    if (session.hydration !== 'loading') return session;
    return {
      hydration: action.result.status,
      progression: action.result.progression,
      revision: 0,
      loadIssue: action.result.status === 'unavailable' ? action.result.reason : null,
    };
  }
  if (session.hydration === 'loading') return session;
  const progression = progressionReducer(session.progression, action);
  return progression === session.progression ? session : { ...session, progression, revision: session.revision + 1 };
}

export function shouldPersistProgression(session: ProgressionSession): boolean {
  return session.hydration === 'ready' && session.revision > 0;
}
