# Stage 3I.1 — List Archipelago foundation

## Scope and integration

World 4, **List Archipelago** (`python-list-archipelago`), adds exactly two three-exercise missions. It requires all seven registered Loop Caverns missions, including The Loop Warden. A completed 960-XP save unlocks it automatically. Missing any of those prerequisites prevents access to the world path and both mission deep links. Index Island also requires Treasure Inventory.

The existing shared World Map renders four worlds in its wrapping selector. World 4 has an original turquoise sea banner, sandy islands, a gold-trimmed treasure chest, wooden bridge, parchment map and crystal, all drawn with local React Native components. Chapter panels and the connecting trail use island colors; the title is slightly smaller for the longer world name. Earlier world headings, art and styles retain their existing branches. No remote assets, dependencies or new navigation routes were added.

The existing selector already uses wrapping, a 45% flex basis, 130-dp minimum width and 72-dp minimum height. Four entries use two rows at normal phone widths, with vertical scrolling through GameScreen. Mission exits resolve the owning world, so these missions return to List Archipelago. Existing Home/Back handling remains in place.

Both available chapters can be completed, but this world has no boss. At 2/2 the selector says **UP TO DATE**, and the map says **AVAILABLE CHAPTERS COMPLETE**. No placeholder boss or genuine World 4 clear is registered. All world, exercise and Profile counts continue to derive from content.

## Missions and educational content

| Mission | Prerequisite | Three interactions | Reward |
| --- | --- | --- | --- |
| Treasure Inventory (`python-archipelago-treasure-inventory-01`) | World 4 unlocked | List purpose choice; valid list assignment choice; three-line Code Builder | 30 XP once |
| Index Island (`python-archipelago-index-island-01`) | Treasure Inventory | Index 0/1 output choice; list length output choice; three-line Code Builder | 30 XP once |

All six exercises are touch-based; no keyboard or multiline transcription is required. Each choice has one correct stable option ID and specific supportive feedback. Both builders reuse the existing controlled component, fragment-ID validation, Undo Last, Reset and explicit Cast Spell. Incorrect arrangements remain available to repair. The existing spell and audio feedback follows validated submissions.

### Reviewed examples and answers

- **List purpose:** one ordered collection stores multiple related items under a variable name; assignment does not automatically print it.
- **List syntax:** `gear = ["net", "hat"]` contains two quoted strings in square brackets, separated by a comma. The distractors use variable names or one whole string.
- **Treasure builder:** `loot = ["orb", "key"]`, then `print(loot)`, then `print("Packed")`. Exact output is `['orb', 'key']` followed by `Packed` on the next line. Creating the variable before reading it and announcing completion afterward give exactly one intended order.
- **Index output:** `kit = ["shell", "flag", "bell"]`; printing indexes 0 and 1 gives `shell` then `flag`. Text printed as a selected item has no quotes/brackets.
- **Length output:** `len(["orb", "key", "cap"])` is 3. Valid indexes are 0, 1, 2; length is not the last index.
- **Index builder:** create `loot = ["ring", "map"]`, assign `item = loot[1]`, then `print(item)`. Output is `map`. Each line depends on the preceding assignment, giving exactly one intended order.

Builder fragments are at most 22 characters, with no additional indentation required at top level. Existing monospace rendering and horizontal code scrolling are retained. Native narrow-screen readability still requires the manual check below.

Four lessons teach each new concept before assessment:

1. **One chest, many treasures** (`python-lesson-list-create`): lists, ordering, brackets, commas, quoted items and assignment; precedes questions 1 and 2 of Treasure Inventory.
2. **Pack, then show the chest** (`python-lesson-list-display`): displaying a whole list, item quotes and top-to-bottom execution; precedes its builder.
3. **The first island is zero** (`python-lesson-list-index`): zero-based positions and printing selected strings; precedes Index Island question 1.
4. **Count items, then choose one** (`python-lesson-list-length`): `len()`, valid index boundaries and storing a selected item in a variable; precedes questions 2 and 3.

