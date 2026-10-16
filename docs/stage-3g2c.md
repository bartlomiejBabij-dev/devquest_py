# Stage 3G.2C — Strings and debugging

## Learning content

Only Talking Trees and Broken Spells were converted. Each retains five exercises and now uses **five tap answers and zero keyboard-entry answers**. They reuse `LessonCard`, `AnswerChoices`, option-ID validation and the existing Learn → example/output → practice → spell → explanation flow.

### Talking Trees — 50 XP

| Existing exercise suffix | Interaction | Objective |
| --- | --- | --- |
| output | Output choice | Join strings while preserving the comma and space |
| variable | Output choice | Print the stored text, not the variable's name |
| repeat | Output choice | Repeat the entire string without added spaces |
| length | Output choice | Use `len()` to count characters, excluding quote marks |
| repair | Missing token | Join text with a quoted digit rather than an integer |

Three lessons appear before exercises 1, 3 and 5:

- **Let the trees speak:** strings, quotes, variable values, `+` and explicit spaces.
- **Echoes and letter counts:** string repetition, `len()`, punctuation and counting before printing.
- **A digit can be text:** string joining versus numeric addition, and why directly joining a string and an integer fails.

All original objectives, including repetition and string length, are retained. No formatting methods or advanced string features were added.

### Broken Spells — 60 XP

| Existing exercise suffix | Interaction | Objective |
| --- | --- | --- |
| name | Choose a repaired line | Match the defined variable name exactly |
| parenthesis | Missing token | Close an unmatched parenthesis |
| quotes | Choose a repaired line | Quote a message rather than read an undefined name |
| assignment | Choose a repaired line | Assign a number with `=`, rather than compare with `==` or store text |
| debug | Choose a repaired line | Read a variable instead of printing its name as text |

Three lessons appear before exercises 1, 2 and 4:

- **Find the broken rune:** what bugs/debugging mean, undefined names and spelling checks.
- **Close the magic circle:** matching quotes/parentheses and simple syntax-error patterns.
- **Make the spell mean it:** assignment, comparison and valid instructions that produce an unwanted result.

The content explicitly distinguishes missing syntax from errors encountered while reading undefined names. `print("power")` is described as valid Python with unwanted output. `mana = "5"` is a valid distractor that fails the stated requirement to store a number, even though printing it would look the same. No question offers both equivalent quote styles as competing correct options.

## Integration and compatibility

No runtime UI, mission engine, validation, audio, navigation or storage code changed. The existing large answer cards, spell events, explanations, Continue behavior, review, Spellbook and notes remain in use. Replays skip automatic lessons; reviewing a lesson never dispatches progression actions.

All world/chapter/mission definitions, IDs, exercise order, rewards, prerequisites and Spellbook links are checked against a pre-edit fixture. Hash checks also preserve all 30 other exercises and the 11 existing lessons. Completed missions remain completed, XP is still derived from their stable IDs and replay still awards zero. Notes remain attached to the same exercise IDs.

## Exact changed files

- `src/game/worldContent.ts` — ten exercise conversions and feedback.
- `src/game/lessonContent.ts` — six additional lessons.
- `tests/stringsDebugging.test.cjs` — nine new tests for content, flow and compatibility.
- `tests/fixtures/strings-debugging-compatibility.json` — pre-edit baseline for unaffected data and progression definitions.
- `tests/educationalContent.test.cjs` — reviewed option IDs, current Forest interaction types and retained direct tests of the unchanged code-entry validator.
- `tests/worldMission.test.cjs` — expected Forest type set updated because its last `fill-blank` exercise became a tap question; full mission/replay assertions retained.
- `tests/fixtures/learning-compatibility.json` — only the ten intentionally changed content snapshots updated; all other earlier snapshots preserved.
- `README.md`.
- `docs/stage-3g2c.md`.

## Automated verification

| Check | Result |
| --- | --- |
| TypeScript | Passed |
| ESLint | Passed |
| Full automated suite | **126 passed**, including nine new tests |
| Android bundle export | Passed; ignored output in `dist/stage-3g2c` |
| Expo Doctor | **20/21 checks passed** |
| Git whitespace check | Passed |

The tests bind independently reviewed code, answer IDs, distractors, repairs and expected outputs to the authored content. They cover exact spaces/quotes, lesson sequencing, invalid IDs, locked entry, wrong answers, duplicate submissions/Continue, 50/60 XP rewards, zero-XP replays, legacy saves at all completion points, profile counts, achievements, world gates and notes. Existing audio, navigation, onboarding, persistence, boss and prototype tests pass. No content or user-entered Python is executed by the game or these tests.

Expo Doctor reports only the existing recommended SDK 57 patch-version differences: expo 57.0.27 → 57.0.30; expo-asset 57.0.19 → 57.0.20; expo-constants 57.0.21 → 57.0.22; expo-linking 57.0.12 → 57.0.13; expo-router 57.0.25 → 57.0.28; expo-splash-screen 57.0.9 → 57.0.10. No dependency or configuration changes were made.

## Android verification and limitations

Both five-question missions were replayed in Expo Go on the Android emulator using a separate temporary app copy with isolated storage keys and a 200-XP test fixture. No test unlock or storage override was added to production code. Both results showed **+0 XP**, **200 total XP**, and the replay-complete message.

- Talking Trees was checked at 1080 × 2400: wrong-answer feedback, preserved selection/feedback through lesson review, Spellbook and return, all five correct answers, explanations and Continue.
- Broken Spells was checked at 1080 × 1800: wrong-answer retry, repaired lines, all five answers, lesson scrolling and reachable controls. The normal emulator size was restored afterward.
- All six new lessons were opened through Review Lesson. Both replays skipped automatic introductions. No keyboard was needed.
- The original app was reopened and then force-stopped/reloaded from the current development server. Its Home still showed **140 total XP**, matching the value before testing; World Map confirmed **4/6 cleared (67%)** and World 2 locked. The temporary server was stopped.

First-time lesson sequencing and new 50/60-XP awards were verified by automated tests, not by completing fresh missions on the device. Physical-phone, iOS and audible audio verification were not performed in this stage. A final wording clarification about an unquoted single word was checked by the automated suite and export after the emulator lesson review.

## Recommended Stage 3G.2D

Have a beginner try these lessons on a physical Android phone first, especially the exact-space choices and debugging explanations. Then consider converting the remaining Goblin King and Guardian's Choice exercises using the same learning loop. Preserve assessment coverage, boss HP behavior, IDs, rewards, notes and strict indentation validation. That work has not been started.

No Git commit was made.
