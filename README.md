# Patchwork

An offline, voice-first daily journal for Indian languages + English.

## What it is

Patchwork is a personal journal where you speak a short voice note every day — a moment, a thought, a feeling — and it remembers your week for you: entries, your current streak, and your average mood.

- **Speak, don't type:** the Record button starts a mic session; Stop saves the note as an entry.
- **Fully offline:** audio + entries are stored on the device (app-private). No server, no login, no tracking, no cloud.
- **Mood detection:** the app reads your speech keywords in English and Indian languages (Hindi included; more to come).
- **Weekly recap:** entries, days active, streak, and average mood.

## Features

- **Voice notes** — Record → speak → Stop and save. Entries show time + mood.
- **Today** — wave hero + list of today's entries with mood labels.
- **This week** — WeekWave (a week-of-days wave: one accent-colored bar per day with entries) + recap line (streak, entries, average mood).
- **Mood labels** — `very good`, `good`, `calm`, `okay`, `low energy`, `sad`, `stressed` — detected from voice keywords in `src/core/journal.js`.
- **Pure logic, no server** — `src/core/journal.js` is dependency-free: mood scoring, entry creation, recap math (streak, average mood, top words). Unit tests run anywhere with `npm test`.

## Tech stack

| Piece | Used |
|---|---|
| App | React Native (Expo, SDK 58) — `App.js` |
| Voice recorder | `expo-audio` (React Native + Web compatible) |
| File storage | `expo-file-system` (app-private `Paths.document/Patchwork/`) |
| Wave hero (Today) | `src/Wave.js` — `@react-three/fiber` + `three` |
| Week wave (Recap) | `src/WeekWave.js` — `@react-three/fiber` + `three` |
| Icons | `src/icons.js` — `react-native-svg` |
| Core logic + tests | `src/core/journal.js`, `src/core/journal.test.js` |

## Design

- **Palette** (`App.js` tokens): paper `#F8F4EA`, surface `#FFFFFF`, ink `#1D1A16`, muted `#8C7D68`, accent `#8B4513` (rust), hairline `rgba(29, 26, 22, 0.07)`, error bg `#FBE6E1`, error text `#A23717`.
- **Typography**: sans-serif, body 15px, hero titles 26px, subtle weight (500) emphasis.
- **Shape**: rounded cards (radius 16), hairline separators, centered layout.
- **Vibe**: warm paper background, rust accent, minimalist — calm and confident rather than loud.

## Running

```bash
npm install
npm run ios          # or: npm run android
npm run web          # or: npx expo start --web
```

From a terminal:

```bash
npm install
npm test             # 8 core tests pass (node, zero deps)
npm start
```

## How it works

1. Tap **Record** → mic permission → speak → **Stop and save**. The entry is stored with its timestamp and a mood.
2. Open **Today**: the wave hero greets you and lists your entries (time + mood).
3. Open **This week**: the WeekWave shows the week so far; the recap line shows streak, entries, and average mood.

## Privacy & data

- All data is local. Entries live at `Paths.document/Patchwork/entries.json` on iOS/Android (the app's private documents directory).
- No network calls in the app — nothing is sent anywhere.
- Note (iOS): the Documents directory is iCloud-backed by default on Apple platforms — to keep the journal fully on-device, exclude it via system settings or a native "exclude from backup" mechanism.

## Contributing

- Run `npm test` before changes — all 8 core tests must pass.
- Want a new mood language? Add keywords to `MOOD_WORDS` in `src/core/journal.js` and a test in `src/core/journal.test.js`.

## License

MIT — see [LICENSE](LICENSE).
