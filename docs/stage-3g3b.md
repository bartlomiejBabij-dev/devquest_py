# Stage 3G.3B - Mirror of Truth

## Content and gameplay

Mirror of Truth is the fifth available Valley chapter, unlocked after The Twin Runes. Stable mission ID: `python-valley-mirror-of-truth-01`. It has exactly three tap exercises and awards 30 XP on first completion, zero on replay.

| Exercise | Interaction | Teaching point | Correct choice |
| --- | --- | --- | --- |
| python-valley-mirror-reversal | Output choice | Reverse a stored True Boolean | False |
| python-valley-mirror-keyword | Missing token | Check for a missing shield | not |
| python-valley-mirror-passage | Output choice | Reveal a passage when its seal is absent | Mirror cleared! |

All options use stable IDs and misconception-specific feedback. Validation never executes player Python. Success uses the existing spell effects and audio, followed by an explanation and Continue. Wrong or repeated answers cannot advance, damage the encounter or duplicate rewards.

Two lessons are added through the existing LessonCard: **Reverse the reflection** before question one, and **Notice what is missing** before question two. The third question reuses the second lesson without another mandatory introduction. Examples use different variables/values from the exercises. Review Lesson remains available and completed replays skip automatic introductions.

The new **not: reverse a Boolean** Spellbook entry teaches both reversals, a missing-lantern example, its output, why it works and the misconception that not changes the stored variable. All three new exercises link to it; existing links and notes remain intact.

## Registry, progression and compatibility

- Two worlds, eleven missions, 49 exercises: 47 tap questions and two short typed answers.
- 26 lessons and 18 Spellbook references.
- Maximum available XP: 540; Valley contributes 240.
- The map automatically renders five Valley chapters, their topics, prerequisites, states and spell counts. It retains UP TO DATE / AVAILABLE CHAPTERS COMPLETE labels without a placeholder boss or permanent world-clear claim.
- A fully completed Stage 3G.3A save still has 510 XP and 46 completed exercises, with Valley now 4/5 (80%). Mirror completion brings those values to 540 XP, 49 exercises and 5/5 (100% of available content).
- Storage keys, version-1 progression format, mission/exercise IDs, previous rewards, profile data, Forest achievements, notes and audio preferences are unchanged. No migration or reset.
- Goblin King remains five spells, 100 HP, 20 damage per correct answer and 100 XP once.
- No mission engine, UI component, route, navigation, audio, persistence, dependency or app configuration change was needed.

## Exact changed files

Production:

- `src/game/valleyContent.ts`: append chapter, mission and three exercises; update Valley chapter IDs and total available XP.
- `src/game/lessonContent.ts`: append two beginner lessons.
- `src/game/spellbookContent.ts`: append one reference and three exercise links.

Tests:

- `tests/mirrorOfTruth.test.cjs`: ten focused regression tests.
- `tests/fixtures/mirror-compatibility.json`: pre-edit hashes of all ten missions, 46 exercises, 24 lessons, 17 references, chapters and old links.
- `tests/shortAdventures.test.cjs`: retain all previous scenarios; extend exact registry/save totals and update Valley percentages.
- `tests/valley.test.cjs`: updated total available Valley XP and denominator; original mission rewards still tested.
- `tests/finalAssessment.test.cjs`: updated Guardian completion percentage for a five-chapter Valley; boss assertions unchanged.
- `tests/spellbookContent.test.cjs`: eighteen entries and all 49 exercise associations.

Documentation:

- `README.md`
- `docs/stage-3g3b.md`

Compatibility assertions verify every previous content record and its order against pre-edit hashes. No old fixture hashes or gameplay checks were removed. Save tests cover all twelve completion points, including zero through eleven missions; notes round-trip for every exercise.

## Automated verification

| Check | Result |
| --- | --- |
| TypeScript | Passed |
| ESLint | Passed |
| Full automated test suite | 156/156 passed, including ten new Mirror tests |
| Android bundle export | Passed: dist/stage-3g3b (ignored) |
| Expo Doctor | 20/21 passed; existing SDK57 patch-version mismatches |
| Git diff --check | Passed |

Expo Doctor lists expo 57.0.27 versus ~57.0.30, expo-asset .19 versus .20, expo-constants .21 versus .22, expo-linking .12 versus .13, expo-router .25 versus .28, and expo-splash-screen .9 versus .10. These match the preceding stage; no dependency changes were made.

Existing battle, boss, audio, navigation, onboarding, profile, note and progression tests pass. The new tests check exact old-content preservation, reviewed answer semantics, stable-ID validation, introductions/review/replay, locked entry, partial completion, duplicate submissions, rewards, all save points, actual profile/world counts and note/reference associations.

## Android verification

Testing used a temporary project copy with separately namespaced storage keys and only the original ten missions seeded complete (510 XP). No genuine save was edited. No developer unlock feature or fixture was added to production. The fixture used its own entry point and a fresh server on port 8083 with a clean Metro cache.

The fresh build loaded successfully after bundling; the previous stage's splash/cache issue did not block the mission checks:

- Valley showed five chapters and nineteen spells, with 510 XP, 4/5 chapters and 80% progress.
- Mirror appeared after The Twin Runes, available with its topic, 30 XP reward and three-spell count.
- The first lesson appeared at 0/3; the second appeared before question two. Question three did not force another lesson.
- Choosing True for the first question showed specific wrong-answer feedback and retained 0/3. The correct False choice produced success feedback and an explanation.
- All three questions completed through the existing explanation/Continue flow, showing 3/3, +30 XP and 540 total XP.
- At 1080 x 1800, the final question's full code and all answer cards were readable after scrolling. The complete replay was also tested at that height.
- Replay skipped automatic introductions, completed all three questions and showed +0 XP, 540 total XP and the already-earned message.
- Return to World Map opened Valley and showed Mirror completed with the AVAILABLE CHAPTERS COMPLETE footer.
- The normal 1080 x 2400 viewport was restored afterward.
- After a genuine force-stop, the first deep-link launch returned to the Android launcher; one repeat opened the app successfully. The reloaded Valley map retained 540 XP, 5/5 completed chapters, 100% and UP TO DATE. The fixture only seeds ten missions when storage is empty, so Mirror completion came from the saved record.
- Android hardware Back returned to Home. Profile displayed 49 completed exercises, eleven missions, one boss, level six and 540 XP.

Locked deep links and unchanged non-Mirror systems are covered by automated tests; a separate locked-state emulator fixture was not used. The isolated app and test server were stopped and port forwarding was removed after testing. Physical Android, iOS and audible audio playback were not tested. Audio code and assets were unchanged.

## Recommended separate Valley final-boss stage

Design one final assessment after Mirror of Truth covering comparisons, if/elif/else, and/or/not with concise beginner feedback. Agree its authored exercise count, encounter balance and reward before implementation; use existing validation/progression, award XP once and distinguish a genuine final world clear from completion of currently available chapters. Include locked-entry, replay, save compatibility and physical-device checks. No boss work was started here and no Git commit was made.
