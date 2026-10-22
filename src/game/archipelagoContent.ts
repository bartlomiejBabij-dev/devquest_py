import { treasureGuardianChapter, treasureGuardianMission, treasureGuardianExercises } from './archipelagoBossContent';
import { listIterationChapters, listIterationMissions, listIterationExercises } from './archipelagoIterationContent';
import { inventoryUpdateChapters, inventoryUpdateMissions, inventoryUpdateExercises } from './archipelagoUpdatesContent';
import { cavernMissions } from './cavernContent';
import type { Chapter, Exercise, Mission, World } from './worldTypes';

export const listArchipelago: World = {
  id: 'python-list-archipelago', languageId: 'python', title: 'List Archipelago',
  description: 'Sail turquoise waters, gather island treasures and organize your discoveries with Python lists.',
  chapterIds: ['python-archipelago-treasure-inventory', 'python-archipelago-index-island', ...inventoryUpdateChapters.map(chapter => chapter.id), ...listIterationChapters.map(chapter => chapter.id), treasureGuardianChapter.id],
  prerequisiteMissionIds: cavernMissions.map(mission => mission.id),
  unlockRequirement: 'Complete all seven chapters of Loop Caverns, including The Loop Warden.', xpReward: 320,
};

export const archipelagoChapters: readonly Chapter[] = [
  {
    id: 'python-archipelago-treasure-inventory', worldId: listArchipelago.id, title: 'Treasure Inventory',
    description: 'Open the shore chest and give your treasures a shared home.',
    learningObjective: 'Create an ordered list with brackets, commas and quoted text, then display it.',
    missionIds: ['python-archipelago-treasure-inventory-01'], prerequisiteMissionIds: [], xpReward: 30,
  },
  {
    id: 'python-archipelago-index-island', worldId: listArchipelago.id, title: 'Index Island',
    description: 'Follow the ancient map to the right item in your inventory.',
    learningObjective: 'Read zero-based list positions and count items with len().',
    missionIds: ['python-archipelago-index-island-01'], prerequisiteMissionIds: ['python-archipelago-treasure-inventory-01'], xpReward: 30,
  },
  ...inventoryUpdateChapters,
  ...listIterationChapters,
  treasureGuardianChapter,
];

export const archipelagoMissions: readonly Mission[] = [
  {
    id: 'python-archipelago-treasure-inventory-01', chapterId: archipelagoChapters[0].id, title: 'Treasure Inventory',
    description: 'Pack, arrange and reveal your treasures with three list spells.',
    exerciseIds: ['python-archipelago-list-purpose', 'python-archipelago-list-syntax', 'python-archipelago-list-build'],
    prerequisiteMissionIds: [], xpReward: 30,
  },
  {
    id: 'python-archipelago-index-island-01', chapterId: archipelagoChapters[1].id, title: 'Index Island',
    description: 'Find the right treasure with three spells of position and length.',
    exerciseIds: ['python-archipelago-index-output', 'python-archipelago-index-length', 'python-archipelago-index-build'],
    prerequisiteMissionIds: [], xpReward: 30,
  },
  ...inventoryUpdateMissions,
  ...listIterationMissions,
  treasureGuardianMission,
];

