import type { Chapter, Exercise, Mission } from './worldTypes';

export const treasureGuardianChapter: Chapter = {
  id: 'python-archipelago-treasure-guardian', worldId: 'python-list-archipelago', title: 'The Treasure Guardian',
  description: 'An ancient vault awakens. Five precise inventory spells will release its golden core.',
  learningObjective: 'Combine lists, indexing, length, updates and direct iteration in a final assessment.',
  missionIds: ['python-archipelago-treasure-guardian-01'], prerequisiteMissionIds: ['python-archipelago-supply-run-01'], xpReward: 100,
};

export const treasureGuardianMission: Mission = {
  id: 'python-archipelago-treasure-guardian-01', chapterId: treasureGuardianChapter.id, title: 'The Treasure Guardian',
  description: 'Face the guardian with five list spells. An optional inventory recap is always available during combat.',
  exerciseIds: ['python-archipelago-guardian-index', 'python-archipelago-guardian-vault', 'python-archipelago-guardian-mark', 'python-archipelago-guardian-expedition', 'python-archipelago-guardian-trial'],
  prerequisiteMissionIds: [], xpReward: 100, encounter: 'treasure-guardian',
};

/** Authored display text only; validators compare stable IDs, never execute Python. */
export const treasureGuardianExercises: readonly Exercise[] = [
  {
    id: 'python-archipelago-guardian-index', chapterId: treasureGuardianChapter.id, languageId: 'python', difficulty: 'challenge',
    type: 'output-choice', concept: 'The Treasure Index', lessonId: 'python-lesson-archipelago-mastery',
    prompt: 'Read the second treasure to open the first seal. What does this spell print?',
    code: 'loot = ["pearl", "crown", "gem"]\nprint(loot[1])',
    hint: 'The first position is 0. Position 1 holds the second treasure.',
    explanation: 'The positions are pearl: 0, crown: 1 and gem: 2. loot[1] selects crown; printing that string shows crown without quotes.',
    options: [
      { id: 'python-archipelago-guardian-index-a', label: 'pearl', feedback: 'pearl is at index 0. Index 1 selects the next item.' },
      { id: 'python-archipelago-guardian-index-b', label: 'crown', feedback: 'Index 1 selects crown, the second item.' },
      { id: 'python-archipelago-guardian-index-c', label: 'gem', feedback: 'gem is the third item, at index 2.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-archipelago-guardian-index-b' },
  },
  {
    id: 'python-archipelago-guardian-vault', chapterId: treasureGuardianChapter.id, languageId: 'python', difficulty: 'challenge',
    type: 'output-choice', concept: 'The Growing Vault', lessonId: 'python-lesson-archipelago-mastery',
    prompt: 'The vault gains one treasure. What is printed after the update?',
    code: 'vault = ["ring", "coin"]\nvault.append("key")\nprint(len(vault))',
    hint: 'Count the two original items, then the one appended item. Length counts items, not the last index.',
    explanation: 'append adds key to the end of vault. The list now contains ring, coin and key, so len(vault) is 3. The last index is 2, but the length is 3.',
    options: [
      { id: 'python-archipelago-guardian-vault-a', label: '3', feedback: 'Two original items plus one new item gives three.' },
      { id: 'python-archipelago-guardian-vault-b', label: '2', feedback: 'That is the old length, and also the new last index. len counts all three items after append.' },
      { id: 'python-archipelago-guardian-vault-c', label: '4', feedback: 'One append adds one item. Starting with two gives three, not four.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-archipelago-guardian-vault-a' },
  },
  {
    id: 'python-archipelago-guardian-mark', chapterId: treasureGuardianChapter.id, languageId: 'python', difficulty: 'challenge',
    type: 'code-builder', concept: "The Smith's Mark", lessonId: 'python-lesson-archipelago-mastery',
    prompt: 'Create gear, replace its first item with a new weapon, then print that updated item. Use all three fragments.',
    code: '', expectedOutput: 'spear',
    hint: 'Create gear before changing index 0. Print index 0 only after replacing it.',
    explanation: 'The list is created with club and helm. gear[0] = "spear" replaces club without adding a position. Printing gear[0] afterward shows spear.',
    fragments: [
      { id: 'python-archipelago-guardian-mark-print', code: 'print(gear[0])' },
      { id: 'python-archipelago-guardian-mark-set', code: 'gear = ["club", "helm"]' },
      { id: 'python-archipelago-guardian-mark-replace', code: 'gear[0] = "spear"' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-archipelago-guardian-mark-set', 'python-archipelago-guardian-mark-replace', 'python-archipelago-guardian-mark-print'] },
  },
  {
    id: 'python-archipelago-guardian-expedition', chapterId: treasureGuardianChapter.id, languageId: 'python', difficulty: 'challenge',
    type: 'output-choice', concept: 'The Island Expedition', lessonId: 'python-lesson-archipelago-mastery',
    prompt: 'The expedition updates its cargo before inspection. What does the loop print?',
    code: 'cargo = ["flint", "flag"]\ncargo[1] = "sail"\nfor item in cargo:\n    print(item)',
    hint: 'Index 1 changes before the loop. Visit the current values from first to last.',
    explanation: 'sail replaces flag at index 1 before inspection. The loop variable item holds flint, then sail. Its indented print displays those values in list order.',
    options: [
      { id: 'python-archipelago-guardian-expedition-a', label: 'flint\nflag', feedback: 'flag was replaced before the loop started. Read the updated list.' },
      { id: 'python-archipelago-guardian-expedition-b', label: 'sail\nflint', feedback: 'Replacement keeps positions. flint is still first; sail is second.' },
      { id: 'python-archipelago-guardian-expedition-c', label: 'flint\nsail', feedback: 'The loop visits flint and the replacement sail in order.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-archipelago-guardian-expedition-c' },
  },
  {
    id: 'python-archipelago-guardian-trial', chapterId: treasureGuardianChapter.id, languageId: 'python', difficulty: 'challenge',
    type: 'code-builder', concept: "The Guardian's Final Trial", lessonId: 'python-lesson-archipelago-mastery',
    prompt: 'Create kit, append the new supply BEFORE inspection begins, then print every item in order. Assemble all four fragments to release the core.',
    code: '', expectedOutput: 'oil\nrag\nwick',
    hint: 'Place creation and append before the for header. The indented print belongs directly beneath the header.',
    explanation: 'kit starts with oil and rag. append adds wick before the loop, so the inspection prints oil, rag and wick. The indented body runs once per item. Your final inventory spell releases the guardian core!',
    fragments: [
      { id: 'python-archipelago-guardian-trial-loop', code: 'for item in kit:' },
      { id: 'python-archipelago-guardian-trial-add', code: 'kit.append("wick")' },
      { id: 'python-archipelago-guardian-trial-print', code: '    print(item)' },
      { id: 'python-archipelago-guardian-trial-set', code: 'kit = ["oil", "rag"]' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-archipelago-guardian-trial-set', 'python-archipelago-guardian-trial-add', 'python-archipelago-guardian-trial-loop', 'python-archipelago-guardian-trial-print'] },
  },
];
