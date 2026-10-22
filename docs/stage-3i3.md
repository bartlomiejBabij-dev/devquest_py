# Stage 3I.3 — Island Expedition & List Iteration

## Implementation

Two regular, three-spell adventures extend the existing List Archipelago registry. There is no new engine, UI, dependency, save format, boss or placeholder.

| Mission | Prerequisite | Three interactions | First / replay XP |
| --- | --- | --- | --- |
| Island Expedition | The Smith's Exchange | Predict `shell` then `bell`; choose current variable `piece`; assemble create-list → for → indented print | 40 / 0 |
| The Supply Run | Island Expedition | Predict append-before-loop output `ink` then `wax`; assemble create → append → for → print; predict replacement-before-loop output `bow` then `cup` | 40 / 0 |

Stable new mission IDs are `python-archipelago-island-expedition-01` and `python-archipelago-supply-run-01`. Chapter prerequisites use the existing progression selectors. World 4 still requires all seven Loop Caverns chapters, including The Loop Warden. Locked mission links and fabricated submissions are rejected by the unchanged mission engine.

### Teaching and reference material

Four short lessons introduce concepts before their first assessment:

1. **Visit every discovery** — list values in order, one body execution per item; three example items produce three printed lines.
2. **A name for this turn** — the loop variable holds the current value, not an index, the whole list or a quoted literal.
3. **Pack first, inspect next** — append changes the existing list before inspection starts.
4. **Inspect the upgraded equipment** — indexed replacement changes one position, preserves length and is visible to the subsequent loop.

Expedition introduces lessons before questions 1 and 2; Supply Run before questions 1 and 3. Completed replays skip automatic introductions. Review Lesson remains available. Lesson examples use different values from their corresponding questions.

The new **Iterating through lists** Spellbook entry (`python-list-iteration`) explains direct iteration, current values, indentation, exact output and common misconceptions. All six new exercises link to it. Existing append/replacement entries, IDs and exercise notes remain available unchanged.

### Code Builder and validation

The two puzzles contain three and four single-line fragments respectively. List creation comes first; Supply Run explicitly requires append before the loop. The print fragment retains four leading spaces. Each puzzle has exactly one accepted stable-ID arrangement; all 6 and 24 permutations are checked. Fragment lines are at most 22 characters (actual new maximum: 20), with existing horizontal code scrolling and 56-dp fragment touch targets.

Existing Undo Last, Reset, explicit Cast Spell, wrong-order draft retention and help/notes round trips are reused. Choice taps use option IDs. Missing, duplicate, unknown, foreign and reversed fragment sequences, display-text answers and malformed data are rejected. Wrong answers leave the attempt unchanged; successful answers show explanations before Continue. Final XP is granted only after the third valid answer, and solved-state duplicate submissions are ignored.

Python examples were reviewed against explicit output fixtures and independent finite JavaScript value tables. No authored or player Python was executed. Tests distinguish item values from indexes, first-to-last order, append at the end before iteration, and indexed replacement without adding a position. No mutation during iteration or advanced list concepts were introduced.

## Progression and compatibility

The pre-change compatibility fixture protects all 89 earlier exercises, 23 missions/rewards, 46 lessons, 25 references, existing reference links and three earlier worlds. It also fingerprints the unchanged mission, validation, Code Builder, lesson-session, progression/storage, profile, notes, navigation, audio-controller and boss source files. Existing historical fixtures remain unchanged.

Version-1 `devquest.progression` records still store completed mission IDs. No migration, reset, new persistence key or player-data modification was performed. Isolated in-memory tests round-trip all prior save prefixes and the following states:

| State | XP | Archipelago progress | Completed exercises | Completed missions | Bosses |
| --- | --- | --- | --- | --- | --- |
| Existing complete Stage 3I.2 save | 1100 | 4/6, 67% | 89 | 23 | 3 |
| Expedition completed | 1140 | 5/6, 83% | 92 | 24 | 3 |
| Supply Run completed | 1180 | 6/6, 100% available | 95 | 25 | 3 |

Replay grants zero additional XP. Lessons, review and map viewing grant none. All three earlier worlds remain cleared; List Archipelago remains **UP TO DATE / AVAILABLE CHAPTERS COMPLETE**, never permanently CLEARED. All counts derive from the content registry.

Final registry: **4 worlds, 25 missions/chapters, 95 exercises (79 choices, 14 builders, 2 typed), 50 lessons, 26 Spellbook entries, 1180 maximum XP and 3 bosses**. Archipelago's authored reward total is 220; individual earlier rewards are unchanged.

## Exact changed files

Added:

- `src/game/archipelagoIterationContent.ts` — two chapters/missions and six exercises.
- `tests/listIteration.test.cjs` — ten focused compatibility, content, validation, lesson, reward and storage cases.
- `tests/fixtures/list-iteration-compatibility.json` — pre-change content/source fingerprints.
- `docs/stage-3i3.md` — this report and manual checklist.

Modified:

