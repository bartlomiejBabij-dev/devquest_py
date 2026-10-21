import type { Chapter, Exercise, Mission } from './worldTypes';

export const inventoryUpdateChapters: readonly Chapter[] = [
  {
    id: 'python-archipelago-growing-chest', worldId: 'python-list-archipelago', title: 'The Growing Chest',
    description: 'A magical chest makes room for each new treasure you discover.',
    learningObjective: 'Use append() to add one item at the end of an existing list and track its length.',
    missionIds: ['python-archipelago-growing-chest-01'], prerequisiteMissionIds: ['python-archipelago-index-island-01'], xpReward: 40,
  },
  {
    id: 'python-archipelago-smiths-exchange', worldId: 'python-list-archipelago', title: "The Smith's Exchange",
    description: 'Trade worn equipment for new treasures at the island forge.',
    learningObjective: 'Replace an existing list item using its index without increasing the list length.',
    missionIds: ['python-archipelago-smiths-exchange-01'], prerequisiteMissionIds: ['python-archipelago-growing-chest-01'], xpReward: 40,
  },
];

export const inventoryUpdateMissions: readonly Mission[] = [
  {
    id: 'python-archipelago-growing-chest-01', chapterId: inventoryUpdateChapters[0].id, title: 'The Growing Chest',
    description: 'Add new treasure to the chest with three append spells.',
    exerciseIds: ['python-archipelago-append-output', 'python-archipelago-append-keyword', 'python-archipelago-append-build'],
    prerequisiteMissionIds: [], xpReward: 40,
  },
  {
    id: 'python-archipelago-smiths-exchange-01', chapterId: inventoryUpdateChapters[1].id, title: "The Smith's Exchange",
    description: 'Upgrade existing items with three replacement spells.',
    exerciseIds: ['python-archipelago-replace-output', 'python-archipelago-replace-choice', 'python-archipelago-replace-build'],
    prerequisiteMissionIds: [], xpReward: 40,
  },
];

