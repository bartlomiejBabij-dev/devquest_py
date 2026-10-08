# DevQuest project guide

DevQuest is a mobile-first fantasy RPG for learning Python. Stages 1 and 2 form a local three-screen playable prototype with responsive battle UI and combat polish.

- Stack: Expo SDK, React Native, strict TypeScript, Expo Router, and React Native StyleSheet. Keep Expo Go compatibility.
- Keep route screens in `src/app`, shared UI in `src/components`, theme in `src/theme.ts`, and challenge data and pure battle logic in `src/game`.
- Keep combat animation code in UI hooks or components, separate from the deterministic battle reducer.
- Keep gameplay deterministic. Never execute player-entered Python code or use a model to judge answers.
- Add future stages incrementally; do not add backend services, subscriptions, or other product systems before their stage is requested.
- Keep user-facing copy in English and verify with `npx tsc --noEmit` and `npm run lint`.