Lesson examples use different items and outputs from the challenges. Completed replays skip automatic introductions. Review Lesson, Spellbook and notes continue to use the existing parent-held answer/draft state and never grant XP.

Two new Spellbook entries, **Python lists** (`python-lists`) and **List indexing and length** (`python-list-indexing`), cover all six new exercise links. The existing string-length entry remains unchanged. Invalid index examples are explained as text only; no Python, including authored examples and assembled programs, was executed. Automated accuracy checks compare independently reviewed code/output fixtures, finite index tables and deterministic answer IDs.

## Progression and compatibility

- Each mission awards 30 XP only on its third valid answer. Earlier answers, lessons, viewing the map, wrong answers and duplicate submissions award nothing. Replays award zero.
- The old 960-XP completion record stays at 960 until a new mission is completed. New totals are 990 and 1020 XP.
- Profile ends at 83 completed exercises, 21 missions, 3 bosses, and level 11 with 20/100 level XP under the unchanged formula.
- All three previous worlds, 19 old missions/rewards, 77 exercises, 38 lessons and 21 Spellbook entries are fingerprinted against the clean Stage 3H.4 baseline. Old notes links are preserved.
- The compatibility fixture also pins all three boss components, boss selectors, mission engine, Code Builder, validators, route helpers, profile, audio controller and progression storage source. Those files are unchanged.
- Persistence still uses the existing version-1 completed-mission-ID record and storage keys. Isolated tests restore every prior mission-prefix save, then round-trip 960/990/1020-XP records using fresh storage instances. Profile, audio and onboarding keys remain intact; all 83 exercise-note links round-trip.
- No real player data was accessed or edited. No migrations, resets or developer unlock controls were introduced.

### Registry totals

| Registry | Total |
| --- | ---: |
| Worlds | 4 |
| Chapters / missions | 21 / 21 |
| Exercises | 83 |
| Choices / Code Builders / short typed answers | 71 / 10 / 2 |
| Lessons | 42 |
| Spellbook entries | 23 |
| Maximum XP | 1020 |
| Final bosses | 3 |

## Exact changed files

Added:

- `src/game/archipelagoContent.ts` — World 4, two chapters/missions and six exercises.
- `src/components/ArchipelagoScenery.tsx` — original decorative island artwork.
- `tests/archipelago.test.cjs` — ten content, lesson, validator, progression, routing and compatibility tests.
- `tests/archipelagoMapUI.test.cjs` — two host-component tests of the real map rendering, switching, lock states, Home/Back handlers and available completion labels.
- `tests/fixtures/archipelago-compatibility.json` — fingerprints captured before implementation.
- `docs/stage-3i1.md` — this report and manual checklist.

Modified:

- `src/game/worldContent.ts` — append/re-export the fourth world and its content.
- `src/game/lessonContent.ts` — four lessons.
- `src/game/spellbookContent.ts` — two references and six exercise links.
- `src/app/world-map.tsx` — World 4 visual branches; shared navigation and selector preserved.
- `tests/codeBuilderUI.test.cjs` — extend the existing real Code Builder control/remount checks to the two new puzzles.
- `tests/codeBuilder.test.cjs` — extend current registry expectations without changing previous builder checks.
- `tests/decisionKeeper.test.cjs` — extend current registry/save expectations.
- `tests/loopCaverns.test.cjs` — extend registry/save/Profile expectations for World 4.
- `tests/loopWarden.test.cjs` — extend registry expectations and verify Warden victory now unlocks Treasure Inventory; old HP/reward tests retained.
- `tests/mirrorOfTruth.test.cjs` — extend current registry/save expectations.
- `tests/shortAdventures.test.cjs` — extend current registry/save expectations.
- `tests/spellbookContent.test.cjs` — extend exact expected entry titles and all-exercise label.
- `tests/valley.test.cjs` — current world count becomes four; historical Valley assertions retained.
- `tests/whileLoops.test.cjs` — extend current registry expectations.
- `README.md` — current overview and Stage 3I.1 summary/link.