/** Python is display-only content. Validation compares authored option/fragment IDs. */
export const inventoryUpdateExercises: readonly Exercise[] = [
  {
    id: 'python-archipelago-append-output', chapterId: inventoryUpdateChapters[0].id, languageId: 'python', difficulty: 'intro',
    type: 'output-choice', concept: 'A new item at the end', lessonId: 'python-lesson-list-append',
    prompt: 'The chest gains a treasure. What does this spell print?',
    code: 'loot = ["orb"]\nloot.append("shell")\nprint(loot[1])',
    hint: 'orb stays at index 0. The newly appended item goes after it, at index 1.',
    explanation: 'append("shell") changes loot from one item to two. orb stays first and shell is added at the end. Index 1 selects shell, so print shows shell without quotes.',
    options: [
      { id: 'python-archipelago-append-output-a', label: 'orb', feedback: 'orb is still at index 0. append adds shell after it; it does not replace orb.' },
      { id: 'python-archipelago-append-output-b', label: 'shell', feedback: 'The added shell is the second item, at index 1.' },
      { id: 'python-archipelago-append-output-c', label: "['orb', 'shell']", feedback: 'That is the whole list. loot[1] selects only its second item, shell.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-archipelago-append-output-b' },
  },
  {
    id: 'python-archipelago-append-keyword', chapterId: inventoryUpdateChapters[0].id, languageId: 'python', difficulty: 'practice',
    type: 'missing-token', concept: 'Grow the existing list', lessonId: 'python-lesson-append-length',
    prompt: 'Choose the method that adds pin at the end so this spell prints 3.',
    code: 'bag = ["key", "cap"]\nbag.____("pin")\nprint(len(bag))',
    hint: 'Use the list method that adds one item. len() counts items; print() displays values.',
    explanation: 'bag.append("pin") adds one item to the existing two-item list. Its length becomes 3. Call append on its own line; it changes bag rather than returning a new list.',
    options: [
      { id: 'python-archipelago-append-keyword-a', label: 'append', feedback: 'append adds pin after key and cap, giving three items.' },
      { id: 'python-archipelago-append-keyword-b', label: 'len', feedback: 'len(bag) counts items; it is not bag.len(...), and it does not add anything.' },
      { id: 'python-archipelago-append-keyword-c', label: 'print', feedback: 'print(bag) displays a value; bag.print(...) is not the list operation for adding an item.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-archipelago-append-keyword-a' },
  },
  {
    id: 'python-archipelago-append-build', chapterId: inventoryUpdateChapters[0].id, languageId: 'python', difficulty: 'practice',
    type: 'code-builder', concept: 'Create, add, then count', lessonId: 'python-lesson-append-length',
    prompt: 'Create pack, add map at the end, then print the new length. Use all three fragments.', code: '', expectedOutput: '3',
    hint: 'Create pack before calling append. Count after adding map; counting earlier would show only two items.',
    explanation: 'pack begins with bell and hat. append("map") changes that same list to three items, so len(pack) is 3. Printing after the update shows the new length.',
    fragments: [
      { id: 'python-archipelago-append-build-count', code: 'print(len(pack))' },
      { id: 'python-archipelago-append-build-add', code: 'pack.append("map")' },
      { id: 'python-archipelago-append-build-set', code: 'pack = ["bell", "hat"]' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-archipelago-append-build-set', 'python-archipelago-append-build-add', 'python-archipelago-append-build-count'] },
  },
  {
    id: 'python-archipelago-replace-output', chapterId: inventoryUpdateChapters[1].id, languageId: 'python', difficulty: 'intro',
    type: 'output-choice', concept: 'Upgrade one position', lessonId: 'python-lesson-list-replace',
    prompt: 'The smith upgrades the second item. What appears?',
    code: 'gear = ["bow", "cap"]\ngear[1] = "helm"\nprint(gear[1])',
    hint: 'Index 1 is the second item. Assignment replaces cap at that position with helm.',
    explanation: 'gear[1] = "helm" replaces cap. The list is now bow followed by helm, still two items. Printing the updated index 1 shows helm.',
    options: [
      { id: 'python-archipelago-replace-output-a', label: 'cap', feedback: 'cap was there before the assignment. Its position now holds helm.' },
      { id: 'python-archipelago-replace-output-b', label: 'bow', feedback: 'bow is at index 0 and stays unchanged. This spell reads index 1.' },
      { id: 'python-archipelago-replace-output-c', label: 'helm', feedback: 'The assignment puts helm in the existing second position.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-archipelago-replace-output-c' },
  },
  {
    id: 'python-archipelago-replace-choice', chapterId: inventoryUpdateChapters[1].id, languageId: 'python', difficulty: 'practice',
    type: 'multiple-choice', optionFormat: 'code', concept: 'Replace, do not add', lessonId: 'python-lesson-replace-length',
    prompt: 'Replace the first item with pearl, keeping exactly two items. Which line does that?', code: 'bag = ["gem", "net"]',
    hint: 'The first position is index 0. Assign to that existing position instead of adding a new one.',
    explanation: 'bag[0] = "pearl" replaces gem at the first position. net stays at index 1 and len(bag) stays 2. append would add a third item instead of upgrading the first.',
    options: [
      { id: 'python-archipelago-replace-choice-a', label: 'bag.append("pearl")', feedback: 'This adds pearl as a third item. gem would remain first, so this is addition rather than replacement.' },
      { id: 'python-archipelago-replace-choice-b', label: 'bag[0] = "pearl"', feedback: 'Index 0 selects gem, and assignment replaces it without changing the number of items.' },
      { id: 'python-archipelago-replace-choice-c', label: 'bag[1] = "pearl"', feedback: 'This replaces net, the second item. To replace the first item, use index 0.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-archipelago-replace-choice-b' },
  },
  {
    id: 'python-archipelago-replace-build', chapterId: inventoryUpdateChapters[1].id, languageId: 'python', difficulty: 'practice',
    type: 'code-builder', concept: 'Forge before revealing', lessonId: 'python-lesson-replace-length',
    prompt: 'Create kit, replace its first item with staff, then print the upgraded item. Use all three lines.', code: '', expectedOutput: 'staff',
    hint: 'Create kit before writing kit[0]. Replace axe before printing, or the output would still be axe.',
    explanation: 'kit begins with axe and orb. The assignment changes index 0 to staff; orb stays at index 1. The final print reads staff. Replacing the item leaves len(kit) at 2.',
    fragments: [
      { id: 'python-archipelago-replace-build-upgrade', code: 'kit[0] = "staff"' },
      { id: 'python-archipelago-replace-build-show', code: 'print(kit[0])' },
      { id: 'python-archipelago-replace-build-set', code: 'kit = ["axe", "orb"]' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-archipelago-replace-build-set', 'python-archipelago-replace-build-upgrade', 'python-archipelago-replace-build-show'] },
  },
];
