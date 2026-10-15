# Stage 3G.2A — Beginner-first learning loop

## Scope and learning flow

Only The Awakening (`python-forest-awakening-01`, 20 XP) and The Crossroads (`python-valley-crossroads-01`, 70 XP) were converted. Each retains its original five exercise IDs and order. The remaining 30 exercises are unchanged, checked against a baseline data fixture.

The flow is **Learn → example and output → quick practice → spell → explanation**. Five short lessons introduce print/output, text/numbers, Booleans, equality/difference and ordered comparisons. Each has a separate example, expected output, why it works and an important rule. The first attempt shows two concept cards in The Awakening and three in The Crossroads. Cards are not inserted after every answer. Completed-mission replays skip automatic introductions, while Review Lesson stays available.

| Mission | Tap interactions | Keyboard input |
| --- | --- | --- |
| The Awakening | Two missing tokens, one multiple choice, one output choice | One short correction: `print` |
| The Crossroads | Two missing tokens, two output choices, one multiple choice | None |

Full-width choices have a minimum 56-point height, pressed/selected states and option-specific retry feedback. A correct tap uses the existing submission, spell animation and audio paths. The explanation remains visible until Continue; there is no automatic exercise skip. Existing editable code and operator controls remain available for the other missions.

`LessonCard` and `AnswerChoices` are reusable components. Typed lesson content is separate from the mission engine. `lessonSession` holds only temporary teaching UI state, never progression. Review preserves the current answer, feedback and attempt; hardware Back closes review first. Spellbook and personal notes remain available from the challenge. The new slice resets scrolling when changing exercises or switching lesson/challenge views; existing keyboard handling is retained.

## Validation and compatibility

- The three new choice formats use exact stable option IDs. The validator rejects display labels, unknown IDs, IDs from other exercises and a correct ID missing from the exercise's option list.
- Display order and labels do not decide correctness. Existing exact and authored Python-line validators remain intact. No player code is executed.
- The existing synchronous submission guard and mission attempt state prevent duplicate successful submissions. Wrong answers do not advance or award XP.
- Lessons never dispatch progression actions. Mission completion still grants its configured reward once; replay grants zero.
- All eight mission IDs, 40 exercise IDs, rewards, prerequisites and persistence formats are preserved. No storage keys or dependencies were changed.
- Legacy completion records, world unlocks, profile counts, achievements and exercise-linked notes remain compatible. Audio, onboarding, boss logic and the original Goblin prototype were not changed.

## Verification

| Check | Result |
| --- | --- |
| TypeScript (`npx tsc --noEmit`) | Passed |
| ESLint (`npm run lint`) | Passed |
| Full test suite (`npm test`) | **108 passed**, including eight new learning-loop tests |
| Android export | Passed; ignored output: `dist/stage-3g2a` |
| Expo Doctor | **19/21 passed**; existing configuration/dependency issues below |
| Git whitespace check | Passed |

The new tests cover independently reviewed answer IDs and outputs, lesson completeness and sequencing, invalid choices, duplicate submissions, correct/incorrect advancement, explanation boundaries, rewards/replays, legacy saves, notes and profile compatibility. Existing battle, boss, progression, navigation, Spellbook, profile, persistence and audio suites pass. These are logic/content tests; they do not replace native UI or listening tests.

Expo Doctor reports two checks requiring separate maintenance:

1. Its current schema rejects the existing PNG `ios.icon` value, expecting an `.icon` directory.
2. Six installed SDK 57 patch versions lag its recommendations: expo 57.0.27 → 57.0.30; expo-asset 57.0.19 → 57.0.20; expo-constants 57.0.21 → 57.0.22; expo-linking 57.0.12 → 57.0.13; expo-router 57.0.25 → 57.0.28; expo-splash-screen 57.0.9 → 57.0.10.

Configuration and dependency files were left unchanged in this learning-flow stage.

### Android emulator

The current application loaded in Expo Go. The existing player had four completed Forest missions and 140 XP. No save was reset or replaced.

Verified on the normal 1080×2400 viewport:

- The Awakening replay skips automatic introductions.
- Wrong token selection displays supportive inline feedback and does not advance.
- Review Lesson displays its example, output, explanation and rule; hardware Back restores the selected wrong answer and feedback.
- Spellbook opens and closes without losing the attempt; the existing personal note remains visible.
- All four tap questions complete through the shared success feedback and explanation flow.
- The final short typing question is the only keyboard exercise.

Verified on a shorter 1080×1800 viewport with **Gboard visibly open**:

- Focusing the short input automatically scrolls the input and Cast Spell above the keyboard.
- Entering `print` and tapping Cast Spell works without manually closing the keyboard.
- The keyboard dismisses and the explanation/mission result remain reachable.
- Replay result shows **+0 XP** and the unchanged **140 total XP**. Returning to the map shows the same four completed Forest chapters; Home navigation works.

The emulator's original viewport was restored. Screenshots are ignored local artifacts under `.expo/stage-3g2a`.

Not verified on device in this stage: first-time automatic lesson sequencing (covered by tests; the saved player had already completed The Awakening), The Crossroads gameplay (still locked for this saved player), fresh reward persistence across a native restart, the keyboard Done action, physical Android, iOS or audible audio. No test fixture was injected into the real save. The existing correct-answer animation path was exercised; detailed animation timing and audio synchronization still need physical-device review.

## Files

Created:

- `src/components/AnswerChoices.tsx`
- `src/components/LessonCard.tsx`
- `src/game/lessonContent.ts`
- `src/game/lessonSession.ts`
- `tests/learningLoop.test.cjs`
- `tests/fixtures/learning-compatibility.json`
- `docs/stage-3g2a.md`

Modified:

- `src/app/mission/[missionId].tsx`
- `src/components/GameScreen.tsx`
- `src/game/worldTypes.ts`, `exerciseValidation.ts`, `worldContent.ts`, `valleyContent.ts`
- `tests/boss.test.cjs`, `educationalContent.test.cjs`, `navigation.test.cjs`, `profile.test.cjs`, `progression.test.cjs`, `progressionStorage.test.cjs`, `spellbookContent.test.cjs`, `valley.test.cjs`, `worldMission.test.cjs` (adapt existing answer fixtures to the new typed choices)
- `README.md`

## Recommended rollout

1. Have a complete beginner try these two missions on a physical Android phone. Check whether lesson wording is understood, options feel comfortable to tap and explanations keep the pace moving. Verify a fresh first attempt with a separate test save and unlocked Crossroads; keep the developer's save intact.
2. After that feedback, convert the other 30 exercises in small chapter batches. Introduce each concept before practice; use plausible misconceptions as distractors and keep typing brief where it adds learning value.
3. Preserve stable IDs, rewards and save formats in each batch. Review Python examples/outputs independently and run compatibility, progression, keyboard and replay checks before expanding again.

The remaining exercises were not converted. No further stage was started and no Git commit was made.
