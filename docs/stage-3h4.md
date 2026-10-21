# Stage 3H.4 — The Eternal Loop

## Implementation

The Eternal Loop is the seventh Loop Caverns chapter. Its mission ID is `python-caverns-eternal-loop-01`; its encounter is `loop-warden`. The Stopping Crystal gates the chapter, and the existing six Valley prerequisites still gate World 3. Locked mission links are rejected by the existing playable-mission selector.

The Loop Warden uses original local React Native shapes: dark stone armor, a cyan crystal heart, violet orbit and looping runes. The compact scene is 104 logical pixels tall. The wrapping name/HP header, animated cyan health bar, impact shake, floating −20 HP, fading defeat and cyan victory panel use existing React Native animation techniques. Reduced motion displays final values directly. Visual HP, damage and defeat feedback work with audio disabled.

HP is derived from the validated solved-exercise prefix, never independently saved: **100 → 80 → 60 → 40 → 20 → 0**. Existing submission guards and phase checks prevent duplicate damage. Wrong answers, fragment selection, Undo, Reset and help views do no damage. Success retains the educational explanation until Continue. The existing brief defeat delay and boss-victory sound are reused.

The mission pays **100 XP once**, after the fifth correct answer, and **0 XP on replay**. World-clear and Profile selectors recognize the registered third boss. Map and victory labels use the correct Warden name; the map retains World 3 on mission return. Before victory a fully completed Stage 3H.3 save shows 6/7 (86%) Caverns completion without clear status. Afterward it shows 7/7, 100%, and CLEARED; the results panel displays WORLD 3 CLEARED!

## Five challenges

All challenge IDs below have the `python-caverns-warden-` prefix. All use touch input without a software keyboard.

| ID suffix / spell | Interaction | Reviewed Python behavior |
| --- | --- | --- |
| `rune` — The Repeating Rune | Output choice | `range(2, 6)` prints 2, 3, 4, 5: four values, excluding 6. |
| `path` — The Crystal Path | Three-fragment Code Builder | A `for` header, indented print and following unindented print produce Path three times, then Cross once. |
| `counter` — The Vanishing Counter | Output choice | Start charge at 5; print before subtracting 1 while charge > 2. Output is 5, 4, 3; the check fails at 2. |
| `echo` — The Broken Echo | Missing-token choice | Increase echo from 1 to 4 to print Ring three times. Resetting or decreasing the counter would not stop this loop. These alternatives remain text only. |
| `final` — The Final Loop | Four-fragment Code Builder | Initialize seal at 2, check seal < 5, print, then increment within the body. Output is 2, 3, 4, followed by a failed check at 5. |

Each builder has exactly one accepted fragment-ID order. The task wording also excludes otherwise executable rearrangements that would produce different output. Fragments retain four-space indentation and fit within 20 characters; the existing horizontal code scrolling and vertical GameScreen remain available. Wrong-order feedback uses the exercise hint to explain the header/body/update or execution-order issue. Code Builder itself, validators and the mission engine are unchanged.

The new optional recap, `python-lesson-caverns-mastery` / **The rhythm of the caverns**, reviews for/range, indentation, precondition checks, counter updates and termination using different examples. It never interrupts first play or replay automatically. The existing OPTIONAL RECAP control is available on the first question and throughout combat, including solved feedback. Review Lesson, Spellbook and notes retain the parent answer/draft and attempt state. The recap awards nothing.

No Python program was executed by the app or tests. Content verification uses independently reviewed text/output fixtures, bounded arithmetic tables and deterministic option/fragment-ID validation. The three choice tasks link to range/while references, and the builders link to for/while references. No new Spellbook entry is needed.

## Registry and compatibility

| Registry | Total |
| --- | ---: |
| Worlds | 3 |
| Chapters / missions | 19 / 19 |
| Exercises | 77 |
| Choice questions / Code Builders / short typed answers | 67 / 8 / 2 |
| Lessons, including optional recaps | 38 |
| Spellbook entries | 21 |
| Maximum XP | 960 |
| World bosses | 3 |

All UI totals continue to derive from registered content. At full completion Profile reports 960 XP, 77 completed exercises, 19 missions and 3 bosses. The unchanged level formula gives level 10 with 60/100 XP toward the next level.

The existing `devquest.progression` version-1 completed-mission-ID format is unchanged. Automated isolated storage checks restore both 860- and 960-XP records, preserve all previous records and replay rewards, and keep separate profile/audio/onboarding keys intact. Notes round-trip with all 77 valid exercise links. Existing malformed-save and queued-write tests remain in the suite. No actual player storage was read, reset, edited or migrated.

The new compatibility fixture was captured from committed Stage 3H.3 content before editing. It verifies all 72 earlier exercises, 18 missions, 37 lessons, 21 Spellbook entries and old links, plus both earlier world definitions. It also pins the unchanged Goblin King/Decision Keeper components, Code Builder, validation, mission engine, profile, progression storage and audio controller. Earlier boss mechanics, rewards and animations remain unchanged.

## Exact changed files

New:

- `src/game/cavernBossContent.ts` — chapter, mission and five exercises.
- `src/components/LoopWardenEncounter.tsx` — original Warden artwork and HP/damage/defeat presentation.
- `tests/loopWarden.test.cjs` — nine focused registration, content, lock, combat, recap, compatibility and storage tests.
- `tests/fixtures/loop-warden-compatibility.json` — Stage 3H.3 content and protected-source fingerprints.
- `docs/stage-3h4.md` — implementation, verification and manual checklist.

Modified:

- `src/game/cavernContent.ts` — append the seventh chapter, mission and five exercises; Caverns reward total becomes 320 XP.
- `src/game/worldTypes.ts` — add the `loop-warden` encounter variant.
- `src/game/boss.ts` — Warden identity and 100/20 derived-HP support.
- `src/game/lessonContent.ts` — one optional recap.
- `src/game/spellbookContent.ts` — five links to existing entries.
- `src/app/mission/[missionId].tsx` — render Warden encounter; cyan results panel and infinity emblem.
- `src/app/world-map.tsx` — seventh-node emblem, Warden labels, action and completed-state styling.
- `tests/codeBuilder.test.cjs` — retain prior content tests; extend current registry and seven-chapter map expectations.
- `tests/codeBuilderUI.test.cjs` — run existing real controlled-component checks for both Warden builders as well as prior builders.
- `tests/decisionKeeper.test.cjs` — extend current registry and save/profile expectations through the third boss.
- `tests/loopCaverns.test.cjs` — extend foundation registry/map/save expectations while retaining ordinary-mission assertions.
- `tests/mirrorOfTruth.test.cjs` — extend current registry and save totals.
- `tests/shortAdventures.test.cjs` — extend current registry and save totals.
- `tests/spellbookContent.test.cjs` — update the all-exercises test label to 77; link assertions remain intact.
- `tests/whileLoops.test.cjs` — extend current registry/map expectations and verify Stopping Crystal now unlocks the Warden.
- `README.md` — current overview, third-boss statistics and Stage 3H.4 summary/link.

No existing test was removed. Historical mission rewards, content fingerprints and earlier-boss checks remain intact. Only current registry/map expectations changed where the new chapter affects totals.

## Verification — 21 October 2026

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npm run lint` | PASS, exit 0 |
| `npm test` | PASS: 209 tests, 0 failures, 0 skipped (198 baseline tests + 9 Warden tests + 2 builder host-component cases) |
| `npx expo export --platform android --output-dir dist/stage-3h4 --max-workers 2` | PASS, exit 0; 1,640 modules, Android Hermes bundle and 33 assets exported |
| `git diff --check` | PASS |
| `npx expo-doctor` | 20/21 checks pass; existing dependency patch-version mismatch check fails |

Doctor's installed → expected versions: Expo 57.0.27 → ~57.0.31; expo-asset 57.0.19 → ~57.0.20; expo-constants 57.0.21 → ~57.0.22; expo-linking 57.0.12 → ~57.0.13; expo-router 57.0.25 → ~57.0.29; expo-splash-screen 57.0.9 → ~57.0.10. Package manifests and lockfile are unchanged; no upgrades or ignore rules were added.

Local ignored logs are `.expo/stage-3h4-{typescript,lint,tests,warden-tests,export,doctor}.log`. The export is ignored at `dist/stage-3h4`.

### Device limitations and manual checklist

**No Android emulator interaction or physical-device test was performed in this stage.** Controls remain reserved for the developer. No taps, resizing, restarts or storage manipulation were automated. Android export verifies bundling, not native rendering, audible playback, gestures or real process-restart persistence. No iOS testing is claimed.

Small-screen review was limited to source/layout inspection (104-dp arena, wrapping header, short monospace fragments, existing scroll containers) and host-component tests for real Code Builder controls and controlled-state remounts. Animation timing, font scaling, device back behavior and narrow-screen control reachability still need visual verification.

Use a separate test installation/device or existing isolated test progression; do not replace genuine player saves.

1. **Unlock:** before Stopping Crystal, confirm the boss node and deep link cannot enter. After it, confirm The Eternal Loop is available and Caverns reads 6/7 without CLEARED; Forest and Valley stay cleared.
2. **Recap:** enter at 100 HP, spell 1/5, with no automatic recap. Open/close OPTIONAL RECAP before casting, after a wrong selection and during a partial builder. Confirm question, selected answer, feedback, HP and draft remain intact.
3. **Builder/readability:** on spells 2 and 5 inspect indentation on a narrow screen and with larger text. Scroll to every fragment, Undo, Reset and Cast Spell. Confirm there is no software keyboard. Open Spellbook/notes and return without losing the draft.
4. **Wrong answer/retry:** choose a distractor and cast an incorrect fragment order. Confirm explanatory feedback, unchanged HP/XP and retained builder arrangement. Undo/reset and retry successfully.
5. **Combat:** verify the five reductions 100 → 80 → 60 → 40 → 20 → 0, visible spell/impact/−20 feedback, no extra damage on rapid taps, and explanation before each Continue. Repeat with reduced motion enabled and audio muted.
6. **Victory:** after final explanation/Continue, verify defeat feedback, THE LOOP WARDEN DEFEATED!, WORLD 3 CLEARED!, +100 XP, total 960 and 100% World 3 completion.
7. **Replay:** start again at 100 HP; finish all five and verify +0 XP, total still 960, with no automatic recap.
8. **Map/navigation:** return to the Caverns map, see 7/7 and the Warden defeated node. Check world switching, Home, and Android Back including dismissing recap/Spellbook before leaving the mission.
9. **Profile:** confirm 960 XP, 77 completed exercises, 19 missions, 3 bosses and unchanged nickname/avatar/achievements.
10. **Persistence:** force-stop and relaunch the test installation. Confirm Warden completion, 960 XP, map clear state and zero replay reward survive.
11. **Audio:** enable music/effects and verify battle theme, correct/incorrect effects and boss victory sound; return to map for forest theme. Check mute and foreground/background resume. This stage makes no audible verification claim.

## Next stage recommendation

A separate World 4 foundation can introduce beginner Python lists: what a list stores, zero-based indexing and a short traversal using the already learned for loop. Start with a small content-only mission set and explicit lessons, reusing current choices/builders, unlock selectors and persistence. World 4, its unlock rules and new content are not implemented here.

No Git commit or push was made. Code/build checks pass; the manual device checks above and existing Doctor dependency warning remain the release limitations.
