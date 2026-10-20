# Stage 3H.1 — Loop Caverns foundation

## Content and learning flow

Loop Caverns is the third registered world. All six Valley missions, including The Decision Keeper, are required. Its two chapters contain one three-exercise mission each:

| Mission | Questions | Prerequisite | First / replay XP |
| --- | --- | --- | --- |
| The Repeating Road | Predict two Echo lines; choose `for`; distinguish three repeated Pings from the final Ready line | World 3 unlocked | 30 / 0 |
| Lanterns of Range | Predict `range(4)` values; choose stop 5 to print 0–4; predict `range(2, 5)` values | The Repeating Road | 30 / 0 |

All six exercises use existing tap choices and stable option-ID validation. Each has one correct answer, a contextual hint, specific wrong-answer feedback and a success explanation before Continue. Wrong and duplicate submissions cannot advance or award XP. No Python is executed.

Four short lessons introduce repeated instructions, indentation, zero-based range values and start/stop boundaries. Each mission introduces a lesson before question one and another before question three; question two practices the first concept. Examples use different values or messages from the questions. Review preserves the attempt, and completed replays skip automatic introductions.

Two new Spellbook entries cover `for` loops and `range()`. Every new exercise links to its relevant entry and supports existing personal notes.

## UI and architecture

The existing World Map is extended, not duplicated. It identifies Valley explicitly and gives Caverns blue/teal panels, three luminous rune crystals and an echoing path. The world picker wraps into roomy rows on small displays. Existing Forest and Valley content, styles and clear states remain in place.

Locked world map links show an unlock explanation and no chapter path. Mission access continues through the unchanged progression/mission checks. All mission returns use their registered owning world. The map returns to Home through the existing navigation handler.

No Caverns boss is registered. Completing its two chapters shows 100% of available chapters, UP TO DATE and AVAILABLE CHAPTERS COMPLETE. `isWorldCleared` stays false for Caverns. Both prior worlds retain their genuine clear status.

## Persistence and compatibility

Storage keys, versions, formats, profile data, levels, achievements, notes, audio settings and persistence logic are unchanged. A valid 640-XP save automatically unlocks World 3 without adding XP or modifying completed records. First completions reach 670 and 700 XP; replays pay zero.

The pre-change compatibility fixture independently preserves hashes of both worlds, twelve chapters/missions, 54 exercises, 27 lessons, eighteen Spellbook entries and their links. Existing fixtures were not regenerated. Historical tests retain their original content assertions while current-registry counts and save-point arrays are extended.

Registered totals:

- 3 worlds and 14 missions.
- 60 exercises: 58 tap questions and 2 typed answers.
- 31 lessons and 20 Spellbook entries.
- 700 maximum XP.
- 2 existing bosses; no new boss.

Profile statistics derive from registered completed exercises: 54 → 57 → 60 exercises and 12 → 13 → 14 missions, with two defeated bosses throughout the Caverns missions.

## Exact changed files

Created:

- `src/game/cavernContent.ts`: World 3, two chapters/missions and six questions.
- `tests/loopCaverns.test.cjs`: eight focused integration/content tests.
- `tests/fixtures/loop-caverns-compatibility.json`: pre-change hashes and links.
- `docs/stage-3h1.md`: this report.

Modified:

- `src/game/worldContent.ts`: append Caverns to the registries.
- `src/game/lessonContent.ts`: four beginner lessons.
- `src/game/spellbookContent.ts`: two entries and six exercise links.
- `src/navigation/worldRoutes.ts`: accessible-map-chapter selector.
- `src/app/world-map.tsx`: third-world theme, responsive picker and locked-path guard.
- `tests/decisionKeeper.test.cjs`: expanded registry/save totals; Valley stays cleared after Caverns completion.
- `tests/mirrorOfTruth.test.cjs`: expanded registry/save totals.
- `tests/shortAdventures.test.cjs`: expanded registry/save totals.
- `tests/valley.test.cjs`: three-world registry count.
- `tests/spellbookContent.test.cjs`: twenty concepts and sixty exercise links.
- `tests/helpers/preExpansionContent.cjs`: limit historical two-world snapshot projection to its original worlds.
- `README.md`: current summary, reference count and stage notes.

