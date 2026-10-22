# DevQuest

A local, playable Expo fantasy RPG that teaches beginner Python concepts. Forest of Variables has six five-exercise missions; completing it unlocks six Valley of Decisions missions: two five-exercise adventures, three short adventures with three exercises, and the five-spell Decision Keeper finale. Completing Valley unlocks Loop Caverns, with six three-spell adventures teaching for loops, range(), while loops and assembling Python code, followed by The Loop Warden five-spell finale. Completing it unlocks List Archipelago, with six short adventures teaching lists, indexing, adding and replacing items, and visiting list values with for loops, followed by the five-spell Treasure Guardian finale. Clearing List Archipelago unlocks Function Forge, with two short adventures introducing function definitions, calls, parameters and arguments. Progression is saved locally. The original three-spell Goblin battle remains playable from Home.

## Run in Expo Go

1. Install Node.js and the [Expo Go](https://expo.dev/go) app on an Android or iOS phone.
2. From this folder, run `npm install` and then `npx expo start`.
3. Scan the QR code with Expo Go on Android or the Camera app on iOS. Keep the phone and computer on the same network. If local network discovery fails, run `npx expo start --tunnel`.

## Checks

Run `npx tsc --noEmit` for strict TypeScript checking, `npm run lint` for the Expo lint check, and `npm test` for mission, progression, content, and battle logic.

## Structure

- `src/app`: Home, Adventurer Profile, Python tutorial, Spellbook, World Map, world mission, Battle, and Victory routes.
- `src/components`: reusable game UI and original shapes-based character art.
- `src/game`: battle data and reducer, world content, Spellbook lessons, pure exercise validation, mission submissions, progression logic, and separate local progression, onboarding, and notes storage.
- `src/theme.ts`: visual theme colors.

Answers are checked against local challenge data; no Python code is executed. Completed world missions are saved locally, so earned XP and chapter unlocks survive relaunch. All authored mission spells must be solved before the configured XP is awarded and the next chapter unlocks. An unfinished attempt restarts from its first spell. Replays remain available without awarding XP again. The Goblin prototype has its own battle and Victory flow; its decorative reward is separate from world mission XP.

New players see a three-screen Python introduction. Skip and Start Adventure save its completion under a separate local key; players with completed missions bypass it. Learn Python on Home reopens it.

The Spellbook on Home contains twenty-eight short Python references. Each world mission can open the relevant entry without leaving the current exercise. Personal notes are tied to exercise IDs and saved locally with an explicit Save Note action; they can be edited or deleted and do not affect XP or progression.

My Profile saves only a trimmed 3–20 character nickname and one of five local avatars under `devquest.profile.v1`. Saves are explicit and queued. Missing or damaged profiles fall back to Python Apprentice/Mage; unreadable or future-version saves are protected from replacement. Profile editing never writes to progression, notes, or onboarding.

Profile and Home XP come from completed mission IDs using the existing XP selector. Completed exercises count unique exercises belonging to completed missions; unfinished attempts and prototype battles do not count. Boss victories count the completed Goblin King, Decision Keeper, Loop Warden and Treasure Guardian missions. Display-only level is `1 + floor(total XP / 100)`, with progress toward the next 100 XP. Achievements require completing the first mission, three Forest chapters, Broken Spells, and the Goblin King respectively; they grant no rewards.

Initial adventure hydration and profile hydration use reusable, reduced-motion-aware skeletons. The placeholder shapes appear only if loading is still unresolved after 120 ms, and disappear as soon as data arrives. Data is never delayed; navigation and background saves do not trigger new skeletons.

The final Forest mission is a Goblin King encounter. Its HP starts at 100 and falls by 20 for each correctly solved exercise. Boss HP is derived from the mission attempt; XP and World 1 completion still use the existing progression system. Replaying the boss earns no additional XP.

The battle screen scrolls on shorter phones. With the keyboard open, the answer and Cast Spell button should remain reachable; the keyboard's Done action also submits the answer.

## Audio

Home's Audio button opens local settings: music and effects toggles, independent volume steps, and Mute All. Music defaults OFF at 20%; effects default ON at 45%. Changes apply immediately and save independently under `devquest.audio.v1`; writes are queued and invalid values are validated/clamped. Failed or future-version loads never overwrite an existing save automatically.

One root `AudioProvider` owns one looping music player and four reusable effect players. Home, Map, Profile, Tutorial, Spellbook, and prototype Victory use Forest Ambience; missions and prototype Battle use RPG Battle Theme II. Staying within the same theme does not restart it. Switching pauses the previous source before replacing it (no crossfade or overlapping music). Correct/incorrect effects follow validated submissions; completion fanfares follow the transition to mission results, after the explanation, or the prototype's victory transition. Reopening a completed mission does not play a fanfare; completing a fresh replay may celebrate without changing XP.

Playback pauses when the app becomes inactive/backgrounded or Android loses window focus, and resumes music when active. Pending effect seeks are invalidated when muted/backgrounded; old effects are not replayed. In-app audio controls are independent of the ringer silent/vibrate setting; native audio interruptions are respected. No microphone permissions or background playback are enabled. Plugin permission settings apply to native builds; Expo Go uses its own host permissions. Audio is optional and never controls gameplay or visible educational feedback.

Bundled music licensing and exact sources are in `assets/audio/CREDITS.md`. Four original effects are reproducible with `python scripts/create_audio.py`. Manual listening on Android/iOS hardware is still required to judge mix, loop seams, Bluetooth/headphone interruption behavior, and device-specific latency.


### Audio release cleanup (Stage 3F.5)

The temporary Test Sound control and playback diagnostics have been removed. Development warnings report playback failures using fixed source labels, without native messages, private data, or source URLs. Repeated identical native errors are deduplicated; users still see the audio-unavailable warning.

The physically verified Stage 3F.4.1 fixes remain: `playsInSilentMode: true`, explicit session activation, native readiness checks, cancellation of pending playback, and foreground/background handling. Normal gameplay events still trigger spell effects. Audio preferences and their storage format are unchanged. Physical-device listening must be retested to verify this cleanup on hardware.

## Valley of Decisions (Stage 3G.1)

World 2 opens only after all six Forest missions, including the Goblin King. The Crossroads teaches Booleans and all six comparison operators (70 XP); The Guardian’s Choice teaches if, else, indentation and branching (80 XP). Stage 3G.3A extends these with The Three Gates and The Twin Runes, each with three exercises and 30 XP. Map percentages describe the currently available missions. World selection updates the existing route; mission exits return to the owning world. No XP is awarded for viewing or replaying a mission.

Legacy progression uses the same `devquest.progression` key and version-1 completed-ID record. Existing mission IDs and rewards are unchanged. Profile statistics include both worlds; the current world is the latest world with a completed mission. Forest achievements and the 100-XP level formula are unchanged.

The new code-repair validator compares complete authored lines and tokens; it does not execute Python. It accepts harmless spacing, blank lines, CRLF, equivalent quotes and consistent indentation of 1–8 spaces (four spaces are taught). It supports only the authored single-depth if/else blocks, identifiers, integer literals and simple strings. Tabs, comments, escape sequences, nested blocks, extra statements and alternative algorithms are intentionally unsupported. Output and single-token exercises retain exact, case-sensitive answers.

See [Stage 3G.1 verification](docs/stage-3g1.md) for changed files, test results and device-testing limitations.

## Beginner learning loop (Stage 3G.2A)

The Awakening and The Crossroads now introduce concepts through short lesson cards with Python examples, output, an explanation and a key rule. New concepts appear once per attempt; completed-mission replays skip automatic lessons. Review Lesson remains available without losing the current answer or mission attempt.

The Awakening has four tappable questions and one five-character `print` answer. The Crossroads has five tappable questions. Multiple choice, missing tokens and output choices validate stable option IDs, never display labels. A correct tap casts the existing spell and reveals an explanation; Continue advances only after that feedback. Incorrect choices explain the misconception and allow retry without a penalty.

All mission/exercise IDs, rewards, save formats and Spellbook links remain unchanged. The other 30 exercises retain their existing content and input mode. See [Stage 3G.2A verification](docs/stage-3g2a.md) for compatibility checks, Android results and the remaining device checks.

### Variables and arithmetic (Stage 3G.2B)

Fire Essence and Mana Stones now use the same learning loop. All ten questions are tappable, with no keyboard entry. Three short lessons per mission introduce variable assignment, reassignment and text values, then addition/subtraction, multiplication and calculation order. Examples show real Python output and explain each step. Review Lesson, Spellbook, notes, spell feedback and replay behavior use the existing implementation.

Both missions retain their five exercise IDs and their 30/40 XP rewards. The other 30 exercises, including The Awakening and The Crossroads, are unchanged. See [Stage 3G.2B verification](docs/stage-3g2b.md) for the exercise summary, compatibility tests and device coverage.

### Strings and debugging (Stage 3G.2C)

Talking Trees and Broken Spells now each have five tap-based questions and three short concept lessons, with no keyboard entry. Strings retain joining, variable values, repetition, character counts and text-versus-number repair. Debugging covers name mistakes, matching punctuation, assignment and valid code that prints an unwanted result. Feedback explains the difference between syntax errors, undefined names and incorrect output.

The existing learning components, mission engine, IDs, 50/60 XP rewards, notes and save formats are unchanged. All other exercises and previous lessons are preserved. See [Stage 3G.2C verification](docs/stage-3g2c.md) for the exact changes and test coverage.

### Final assessments (Stage 3G.2D)

Goblin King's Lair now has four tap questions and one short `power` repair, with an optional Forest recap available before the first answer and throughout the fight. The Guardian's Choice has five tap questions and three lessons about if/indentation, skipped blocks and else branches. Complete code choices use monospace text and retain their leading spaces.

All forty exercises now have lesson or recap help: 38 use taps and two retain short identifier recall. Boss HP remains 100 with 20 damage per successful spell; rewards remain 100/80 XP once, and replay pays zero. IDs, saves, other content, combat and audio are unchanged. The strict Python-line validator remains available and regression-tested with its original authored exercises. See [Stage 3G.2D verification](docs/stage-3g2d.md) for details.


### Short Valley adventures (Stage 3G.3A)

Regular mission counters now follow their authored exercise arrays, supporting three, four or five spells through the existing engine. Goblin King remains five spells, 100 HP and 20 damage per success.

After The Guardian's Choice, The Three Gates teaches `elif` and first-match branching. It unlocks The Twin Runes, which teaches `and` and `or`. Both missions contain three tap questions, short introductory lessons, specific wrong-answer feedback and relevant Spellbook references. Each pays 30 XP once; replays pay zero. There are now 46 exercises (44 tap questions and two short typed answers), ten missions and seventeen Spellbook entries.

Existing saves retain their IDs, XP, notes and settings without migration. Valley percentages reflect its four available chapters; an old fully completed 450-XP save now shows 2/4 Valley chapters complete. Completing the new missions adds six completed exercises and brings the available total to 510 XP. See [Stage 3G.3A verification](docs/stage-3g3a.md) for changes, compatibility tests and Android coverage.


### Mirror of Truth (Stage 3G.3B)

After The Twin Runes, Mirror of Truth teaches Boolean `not` through three tap questions: predict a reversed Boolean, choose the missing keyword, and reveal the mirror passage with an `if not` condition. Two concise lessons introduce reversal and checking for absence, with automatic introductions skipped on completed replays. A new Spellbook reference explains both Boolean reversals and why `not` does not change the stored variable.

The mission awards 30 XP once; replay awards zero. Existing IDs, content, rewards, saves, notes and settings remain unchanged. The map uses five available Valley chapters; a completed Stage 3G.3A save keeps 510 XP and 46 completed exercises while showing 4/5 (80%) Valley progress. Completing Mirror brings the available totals to 540 XP, eleven missions and 49 exercises (47 tap and two short typed answers), with 26 lessons and eighteen Spellbook references. See [Stage 3G.3B verification](docs/stage-3g3b.md).


### The Decision Keeper (Stage 3G.3C)

The sixth Valley chapter is a final boss unlocked after Mirror of Truth. Five tap trials assess comparison boundaries, first-match branches, and/or, not with indentation, and a final repaired condition. One optional recap is available throughout the encounter; it is never a mandatory introduction. The existing Spellbook entries and notes support all five exercises.

The original stone guardian has 100 HP, loses 20 per validated correct spell, and awards 100 XP once. Replays award zero. Victory reveals WORLD 2 CLEARED; map clear status requires the boss and all registered Valley chapters. Goblin King retains its original artwork, animations, five spells and 100/20 balance.

There are now twelve missions, 54 exercises (52 tap and two short typed answers), 27 lessons, eighteen Spellbook references and 640 available XP. A completed Stage 3G.3B save keeps 540 XP, 49 exercises and one boss, with Valley showing 5/6 (83%) until the Keeper is defeated. Afterward Profile shows 54 exercises, twelve missions and two bosses. No save migration is required. See [Stage 3G.3C verification](docs/stage-3g3c.md).


### Loop Caverns foundation (Stage 3H.1)

Complete all six Valley chapters, including The Decision Keeper, to enter World 3. The Repeating Road teaches repeated actions and the indented `for` body; Lanterns of Range teaches zero-based values, the excluded stop and `range(start, stop)`. Each has three tap questions and awards 30 XP once, with zero replay XP. Four concise lessons introduce concepts before practice, and two Spellbook references support review and exercise notes.

The shared map adds teal crystal scenery and a responsive three-world selector. Locked world links show their requirement without exposing an enterable chapter path. Mission returns retain the owning world. Completing both Caverns chapters means AVAILABLE CHAPTERS COMPLETE / UP TO DATE; a future final boss is not part of this stage.

Current totals: three worlds, fourteen missions, sixty exercises (58 tap, two typed), 31 lessons, twenty Spellbook references and 700 available XP. Old 640-XP saves unlock Caverns automatically without migration; Forest and Valley content, rewards and bosses are unchanged. See [Stage 3H.1 verification](docs/stage-3h1.md).

### Interactive Code Builder (Stage 3H.2)

Echo Bridge follows Lanterns of Range; Counting Tower follows Echo Bridge. Each adds three exercises and awards 40 XP once, with zero replay XP. Four Code Builder puzzles let players tap prewritten fragments into order, undo or reset, and explicitly Cast Spell. Indentation is preserved, no keyboard is needed, and help/Spellbook views retain the arrangement. Validation checks authored fragment IDs and never executes Python.

Two lessons teach loop assembly, execution order and range boundaries. The existing for/range Spellbook entries support all six new exercises. Current totals are three worlds, sixteen missions, 66 exercises (60 choices, four builders, two typed), 33 lessons, twenty references and 780 available XP. A completed 700-XP save retains its rewards and shows 2/4 available Caverns chapters until the new missions are completed. World 3 still has no final boss and displays UP TO DATE at 4/4. See [Stage 3H.2 verification](docs/stage-3h2.md).

### While loops and the Stopping Crystal (Stage 3H.3)

The Endless Echo follows Counting Tower and teaches checking a while condition, zero repetitions and counter updates. The Stopping Crystal follows it, teaching termination, countdowns and repairing a while loop to match a finite for loop. Each has three exercises and pays 40 XP once, zero on replay. Four lessons introduce the concepts before assessment; two four-fragment puzzles reuse Code Builder. A new while-loop Spellbook entry supports all six questions. Every program remains display-only text, including examples of nontermination.

Current totals: three worlds, eighteen missions, 72 exercises (64 choices, six builders, two typed), 37 lessons, 21 references and 860 available XP. Existing 780-XP saves keep their records and show 4/6 (67%) available Caverns progress. Both new completions reach 6/6 and UP TO DATE; no Caverns boss or permanent clear is added. See [Stage 3H.3 verification and manual checklist](docs/stage-3h3.md).


### The Eternal Loop (Stage 3H.4)

The seventh Loop Caverns chapter unlocks after The Stopping Crystal. The Loop Warden combines three choice questions and two Code Builder puzzles to assess range boundaries, indentation, execution order and finite while loops. One optional recap is available before and during combat; it never opens automatically. All code remains display-only text.

Original cyan crystal and stone artwork accompanies HP derived from validated answers: 100 → 80 → 60 → 40 → 20 → 0. Explicit successful casts trigger damage; editing fragments, wrong answers and duplicate taps do not. First completion awards 100 XP, replay zero. Completing all seven chapters displays WORLD 3 CLEARED and adds the third defeated boss to Profile.

Current totals: three worlds, nineteen missions, 77 exercises (67 choices, eight builders, two typed), 38 lessons, 21 Spellbook references and 960 available XP. A completed 860-XP save retains all progress and shows 6/7 (86%) Caverns completion until the Warden is defeated. No save migration or dependency change is required. See [Stage 3H.4 verification and physical-device checklist](docs/stage-3h4.md).


### List Archipelago foundation (Stage 3I.1)

World 4 unlocks after all seven Loop Caverns missions, including The Loop Warden. The shared four-world map adds turquoise sea, original island/chest/bridge artwork and a wrapping selector. Treasure Inventory teaches list syntax and displaying a collection; Index Island teaches zero-based positions and len(). Each mission has three touch exercises, including a three-fragment Code Builder, and pays 30 XP once, zero on replay. Four short lessons introduce each concept before assessment; two Spellbook entries support review and stable exercise notes.

Current totals: four worlds, 21 missions, 83 exercises (71 choices, ten builders, two typed), 42 lessons, 23 references and 1020 available XP. Existing 960-XP saves unlock World 4 without migration. Its two available chapters end at UP TO DATE / AVAILABLE CHAPTERS COMPLETE; there is no World 4 boss or permanent clear yet. Existing worlds, bosses, rewards, saved formats and audio are unchanged. See [Stage 3I.1 verification and manual Android checklist](docs/stage-3i1.md).


### Growing chests and inventory updates (Stage 3I.2)

After Index Island, The Growing Chest teaches append(): add one item at the end of the existing list and increase its length by one. The Smith's Exchange follows it and teaches indexed assignment: replace an existing item while keeping the same length. Each mission has three touch exercises, including a three-line Code Builder, and rewards 40 XP once, zero on replay. Four concise lessons introduce the operations before assessment, and two new Spellbook references preserve exercise-linked notes.

Current totals: four worlds, 23 missions, 89 exercises (75 choices, twelve builders, two typed), 46 lessons, 25 Spellbook entries and 1100 maximum XP. A completed 1020-XP save keeps all records and shows 2/4 Archipelago chapters; new completions bring 1060 then 1100 XP. Completing all four available chapters displays UP TO DATE, with no World 4 boss or permanent clear. Engine, navigation, audio, old content and save formats are unchanged. See [Stage 3I.2 verification and physical Android checklist](docs/stage-3i2.md).

### Island Expedition and list iteration (Stage 3I.3)

Island Expedition follows The Smith's Exchange and teaches visiting list values in order, the current loop variable and the indented body. The Supply Run follows it and combines append or indexed replacement before inspecting the updated list. Each mission contains three touch exercises and awards 40 XP once, zero on replay. Four short lessons, two Code Builder puzzles (three and four fragments), and one list-iteration Spellbook reference reuse the existing learning flow. Python remains display-only text.

Current totals: four worlds, 25 missions, 95 exercises (79 choices, fourteen builders, two typed), 50 lessons, 26 references and 1180 maximum XP. A completed 1100-XP save remains valid and shows 4/6 Archipelago chapters; new completions bring 1140 then 1180 XP. At 6/6, World 4 is UP TO DATE, awaiting a future boss. Earlier content, rewards, engines, save formats and audio remain unchanged. See [Stage 3I.3 verification and manual checklist](docs/stage-3i3.md).

### The Treasure Guardian (Stage 3I.4)

The seventh List Archipelago chapter follows The Supply Run. An original stone-and-gold vault guardian with turquoise crystals guards the final list assessment: three choice questions and two Code Builder puzzles covering indexing, append/length, replacement and direct iteration. One optional recap is available throughout combat. No new Python syntax or execution engine is introduced.

Boss HP follows validated answers: 100 → 80 → 60 → 40 → 20 → 0. Wrong answers, fragment edits and duplicate submissions do not damage it. First completion grants 100 XP; replay grants zero. The vault opens and releases its core on defeat; reduced motion uses the final pose immediately. Completing all seven chapters shows WORLD 4 CLEARED and the fourth boss victory in Profile.

Current totals: four worlds, 26 missions, 100 exercises (82 choices, sixteen builders, two typed), 51 lessons, 26 references and 1280 maximum XP. A completed 1180-XP save retains its records and shows 6/7 (86%) Archipelago completion until the Guardian is defeated. Save formats, earlier content/bosses and audio remain unchanged. See [Stage 3I.4 verification and physical-device checklist](docs/stage-3i4.md).

### Function Forge foundation (Stage 3J.1)

World 5 unlocks after all seven List Archipelago chapters, including The Treasure Guardian. The existing wrapping world picker adds Function Forge with an original glowing anvil, enchanted hammer and blue-purple runes. The Silent Anvil teaches defining versus calling a function; The Rune Engraver teaches one parameter receiving different arguments. Each mission contains three touch exercises and awards 30 XP once, zero on replay. Four short lessons, two three-fragment Code Builders and two Spellbook entries reuse the current learning flow. Python remains display-only text.

Current totals: five worlds, 28 missions, 106 exercises (86 choices, eighteen builders, two typed), 55 lessons, 28 references and 1340 maximum XP. A completed 1280-XP World 4 save unlocks the Forge without migration. New completions bring 1310 then 1340 XP. At 2/2 available chapters the Forge is UP TO DATE; there is no World 5 boss or permanent clear. All four earlier worlds, bosses, rewards and saved data formats remain unchanged. See [Stage 3J.1 verification and manual checklist](docs/stage-3j1.md).
