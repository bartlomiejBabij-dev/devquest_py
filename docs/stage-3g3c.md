# Stage 3G.3C — The Decision Keeper

## Implementation

The sixth Valley chapter unlocks after Mirror of Truth. Its five tap questions review comparison boundaries, first-match branches, `and`/`or`, `not` with indentation, and repairing a combined condition. Stable option IDs use the existing deterministic validator. The final snippet uses `mp` (mana points) and short output to keep indentation readable on narrow screens.

An original stone guardian is drawn with local React Native shapes, a violet halo, gold frame and green rune core. The encounter has an animated HP bar, hit reaction, floating −20 HP and a brief defeat fade. Reduced motion uses static state feedback. No new assets, dependencies or permissions are needed.

HP derives from the validated attempt: 100 → 80 → 60 → 40 → 20 → 0. Wrong answers and duplicate submissions cannot change it. The existing explanation/Continue flow, audio events and completion logic are reused. One optional recap is available on first attempts and replays without changing the attempt or awarding XP. All five exercises link to existing Spellbook entries and support existing notes.

First victory awards 100 XP; replay awards zero. Victory and the map mark World 2 cleared only when its boss and all registered missions are complete. Profile counts both bosses. Goblin King's artwork, animations, five exercises, 100 HP, 20 damage and 100-XP reward are unchanged.

## Compatibility and totals

No storage keys, versions, migrations or persistence formats changed. Existing nicknames, avatars, notes, audio preferences, achievements, level formula and unlock rules are untouched. A completed Stage 3G.3B save retains 540 XP, 49 exercises and one boss, and shows 5/6 Valley chapters (83%). Completing the Keeper brings it to 640 XP, 54 exercises, twelve missions and two bosses.

Registry totals: two worlds, twelve missions, 54 exercises (52 tap questions and two typed answers), 27 lessons, eighteen Spellbook entries and 640 maximum XP. Valley has six chapters, 24 exercises and 340 XP. Counts derive from content.

## Files

Created:

- `src/components/DecisionKeeperEncounter.tsx`: local guardian artwork and animations.
- `tests/decisionKeeper.test.cjs`: nine focused boss, compatibility and integration tests.
- `tests/fixtures/decision-keeper-compatibility.json`: pre-change content hashes and reference links.
- `docs/stage-3g3c.md`: implementation and verification record.

Modified:

- `src/game/valleyContent.ts`: chapter, mission and five questions.
- `src/game/worldTypes.ts`: Keeper encounter discriminator.
- `src/game/lessonContent.ts`: optional recap.
- `src/game/spellbookContent.ts`: five links to existing concepts.
- `src/game/boss.ts`: shared boss identity, Keeper HP and genuine world-clear selector.
- `src/game/profile.ts`: count both completed bosses.
- `src/app/mission/[missionId].tsx`: encounter selection and owning-world victory presentation.
- `src/app/world-map.tsx`: Keeper states and cleared-world labels.
- `tests/finalAssessment.test.cjs`, `tests/mirrorOfTruth.test.cjs`, `tests/shortAdventures.test.cjs`, `tests/spellbookContent.test.cjs`, `tests/valley.test.cjs`: retain existing assertions and update registry totals/denominators.
- `README.md`: current feature summary and this report link.

## Automated verification

The tests cover exact preservation of all 49 earlier exercises, eleven missions, 26 lessons and eighteen references; unique IDs; reviewed Python semantics; foreign and incorrect answer rejection; prerequisite and forged-attempt rejection; every HP step; delayed rewards; duplicate submissions; replay; optional recap; all save points; profile, notes, links, navigation and audio routing. Existing battle, onboarding, audio and persistence tests remain in the full suite.

| Check | Result |
| --- | --- |
| TypeScript | Passed |
| ESLint | Passed |
| Full suite | 165/165 passed, including nine new Keeper tests |
| Android export | Passed: `dist/stage-3g3c` (ignored) |
| Expo Doctor | 20/21; existing SDK 57 patch-version mismatches |
| Git diff --check | Passed |

Doctor recommends patch updates for expo 57.0.27 → .30, expo-asset .19 → .20, expo-constants .21 → .22, expo-linking .12 → .13, expo-router .25 → .28 and expo-splash-screen .9 → .10. These match the preceding stage. No dependency updates were made.

## Android verification

The emulator used a temporary project copy, a fresh Metro cache on port 8084 and separate `devquest.stage3g3c-test.*` storage keys. Ten prerequisite missions were seeded first to test locked entry; then eleven were seeded for the fight. Only missing test storage was seeded, so saved Keeper completion could be tested independently. No real player data or production unlock shortcut was used.

