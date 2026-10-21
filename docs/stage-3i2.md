# Stage 3I.2 — Growing Chests & Inventory Updates

## Implementation

List Archipelago now has four sequential chapters:

1. Treasure Inventory — unchanged, 30 XP.
2. Index Island — unchanged, 30 XP.
3. **The Growing Chest** (`python-archipelago-growing-chest-01`) — requires Index Island, three exercises, 40 XP once.
4. **The Smith's Exchange** (`python-archipelago-smiths-exchange-01`) — requires The Growing Chest, three exercises, 40 XP once.

The two missions reuse the existing choice and Code Builder interactions, lesson sessions, spell feedback, audio, mission submission and persistence flows. Production edits are limited to authored content and its registration. No UI, navigation, engine, validator, boss or dependency changes were needed.

The shared map derives chapter names, objectives, rewards and spell counts from the registry. Locked mission deep links remain rejected. Mission returns still target List Archipelago, and all four world-selector entries work through the existing route. Finishing all four chapters displays **UP TO DATE / AVAILABLE CHAPTERS COMPLETE**. World 4 has no final boss or genuine clear status.

## Educational content and accuracy

| Exercise ID suffix (prefix `python-archipelago-`) | Interaction | Reviewed behavior |
| --- | --- | --- |
| `append-output` | Output choice | Start with orb, append shell, read index 1: output `shell`. orb remains first. |
| `append-keyword` | Missing-token choice | `bag.append("pin")` adds to key/cap; `len(bag)` becomes 3. |
| `append-build` | Three-fragment Code Builder | Create bell/hat list, append map, then print its length: output `3`. |
| `replace-output` | Output choice | Replace index 1 of bow/cap with helm; output `helm`. Two items remain. |
| `replace-choice` | Code choice | `bag[0] = "pearl"` replaces gem in gem/net; length stays 2. `append` would add a third item; index 1 would replace the wrong item. |
| `replace-build` | Three-fragment Code Builder | Create axe/orb list, replace index 0 with staff, then print it: output `staff`. Length stays 2. |

All six questions are touch-based. Each choice has one correct stable ID and supportive feedback for its distractors. The builders have exactly one intended order: creation must precede mutation, and output must follow mutation. Printing earlier would show the old count or old item. Fragments are at most 22 characters and use top-level Python statements, so no indentation is required. The existing monospace view and horizontal/vertical scrolling remain available.

Code Builder retains stable fragment IDs, Undo Last, Reset, explicit Cast Spell, wrong-order draft retention, and parent-held state across Review Lesson, Spellbook and notes. Existing host-component tests automatically exercise both newly registered builders, including no text input, no submission on selection, control remounts, wrong-order recovery and explicit casting.

Four lessons introduce the concepts before their first assessment:

- **Make room for new treasure** (`python-lesson-list-append`): a list can change; `append(value)` adds one element at the end of the existing list. Example output: `gem`.
- **Add one, count again** (`python-lesson-append-length`): length increases by one; count after updating. Example output: `2`.
- **Upgrade an existing treasure** (`python-lesson-list-replace`): replace a value at an existing zero-based index. Example output: `mug`.
- **Same chest, new contents** (`python-lesson-replace-length`): replacement preserves length; appending increases it. Example output: `2`.

Each mission shows a lesson before question 1 and a second before question 2; question 3 reuses that second lesson. Examples differ from challenge values and answers. Completed replays skip automatic introductions, and Review Lesson remains available without resetting the challenge.

New Spellbook entries:

- `python-list-append` — **append(): add an item**, with a coin/ring example outputting `ring` then `2`.
- `python-list-replacement` — **Indexed assignment: replace an item**, with a cloak/boots upgrade outputting `cape` then `2`.

All six new exercises link to these entries. Earlier references and note associations are unchanged. Lessons and references explicitly explain that `append()` modifies the original list and does **not** return a new list; assigning its result back to the list variable is presented only as a mistake.

No authored or player Python was executed. Accuracy checks use reviewed code/output fixtures and fixed before/after item tables. The tables verify unchanged earlier positions after append, one extra item at the end, unchanged length after replacement, and unchanged other positions. Deterministic validation accepts only the expected option IDs or fragment sequence, rejecting labels, malformed JSON, duplicate/missing/extra/unknown/foreign fragments and wrong orders.

## XP, Profile and save compatibility

- No XP is awarded before the third validated answer. Correct answers enter solved feedback and require Continue. Incorrect answers leave progress unchanged; duplicate submissions cannot advance or grant another reward.
- Each new mission grants 40 XP once. Replay grants zero.
- A completed Stage 3I.1 save retains 1020 XP and all 21 completed missions/83 exercises, with **2/4 Archipelago chapters (50%)**.
- The Growing Chest brings 1060 XP, 22 missions, 86 exercises and 3/4 chapters (75%).
- The Smith's Exchange brings 1100 XP, 23 missions, 89 exercises and 4/4 chapters (100% available progress).
- The number of defeated bosses stays three. All earlier worlds stay cleared; achievements, nicknames, avatars and the level formula are unchanged. At maximum XP the existing formula gives level 12.
- Existing storage keys and the version-1 completed-mission-ID schema are unchanged. Tests restore every prior save prefix and round-trip isolated 1020/1060/1100-XP records with fresh stores; replay still grants zero. Profile, audio and onboarding keys stay intact, and notes round-trip across all 89 exercise IDs.
- A compatibility fixture captured before editing verifies all 83 previous exercises, 21 missions/rewards, 42 lessons, 23 Spellbook entries and old links. World 4 differs only by the appended chapter IDs and its authored XP total, now 140. The other three worlds are unchanged.
- Source fingerprints verify unchanged boss code/components, Code Builder, validation, mission engine/screen, map, route helpers, profile, audio controller and progression storage.

