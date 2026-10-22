# Stage 3I.4 — The Treasure Guardian

## Implementation

The Treasure Guardian is the seventh List Archipelago chapter and its first final boss. Stable mission ID: `python-archipelago-treasure-guardian-01`. It unlocks after `python-archipelago-supply-run-01`, with the existing World 4 prerequisites still required. No World 5, additional ordinary mission, new Python concept, dependency, permission or remote asset was added.

### Boss presentation and combat

Original React Native shapes form a stone vault with gold armor, a glowing golden core, turquoise eyes and island crystals. The compact 112-dp scene leaves room for the existing vertically scrolling exercise UI. A gold HP bar reflects the validated attempt; hits shake the vault and float **−20 HP**. On defeat the lid rises, armor fades and the core lifts free. Animations last at most 780 ms, stop on effect cleanup, and become immediate static state changes when reduced motion is requested. Labels and feedback remain readable with audio muted.

The mission screen renders the new encounter in its existing boss branch and uses a turquoise/gold result panel. Successful submissions retain the existing spell animation and sound; the boss-victory sound follows Continue into results. The completed result shows **THE TREASURE GUARDIAN DEFEATED!**, **WORLD 4 CLEARED!**, actual XP awarded, total XP and world completion. These values come from the existing mission and progression selectors.

HP is derived from the consecutive validated exercise IDs: **100 → 80 → 60 → 40 → 20 → 0**. Choice taps submit through the existing choice flow; builders require explicit Cast Spell. Wrong answers, editing, Undo/Reset and duplicate successful submissions do not damage the boss or award XP. Explanations remain until Continue. There is no independent health or reward state, no early victory, and no mission-engine rewrite.

The existing Goblin King, Decision Keeper and Loop Warden content, artwork, health/reward rules and save records are unchanged.

## Five assessment spells

| Spell | Interaction | Reviewed behavior |
| --- | --- | --- |
| The Treasure Index | Output choice | `loot[1]` selects `crown`, the second item of `pearl, crown, gem` |
| The Growing Vault | Output choice | Append `key` to two items; `len(vault)` prints `3` |
| The Smith's Mark | Three-fragment builder | Create `gear`, replace index 0 with `spear`, then print `spear` |
| The Island Expedition | Output choice | Replace cargo index 1 before iteration; print `flint`, then `sail` |
| The Guardian's Final Trial | Four-fragment builder | Create `kit`, append `wick` before iteration, then print `oil`, `rag`, `wick` |

The five exercise IDs use the stable `python-archipelago-guardian-` prefix and suffixes `index`, `vault`, `mark`, `expedition`, `trial`. Each choice has exactly one accepted option ID. Builder IDs are unique; all 6 and 24 possible orders are tested, with exactly one accepted sequence per puzzle. The prompts explicitly require updates before reading. The final print retains four-space indentation. Builder fragments are at most 23 characters and reuse horizontal code scrolling, Undo Last, Reset and explicit submission. There is no keyboard input.

Python semantics were independently reviewed against exact display/output fixtures and bounded JavaScript list-value tables. Indexes, lengths, append order, replacement without growth and direct iteration are covered. **No Python program was executed by the application, validators or tests.** Malformed, missing, duplicate, unknown, foreign and incorrectly ordered fragment IDs and foreign choice IDs are rejected. Forged jumps to later exercises cannot complete the mission.

### Optional recap and references

One new lesson, `python-lesson-archipelago-mastery`, is marked `optionalReview`. It summarizes square brackets/commas, index 0, length, append, replacement, direct iteration, indentation and execution order. Its separate example updates `bag` to `chart, rope, torch` and prints `3` followed by those items. It does not reveal the boss answers.

The recap never opens automatically, including on first play. It is available for all five exercises, both while answering and after success. Review and Spellbook round trips retain the selected answer, incorrect feedback, builder draft, current exercise and HP. Existing note editing remains attached to the exercise ID. These views grant no progression or XP.

No Spellbook entry was added. The questions link respectively to existing list indexing, append, replacement and list-iteration references. All earlier links and notes are preserved.

## World completion, Profile and save compatibility

| State | Total XP | Archipelago | Completed exercises | Missions | Bosses |
| --- | --- | --- | --- | --- | --- |
| Existing completed Stage 3I.3 save | 1180 | 6/7, 86%; not cleared | 95 | 25 | 3 |
| First Guardian completion | 1280 | 7/7, 100%; CLEARED | 100 | 26 | 4 |
| Guardian replay | 1280, +0 earned | 7/7, CLEARED | 100 | 26 | 4 |

