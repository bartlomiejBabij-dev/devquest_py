# Stage 3G.2D — Final boss and conditional assessment

## Content and teaching

Only the existing five Goblin King's Lair exercises and five Guardian's Choice exercises changed. Their IDs, ordering, objectives and 100/80 XP rewards are preserved.

| Encounter | Existing exercise suffix | Interaction | Assessment |
| --- | --- | --- | --- |
| Goblin King | output | Output choice | Ordered print output, text and multiplication |
| Goblin King | variable | Output choice | Updated variable value |
| Goblin King | string | Output choice | Concatenation, exact spaces, case and quotes |
| Goblin King | arithmetic | Missing token | Multiplication operator |
| Goblin King | debug | Short typing | Recall `power` to repair an undefined name |
| Guardian | if | Missing token | Conditional keyword |
| Guardian | indent | Code choice | Complete correctly indented three-line snippet |
| Guardian | skip | Output choice | Skip a false block, run the unindented line |
| Guardian | else | Missing token | Alternative branch keyword |
| Guardian | branch | Code choice | Repair a comparison, including the boundary at 3 |

This stage has **nine tap questions and one five-character typing question**. Across all forty existing exercises, 38 use taps and two retain short recall (`print` and `power`). No multiline transcription remains.

Four short teaching cards were added:

- **Your Forest spellcraft:** optional recap of assignments, updates, arithmetic, strings, output and name repair. Accessible before the first boss answer and throughout the encounter through the existing Review Lesson control, visibly labeled Optional Recap. It never automatically interrupts a first attempt or replay.
- **A spell with a condition:** introduces `if`, the colon and four-space indentation before Guardian question 1; also supports question 2.
- **When a spell stays quiet:** introduces false-block skipping and the return to the left edge before question 3.
- **Choose the other path:** introduces `else`, branch selection and equality boundaries before question 4; supports the final repair.

Examples use different values and messages from the challenges. Wrong choices explain specific misconceptions. The Guardian's final `<=` distractor deliberately works for mana 2 but fails at exactly 3; the prompt explicitly requires correctness across the boundary. Incorrect indentation options are described as invalid, while comparison repairs distinguish valid syntax from the wrong behavior.

## Minimal integration

The existing lesson system gained one optional-review flag. The existing answer component gained an opt-in code format for the two complete-snippet choices; their leading spaces are preserved and displayed in monospace. All other questions keep their existing presentation. The shared mission screen only changes the recap button's visible label.

The boss component, HP calculation, mission engine, validators, progression, storage, keyboard handling, navigation and audio were not changed. HP remains derived from the validated spell sequence: **100 → 80 → 60 → 40 → 20 → 0**. Wrong or duplicate answers cannot reduce it. Success still reveals the explanation before Continue. The fifth success completes the mission and awards its existing reward once. Replay awards zero. All six Forest missions remain required to unlock Valley.

## Files changed

Production:

- `src/game/worldContent.ts` — five boss exercise presentations.
- `src/game/valleyContent.ts` — five Guardian exercise presentations.
- `src/game/lessonContent.ts` — one recap and three conditional lessons.
- `src/game/worldTypes.ts` — optional review and code-choice presentation fields.
- `src/game/lessonSession.ts` — optional recaps do not trigger automatic introductions.
- `src/components/AnswerChoices.tsx` — monospace support for complete code choices.
- `src/app/mission/[missionId].tsx` — Optional Recap label, retaining the existing Review Lesson action.

Tests and fixtures:

- `tests/finalAssessment.test.cjs` — eight new focused tests.
- `tests/fixtures/final-assessment-compatibility.json` — pre-edit definitions, hashes and original multiline exercises.
- `tests/educationalContent.test.cjs` — reviewed boss option IDs and current interaction types.
- `tests/worldMission.test.cjs` — current Forest interaction types; full gameplay assertions retained.
- `tests/valley.test.cjs` — reviewed Guardian option IDs; strict multiline tests use the original exercise definitions.
- `tests/learningLoop.test.cjs` — original indentation fixture retains strict code-entry coverage.
- `tests/progression.test.cjs` — CRLF output validation retains its explicit code-entry fixture; raw output is rejected for the converted choice.
- `tests/fixtures/learning-compatibility.json` and `tests/fixtures/strings-debugging-compatibility.json` — only the ten intentionally converted exercise hashes updated.
- `README.md` and this report.

The new pre-edit fixture independently verifies all world/chapter/mission definitions, all 30 unaffected exercises, 17 previous lessons and Spellbook links. Existing save, profile, achievement and note tests retain their assertions. No tests were removed. The original Python-line validator still rejects incorrect indentation, operators, extra statements, imports, tabs and other unsupported input; the game never executes player Python.

## Automated verification

| Check | Result |
| --- | --- |
| TypeScript | Passed |
| ESLint | Passed |
| Complete test suite | **134/134 passed**, including eight new tests |
| Android export | Passed, `dist/stage-3g2d` (ignored) |
| Expo Doctor | **20/21 passed** |
| Git whitespace check | Passed |

Expo Doctor reports the six existing SDK 57 patch-version mismatches: expo .27 → .30; expo-asset .19 → .20; expo-constants .21 → .22; expo-linking .12 → .13; expo-router .25 → .28; expo-splash-screen .9 → .10. No dependencies or configuration were updated.

The suite checks reviewed answers and exact snippets/output, unique stable choices, invalid-ID rejection, whitespace, boundary behavior, lesson sequencing, optional recap, unchanged selection/attempt during review, 20-damage boss steps, wrong/duplicate submissions, fifth-spell defeat, XP once/replay zero, all-six-Forest world gating and legacy saves at all nine completion points.

## Device verification

Testing used a temporary app copy with separate storage keys and an all-completed 450-XP fixture. No production unlock override was added and the developer save was not used for mission completions. That save showed 140 XP before testing.

The Goblin King replay passed on the Android emulator at 1080 × 2400:

- Optional recap opened before answering; its return, a later review and the Spellbook round trip preserved the selected wrong answer and feedback.
- A wrong answer left HP at 100. Correct spells displayed 80, 60, 40, 20 and finally 0 HP, with success explanations and Continue between spells.
- The final `power` input was tested with Gboard visibly open. Input and Cast Spell remained visible; pressing Cast Spell worked and dismissed the keyboard.
- The result displayed Goblin King Defeated, World 1 Cleared, 100% World 1 completion, +0 XP and 450 total XP.

The Guardian replay passed at **1080 × 1800**:

- All three conditional lessons were opened through Review Lesson and closed back to the current question.
- All five tap questions completed without using the keyboard. The full code choices retained visible, readable monospace indentation while scrolling.
- Choosing an unindented block showed its specific error feedback and allowed a correct retry.
- The final `<=` choice explained the boundary mistake and left the Guardian at 4/5 solved. The correct `<` repair completed the encounter.
- The result displayed +0 XP, 450 total XP and the replay-complete message.

The normal 1080 × 2400 viewport was restored and the isolated test server stopped. The original app loaded from the current workspace afterward and still showed **140 XP**, matching its pre-test balance. Its map confirmed **4/6 Forest chapters cleared (67%)**, with Valley still locked. The initial fixture bundle showed a stale recap label; one clean test-server restart refreshed the UI, and the complete replay checks above used the refreshed build.

Physical-phone, iOS, audible audio and first-time beginner verification were not performed. Fresh reward awards and first-time lesson sequencing are covered by automated tests rather than device completion of fresh missions.

No Git commit was made. No subsequent stage was started.
