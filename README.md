<div align="center">

# 🌍 EarthScope

**Explore real-time natural events across Earth.**

A polished, cross-platform desktop application for visualising wildfires, volcanoes,
storms, floods and more on a calm, interactive globe — powered by NASA's
[EONET](https://eonet.gsfc.nasa.gov) API.

[Getting Started](#getting-started) · [Features](#features) · [Architecture](docs/ARCHITECTURE.md) · [Development](docs/DEVELOPMENT.md)

</div>

---

## Overview

EarthScope is a native desktop app (Electron + React + TypeScript) designed to feel
like professional engineering software — think Linear, Arc, or FlightRadar24 — not a
web page wrapped in a shell. A vector-style globe is the centrepiece; every other
surface (dashboard, timeline, analytics) exists to help you understand what is
happening on it.

## Features

- **Interactive vector globe** — a calm, readable Earth with thin coastlines and
  country borders, a soft atmosphere, and a starfield. Inertial rotation, zoom, and
  smooth "fly-to" camera transitions.
- **Live event visualisation** — hundreds of events rendered in a single GPU draw
  call, each category with its own animated visual language (ember flicker, rotating
  storm, expanding flood ripple, …).
- **Dashboard** — an at-a-glance overview of global activity with recent events and a
  category breakdown.
- **Explore** — a docked event list, instant filtering, and a detail panel with
  timeline, location, updates, and links to NASA resources.
- **Timeline** — scrub or play back time and watch events appear and resolve.
- **Analytics** — trends over time, by category and by continent, with CSV/JSON export.
- **Command palette** (`⌘/Ctrl + K`) — search events and jump anywhere with the keyboard.
- **Offline-first** — recent data is cached; the app degrades gracefully and resyncs
  when back online.
- **Settings** — refresh interval, theme, animation speed, globe behaviour,
  notifications, cache size, and opt-in telemetry (off by default).

## Tech Stack

| Concern        | Choice                                            |
| -------------- | ------------------------------------------------- |
| Shell          | Electron 31                                       |
| UI             | React 18 + TypeScript (strict)                    |
| Build          | Vite via `electron-vite`                          |
| Styling        | Tailwind CSS                                       |
| 3D             | Three.js + React Three Fiber + drei               |
| Motion         | Framer Motion                                     |
| State          | Zustand                                            |
| Data           | TanStack Query                                     |
| Charts         | Recharts                                           |
| Geodata        | `world-atlas` (bundled TopoJSON), `topojson-client`|
| Testing        | Vitest + Testing Library                          |

> **Why Electron over Tauri?** EarthScope leans heavily on the mature JS 3D
> ecosystem (React Three Fiber, drei) and ships identical rendering across
> platforms. Electron keeps that stack first-class. The architecture isolates all
> platform/native code behind a typed IPC bridge, so a future Tauri port would only
> need to reimplement `src/main` — the renderer and `src/shared` are runtime-agnostic.

## Getting Started

### Prerequisites

- Node.js **20+**
- npm **10+**

### Install & run

```bash
npm install
npm run dev
```

The app launches with hot-reloading for the renderer and main process.

### Useful scripts

| Script                | Description                                  |
| --------------------- | -------------------------------------------- |
| `npm run dev`         | Run the app in development                   |
| `npm run build`       | Typecheck + build all three processes        |
| `npm run test`        | Run the unit test suite                      |
| `npm run test:watch`  | Watch-mode tests                             |
| `npm run lint`        | ESLint                                       |
| `npm run typecheck`   | TypeScript, no emit                          |
| `npm run package`     | Build an unpacked app (no installer)         |
| `npm run make`        | Build installers for the current platform    |
| `npm run make:win`    | Windows installer (NSIS)                      |
| `npm run make:mac`    | macOS DMG                                     |
| `npm run make:linux`  | Linux AppImage + deb                          |

See [docs/INSTALL.md](docs/INSTALL.md) for packaging and distribution details, and
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the pieces fit together.

## Data & Attribution

Event data is provided by NASA's Earth Observatory Natural Event Tracker (EONET).
EarthScope is an independent project and is **not affiliated with or endorsed by
NASA**.

## License

[MIT](LICENSE) © 2026 EarthScope