The map uses registered boss identity for FINAL BOSS, FACE THE GUARDIAN and GUARDIAN DEFEATED states. Its selected world tab shows CLEARED only after the boss and all seven chapters are complete. Mission exit/return and Android Back handlers resolve to List Archipelago. Earlier world clear states are preserved.

The existing `isWorldCleared` selector and Profile boss counter require no changes: both consume registered boss identity. Current totals derive from the registry: **4 worlds, 26 missions/chapters, 100 exercises (82 choice, 16 builder, 2 typed), 51 lessons, 26 Spellbook entries, 1280 maximum XP and 4 bosses**. The world reward total is 320; earlier individual rewards are unchanged.

The same version-1 `devquest.progression` completed-ID format remains in use. There is no migration, reset or new key. Isolated tests restore 1180/1280 saves and replay with zero extra XP; existing all-prefix tests include the new completion. Profile/nickname/avatar, notes, achievements, onboarding and audio storage logic is unchanged. No genuine player save was read or modified for testing.

## Exact changed files

Added:

- `src/game/archipelagoBossContent.ts` — chapter, mission and five exercises.
- `src/components/TreasureGuardianEncounter.tsx` — original vault artwork, HP/damage/defeat presentation and reduced motion.
- `tests/treasureGuardian.test.cjs` — nine focused content, validation, progression, recap and compatibility cases.
- `tests/treasureGuardianUI.test.cjs` — real mission-screen handler/render tests and encounter animation-contract tests under host mocks.
- `tests/fixtures/treasure-guardian-compatibility.json` — pre-change fingerprints for all 95 exercises, content, references and unchanged runtime/old boss sources.
- `tests/fixtures/treasure-guardian-source-extensions.json` — explicit before/after fingerprints for the three necessarily extended boss integration files.
- `tests/protectedSource.cjs` — verifies historical fingerprints plus the pinned reviewed integration extensions; all other protected files must remain unchanged.
- `docs/stage-3i4.md` — this report and device checklist.

Modified production/documentation files:

- `src/game/archipelagoContent.ts` — append seventh chapter/mission/exercises; world reward total 320.
- `src/game/worldTypes.ts` — add the `treasure-guardian` encounter type.
- `src/game/boss.ts` — registered Guardian identity and 100/20 HP calculation; existing boss branches and clear selector retained.
- `src/game/lessonContent.ts` — one optional recap.
- `src/game/spellbookContent.ts` — five links to existing entries.
- `src/app/mission/[missionId].tsx` — Guardian encounter and result styling.
- `src/app/world-map.tsx` — Guardian glyph, available/completed labels and encounter action.
- `README.md` — current overview, fourth boss count and stage summary.

Modified existing tests:

- `tests/archipelago.test.cjs` — seven-chapter registry, prerequisites and percentages; prior content checks retained.
- `tests/archipelagoMapUI.test.cjs` — seven nodes, locked/available/completed boss and final CLEARED state.
- `tests/codeBuilder.test.cjs` — current registry totals.
- `tests/decisionKeeper.test.cjs` — current totals, save prefixes and fourth-boss count.
- `tests/inventoryUpdates.test.cjs` — current registry/progress expectations and protected-source extension verification.
- `tests/listIteration.test.cjs` — current totals, 6/7 progression and Guardian unlock; prior iteration coverage retained.
- `tests/loopCaverns.test.cjs` — current totals, save prefixes and fourth-boss count.
- `tests/loopWarden.test.cjs` — current totals and protected-source verification; Warden checks retained.
- `tests/mirrorOfTruth.test.cjs` — current totals, mission IDs and save prefixes.
- `tests/shortAdventures.test.cjs` — current totals, mission IDs and save prefixes.
- `tests/spellbookContent.test.cjs` — all-100 exercise-link test label.
- `tests/whileLoops.test.cjs` — current registry totals.

No old fixture was regenerated or edited, and no previous test was deleted. Historical content/reward assertions still run. For `boss.ts`, the map and mission screen, historical source hashes are checked against the recorded before hashes and current code against the reviewed after hashes. This explicitly permits only the required integration changes while retaining protected-source checks. Earlier boss artwork and unchanged gameplay engines retain their original fingerprints. The existing data-driven `tests/codeBuilderUI.test.cjs` automatically includes both new puzzles without edits.