- The locked Keeper deep link displayed Mission locked. Valley displayed six chapters, 24 spells, 510 XP and 4/6 completed chapters.
- After the prerequisite fixture changed, the encounter opened directly at spell 1/5 and 100 HP. The recap remained optional. Opening it and using Android Back restored the same attempt at 100 HP.
- A wrong first answer showed contextual feedback and retained 100 HP. Correct answers visibly produced 80, 60, 40 and 20 HP, with explanations before Continue.
- At 945 × 1800 pixels (360 dp width at 420 dpi), the initial final snippets wrapped. The new final question was shortened; a second screenshot confirmed all four choices fit in two lines with indentation intact. No shared answer UI or old content was changed.
- The unindented final choice showed its syntax feedback and retained 20 HP. The correct fifth choice produced 0 HP, the defeat state and an explanation before the result screen.
- First victory showed THE DECISION KEEPER DEFEATED, WORLD 2 CLEARED, +100 XP, 640 total XP and 100% World 2 completion.
- The complete five-question replay at the same small viewport showed +0 XP, 640 total XP, 100% completion and “Replay complete. XP was already earned.” The saved UI trace from the interrupted session confirms this result.

### Final verification resumed on 20 October 2026

The existing implementation and isolated test save were retained. The fixture's encounter, mission and map source were compared with the working tree; they match apart from line endings. The test fixture still seeds only eleven missions (540 XP) when storage is absent, so a reloaded 640-XP result cannot come from its seed.

TypeScript, ESLint, all 165 tests, Android export and `git diff --check` passed again. The exported Android bundle is `entry-6f6ae26165b6b8c98b479a876fcb39e3.hbc`. Expo Doctor's result above comes from the original implementation session; it was not rerun during finalization.

The old isolated app was still displaying Home with level 7 and 640 XP when verification resumed, but its test server had stopped. After one clean server restart and a genuine force-stop, Expo Go showed “Something went wrong”; its error log reported `java.io.IOException: Failed to download remote update`. A repeat deep-link launch after the server was ready remained on that error. Investigation stopped without clearing app data or changing dependencies. This launch failure prevents a claim that persistence survived a successful fresh relaunch in this run; it does not establish an application logic defect.

| Remaining check | Evidence and limitation |
| --- | --- |
| Keeper replay | Complete emulator replay trace: +0 XP, total 640, explanation/Continue flow and World 2 clear result. |
| Force-stop persistence | Automated save/load and replay tests pass. Fresh emulator relaunch blocked by the Expo Go download error. |
| Valley clear condition | Automated selectors verify 5/6 = 83% and not cleared before Keeper; 6/6 = 100% and cleared afterward. First-victory emulator result showed World 2 cleared. The final completed map screen was not reverified. |
| Profile | Automated statistics verify 640 XP, 54 exercises, twelve missions, two bosses and level 7. Home visibly showed level 7 and 640 XP before force-stop. The Profile screen itself was not verified. |
| Navigation | Earlier locked-entry Return to World Map and recap Android Back checks passed on the emulator. Existing navigation tests and boss owning-world route tests pass. Post-victory map → Home and hardware Back were not reverified. |
| Goblin King | Full automated first-victory and replay flows pass: five spells, 100 → 80 → 60 → 40 → 20 → 0 HP, wrong/duplicate answers cause no damage, +100 first victory and +0 replay. Original Goblin prototype tests also pass. No fresh emulator Goblin run was performed. |

The isolated server and app were stopped, port 8084 forwarding removed and the normal emulator viewport restored. No genuine player data was reset or edited. Physical Android, iOS, audible playback and device reduced-motion behavior were not tested.

## Final status and remaining manual checks

Stage 3G.3C implementation and automated/build verification are complete. No gameplay changes were needed during finalization; only this report was completed. README already describes the stage and needed no further edits. There is no automatic Git commit.

On a working Expo Go connection, finish the device-only checks: relaunch with the completed Keeper save, confirm Valley 6/6 and its completed boss node, inspect Profile totals (640/54/12/2), return through World Map and Home using Android Back, and smoke-test Goblin King. Use the developer's normal progression as-is or a separately isolated fixture; never reset a real save to enable these checks.

## Next stage

Plan World 3 separately: agree its beginner learning objectives, prerequisites, short-mission structure and final assessment before authoring content. Reuse deterministic validation, lessons, progression and compatibility fixtures. This stage adds no World 3 placeholder or route, and makes no Git commit.
