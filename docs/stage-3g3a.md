# Stage 3G.3A - Variable-length missions and short Valley adventures

## Implementation

The existing pure mission engine already derives completion and Continue from the authored exercise array. No engine, progression, persistence or navigation rewrite was needed. Regular result text, progress captions, typing hints and the shared Valley guardian counter now use the actual exercise count. Three-, four- and five-exercise attempts are covered by tests; the four-exercise case is a test-only fixture.

Goblin King remains five spells, 100 HP, 20 damage per correct answer and 100 XP once. All eight original missions, forty exercises, twenty-one lessons, fourteen Spellbook references, IDs, rewards and prerequisites retain their original data. Compatibility hashes captured before this stage verify that preservation.

## New content

| Mission | Opens after | Learning focus | Questions | Reward |
| --- | --- | --- | --- | --- |
| The Three Gates | The Guardian's Choice | elif, top-to-bottom checks, first matching branch | 3 tap, 0 typing | 30 XP once |
| The Twin Runes | The Three Gates | and requires both; or accepts at least one, including both | 3 tap, 0 typing | 30 XP once |

Three short lessons introduce the concepts before practice, with examples different from the questions. Each choice has stable IDs and misconception-specific feedback. Correct answers use the existing spell effects, explanation and Continue flow. Review Lesson, Spellbook and notes use the existing interfaces. Three new Spellbook entries include explanations, examples, output, why it works and common mistakes; all six exercises link to them.

The full registry now contains two worlds, ten missions, 46 exercises (44 tap and two short typed answers), 24 lessons and 17 Spellbook entries. No not operator, new boss or third world was added.

## Progression and compatibility

- Valley now has four real chapters, sequentially unlocked using existing selectors. Its nodes show a short learning objective; mission details show the actual spell count and locked panels identify the prerequisite chapter.
- Map totals derive from registered content. Completed available Valley content is labeled UP TO DATE, with the existing AVAILABLE CHAPTERS COMPLETE footer, rather than implying the world can never expand.
- Existing version-1 saves and storage keys are unchanged. An eight-mission save keeps 450 XP and 40 completed exercises; its Valley progress becomes 2/4 (50%).
- The new missions raise those totals to 480 XP/43 exercises/75%, then 510 XP/46 exercises/100% of available Valley chapters. The existing XP-based level calculation and Forest achievements are unchanged.
- No XP before the final validated answer; replay earns zero. Wrong answers, duplicate submissions, forged attempts and locked deep links retain the existing safeguards.
- Nicknames, avatars, notes, audio preferences, onboarding and genuine developer progression are not reset or migrated.

## Files

Production:

- src/game/valleyContent.ts - two chapters, two missions, six exercises and updated Valley metadata.
- src/game/lessonContent.ts - three new lessons appended.
- src/game/spellbookContent.ts - three references, six links and optional whyItWorks field.
- src/components/SpellbookEntryView.tsx - displays why-it-works text when provided.
- src/components/ValleyGuardian.tsx - receives the actual total count.
- src/app/mission/[missionId].tsx - derived ordinary mission counters.
- src/app/world-map.tsx - Valley learning topics, spell counts, prerequisite titles and up-to-date label.

Tests and documentation:

- tests/shortAdventures.test.cjs - twelve focused regression tests.
- tests/fixtures/short-adventures-compatibility.json - pre-edit data and hashes.
- tests/helpers/preExpansionContent.cjs - projects the original registry for historical conversion snapshot tests.
- tests/{learningLoop,variablesArithmetic,stringsDebugging,finalAssessment}.test.cjs - retain original scenario coverage and snapshot hashes while allowing new registrations; full new registry is independently checked.
- tests/valley.test.cjs - preserves original ten-question scenarios and updates expected newly unlocked chapter/world totals.
- tests/spellbookContent.test.cjs - verifies all seventeen entries and 46 links.
- README.md and this report.

No dependencies, app configuration, audio, storage formats or game engine files changed.

## Automated verification

| Check | Result |
| --- | --- |
| TypeScript | Passed |
| ESLint | Passed |
| Full test suite | 146/146 passed, including 12 new tests |
| Android bundle export | Passed, dist/stage-3g3a (ignored) |
| Expo Doctor | 20/21 passed; existing patch-version warnings |
| Git whitespace check | Passed |

Expo Doctor reports the same six SDK57 patch mismatches as the preceding stage: expo 57.0.27 vs ~57.0.30; expo-asset .19 vs .20; expo-constants .21 vs .22; expo-linking .12 vs .13; expo-router .25 vs .28; expo-splash-screen .9 vs .10. Dependencies were left unchanged as requested.

The new tests cover three- and four-spell completion, partial attempts, incorrect/duplicate submissions, XP once and zero-XP replay, prerequisite gates, reviewed code/choice/output semantics, lesson order, reference/notes links, profile counts, map percentages, boss balance and saves at all eleven completion points. Existing battle, audio, navigation, profile, onboarding and persistence tests pass.

## Android verification and remaining limitations

The Android emulator was available, but interactive verification was blocked. Its initial Home screen showed the genuine saved balance of 140 XP. Testing used a temporary project copy with separately namespaced storage keys and a seed containing only the eight original completed missions (450 XP); no production unlock bypass was added.

Expo Go initially displayed an older cached two-chapter Valley screen with a Cannot connect to Expo CLI warning. A clean fixture server and one force-stop/relaunch attempt produced a bundle but left Expo Go on the test app splash screen. UI inspection repeatedly timed out. Retries were stopped rather than spending the session troubleshooting the emulator.

Consequently, fresh new-mission completions, on-device 3/3 results, replay rewards, short-viewport layout, profile counts, force-stop persistence, navigation and audible effects are **not device-verified in this stage**. Their domain behavior is covered by automated tests. No genuine mission was completed and no genuine save was edited. No viewport override was applied. The isolated server and its port forwarding were stopped; the temporary copy is ignored/outside the repository.

Physical-phone listening/gameplay and iOS testing were not performed. A follow-up device pass remains needed for the six new questions and their longer conditional code blocks. The emulator blocker is not established as a production application defect.

## Recommended Stage 3G.3B

Add a similarly small, beginner-first Valley adventure teaching not with a short lesson, three tap exercises, linked Spellbook help and compatibility tests. Review physical-device feedback on these short missions before expanding further. That stage has not been started. No Git commit was made.
