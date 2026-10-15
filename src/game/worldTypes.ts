export interface World {
  id: string;
  languageId: string;
  title: string;
  description: string;
  chapterIds: readonly string[];
  prerequisiteMissionIds: readonly string[];
  unlockRequirement?: string;
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
  encounter?: 'guardian';
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
  lessonId?: string;
}

export interface LessonContent {
  id: string;
  title: string;
  explanation: string;
  codeExample: string;
  expectedOutput: string;
  whyItWorks: string;
  importantRule: string;
}

export interface AnswerOption {
  /** Stable identity, independent of display text and position. */
  id: string;
  label: string;
  /** Shown only after this option is submitted. */
  feedback: string;
}

export type ChoiceExercise = ExerciseBase & {
  type: 'multiple-choice' | 'missing-token' | 'output-choice';
  options: readonly AnswerOption[];
  validation: { kind: 'option-id'; correctOptionId: string };
};

export type CodeExercise = ExerciseBase & {
  validation: { kind: 'exact' | 'python-lines'; acceptedAnswers: readonly string[]; caseSensitive: boolean };
} & (
  | { type: 'fill-blank' }
  | { type: 'predict-output' }
  | { type: 'fix-mistake' }
  | { type: 'choose-operator'; options: readonly string[] }
);

export type Exercise = CodeExercise | ChoiceExercise;

export interface ProgressionState {
  completedMissionIds: readonly string[];
}

export interface CompletionProgress {
  completed: number;
  total: number;
  percent: number;
}
