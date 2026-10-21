# Stage 3H.3 — While loops and the Stopping Crystal

## Implementation

Started from a clean Stage 3H.2 working tree. This stage adds content through the existing registries. Code Builder, exercise types/validators, mission submission, lesson-session logic, progression, persistence, profile, navigation, audio and both bosses are unchanged.

| Mission | Prerequisite | Three exercises | First / replay XP |
| --- | --- | --- | --- |
| The Endless Echo | Counting Tower | Predict a finite loop's output (2, 3); choose a condition that skips the body; build a four-line counter loop (4, 5, 6) | 40 / 0 |
| The Stopping Crystal | The Endless Echo | Explain a missing update; build a four-line countdown (4, 3, 2); repair an update to match `range(3, 5)` | 40 / 0 |

Mission IDs: `python-caverns-endless-echo-01` and `python-caverns-stopping-crystal-01`. New content lives in `cavernWhileContent.ts`; the existing Caverns registry appends it after Counting Tower. No placeholder boss or extra mission is registered.

## Lessons and reviewed Python behavior

Four lessons use the existing cards and stay within the existing 110-word explanation limit:

1. **Repeat while it is True** — check before every repetition, print the counter, then update. The example starts `count` at 0 and stops before 3, printing 0, 1, 2.
2. **Sometimes there is no first turn** — a False starting condition skips both print and update. The example's `4 < 4` is False; only the outside Rest message appears.
3. **Give the crystal a stopping point** — missing, reset or wrong-direction updates can keep a condition True. A finite countdown example prints Glow twice and stops at zero.
4. **Two ways to count** — `for` takes values from `range`; `while` needs initialization and an update. Two separate finite loops each print 1, 2; the combined example therefore prints 1, 2, 1, 2.

Endless Echo shows introductions before questions 1 and 2. Question 3 reuses its already-seen first lesson. Stopping Crystal shows introductions before questions 1 and 3. Question 2 practices the first lesson. All reviews stay available; completed replays skip automatic introductions.

The new `python-while-loops` Spellbook entry uses a different finite example printing Shine twice, explains the update and stopping check, and warns about missing/reset/wrong-direction updates. All six new questions link to this entry. All previous entry IDs, text and exercise-note links remain unchanged.

### Execution safety

No authored or player-created Python is executed by the app or tests. Choice validation compares stable option IDs; builder validation compares stable fragment-ID sequences. The intentionally nonterminating missing-update example and incorrect repairs are text only. Tests compare reviewed code strings and use fixed, finite arithmetic tables; they never simulate an infinite loop or run the authored examples.

For example, the countdown builder assembles:

```python
power = 4
while power > 1:
    print(power)
    power = power - 1
```

It prints 4, 3, 2. The last update makes `power` equal 1; `1 > 1` is False. Printing before the update is necessary to match the target output. Each of the two puzzles has four fragments and exactly one accepted permutation.

## Code Builder and mobile behavior

No UI redesign or engine changes were needed. Existing tap cards, Undo Last, Reset, explicit Cast Spell, wrong-answer recovery, successful spell effects, explanation/Continue flow and synchronous submission guards are reused. Selection stays in the parent mission screen when Review Lesson hides the exercise or Spellbook/notes opens. Existing Back handlers close help views first.

Both builders have two indented lines and four total lines. Each fragment is at most 24 characters; the existing monospace text, horizontal overflow scrolling, 56-point card targets, 48-point editing actions and vertically scrolling mission container remain in place. Host-tree tests exercise the real controlled component with both new puzzles, including retained drafts, wrong order, undo/reset and explicit submission. They are not native layout or touch-dispatch tests.

## Progression and compatibility

- Registry: **3 worlds, 18 missions, 72 exercises, 37 lessons, 21 Spellbook entries, 860 maximum XP**.
- Exercise formats: 64 choices, six Code Builders, two short typed answers.
- Caverns: six chapters, 220 available mission XP, no final boss.
- A completed Stage 3H.2 save retains 780 XP, sixteen missions and 66 completed exercises. It unlocks Endless Echo and shows 4/6 (67%) available Caverns progress.
- Endless Echo completion: 820 XP, seventeen missions, 69 exercises, 5/6 (83%).
- Stopping Crystal completion: 860 XP, eighteen missions, 72 exercises, 6/6 (100%).
- Caverns remains **UP TO DATE / AVAILABLE CHAPTERS COMPLETE**; `isWorldCleared` is false because no Caverns boss exists.
- Both bosses remain completed for these saves, with unchanged five-spell, 100-HP, 20-damage rules. Forest/Valley clear states and World 3's six-Valley-mission prerequisite are unchanged.
- New missions pay nothing before question three and award 40 XP only once. Replays, wrong answers and duplicate submissions grant no additional rewards.
- Storage keys, version 1 format, profile nickname/avatar, achievements, notes, onboarding and audio preferences remain unchanged. No genuine saved data was read, edited or reset.

