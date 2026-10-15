# Stage 3G.1 — Valley of Decisions

## Implementation

The shared world registry now includes Forest of Variables and Valley of Decisions. Worlds declare prerequisite mission IDs; chapter and mission unlocks consult that gate. Valley requires **all six** Forest missions, including the actual Goblin King. The Guardian chapter additionally requires The Crossroads.

Forest content, stable IDs, rewards, boss identification, the three-spell prototype and audio implementation are unchanged. No dependency or native configuration changes were made.

The existing mission engine handles both new missions: wrong answers cannot advance, correct answers show the existing spell animation and explanation, Continue advances, and only the fifth answer completes the mission. Rewards are 70 and 80 XP, once each; replay pays zero. Total available XP is now 450 (300 Forest + 150 Valley).

### Ten new exercises

| Chapter | Exercise | Approach |
| --- | --- | --- |
| The Crossroads | Boolean True | Fill in an unquoted Boolean |
| The Crossroads | Equality, == | Choose the comparison operator |
| The Crossroads | Difference and size, != and > | Predict two Boolean outputs |
| The Crossroads | Boundaries, < and <= | Predict two Boolean outputs |
| The Crossroads | At least, >= | Choose the inclusive threshold operator |
| The Guardian's Choice | if | Fill in the conditional keyword |
| The Guardian's Choice | Indentation | Repair a complete three-line block |
| The Guardian's Choice | Conditional execution | Predict output when a false block is skipped |
| The Guardian's Choice | else | Fill in the alternative keyword |
| The Guardian's Choice | Branch selection | Repair the comparison in a complete five-line if/else block |

Each has a hint, explanation and linked Spellbook entry. The guardian is a compact original shape-based sentinel, using the existing mission spell effects rather than a new combat engine.

### Validation

Existing exact validation remains unchanged. The two multiline repair exercises use full-line token and indentation comparison against authored solutions. No Python is executed and no evaluator or parser dependency was added.

Supported formatting: spaces around tokens, blank lines, CRLF, matching single/double quotes, and consistent indentation of 1–8 spaces. Four spaces are taught. Only the authored single-depth blocks, names, integers, simple unescaped strings, assignment/comparison operators, parentheses and colons are supported. Tabs, comments, escapes, nested blocks, inline suites, extra statements, output-only answers and alternative algorithms are rejected. Input is bounded to 2,000 characters.

### Navigation, saves and profile

- The existing map switches worlds by updating route parameters, without pushing another map. Valley has a purple valley banner, lock explanation and two connected chapter nodes.
- Mission exits return to the owning world's map, including deep-linked missions. Unknown world IDs fall back to Forest. Existing unfinished-attempt confirmation remains.
- Mission initialization retries after progression hydration when no attempt exists, without resetting an active attempt on progression updates.
- The `devquest.progression` key and version-1 completed-ID format are unchanged. New completions use the existing queued persistence writer. Legacy Forest saves require no migration.
- Statistics count actual completed mission/exercise IDs across both worlds. Current world means the latest world with a completed mission; merely opening a world changes no stats. Level calculation and Forest achievements remain unchanged.
- Spellbook adds Boolean values, comparisons, if, else and indentation (14 entries total). All 40 exercises have valid references and remain eligible for existing personal notes.
- Valley completion describes its two currently available chapters, not future content.

## Verification

- TypeScript: passed.
- ESLint: passed.
- Full suite: **100 passed**, including all 87 existing tests and 13 new tests. Original Forest suites now explicitly scope their fixed six-mission/30-exercise assertions to Forest.
- Coverage includes legacy saves at all seven completion points, every missing prerequisite, locked deep links, all ten reviewed answers, misleading submissions, meaningful indentation, duplicate submission/replay handling, both full mission flows, fresh-store reload, queued saves, profile/achievement correctness, Spellbook links, navigation and existing audio tests.
- Android export: passed, output in ignored `dist/stage-3g1`.
- Expo Doctor: **20/21 passed**. Its dependency version check reports installed patch versions behind the recommended SDK 57 patches: expo 57.0.27 → 57.0.29; expo-asset 57.0.19 → 57.0.20; expo-constants 57.0.21 → 57.0.22; expo-linking 57.0.12 → 57.0.13; expo-router 57.0.25 → 57.0.27; expo-splash-screen 57.0.9 → 57.0.10. Dependency files were not changed.

### Android manual verification

The existing Android emulator loaded the current application after force-stop/relaunch. Its existing two Forest completions and 50 XP remained intact. Visually checked Forest, the one-tap switch to Valley, the World 2 locked state and requirement, and hardware Back to Home. Screenshots are local ignored verification artifacts under `.expo/stage-3g1`.

A disposable test copy with a completed-Forest fixture and separately prefixed storage keys was attempted to test unlocked gameplay without altering the real player. Expo Go displayed “Something went wrong” before that copy loaded. The investigation was stopped rather than repeatedly retried; its server was stopped and the main app was restored to Home.

**Not verified on device:** completing a new mission, saving its completion across a native relaunch, the guardian/multiline keyboard layout, a shorter viewport, or audible audio. Those mission/save flows are verified with isolated automated fixtures only. No physical phone or iOS listening/device testing was performed. No saved player data was reset or replaced.

## Files

Created:

- `src/game/valleyContent.ts`
- `src/game/pythonLinesValidation.ts`
- `src/components/ValleyGuardian.tsx`
- `src/navigation/worldRoutes.ts`
- `tests/valley.test.cjs`
- `tests/fixtures/forest-complete-v1.json`
- `docs/stage-3g1.md`

Modified:

- `src/game/worldTypes.ts`, `worldContent.ts`, `progression.ts`, `worldMission.ts`, `exerciseValidation.ts`, `profile.ts`, `spellbookContent.ts`
- `src/app/world-map.tsx`, `mission/[missionId].tsx`, `index.tsx`, `spellbook.tsx`
- `tests/progression.test.cjs`, `progressionStorage.test.cjs`, `worldMission.test.cjs`, `educationalContent.test.cjs`, `boss.test.cjs`, `spellbookContent.test.cjs`, `navigation.test.cjs`
- `README.md`

## Next stage

Before expanding the curriculum, finish a device playthrough of both Valley missions, especially multiline indentation with the software keyboard, replay rewards and relaunch persistence. Stage 3G.2 can then add the next agreed Valley chapters using this registry, prerequisite system and mission engine. No further chapters, boss, services or monetization were implemented. No Git commit was made.