- `src/game/archipelagoContent.ts` — append the new registrations and update the world reward total.
- `src/game/lessonContent.ts` — four lessons.
- `src/game/spellbookContent.ts` — one reference and six links.
- `tests/archipelago.test.cjs` — current totals, sequential prerequisites and six-chapter percentages; earlier foundation coverage retained.
- `tests/archipelagoMapUI.test.cjs` — all six nodes, 4/6 → 5/6 → 6/6 rendering and UP TO DATE only at full available completion.
- `tests/codeBuilder.test.cjs` — current registry totals.
- `tests/decisionKeeper.test.cjs` — current totals and save-prefix expectations.
- `tests/inventoryUpdates.test.cjs` — current registry/map/unlock expectations, preserving prior exercise and reward checks.
- `tests/loopCaverns.test.cjs` — current totals and save-prefix expectations.
- `tests/loopWarden.test.cjs` — current registry totals; boss checks retained.
- `tests/mirrorOfTruth.test.cjs` — current totals, mission IDs and save-prefix expectations.
- `tests/shortAdventures.test.cjs` — current totals, mission IDs and save-prefix expectations.
- `tests/spellbookContent.test.cjs` — additional reference and all-95 exercise-link label.
- `tests/whileLoops.test.cjs` — current registry totals.
- `README.md` — current overview/reference count and stage summary/link.

No previous test was removed. `tests/codeBuilderUI.test.cjs` is unchanged: its registered-content cases automatically test both new puzzles using the real component with mocked native primitives.

## Verification

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npm run lint` | PASS, exit 0 |
| `npm test` | **246 passed, 0 failed, 0 skipped**; 234 existing cases plus ten new logic/content cases and two automatically included builder component cases |
| `npx expo export --platform android --output-dir dist/stage-3i3 --max-workers 2` | PASS, exit 0; Android Hermes bundle (4 MB) and metadata exported |
| `git diff --check` | PASS |
| `npx expo-doctor` | 20/21 passed; existing Expo dependency patch-version mismatch check failed, exit 1 |

Doctor installed → expected: Expo 57.0.27 → ~57.0.31; expo-asset 57.0.19 → ~57.0.20; expo-constants 57.0.21 → ~57.0.22; expo-linking 57.0.12 → ~57.0.13; expo-router 57.0.25 → ~57.0.29; expo-splash-screen 57.0.9 → ~57.0.10. This matches the prior stage's reported mismatch. No packages, lockfile, exclusions or SDK configuration were changed.

The suite includes existing three-boss HP/reward/replay checks, original Goblin prototype, audio lifecycle/preferences, progression hydration/write ordering, navigation and note/profile compatibility. The real map component is exercised with host mocks across all six chapter states and four world tabs; the two new builder component cases cover explicit submission, incorrect-order recovery, Undo/Reset, indentation, no text input and retained controlled drafts during help/notes review.

Ignored logs: `.expo/stage-3i3-{typescript,lint,tests,export,doctor}.log`. Ignored Android output: `dist/stage-3i3`.

### Native limitations and manual Android checklist

**No emulator or physical-device interaction was performed for this stage.** Controls remain reserved for the developer. There were no automated taps, app restarts, viewport changes or modifications to genuine player data. Host-component tests verify rendered values and handlers with mocked native hooks; they do not establish native layout, actual Android Back dispatch, audio, animations or persistence through a real process restart. No iOS device testing is claimed.

Small-screen review: both builders reuse horizontal code scrolling, preserved indentation, 48-dp Undo/Reset targets, 56-dp fragment targets, and the mission's vertical scroll view. New code is deliberately short. Actual narrow-screen readability remains to be manually confirmed.

Use a separate test installation or existing isolated test progression, preserving genuine saves:

1. From Home, visit World 4 and switch among all four worlds. At 1100 XP, verify 4/6 chapters, Expedition available and Supply Run locked. Before Smith completion, Expedition's deep link must be blocked.
2. Play Expedition, then Supply Run. Read two short lessons per mission, try a wrong choice, and check feedback. Correct answers should cast a spell and retain the explanation until Continue.
3. For both builders, enter the wrong order, use Undo Last/Reset and retry. Choosing fragments must not auto-submit; Cast Spell must be explicit. Check preserved indentation and reachable controls on a small screen. No keyboard should open.
4. With a partial/wrong draft, visit Review Lesson, Spellbook and notes, then return. Confirm the question and draft survive. Check lesson and feedback scrolling with larger text.
5. Confirm zero reward before question three, then +40 XP and totals 1140/1180. Replay both for +0 XP, with automatic introductions skipped. Rapid taps must not duplicate rewards.
6. Exit missions to List Archipelago, then Home; verify Android Back. Confirm 5/6 then 6/6 UP TO DATE, not CLEARED. Profile should show 1180 XP, 95 exercises, 25 missions and three bosses after full completion.
7. On the isolated installation, force-stop and relaunch manually. Verify completion, XP, notes, profile and audio preferences survive. Listen for enabled music/spell effects and check spell animations. Audio must remain optional.

## Recommended separate Stage 3I.4

Add one World 4 final-boss assessment using only already taught lists, indexing, length, append, replacement and direct iteration. Reuse the existing boss, validation, rewards and replay systems; introduce no new list methods or syntax in the assessment. World 4 should become permanently cleared only through that real boss completion. Boss design/content/reward belong to the separate stage and are not implemented here.

No Git commit or push was made.
