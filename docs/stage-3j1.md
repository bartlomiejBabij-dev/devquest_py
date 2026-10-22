# Stage 3J.1 — Function Forge foundation

## World and navigation

World 5, `python-function-forge`, adds an ancient workshop theme using original local React Native shapes: a glowing gold/orange anvil, an enchanted hammer, stone arch and cool blue-purple runes. No assets, libraries, permissions or native configuration were added. The shared World Map gains forge colors/scenery and two chapter nodes; earlier world branches are unchanged.

The existing world selector wraps five tabs with 45% preferred widths, 130-dp minimum widths and 72-dp minimum heights. It remains in the vertical scroll view. Locked Forge links show the requirement and no enterable chapter path. All seven registered Archipelago mission IDs, including The Treasure Guardian, are required. The existing mission route rejects locked entries. No unlock shortcut or fake boss is present.

The Forge's mission exits resolve to its own map through the existing registry-based route helper. Map Back/Exit returns Home. At 2/2 chapters, the world displays **UP TO DATE / AVAILABLE CHAPTERS COMPLETE**, never CLEARED. Earlier four world-clear states remain unchanged. All counts and Profile values derive from registered content.

## Missions and learning content

| Mission | Prerequisite | Three exercises | First/replay XP |
| --- | --- | --- | --- |
| The Silent Anvil | World 5 unlocked | Uncalled `spark` definition produces no output; choose `def`; build `chime` definition/body/call to print `Ding` | 30 / 0 |
| The Rune Engraver | The Silent Anvil | Predict `stamp("Sun")`; choose parameter `rune` so two calls print `Oak`, then `Ash`; build `seal(sign)` and call with `Moon` | 30 / 0 |

Stable mission IDs: `python-forge-silent-anvil-01` and `python-forge-rune-engraver-01`. Six exercise IDs share `python-forge-`, with suffixes `anvil-silence`, `anvil-definition`, `anvil-build`, `rune-output`, `rune-parameter`, `rune-build`.

Four concise lessons appear before dependent challenges:

1. **A spell waiting for your call** — functions group reusable instructions; defining does not execute the body. `ring_bell()` prints `Bell!`; omitting the call prints nothing. Empty parentheses are valid for a no-parameter function.
2. **Shape a reusable spell** — `def`, names, parentheses, colon, indentation and calls after the definition. Calling `light_lamp()` twice prints `Lit` twice.
3. **Send a value into the spell** — a parameter is the name in the definition; an argument supplies its value. `announce("Ruby")` prints `Ruby` through parameter `item`.
4. **One spell, different treasures** — successive calls bind different values to one parameter. `reveal` prints `Pearl`, then `Coin`.

Each mission introduces lessons before questions 1 and 2, then reuses the second lesson for its builder. Completed replays skip automatic introductions. Review Lesson remains available. The new examples differ from their linked assessment programs and outputs.

Two Spellbook entries, **Defining and calling functions** (`python-functions`) and **Parameters and arguments** (`python-function-parameters`), include independent examples, exact output, explanations and common mistakes. The first three exercises link to the first entry; the remaining three link to the second. Existing 26 entries and exercise-linked personal notes are unchanged.

### Code Builder and Python correctness

Both builders have three short fragments: definition header, four-space-indented print body, then an unindented call. Each has one intended order out of all six permutations. Fragment IDs are stable; input validates IDs rather than displayed Python. Unknown, foreign, malformed, missing, repeated, extra and reversed fragments are rejected.

The existing component supplies tap selection, Undo Last, Reset, explicit Cast Spell, wrong-order feedback, no keyboard and controlled drafts that survive help/notes views. Its generic indentation guidance now says a block can be a loop or function; no interaction or validation code changed. New builder lines are at most 17 characters and retain horizontal scrolling.

Semantics were reviewed against exact code/output fixtures and independent finite call/argument tables, without running Python. These checks cover silent definitions, one and multiple calls, colon/parenthesis syntax, function-body indentation, argument values received through parameters and fixed-text versus parameter printing. No new execution mechanism, return teaching, multiple parameters or advanced function syntax was added. `No output` is a choice label explaining the absence of printed text, not a literal output line.

