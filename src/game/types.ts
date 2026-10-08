export interface Challenge {
  id: number;
  title: string;
  mission: string;
  code: string;
  answer: string;
  hint: string;
}

export interface BattleState {
  enemyHp: number;
  challengeIndex: number;
  result: 'idle' | 'incorrect' | 'correct';
  feedback: string;
  attemptCount: number;
}
