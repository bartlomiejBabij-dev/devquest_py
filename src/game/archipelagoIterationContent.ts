import type { Chapter, Exercise, Mission } from './worldTypes';

export const listIterationChapters: readonly Chapter[] = [
  {
    id: 'python-archipelago-island-expedition', worldId: 'python-list-archipelago', title: 'Island Expedition',
    description: 'Inspect each treasure from the expedition, one discovery at a time.',
    learningObjective: 'Use for to visit list values in order and repeat an indented action for each item.',
    missionIds: ['python-archipelago-island-expedition-01'], prerequisiteMissionIds: ['python-archipelago-smiths-exchange-01'], xpReward: 40,
  },
  {
    id: 'python-archipelago-supply-run', worldId: 'python-list-archipelago', title: 'The Supply Run',
    description: 'Prepare the inventory, then check every supply before sailing.',
    learningObjective: 'Append or replace items before using a for loop to read the updated list.',
    missionIds: ['python-archipelago-supply-run-01'], prerequisiteMissionIds: ['python-archipelago-island-expedition-01'], xpReward: 40,
  },
];

export const listIterationMissions: readonly Mission[] = [
  {
    id: 'python-archipelago-island-expedition-01', chapterId: listIterationChapters[0].id, title: 'Island Expedition',
    description: 'Visit each discovery with three list-iteration spells.',
    exerciseIds: ['python-archipelago-iteration-output', 'python-archipelago-iteration-variable', 'python-archipelago-iteration-build'],
    prerequisiteMissionIds: [], xpReward: 40,
  },
  {
    id: 'python-archipelago-supply-run-01', chapterId: listIterationChapters[1].id, title: 'The Supply Run',
    description: 'Prepare and inspect the supplies with three combined list spells.',
    exerciseIds: ['python-archipelago-supply-output', 'python-archipelago-supply-build', 'python-archipelago-supply-replace'],
    prerequisiteMissionIds: [], xpReward: 40,
  },
];

