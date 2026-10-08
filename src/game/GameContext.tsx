import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import { battleReducer, initialBattleState, type BattleAction } from './battle';
import type { BattleState } from './types';

interface GameContextValue { battle: BattleState; dispatch: Dispatch<BattleAction> }
const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [battle, dispatch] = useReducer(battleReducer, initialBattleState);
  return <GameContext.Provider value={{ battle, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const game = useContext(GameContext);
  if (!game) throw new Error('useGame must be used inside GameProvider');
  return game;
}