Wrong answers retain the attempt; correct answers show an explanation before Continue. Selecting fragments alone never submits. XP is awarded only on the third validated answer. Duplicate solved-state submissions and completed replays grant zero extra XP. Spell effects and audio use the unchanged mission screen and controller.

## Progression and saved data

| Completion state | XP | Forge progress | Completed missions | Completed exercises | Bosses |
| --- | --- | --- | --- | --- | --- |
| Existing completed World 4 save | 1280 | 0/2, 0%; Anvil unlocked | 26 | 100 | 4 |
| Silent Anvil completed | 1310 | 1/2, 50%; Engraver unlocked | 27 | 103 | 4 |
| Rune Engraver completed | 1340 | 2/2, 100% available; UP TO DATE | 28 | 106 | 4 |

Final registry: **5 worlds, 28 missions/chapters, 106 exercises (86 choice, 18 builder, 2 typed), 55 lessons, 28 Spellbook entries, 1340 maximum XP and 4 bosses**.

The existing version-1 `devquest.progression` completed-ID format remains unchanged. No migration, new save key or reset is needed. In-memory tests restore prior save prefixes and 1280/1310/1340 records, checking unlocks, first-completion rewards, zero replay XP and notes. Profile/nickname/avatar, achievements, level formula, onboarding and audio settings retain their existing code and keys. No genuine player data was accessed or modified for tests.

The pre-change fixture preserves every prior world, chapter, mission, exercise, lesson and reference hash, all reference links, all four boss art components, boss logic, mission/validation/progression/storage/profile/audio/navigation logic and mission screen. Old fixtures are unchanged. The protected-source helper now follows explicit reviewed fingerprint extensions for the map and Code Builder's guidance text, retaining historical snapshots and pinning the current approved changes.

## Exact changed files

Added:

- `src/game/forgeContent.ts` — World 5, two chapters/missions and six exercises.
- `src/components/ForgeScenery.tsx` — original local anvil/workshop artwork.
- `tests/functionForge.test.cjs` — nine focused compatibility, content, validation, lessons, rewards and storage tests.
- `tests/fixtures/function-forge-compatibility.json` — pre-change registry and protected-source fingerprints.
- `tests/fixtures/function-forge-source-extensions.json` — reviewed map and Code Builder guidance extensions.
- `docs/stage-3j1.md` — this report and manual checklist.

Modified production/documentation:

- `src/game/worldContent.ts` — append the fifth world and content to the existing registry.
- `src/game/lessonContent.ts` — four beginner lessons.
- `src/game/spellbookContent.ts` — two references and six exercise links.
- `src/app/world-map.tsx` — forge scenery, colors and copy in the shared map.
- `src/components/CodeBuilder.tsx` — indentation help now includes function bodies.
- `README.md` — current overview, reference count and stage summary/link.

Modified tests:

- `tests/archipelagoMapUI.test.cjs` — five-tab switching plus Forge locked/unlocked/completed rendering, scenery and Home/Back handlers.
- `tests/codeBuilderUI.test.cjs` — include both Forge builders in the real component's control/draft/help/notes tests.
- `tests/protectedSource.cjs` — chain explicit reviewed source extensions without editing old fixtures.
- `tests/archipelago.test.cjs` — updated global registry and new mission/exercise expectations.
- `tests/codeBuilder.test.cjs` — updated global totals and registered missions.
- `tests/decisionKeeper.test.cjs` — current totals, new missions and save-prefix expectations.
- `tests/inventoryUpdates.test.cjs` — current totals and new content expectations.
- `tests/listIteration.test.cjs` — current totals/new content; original iteration lessons/reference checks retain their scope.
- `tests/loopCaverns.test.cjs` — current totals, new missions, save prefixes and latest current-world statistic.
- `tests/loopWarden.test.cjs` — current totals and new registry content; historical boss tests retained.
- `tests/mirrorOfTruth.test.cjs` — current totals, mission IDs and save prefixes.
- `tests/shortAdventures.test.cjs` — current totals, mission IDs and save prefixes.
- `tests/spellbookContent.test.cjs` — two expected titles and all-106 link coverage.
- `tests/treasureGuardian.test.cjs` — current totals/new content and first Forge chapter unlocking on World 4 victory; optional recap checks preserved.
- `tests/valley.test.cjs` — current world count.
- `tests/whileLoops.test.cjs` — current totals and registered mission expectations.

