# DevQuest — Stage 2 prototype

A local, playable Expo prototype of a fantasy RPG that teaches beginner Python concepts through a three-spell battle. Stage 2 adds responsive battle layout, keyboard-aware scrolling, combat effects, and a victory reward reveal.

## Run in Expo Go

1. Install Node.js and the [Expo Go](https://expo.dev/go) app on an Android or iOS phone.
2. From this folder, run `npm install` and then `npx expo start`.
3. Scan the QR code with Expo Go on Android or the Camera app on iOS. Keep the phone and computer on the same network. If local network discovery fails, run `npx expo start --tunnel`.

## Checks

Run `npx tsc --noEmit` for strict TypeScript checking and `npm run lint` for the Expo lint check.

## Structure

- `src/app`: three Expo Router screens.
- `src/components`: reusable game UI and original shapes-based character art.
- `src/game`: challenge data, pure battle reducer, and in-memory game context.
- `src/theme.ts`: visual theme colors.

Answers are checked against local challenge data; no Python code is executed. Progress is kept only in memory and resets on relaunch.

The battle screen scrolls on shorter phones. With the keyboard open, the answer and Cast Spell button should remain reachable; the keyboard's Done action also submits the answer.