/** Display-only Python. All answers are checked against stable option or fragment IDs. */
export const listIterationExercises: readonly Exercise[] = [
  {
    id: 'python-archipelago-iteration-output', chapterId: listIterationChapters[0].id, languageId: 'python', difficulty: 'intro',
    type: 'output-choice', concept: 'Visit each treasure in order', lessonId: 'python-lesson-list-iteration',
    prompt: 'Which discoveries appear, in order?', code: 'finds = ["shell", "bell"]\nfor find in finds:\n    print(find)',
    hint: 'find holds shell on the first turn and bell on the second. Print the value from each turn.',
    explanation: 'The loop visits shell, then bell, following list order. The indented print runs once for each of the two items. find holds the item itself, not its index.',
    options: [
      { id: 'python-archipelago-iteration-output-a', label: '0\n1', feedback: 'Those are indexes. Looping directly over finds gives its values: shell and bell.' },
      { id: 'python-archipelago-iteration-output-b', label: 'shell\nbell', feedback: 'Each item is printed once in the same order as the list.' },
      { id: 'python-archipelago-iteration-output-c', label: 'bell\nshell', feedback: 'A for loop visits this list from first to last. shell comes before bell.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-archipelago-iteration-output-b' },
  },
  {
    id: 'python-archipelago-iteration-variable', chapterId: listIterationChapters[0].id, languageId: 'python', difficulty: 'practice',
    type: 'missing-token', concept: 'The current item has a name', lessonId: 'python-lesson-list-current-item',
    prompt: 'Choose what goes inside print() to show gem, then cap, one item per line.',
    code: 'loot = ["gem", "cap"]\nfor piece in loot:\n    print(____)',
    hint: 'The name before in holds the current item. Use that name without quotes.',
    explanation: 'piece receives gem on the first turn and cap on the next. print(piece) displays each value. loot names the whole list, while "piece" would print the same literal word each time.',
    options: [
      { id: 'python-archipelago-iteration-variable-a', label: 'piece', feedback: 'piece is the loop variable holding the current list element.' },
      { id: 'python-archipelago-iteration-variable-b', label: 'loot', feedback: 'loot names the entire list. Printing it inside the loop would show the whole list twice.' },
      { id: 'python-archipelago-iteration-variable-c', label: '"piece"', feedback: 'Quotes make literal text. This would print the word piece twice instead of the treasures.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-archipelago-iteration-variable-a' },
  },
  {
    id: 'python-archipelago-iteration-build', chapterId: listIterationChapters[0].id, languageId: 'python', difficulty: 'practice',
    type: 'code-builder', concept: 'Build an expedition loop', lessonId: 'python-lesson-list-current-item',
    prompt: 'Create kit, then visit each item and print it in list order. Use all three fragments.', code: '', expectedOutput: 'orb\nkey',
    hint: 'Create kit before the for header. The indented print belongs below that header and uses tool, the current item.',
    explanation: 'kit is created first. for tool in kit gives tool the values orb and key in order. The indented print runs on each turn, producing one line per item.',
    fragments: [
      { id: 'python-archipelago-iteration-build-print', code: '    print(tool)' },
      { id: 'python-archipelago-iteration-build-set', code: 'kit = ["orb", "key"]' },
      { id: 'python-archipelago-iteration-build-loop', code: 'for tool in kit:' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-archipelago-iteration-build-set', 'python-archipelago-iteration-build-loop', 'python-archipelago-iteration-build-print'] },
  },
  {
    id: 'python-archipelago-supply-output', chapterId: listIterationChapters[1].id, languageId: 'python', difficulty: 'practice',
    type: 'output-choice', concept: 'Read the list after adding', lessonId: 'python-lesson-list-append-iterate',
    prompt: 'The inventory is updated before inspection. What does the loop print?',
    code: 'bag = ["ink"]\nbag.append("wax")\nfor supply in bag:\n    print(supply)',
    hint: 'append changes bag before the loop begins. ink stays first and wax is added at the end.',
    explanation: 'bag starts with ink. append("wax") changes the existing list to ink followed by wax. The loop begins afterward and prints both values in that order.',
    options: [
      { id: 'python-archipelago-supply-output-a', label: 'ink', feedback: 'The append happens before the loop, so wax is already present and gets a turn too.' },
      { id: 'python-archipelago-supply-output-b', label: 'wax\nink', feedback: 'append adds at the end. ink remains first, followed by wax.' },
      { id: 'python-archipelago-supply-output-c', label: 'ink\nwax', feedback: 'The loop reads both items from the updated list, in order.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-archipelago-supply-output-c' },
  },
  {
    id: 'python-archipelago-supply-build', chapterId: listIterationChapters[1].id, languageId: 'python', difficulty: 'practice',
    type: 'code-builder', concept: 'Prepare before you inspect', lessonId: 'python-lesson-list-append-iterate',
    prompt: 'Create pack, add hat BEFORE the loop begins, then print each item. Assemble all four fragments.', code: '', expectedOutput: 'net\nhat',
    hint: 'Place the list creation and append before the for header. Keep the indented print directly under the header. Appending after the loop would be too late.',
    explanation: 'pack starts with net. append("hat") adds the second item before inspection. for item in pack then prints net and hat. The unindented append runs once, before the loop body.',
    fragments: [
      { id: 'python-archipelago-supply-build-loop', code: 'for item in pack:' },
      { id: 'python-archipelago-supply-build-print', code: '    print(item)' },
      { id: 'python-archipelago-supply-build-set', code: 'pack = ["net"]' },
      { id: 'python-archipelago-supply-build-add', code: 'pack.append("hat")' },
    ], validation: { kind: 'fragment-sequence', expectedFragmentIds: ['python-archipelago-supply-build-set', 'python-archipelago-supply-build-add', 'python-archipelago-supply-build-loop', 'python-archipelago-supply-build-print'] },
  },
  {
    id: 'python-archipelago-supply-replace', chapterId: listIterationChapters[1].id, languageId: 'python', difficulty: 'challenge',
    type: 'output-choice', concept: 'The final equipment check', lessonId: 'python-lesson-list-replace-iterate',
    prompt: 'Your final supply spell upgrades the first item before sailing. What does the inspection print?',
    code: 'gear = ["axe", "cup"]\ngear[0] = "bow"\nfor item in gear:\n    print(item)',
    hint: 'Index 0 is replaced before the loop. The second item stays in place; nothing is appended.',
    explanation: 'gear[0] = "bow" replaces axe without adding an item. The loop then visits bow and cup. You prepared the list first and inspected its two current values in order.',
    options: [
      { id: 'python-archipelago-supply-replace-a', label: 'axe\ncup', feedback: 'That was the original list. The assignment replaces axe before the loop starts.' },
      { id: 'python-archipelago-supply-replace-b', label: 'bow\ncup', feedback: 'The first item is now bow, while cup stays second.' },
      { id: 'python-archipelago-supply-replace-c', label: 'axe\ncup\nbow', feedback: 'Indexed assignment replaces an item. It does not append a third value.' },
    ], validation: { kind: 'option-id', correctOptionId: 'python-archipelago-supply-replace-b' },
  },
];
