# AETHEREA — 3D Browser MMORPG

> A real-time 3D massively-multiplayer RPG that runs entirely in the browser, built with React, TypeScript, and WebGL/Three.js.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)

---

## Features

- **3D World** — WebGL-powered environment rendered with Three.js
- **WASD Movement** — smooth first/third-person character locomotion
- **Mouse-Lock Controls** — pointer-lock API for immersive camera control
- **RPG Stats** — real-time HP and XP tracking displayed on HUD
- **Combat System** — engage enemies with attack mechanics and damage feedback
- **Game Phases** — distinct Menu, Playing, and Game-Over states with transitions
- **MMORPG Foundation** — architecture designed to support multiplayer expansion

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Language | TypeScript |
| 3D Engine | Three.js / WebGL |
| State Management | React hooks + context |
| Input | Keyboard events + Pointer Lock API |

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and click **Play** to enter the world.

### Controls

| Key / Input | Action |
|-------------|--------|
| `W A S D` | Move character |
| Mouse | Look / rotate camera |
| `Click` | Attack / interact |
| `Escape` | Pause / release mouse lock |

## Project Structure

```
src/
├── App.tsx           # Game lifecycle & phase management
├── components/
│   ├── GameCanvas    # Three.js WebGL renderer
│   ├── HUD           # HP / XP overlay
│   ├── Menu          # Start / game-over screens
│   └── ...
├── systems/
│   ├── movement      # WASD + mouse-look logic
│   ├── combat        # Attack & damage resolution
│   └── stats         # HP / XP state
└── types/            # Shared TypeScript interfaces
```

## License

MIT