## Verification results

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npm run lint` | PASS, exit 0 |
| `npm test` | **259 passed, 0 failed, 0 skipped**, exit 0 |
| `npx expo export --platform android --output-dir dist/stage-3i4 --max-workers 2` | PASS, exit 0; Android Hermes bundle (4 MB) and metadata exported |
| `git diff --check` | PASS |
| `npx expo-doctor` | 20/21 passed; existing Expo dependency patch-version check failed, exit 1 |

The suite grew from 246 to 259 cases: nine Guardian logic/content tests, two host UI tests and two automatically included builder component cases. Existing audio, navigation, persistence, onboarding, progression, old boss and original Goblin prototype tests all pass. The earlier 95 exercises and all prior lesson/reference content match their captured fingerprints.

Doctor installed → expected: Expo 57.0.27 → ~57.0.31; expo-asset 57.0.19 → ~57.0.20; expo-constants 57.0.21 → ~57.0.22; expo-linking 57.0.12 → ~57.0.13; expo-router 57.0.25 → ~57.0.29; expo-splash-screen 57.0.9 → ~57.0.10. This matches Stage 3I.3's existing finding. No dependency, lockfile or exclusion change was made.

Ignored logs: `.expo/stage-3i4-{typescript,lint,tests,ui,export,doctor,diff-check}.log`. Ignored Android output: `dist/stage-3i4`.

### Native limitations

**No emulator or physical-device testing was performed in this stage.** Emulator controls remain reserved for the developer. No taps, resizing, app restarts, data clearing or genuine save modifications occurred. No iOS device testing is claimed.

Host tests run the real mission screen and its submit/review/replay/return handlers using mocked React/native services and immediate timers. They verify HP, feedback/draft retention, audio event counts, result copy, replay XP and routing. Encounter tests verify health accessibility values, damage/defeat labels, reduced-motion behavior and cancellable bounded animations. They do not prove native layout, actual animation appearance, physical sound, hardware Back delivery or process-restart persistence.

Small-screen code review confirms the compact boss scene, wrapping heading, existing vertical mission scroll, horizontal code scroll and short fragments. Narrow Android rendering and larger text settings remain manual checks.

### Physical-device checklist

Use a separate test installation or existing isolated progression, preserving genuine saves:

1. Before Supply Run completion, confirm Guardian is locked and its deep link is blocked. With the 1180-XP save, verify 6/7 chapters, Guardian available and no World 4 CLEARED state.
2. Enter the boss: verify 100 HP, five spells and no automatic tutorial. Open the optional recap and return without changing HP or the question.
3. Try wrong choices and wrong builder orders. Confirm zero damage and supportive feedback. Check Undo Last/Reset, visible indentation, explicit Cast Spell and no keyboard.
4. With a partial or wrong draft, open recap, Spellbook and notes, then return. Confirm the draft, selected answer, feedback, exercise and HP survive.
5. Solve five spells: verify 80, 60, 40, 20, 0 HP, one spell effect per success, floating −20 HP, and explanation before Continue. Check the lid/core defeat animation and static reduced-motion state. Test with audio muted too.
6. Verify +100 XP only on the fifth valid answer, 1280 total XP, WORLD 4 CLEARED and 100% completion. Replay: HP restarts at 100, recap stays optional and the result grants +0 XP.
7. Return to List Archipelago: verify 7/7, CLEARED and completed Guardian node. Profile should show 1280 XP, 100 exercises, 26 missions and four bosses. Check Home navigation and Android Back.
8. Force-stop/relaunch the isolated test installation. Confirm saved completion, zero replay reward, profile/notes/audio preferences and earlier world progress remain.
9. Check narrow-screen scrolling, long feedback and larger text. Confirm enabled battle music, spell sounds and defeat sound; background/foreground behavior should remain unchanged.

## Recommended separate Stage 3J.1 / World 5

Start with a small World 5 foundation, unlocked by all seven Archipelago chapters including the Guardian. A suitable next topic is beginner Python functions: two short adventures introducing a named reusable action and calling it, with lessons before assessment. Defer parameters, return values and a final boss until separately scoped. Reuse existing choices/builders and preserve save compatibility. No World 5 work is included here.

No commit or push was made.