No actual saved player data was read, reset, migrated or edited.

| Registry | Total |
| --- | ---: |
| Worlds | 4 |
| Missions / chapters | 23 / 23 |
| Exercises | 89 |
| Choice questions / builders / short typed answers | 75 / 12 / 2 |
| Lessons | 46 |
| Spellbook entries | 25 |
| Maximum XP | 1100 |
| Bosses | 3 |

## Exact changed files

Added:

- `src/game/archipelagoUpdatesContent.ts` — two chapters, two missions and six exercises.
- `tests/inventoryUpdates.test.cjs` — nine focused compatibility, content, validation, lessons, progression and storage tests.
- `tests/fixtures/inventory-updates-compatibility.json` — pre-change content and protected-source fingerprints.
- `docs/stage-3i2.md` — this report and manual checklist.

Modified:

- `src/game/archipelagoContent.ts` — append new content and increase authored world reward total from 60 to 140.
- `src/game/lessonContent.ts` — four beginner lessons.
- `src/game/spellbookContent.ts` — two entries and six exercise links.
- `tests/archipelago.test.cjs` — retain foundation questions/rewards while extending current registry, unlock and 2/4 expectations.
- `tests/archipelagoMapUI.test.cjs` — test all four chapter states and 2/4 through 4/4 map progression.
- `tests/codeBuilder.test.cjs` — updated current registry totals; earlier builder assertions retained.
- `tests/decisionKeeper.test.cjs` — expanded current totals and save-prefix expectations.
- `tests/loopCaverns.test.cjs` — expanded current totals and save-prefix expectations.
- `tests/loopWarden.test.cjs` — expanded current totals; old boss HP/reward checks retained.
- `tests/mirrorOfTruth.test.cjs` — expanded current registry and save-prefix expectations.
- `tests/shortAdventures.test.cjs` — expanded current registry and save-prefix expectations.
- `tests/spellbookContent.test.cjs` — two expected reference titles and updated all-exercises test label.
- `tests/whileLoops.test.cjs` — updated current registry totals; earlier while content/behavior checks retained.
- `README.md` — current overview and Stage 3I.2 summary/link.

No old test was deleted. Historical content/reward assertions and fixtures remain intact. Existing `tests/codeBuilderUI.test.cjs` was not edited: its data-driven cases automatically include the two new builders.

## Verification results

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npm run lint` | PASS, exit 0 |
| `npm test` | **234 passed, 0 failed, 0 skipped** — 223 baseline cases plus 9 new logic/content cases and 2 automatically included builder component cases |
| `npx expo export --platform android --output-dir dist/stage-3i2 --max-workers 2` | PASS, exit 0; Android Hermes bundle and metadata exported |
| `git diff --check` | PASS |
| `npx expo-doctor` | 20/21 pass; one existing dependency patch-version mismatch check fails |

Doctor installed → expected: Expo 57.0.27 → ~57.0.31; expo-asset 57.0.19 → ~57.0.20; expo-constants 57.0.21 → ~57.0.22; expo-linking 57.0.12 → ~57.0.13; expo-router 57.0.25 → ~57.0.29; expo-splash-screen 57.0.9 → ~57.0.10. No packages, lockfile, dependency exclusions or SDK settings were changed.

Ignored logs are `.expo/stage-3i2-{typescript,lint,tests,export,doctor}.log`; the bundle is at `dist/stage-3i2`.

### Native limitations and physical Android checklist

**No native interaction was tested in this stage.** Emulator controls remain reserved for the developer. No automated taps, resizing, restarts, data clearing or save modifications were performed. Host-component tests verify controls and rendered content with mocked native hooks; they do not verify physical layout, hardware Back dispatch, animations, audio or process-restart persistence. No iOS testing is claimed.

Use a separate test installation/device or existing isolated test progression, preserving genuine saves.

1. With the two original Archipelago missions complete, confirm 1020 XP and 2/4 chapters. Growing Chest should be available; Smith's Exchange should remain locked. Before Index Island completion, a Growing Chest deep link must be blocked.
2. Play both missions. Check the two lessons per mission, wrong-answer feedback, exact outputs, explanation before Continue, no XP before spell three, then +40 XP and totals 1060/1100. Replay each for +0 XP and verify automatic lessons are skipped.
3. In each builder, try a wrong order, Undo Last and Reset. Confirm fragments do not auto-submit, Cast Spell is explicit, incorrect order retains the draft, and rapid taps cannot double-award XP. No keyboard should appear.
4. Leave a partial or incorrect draft, open Review Lesson, Spellbook and notes, then return. Confirm the question, draft and appropriate feedback remain. Check small-screen scrolling, longer lesson text and all controls with larger text settings.
5. Exit each mission to List Archipelago; check four-world switching, Home and Android Back behavior. At 4/4, confirm UP TO DATE / AVAILABLE CHAPTERS COMPLETE with no World 4 boss or genuine clear. Profile should show 1100 XP, 89 exercises, 23 missions and 3 bosses.
6. On the isolated installation, manually force-stop and relaunch. Confirm completion, XP, note/profile/audio preferences and zero replay rewards persist. Check spell sounds/music if enabled; audio should remain optional.

## Recommended separate Stage 3I.3

Consider two short lessons/missions comparing removal by value with removal by position, with careful prerequisites and finite examples before assessment. Reuse the existing choice/builder formats and persistence. Removal methods, further missions and the Archipelago boss are not implemented in this stage.

No Git commit or push was made. Automated/build verification is complete; native manual checks and the existing Doctor mismatch remain the limitations.