## Verification

The full suite includes new checks for exact old-content preservation, unique IDs, six Valley prerequisites, locked map/mission links, foreign/incorrect options, reviewed range boundaries and output, lesson sequencing/review/replay, three-spell completion, duplicate submissions, one-time XP, all fifteen save points, profile data, note links, navigation destinations and existing audio routing. Prior Goblin King, Decision Keeper, original prototype, persistence, audio, onboarding and navigation tests remain included.

### Automated checks

Finalization reruns on 20 October 2026:

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | Passed (exit 0) |
| `npm run lint` | Passed (exit 0) |
| `npm test` | **173 passed**, 0 failed, 0 skipped; includes eight Loop Caverns tests |
| `npx expo export --platform android --output-dir dist/stage-3h1 --max-workers 2` | Passed (exit 0); Android Hermes bundle, assets and metadata exported |
| `git diff --check` | Passed; Git also reports its existing LF-to-CRLF normalization notice for `worldRoutes.ts` |

The preceding implementation session also passed all 173 tests, TypeScript and ESLint. Its retained Expo Doctor report passed **20/21 checks**: the remaining check reports six Expo patch-version mismatches (`expo`, `expo-asset`, `expo-constants`, `expo-linking`, `expo-router`, `expo-splash-screen`). Dependencies were not changed or upgraded. Doctor was not rerun during finalization.

Reward/replay and compatibility verification is automated: both missions award 30 XP only on the third valid answer, repeated submissions cannot add rewards, and completed replays award zero. Fifteen serialized save points round-trip through the existing storage code, retaining prior XP, completed IDs, profile/audio records and note links. The old-content hash fixture checks every previous exercise and reward. Both existing boss suites remain included.

### Android emulator and manual verification

The developer manually controlled the emulator during the implementation session and explicitly confirmed:

- World 3 appears correctly.
- Both Loop Caverns chapters were completed.
- The map displays **2/2 chapters, 100% available progress and 700 XP**.
- World 3 displays **UP TO DATE**, without a permanent world-clear claim.
- Earlier worlds and their saved progression remain intact.

These are developer-reported manual results, not an automated end-to-end test. Earlier assistant inspection observed the Repeating Road lesson and Lanterns of Range question UI. Testing used an isolated temporary app copy with separate `devquest.stage3h1-test.*` storage keys. Finalization did not send emulator taps, restart the app/server, resize the device, or read/write genuine saved progression.

### Rendering, navigation and limitations

Code review confirms the wrapping world selector, existing safe-area/scrolling containers, scrollable chapter details and compact exercise code. Tests enforce at most 25 characters per new question-code line and verify each mission's return route uses its registered world. Existing map Back handling closes chapter details first, then returns Home. The developer's completion and map results provide emulator evidence for the normal playthrough and map return.

No new 360-dp/large-font visual pass or dedicated hardware-Back sequence was performed. Rapid world switching, device replay rewards and force-stop/relaunch persistence were not separately verified on the emulator in this stage; relevant route, replay and storage behavior is covered by automated tests. No physical-device, iOS or fresh audible-audio verification is claimed. The Android export verifies bundling, not device rendering or listening.

Only this report was edited during finalization; the existing implementation and README updates were retained. No gameplay fixes or dependency changes were needed.

### Commit readiness

Stage 3H.1 is ready to commit with the verification limitations above documented. All requested final automated/build checks passed. The existing Expo Doctor patch-version warning remains a separate dependency-maintenance item. No commit was created.

## Scope

No new dependencies, storage migrations, boss, `while` loops, nested loops, new interaction engine, backend or Stage 3H.2 work. No automatic Git commit.
