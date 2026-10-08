import { challenges } from './challenges';
import type { BattleState } from './types';

export const ENEMY_MAX_HP = 30;
export const SPELL_DAMAGE = 10;
export const initialBattleState: BattleState = { enemyHp: ENEMY_MAX_HP, challengeIndex: 0, result: 'idle', feedback: '', attemptCount: 0 };

export type BattleAction = { type: 'submit'; answer: string } | { type: 'advance' } | { type: 'reset' };

export function battleReducer(state: BattleState, action: BattleAction): BattleState {
  if (action.type === 'reset') return { ...initialBattleState };
  if (action.type === 'advance') {
    if (state.result !== 'correct' || state.enemyHp === 0) return state;
    return { ...state, challengeIndex: state.challengeIndex + 1, result: 'idle', feedback: '' };
  }
  if (state.result === 'correct' || state.enemyHp === 0) return state;
  const challenge = challenges[state.challengeIndex];
  if (!challenge) return state;
  if (action.answer.trim() !== challenge.answer) {
    return { ...state, result: 'incorrect', feedback: `Not quite! ${challenge.hint}`, attemptCount: state.attemptCount + 1 };
  }
  return {
    ...state,
    enemyHp: Math.max(0, state.enemyHp - SPELL_DAMAGE),
    result: 'correct',
    attemptCount: state.attemptCount + 1,
    feedback: state.enemyHp === SPELL_DAMAGE ? 'Critical hit! The Bug Goblin falls!' : 'Perfect cast! 10 damage dealt.',
  };
}
