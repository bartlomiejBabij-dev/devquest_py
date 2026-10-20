# Stage 3H.2 — Code Builder and two Loop Caverns missions

## Scope and implementation

The stage began from a clean, committed Stage 3H.1 working tree. It extends the existing mission screen and deterministic validator. No mission engine rewrite, dependency changes, save migration, new boss, new world or Stage 3H.3 work is included.

Code Builder uses a typed `code-builder` exercise with authored fragments, globally unique fragment IDs, a deliberately shuffled display order, expected output and one expected ID sequence. The player's draft is a JSON array of fragment IDs carried through the existing string-answer channel; it is not executed or saved as progression. Validation rejects wrong order, missing/duplicate/foreign/unknown/extra IDs, display text and malformed payloads. Changing fragment presentation does not change validation.

The reusable controlled UI provides:

- Monospace fragments with original indentation, 56-point minimum tap targets and horizontal scrolling for larger text/narrow viewports.
- The assembled program in selected order, plus all unused fragments.
- Undo Last, Reset and explicit Cast Spell; selecting fragments never submits.
- Supportive wrong-answer feedback that keeps the arrangement intact.
- The assembled answer after success, followed by the existing animation, audio, explanation and Continue flow.
- No TextInput or software-keyboard requirement.

The parent mission screen retains its existing `answer` state when Review Lesson replaces the exercise subtree or Spellbook/notes opens in a modal. Closing help does not clear the draft. Existing Android Back handlers close those views first. Continue, replay and mission changes clear the local answer through the existing paths. The screen's synchronous submission/attempt refs and mission phase checks still prevent repeated successful casts and skipped explanations.

## Educational content

| Mission | Prerequisite | Three exercises | XP first / replay |
| --- | --- | --- | --- |
| Echo Bridge | Lanterns of Range | Predict repeated Bell then Safe; assemble a two-line Step loop; assemble Ready → three Cross lines → Done using four fragments | 40 / 0 |
| Counting Tower | Echo Bridge | Predict `range(4, 7)`; assemble a two-line `range(5, 8)` loop; assemble a counting loop followed by Top | 40 / 0 |

Example authored answer in Counting Tower:

```python
for n in range(6, 8):
    print(n)
print("Top")
```

Expected output:

```text
6
7
Top
```

The bank presents the three fragments in a different order. The player must put the loop header before its indented body and place Top after counting, matching the requested output. The validator compares fragment IDs, not this displayed code.

Two new concise lessons, **Build a spell in order** and **Assemble a counting spell**, appear before each mission's first question. Their examples and outputs differ from the questions. Subsequent exercises reuse the lesson without mandatory repeats; Review Lesson stays available, and completed replays skip automatic introductions. Six exercise links reuse the existing `python-for-loops` and `python-range` Spellbook entries. No reference text or prior note ID changes.

## Progression and compatibility

- Caverns now has four sequential chapters; no map implementation change was necessary.
- Old 700-XP saves retain all completed records and unlock Echo Bridge. Caverns available progress becomes 2/4 (50%).
- Echo Bridge brings total XP to 740 and available progress to 3/4 (75%); Counting Tower brings them to 780 and 4/4 (100%).
- Both rewards are first-completion-only. Replays award zero, and questions one/two award nothing.
- `isWorldCleared` remains false for Caverns. Existing map logic displays UP TO DATE / AVAILABLE CHAPTERS COMPLETE at 100%.
- Return routes use the owning Loop Caverns world. Locked missions remain rejected by existing mission access checks.
- Registry totals: **3 worlds, 16 missions, 66 exercises, 33 lessons, 20 Spellbook entries, 780 maximum XP**. Exercise formats: 60 choice questions, four builders, two short typed answers. Boss count remains two.
- No storage keys, versions, profile data, achievements, notes, audio preferences or progression formats were changed. No real saved player data was read, reset or modified during implementation.

## Exact changed files

Added:

- `src/components/CodeBuilder.tsx` — controlled fragment UI.
- `src/game/codeBuilder.ts` — pure draft edits, decoding, assembly and sequence validation.
- `src/game/cavernBuilderContent.ts` — two chapters/missions and six exercises.
- `tests/codeBuilder.test.cjs` — validation, content, progression, storage and compatibility checks.
- `tests/codeBuilderUI.test.cjs` — real controlled component rendered to a lightweight host tree; control/remount checks without native rendering.
- `tests/fixtures/code-builder-compatibility.json` — hashes captured before production edits for all 60 prior exercises, fourteen missions, prior chapters/lessons/references and links, plus original world data.
- `docs/stage-3h2.md` — this report.

Modified:

- `src/game/worldTypes.ts` — typed builder variant.
- `src/game/exerciseValidation.ts` — dispatch builder answers to the pure validator.
- `src/app/mission/[missionId].tsx` — render target output and controlled builder, retaining existing answer/submit/help flows.
- `src/game/cavernContent.ts` — append new chapters/missions/exercises and update world reward total.
- `src/game/lessonContent.ts` — two lessons.
- `src/game/spellbookContent.ts` — six links to existing concepts.
- `tests/decisionKeeper.test.cjs` — expanded current registry/save expectations; prior boss assertions retained.
- `tests/loopCaverns.test.cjs` — preserve foundation content checks while extending current registry, progress and save expectations.
- `tests/mirrorOfTruth.test.cjs` — expanded registry/save expectations.
- `tests/shortAdventures.test.cjs` — expanded registry/save expectations.
- `tests/spellbookContent.test.cjs` — all 66 links and builder target-output checks.
- `README.md` — current summary and stage notes.

## Verification

Final verification on 20 October 2026:

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | Passed, exit 0 |
| `npm run lint` | Passed, exit 0 |
| `npm test` | **187 passed**, 0 failed, 0 skipped; fourteen added tests, all 173 previous tests retained |
| `npx expo export --platform android --output-dir dist/stage-3h2 --max-workers 2` | Passed, exit 0; Android Hermes bundle, assets and metadata exported |
| `git diff --check` | Passed; only existing Git LF-to-CRLF normalization notices |
| `npx expo-doctor` | **20/21 passed**, exit 1; existing Expo patch-version mismatch check remains |

Doctor reports installed/expected versions: `expo` 57.0.27/~57.0.30, `expo-asset` 57.0.19/~57.0.20, `expo-constants` 57.0.21/~57.0.22, `expo-linking` 57.0.12/~57.0.13, `expo-router` 57.0.25/~57.0.28 and `expo-splash-screen` 57.0.9/~57.0.10. These are the same mismatches recorded in Stage 3H.1; neither package manifests nor lockfiles were changed.

Automated coverage includes every authored builder permutation (exactly one accepted), malformed/foreign/duplicate/extra IDs, stable IDs independent of text, preserved indentation, Undo/Reset, controlled remounts, reviewed Python outputs/range boundaries, introductory lessons, explicit submission, wrong-answer preservation, repeated-cast and Continue guards, sequential unlocking, locked/forged attempts, 40-XP rewards, zero-XP replay, save reloads, profile counts and exercise-note links. Independent hashes verify every prior exercise/mission/lesson/reference is unchanged. Existing boss, prototype, navigation, persistence and audio suites remain enabled. Historical fixtures were not regenerated or weakened; current-total assertions were extended for the new content.

### Android and device limitations

The developer previously reserved emulator controls for manual use. No automated taps, device resizing, force-stop, app relaunch or emulator networking changes were performed in this stage. Prior Stage 3H.1 manual results do not verify the new Code Builder.

The controlled-component host-tree test checks callbacks and remounting, not native layout or touch dispatch. A fresh Android pass is still needed for narrow-screen fragment taps/scrolling, wrong order → Undo/Reset → correct cast, Review Lesson/Spellbook/notes round trips, Android Back, both mission completions and replay. Use isolated test data for this pass. No physical-device, iOS, native keyboard or fresh audible-audio verification is claimed.

Implementation is limited to short authored line fragments. There is no drag-and-drop editor, free-form multiline typing, Python execution, or persistence of unfinished attempts. The existing leave-mission confirmation remains in place.

Stage 3H.2 implementation and automated/build verification are complete. The Android interaction pass above remains unverified. No Git commit was created.