No tests were removed. Old content fixtures and historical reward assertions were retained; expectations that describe the current registry were extended for the new content.

## Verification

- `npx tsc --noEmit`: passed.
- `npm run lint`: passed.
- `npm test`: **223 passing, 0 failing, 0 skipped** — 209 prior cases plus 10 Archipelago cases, 2 map host-component cases and 2 Code Builder host-component cases.
- `npx expo export --platform android --output-dir dist/stage-3i1 --max-workers 2`: passed, exit 0; Android Hermes bundle and metadata exported successfully after the final map changes.
- `git diff --check`: passed.
- `npx expo-doctor`: **20/21 passed**. The remaining check flags the same six existing Expo dependency patch mismatches. No dependency upgrades or ignore rules were added.

Doctor installed → expected: Expo 57.0.27 → ~57.0.31; expo-asset 57.0.19 → ~57.0.20; expo-constants 57.0.21 → ~57.0.22; expo-linking 57.0.12 → ~57.0.13; expo-router 57.0.25 → ~57.0.29; expo-splash-screen 57.0.9 → ~57.0.10.

Ignored verification logs are `.expo/stage-3i1-{typescript,lint,tests,export,doctor}.log`; the Android export target is `dist/stage-3i1`.

### Native limitations and manual Android checklist

No emulator taps, resizing, app-data clearing, force-stop or relaunch were performed. Emulator controls remain reserved for the developer. No physical Android or iOS testing is claimed. Host-component tests exercise actual rendered component trees and callbacks with mocked native hooks; they do not prove native layout, hardware Back dispatch, touch gestures, animation or audible playback.

Use a separate test installation/device or an already isolated test profile; never replace genuine saved progression.

1. Before Warden completion, select List Archipelago and confirm its seven-chapter unlock requirement, no enterable path and rejected mission deep links. After Warden, confirm World 4 opens with Treasure Inventory available and Index Island locked.
2. Switch repeatedly among all four worlds on a small Android screen. Check both selector rows, title wrapping, island artwork, chapter descriptions, scrolling and Home/Back navigation. Earlier worlds should retain their appearance and clear states.
3. Complete Treasure Inventory: read both lessons, try a wrong choice, build in the wrong order, Undo/Reset, then cast correctly. Check list punctuation/output and explanations before Continue. Confirm +30 XP, total 990, and Index Island unlock.
4. Complete Index Island: inspect zero-based and length lessons, try an off-by-one answer, then assemble the three-line lookup. Confirm +30 XP, total 1020, 2/2 available chapters and UP TO DATE / AVAILABLE CHAPTERS COMPLETE, without a World 4 clear or boss.
5. In each builder, leave a partial draft, open Review Lesson, Spellbook and notes, then return. Check the draft/feedback survives, no keyboard appears, and all controls remain reachable with larger text. Confirm only Cast Spell submits.
6. Replay both missions: automatic introductions skipped, rewards +0, total still 1020. Try rapid taps; they must not skip explanations or grant extra XP.
7. Return from each mission to List Archipelago. Check Profile (1020 XP, 83 exercises, 21 missions, 3 bosses), unchanged nickname/avatar/achievements and old notes. On the isolated installation, manually force-stop/relaunch and confirm progression and zero replay XP remain saved.
8. With audio enabled, check forest theme on maps, battle theme in missions, and correct/incorrect/victory effects; verify muted play remains understandable. Native listening and lifecycle behavior were not retested in this stage.

## Recommended separate Stage 3I.2

Extend lists with two short missions teaching changing an existing item and adding one item with `append()`, with explicit lessons about how list length and valid indexes change. Keep the existing interaction formats and save schema. Those concepts, additional missions and a World 4 boss are not implemented here.

No Git commit or push was made.
