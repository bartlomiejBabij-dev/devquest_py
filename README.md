# DevQuest

A local, playable Expo fantasy RPG that teaches beginner Python concepts. The Forest of Variables map leads to six five-exercise missions with locally saved progression. The original three-spell Goblin battle remains playable from Home.

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

Answers are checked against local challenge data; no Python code is executed. Completed world missions are saved locally, so earned XP and chapter unlocks survive relaunch. All five mission spells must be solved before the configured XP is awarded and the next chapter unlocks. An unfinished attempt restarts from its first spell. Replays remain available without awarding XP again. The Goblin prototype has its own battle and Victory flow; its decorative reward is separate from world mission XP.

New players see a three-screen Python introduction. Skip and Start Adventure save its completion under a separate local key; players with completed missions bypass it. Learn Python on Home reopens it.

The Spellbook on Home contains nine short Python references. Each world mission can open the relevant entry without leaving the current exercise. Personal notes are tied to exercise IDs and saved locally with an explicit Save Note action; they can be edited or deleted and do not affect XP or progression.

My Profile saves only a trimmed 3–20 character nickname and one of five local avatars under `devquest.profile.v1`. Saves are explicit and queued. Missing or damaged profiles fall back to Python Apprentice/Mage; unreadable or future-version saves are protected from replacement. Profile editing never writes to progression, notes, or onboarding.

Profile and Home XP come from completed mission IDs using the existing XP selector. Completed exercises count unique exercises belonging to completed missions; unfinished attempts and prototype battles do not count. Boss victories count the completed Goblin King mission. Display-only level is `1 + floor(total XP / 100)`, with progress toward the next 100 XP. Achievements require completing the first mission, three Forest chapters, Broken Spells, and the Goblin King respectively; they grant no rewards.

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
