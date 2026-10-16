# Stage 3G.2B — Variables and arithmetic

## Implementation

Only Fire Essence and Mana Stones were converted. Both use the existing **Learn → example/output → practice → spell → explanation** flow, `LessonCard`, `AnswerChoices`, deterministic option-ID validation and mission engine. No runtime UI, navigation, audio or storage changes were needed.

Each mission has **five tap-based questions and zero keyboard-entry questions**. Correct answers keep the existing spell animation, audio event, explanation and Continue action. Wrong answers explain the misconception and allow retry. All answer cards retain their minimum 56-point touch targets.

### Fire Essence — 30 XP

| Existing exercise suffix | Interaction | Learning objective |
| --- | --- | --- |
| assignment | Missing value | Store the number 10, rather than quoted text |
| read | Multiple choice | Understand a variable as a name for a stored value |
| update | Output choice | Read the old value, add 3, then store and print the new value |
| print | Output choice | Print text stored in a variable, rather than the variable's name |
| name | Missing token | Use the exact defined variable name without quotes |

Three lessons appear before exercises 1, 3 and 4: **Give a value a name**, **Refill your mana**, and **Remember a name**. They explain why variables are useful, one `=` for assignment versus `==` for comparison, numbers versus text, reading values with `print()`, exact names and reassignment. The update example explicitly reads the old `mana` value of 10, adds 5 and stores 15. Its challenge uses different values.

### Mana Stones — 40 XP

| Existing exercise suffix | Interaction | Learning objective |
| --- | --- | --- |
| operator | Missing operator | Subtract a spell cost from a variable's value |
| addition | Output choice | Add small integers and store the result |
| multiplication | Missing operator | Use Python's `*` for equal groups |
| precedence | Output choice | Multiply before adding |
| damage | Output choice | Apply multiplication and addition to stored values |

Three lessons appear before exercises 1, 3 and 4: **Count your supplies**, **Power in groups**, and **Which step comes first?** They teach addition/subtraction, calculating with variables, `*` instead of `x` or `×`, and multiplication before addition/subtraction. The original five objectives are retained. Division was not part of those objectives and was not added.

Lessons stay concise, show expected output and explain why it occurs. Teaching examples differ from the questions. Completed replays skip automatic introductions, and Review Lesson remains available without changing the attempt or awarding XP.

## Compatibility

- All mission IDs, exercise IDs, mission order, rewards, prerequisite rules and save formats remain unchanged.
- Existing mission completions, XP, profile statistics, achievements, world unlocks and boss progression remain valid.
- All ten original Spellbook associations and exercise-linked notes are preserved.
- The other 30 exercise objects are checked against a pre-edit baseline, including The Awakening and The Crossroads.
- Existing lessons, shared UI, validators, audio preferences, onboarding and the original Goblin battle are unchanged.
- The only fixture updates reflect the two newly converted missions: reviewed answers now use stable option IDs, and the compatibility baseline covers the 30 exercises outside this stage. Previous tests were retained and scoped to their original lessons where needed.

## Changed files

- `src/game/worldContent.ts`: ten exercise conversions, misconception feedback and lesson references.
- `src/game/lessonContent.ts`: six new lessons; the existing five lessons are unchanged.
- `tests/variablesArithmetic.test.cjs`: nine new content, flow and compatibility tests.
- `tests/educationalContent.test.cjs`: reviewed stable option IDs for the ten converted questions.
- `tests/learningLoop.test.cjs`: retain original lesson assertions while allowing the new lesson set.
- `tests/fixtures/learning-compatibility.json`: pre-edit data hashes for all 30 exercises outside this stage; original mission IDs/order/rewards retained.
- `README.md` and this report.

## Automated verification

| Check | Result |
| --- | --- |
| TypeScript (`npx tsc --noEmit`) | Passed |
| ESLint (`npm run lint`) | Passed |
| Full suite (`npm test`) | **117 passed**, including nine new tests |
| Android export | Passed; ignored output: `dist/stage-3g2b` |
| Expo Doctor | **19/21 checks passed**, details below |
| Git whitespace check | Passed |

Tests cover the authored answer IDs and distractors, reviewed Python examples/outputs, variable reassignment, assignment versus equality, multiplication precedence, lesson sequencing, locked entry, wrong answers, duplicate submissions/Continue, first-completion rewards and zero-XP replays. Legacy saves are checked at every completion point from zero through all eight missions, including profile counts, achievements, world gates and fresh storage instances. Notes and all ten Spellbook associations are checked explicitly. Existing battle, boss, audio, navigation, onboarding, persistence and profile suites pass.

Output checks use independently reviewed snippets and fixed arithmetic expectations; they do not execute content or user-entered Python. Logic tests cannot establish visual quality, native animation timing or audible playback.

Expo Doctor's schema check failed to reach the Expo API (TLS connection failure). Its other failed check reported six existing patch mismatches: expo 57.0.27 → 57.0.30; expo-asset 57.0.19 → 57.0.20; expo-constants 57.0.21 → 57.0.22; expo-linking 57.0.12 → 57.0.13; expo-router 57.0.25 → 57.0.28; expo-splash-screen 57.0.9 → 57.0.10. Dependencies and app configuration were not changed.

## Android verification

Expo Go loaded the current bundle after the test development server was restarted with an emulator-reachable listener. The real saved player had four completed Forest chapters and **140 XP**. No save was deleted, replaced or edited to unlock a first-time attempt.

Fire Essence was played through on the normal 1080×2400 viewport. Verified all five tap questions, supportive wrong-answer feedback, all three lesson cards through Review Lesson, hardware Back preserving a wrong selection/feedback, and a Spellbook round trip with the personal-note panel still available. Success feedback and explanations appeared before Continue. Completion showed **+0 XP** and **140 total XP**. Replay Mission returned to spell 1 without a compulsory lesson, and exit returned to the map.

Mana Stones was completed on a shorter 1080×1800 viewport, including all five questions, all three lessons through review, lesson scrolling, wrong-answer retry and reachable answer/Continue controls. Its result also showed **+0 XP** and **140 total XP**. The emulator's normal 1080×2400 viewport was restored. Both missions use zero code-entry questions, so no Gboard interaction is required for this stage.

First-time introductions and fresh 30/40 XP awards are verified by automated fixtures, not by altering this player's completed missions. No physical Android or iOS testing, audible playback check or new-completion/native-relaunch persistence test was performed. Detailed animation/audio timing still needs physical-device review. Screenshots are ignored artifacts under `.expo/stage-3g2b`.

## Recommended Stage 3G.2C

First have a beginner test Fire Essence and Mana Stones on a physical Android phone, including first-time lessons and wrong-answer feedback. Then convert Talking Trees and Broken Spells using the same components, with short lessons before strings and error correction, mostly tap-based questions and only brief typing where useful. Preserve stable IDs, rewards, notes and replay checks. That work has not been started.

No Git commit was made.