The new pre-edit hash fixture verifies all 66 previous exercises, sixteen missions, prior chapters, 33 lessons, twenty Spellbook entries and all prior links. Forest and Valley world definitions are unchanged; Caverns only gains the two chapter IDs and corresponding reward total. Existing fixtures were not regenerated. Historical tests retain their content/reward checks while current registry counts and save-point expectations extend through 860 XP.

## Exact changed files

Added:

- `src/game/cavernWhileContent.ts` — two chapters/missions and six exercises.
- `tests/whileLoops.test.cjs` — nine new content, validation, progression, compatibility and storage tests.
- `tests/fixtures/while-compatibility.json` — pre-edit baseline hashes and links.
- `docs/stage-3h3.md` — this report.

Modified:

- `src/game/cavernContent.ts` — append new content, chapter IDs and world XP total.
- `src/game/lessonContent.ts` — four lessons.
- `src/game/spellbookContent.ts` — one entry and six links.
- `tests/codeBuilderUI.test.cjs` — two new controlled-component tests for four-fragment while puzzles and help/notes recovery.
- `tests/codeBuilder.test.cjs` — expanded registry and map expectations, preserving prior builder checks.
- `tests/loopCaverns.test.cjs` — expanded registry/map/save expectations, preserving foundation checks.
- `tests/decisionKeeper.test.cjs` — current registry/save expectations; boss checks retained.
- `tests/mirrorOfTruth.test.cjs` — current registry/save expectations.
- `tests/shortAdventures.test.cjs` — current registry/save expectations.
- `tests/spellbookContent.test.cjs` — twenty-one entries and all 72 exercise links.
- `README.md` — current content summary and stage link.

## Verification

Final verification on 21 October 2026:

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | Passed, exit 0 |
| `npm run lint` | Passed, exit 0 |
| `npm test` | **198 passed**, 0 failed, 0 skipped; all 187 previous tests plus eleven new tests |
| `npx expo export --platform android --output-dir dist/stage-3h3 --max-workers 2` | Passed, exit 0; Android Hermes bundle, assets and metadata exported |
| `git diff --check` | Passed; Git also reports LF-to-CRLF normalization notices |
| `npx expo-doctor` | **20/21 passed**, exit 1; existing Expo patch-version mismatch check remains |

Doctor's installed/expected versions are `expo` 57.0.27/~57.0.30, `expo-asset` 57.0.19/~57.0.20, `expo-constants` 57.0.21/~57.0.22, `expo-linking` 57.0.12/~57.0.13, `expo-router` 57.0.25/~57.0.28 and `expo-splash-screen` 57.0.9/~57.0.10. These match the preceding stage's warnings. Dependencies and lockfiles are unchanged.

The initial run caught new lesson explanations exceeding the existing 110-word limit. The new copy was shortened, retaining that test unchanged. The focused rerun passed all twenty selected tests before final full-suite verification.

New automated coverage includes all 24 orderings for each four-fragment builder, malformed/missing/duplicate/unknown/foreign/extra IDs, display-independent validation, indentation, wrong-order recovery, Undo/Reset, controlled help remounts, lesson sequencing, finite and zero-turn behavior, stopping boundaries, text-only nontermination, for/while equivalence, locked deep links, forged attempt jumps, third-answer rewards, repeated submissions, zero-XP replay, save reloads, profile counts, note links, world returns and audio route policy. All prior boss, audio, navigation, persistence and prototype tests remain included.

### Android limitations and manual checklist

Emulator controls remain reserved for the developer. No automated taps, device resizing, force-stop/relaunch, server/network changes or saved-data manipulation were performed. Android interaction, narrow-screen layout, hardware Back, audible playback and physical-device/iOS behavior are **not verified for this stage**. Build export and controlled-component tests do not establish native visual or touch behavior.

Using an isolated test profile with Counting Tower completed:

1. Confirm Endless Echo is available and Stopping Crystal is locked; read the two introductions and test a wrong answer.
2. On the four-fragment puzzle, assemble an incorrect order and cast. Confirm the draft remains, then use Undo Last/Reset to repair it.
3. With a partial draft, open/close Review Lesson and Spellbook, save an exercise note and use Android Back. Confirm the draft and mission position survive; no answer keyboard should open.
4. On a small viewport, check both indented lines, fragment tapping, horizontal/vertical scrolling and access to Cast Spell and Continue.
5. Finish Endless Echo: confirm +40 XP (820 total from the baseline), 5/6 progress and the next chapter unlock. Replay for +0 XP.
6. Finish Stopping Crystal: confirm +40 XP, 860 total, 6/6 and UP TO DATE. Replay for +0 XP; check Profile (72 exercises, eighteen missions, two bosses) and returns to Caverns/Home.

## Separate future boss stage

Recommended scope: a Loop Caverns final assessment unlocked after all six chapters, reviewing finite `for`, `range` and `while` behavior with existing choices/builders. Reuse the boss HP, animation, first-reward/replay and owning-world navigation systems; define the boss's content and reward in that separate stage. Do not introduce advanced loop syntax as part of the recap. No boss implementation, commit or push is included here.

Stage 3H.3 implementation and automated/build verification are complete. Native Android interaction remains pending the manual checklist above.
