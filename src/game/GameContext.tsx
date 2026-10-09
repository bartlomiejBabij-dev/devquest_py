import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import { battleReducer, initialBattleState, type BattleAction } from './battle';
import { initialProgressionState, progressionReducer, type ProgressionAction } from './progression';
import type { BattleState } from './types';
import type { ProgressionState } from './worldTypes';

interface GameContextValue {
  battle: BattleState;
  dispatch: Dispatch<BattleAction>;
  progression: ProgressionState;
  dispatchProgression: Dispatch<ProgressionAction>;
}
const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [battle, dispatch] = useReducer(battleReducer, initialBattleState);
  const [progression, dispatchProgression] = useReducer(progressionReducer, initialProgressionState);
  return <GameContext.Provider value={{ battle, dispatch, progression, dispatchProgression }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const game = useContext(GameContext);
  if (!game) throw new Error('useGame must be used inside GameProvider');
  return game;
}