/** Authored display text only. Choices and builders validate stable IDs, never Python. */
export const archipelagoExercises: readonly Exercise[] = [
  {
    id: 'python-archipelago-list-purpose', chapterId: archipelagoChapters[0].id, languageId: 'python', difficulty: 'intro',
    type: 'multiple-choice', concept: 'An ordered collection', lessonId: 'python-lesson-list-create',
    prompt: 'You want to keep several island treasures together in a known order. Why use a Python list?', code: '',
    hint: 'A list groups several items under one variable name and keeps their order.',
    explanation: 'A list stores multiple items together in order. One inventory variable can hold the collection, so you do not need a separate variable for each treasure.',
    options: [
      { id: 'python-archipelago-list-purpose-a', label: 'It prints every treasure automatically.', feedback: 'Storing a list does not display it. Use print() when you want to show a value.' },
      { id: 'python-archipelago-list-purpose-b', label: 'It stores multiple items together in order.', feedback: 'One variable can name the whole ordered collection.' },
      { id: 'python-archipelago-list-purpose-c', label: 'It can hold only one text item.', feedback: 'A list can hold several items. Commas separate them inside square brackets.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-archipelago-list-purpose-b' },
  },
  {
    id: 'python-archipelago-list-syntax', chapterId: archipelagoChapters[0].id, languageId: 'python', difficulty: 'practice',
    type: 'multiple-choice', optionFormat: 'code', concept: 'Brackets, commas and quotes', lessonId: 'python-lesson-list-create',
    prompt: 'Choose the valid assignment that stores net and hat as two text items in a list called gear.', code: '',
    hint: 'Wrap the items in [ ], put a comma between them, and quote each text item.',
    explanation: 'gear = ["net", "hat"] assigns a two-item list. Square brackets surround the items, the comma separates them, and quotes mark each text value.',
    options: [
      { id: 'python-archipelago-list-syntax-a', label: 'gear = ["net", "hat"]', feedback: 'This uses a list, a comma and two quoted text items.' },
      { id: 'python-archipelago-list-syntax-b', label: 'gear = [net, hat]', feedback: 'Without quotes, net and hat would be variable names, not the requested text items.' },
      { id: 'python-archipelago-list-syntax-c', label: 'gear = "net, hat"', feedback: 'This is one string. Square brackets around separately quoted items make a list.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-archipelago-list-syntax-a' },
  },
  {
    id: 'python-archipelago-list-build', chapterId: archipelagoChapters[0].id, languageId: 'python', difficulty: 'practice',
    type: 'code-builder', concept: 'Pack before you display', lessonId: 'python-lesson-list-display',
    prompt: 'Create loot, print the whole list, then announce Packed. Use all three lines in that order.', code: '',
    expectedOutput: "['orb', 'key']\nPacked",
    hint: 'Assign loot before reading it. The Packed message must appear after the list, not before it.',
    explanation: 'Assignment creates loot before print(loot) reads it. Python displays the whole list with brackets, a comma and quotes around its strings. The final print shows Packed on the next line.',
    fragments: [
      { id: 'python-archipelago-list-build-end', code: 'print("Packed")' },
      { id: 'python-archipelago-list-build-show', code: 'print(loot)' },
      { id: 'python-archipelago-list-build-set', code: 'loot = ["orb", "key"]' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-archipelago-list-build-set', 'python-archipelago-list-build-show', 'python-archipelago-list-build-end'] },
  },
  {
    id: 'python-archipelago-index-output', chapterId: archipelagoChapters[1].id, languageId: 'python', difficulty: 'intro',
    type: 'output-choice', concept: 'Start counting positions at zero', lessonId: 'python-lesson-list-index',
    prompt: 'Which two treasures does this spell reveal, in order?', code: 'kit = ["shell", "flag", "bell"]\nprint(kit[0])\nprint(kit[1])',
    hint: 'Position 0 is the first item. Position 1 is the second item.',
    explanation: 'Lists preserve order: shell is at index 0, flag at index 1 and bell at index 2. Printing the selected strings shows shell and flag on separate lines, without quotes.',
    options: [
      { id: 'python-archipelago-index-output-a', label: 'flag\nbell', feedback: 'Those are positions 1 and 2. Python starts indexing at 0, so the first print selects shell.' },
      { id: 'python-archipelago-index-output-b', label: 'shell\nbell', feedback: 'shell is at 0, but bell is at 2. The second print asks for index 1: flag.' },
      { id: 'python-archipelago-index-output-c', label: 'shell\nflag', feedback: 'Zero selects the first item; one selects the second.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-archipelago-index-output-c' },
  },
  {
    id: 'python-archipelago-index-length', chapterId: archipelagoChapters[1].id, languageId: 'python', difficulty: 'practice',
    type: 'output-choice', concept: 'Length counts items', lessonId: 'python-lesson-list-length',
    prompt: 'How many items does this inventory contain? Predict the output.', code: 'bag = ["orb", "key", "cap"]\nprint(len(bag))',
    hint: 'Count items, not letters or the last index. Each quoted word is one item.',
    explanation: 'len(bag) is 3 because the list contains three items. Their indexes are 0, 1 and 2. Index 3 would be outside this list; length and the last valid index are different.',
    options: [
      { id: 'python-archipelago-index-length-a', label: '2', feedback: 'Two is the last valid index here. len() counts all three items.' },
      { id: 'python-archipelago-index-length-b', label: '3', feedback: 'orb, key and cap are three separate items.' },
      { id: 'python-archipelago-index-length-c', label: '9', feedback: 'Nine counts the letters. len() on this list counts items, not letters inside its strings.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-archipelago-index-length-b' },
  },
  {
    id: 'python-archipelago-index-build', chapterId: archipelagoChapters[1].id, languageId: 'python', difficulty: 'practice',
    type: 'code-builder', concept: 'Find the second treasure', lessonId: 'python-lesson-list-length',
    prompt: 'Create loot, store its second item in item, then print item. Assemble all three fragments.', code: '', expectedOutput: 'map',
    hint: 'Create the list before reading loot[1]. Set item before printing it. Index 1 selects the second item.',
    explanation: 'loot holds ring at index 0 and map at index 1. item = loot[1] stores map in item. Only after both assignments can print(item) display map.',
    fragments: [
      { id: 'python-archipelago-index-build-read', code: 'item = loot[1]' },
      { id: 'python-archipelago-index-build-print', code: 'print(item)' },
      { id: 'python-archipelago-index-build-set', code: 'loot = ["ring", "map"]' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-archipelago-index-build-set', 'python-archipelago-index-build-read', 'python-archipelago-index-build-print'] },
  },
  ...inventoryUpdateExercises,
  ...listIterationExercises,
  ...treasureGuardianExercises,
];
