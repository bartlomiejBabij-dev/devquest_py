export interface World {
  id: string;
  languageId: string;
  title: string;
  description: string;
  chapterIds: readonly string[];
  /** Total XP available from this world's missions, not an extra reward. */
  xpReward: number;
}

export interface Chapter {
  id: string;
  worldId: string;
  title: string;
  description: string;
  learningObjective: string;
  missionIds: readonly string[];
  prerequisiteMissionIds: readonly string[];
  /** Total XP available from this chapter's missions, not an extra reward. */
  xpReward: number;
}

export interface Mission {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  exerciseIds: readonly string[];
  prerequisiteMissionIds: readonly string[];
  xpReward: number;
}

interface ExerciseBase {
  id: string;
  chapterId: string;
  languageId: string;
  difficulty: 'intro' | 'practice' | 'challenge';
  concept: string;
  prompt: string;
  code: string;
  hint: string;
  explanation: string;
  validation: {
    kind: 'exact';
    acceptedAnswers: readonly string[];
    caseSensitive: boolean;
  };
}

export type Exercise =
  | (ExerciseBase & { type: 'fill-blank' })
  | (ExerciseBase & { type: 'predict-output' })
  | (ExerciseBase & { type: 'fix-mistake' })
  | (ExerciseBase & { type: 'choose-operator'; options: readonly string[] });

export interface ProgressionState {
  completedMissionIds: readonly string[];
}

export interface CompletionProgress {
  completed: number;
  total: number;
  percent: number;
}
