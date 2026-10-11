# DevQuest

A local, playable Expo fantasy RPG that teaches beginner Python concepts. The Forest of Variables map leads to six five-exercise missions with locally saved progression. The original three-spell Goblin battle remains playable from Home.

## Run in Expo Go

1. Install Node.js and the [Expo Go](https://expo.dev/go) app on an Android or iOS phone.
2. From this folder, run `npm install` and then `npx expo start`.
3. Scan the QR code with Expo Go on Android or the Camera app on iOS. Keep the phone and computer on the same network. If local network discovery fails, run `npx expo start --tunnel`.

## Checks

Run `npx tsc --noEmit` for strict TypeScript checking, `npm run lint` for the Expo lint check, and `npm test` for mission, progression, content, and battle logic.

## Structure

- `src/app`: Home, Python tutorial, Spellbook, World Map, world mission, Battle, and Victory routes.
- `src/components`: reusable game UI and original shapes-based character art.
- `src/game`: battle data and reducer, world content, Spellbook lessons, pure exercise validation, mission submissions, progression logic, and separate local progression, onboarding, and notes storage.
- `src/theme.ts`: visual theme colors.

Answers are checked against local challenge data; no Python code is executed. Completed world missions are saved locally, so earned XP and chapter unlocks survive relaunch. All five mission spells must be solved before the configured XP is awarded and the next chapter unlocks. An unfinished attempt restarts from its first spell. Replays remain available without awarding XP again. The Goblin prototype has its own battle and Victory flow; its decorative reward is separate from world mission XP.

New players see a three-screen Python introduction. Skip and Start Adventure save its completion under a separate local key; players with completed missions bypass it. Learn Python on Home reopens it.

The Spellbook on Home contains nine short Python references. Each world mission can open the relevant entry without leaving the current exercise. Personal notes are tied to exercise IDs and saved locally with an explicit Save Note action; they can be edited or deleted and do not affect XP or progression.

The final Forest mission is a Goblin King encounter. Its HP starts at 100 and falls by 20 for each correctly solved exercise. Boss HP is derived from the mission attempt; XP and World 1 completion still use the existing progression system. Replaying the boss earns no additional XP.

The battle screen scrolls on shorter phones. With the keyboard open, the answer and Cast Spell button should remain reachable; the keyboard's Done action also submits the answer.