No previous tests were removed or historical content fixtures rewritten. Boss behavior checks remain, including the actual Guardian screen's victory/replay handlers. Only current registry expectations, legitimate newly unlocked chapter expectations and explicitly scoped historical content checks were extended.

## Verification

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npm run lint` | PASS, exit 0 |
| `npm test` | **271 passed, 0 failed, 0 skipped**, exit 0 |
| `npx expo export --platform android --output-dir dist/stage-3j1 --max-workers 2` | PASS, exit 0; Android Hermes bundle (4.1 MB) and metadata exported |
| `git diff --check` | PASS |
| `npx expo-doctor` | 20/21 passed; existing Expo dependency patch-version mismatch check failed, exit 1 |

The suite grew from 259 to 271 cases: nine Forge logic/content cases, two builder component cases and one Forge map component case. Existing four-boss, original Goblin prototype, audio, onboarding, progression, navigation, profile, notes and storage tests all pass. Historical compatibility fixtures remain unchanged.

Doctor installed → expected: Expo 57.0.27 → ~57.0.31; expo-asset 57.0.19 → ~57.0.20; expo-constants 57.0.21 → ~57.0.22; expo-linking 57.0.12 → ~57.0.13; expo-router 57.0.25 → ~57.0.29; expo-splash-screen 57.0.9 → ~57.0.10. This matches the prior stage's finding. No dependencies, lockfile, SDK settings or Doctor exclusions changed.

Ignored final logs: `.expo/stage-3j1-{typescript,lint,tests,export,doctor,diff-check}.log`. Ignored Android output: `dist/stage-3j1`. The full suite includes the final map assertions; the earlier map-only diagnostic log records the corrected host-text whitespace assertion.

### Native limitations

**No native interaction was performed for this stage.** The developer reserves emulator controls. There were no automated taps, resizing, app restarts, force-stops or saved-data modifications. No iOS device testing is claimed.

Host-component tests execute real map rendering/handlers and Code Builder controls with mocked native primitives. They verify wrapping style declarations, content/state, draft retention and navigation targets, but not physical screen layout, gestures, Android Back dispatch, sound, actual animation or process-relaunch persistence. Small-screen code review confirms the inherited vertical scroll, wrapping tabs, short fragments, horizontal code scroll and accessible touch target sizes. Physical confirmation remains pending.

### Short manual checklist

Use a separate test installation or existing isolated progression, preserving genuine saves:

1. Open all five world tabs on a narrow Android screen. Check no overlap, vertical scrolling, previous themes/statuses and Home/Back behavior. Before Guardian completion, Forge should show its unlock requirement with no enterable chapters; locked mission links must be blocked.
2. With a completed 1280-XP World 4 save, enter Forge: Anvil available, Engraver locked. Play both missions; read the two short lessons per mission and try wrong choices. Confirm explanations remain until Continue.
3. In each builder, try a wrong order, Undo Last and Reset. Check four-space indentation, no keyboard, explicit Cast Spell and no damage/progress from editing alone. Review Lesson/Spellbook/notes round trips should retain the draft and current exercise.
4. Confirm no XP before the third success; then +30 XP, totals 1310/1340 and sequential unlocking. Replay for +0 XP with automatic lessons skipped. Check successful spell effects and enabled audio.
5. Exit each mission to Forge. At 2/2 verify UP TO DATE / AVAILABLE CHAPTERS COMPLETE, not CLEARED. Profile should show 1340 XP, 28 missions, 106 exercises and four bosses.
6. On the isolated installation, manually force-stop and relaunch. Verify saved unlocks, completions, XP, notes/profile/audio settings and zero replay rewards. Check larger text, scrolling and visible code indentation.

## Recommended separate Stage 3J.2

Introduce returning one simple value in a short, beginner-first lesson sequence, clearly distinguishing displaying with print from giving a result back to the caller. Then practice storing and using the returned value with already taught syntax. Reuse the existing choice/builder engine and save format; defer multiple parameters and a Forge boss. No Stage 3J.2 work is included here.

No commit or push was made.
