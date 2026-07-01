# Development guide

## Prerequisites

- Node.js 20+ and npm 10+
- Git

Platform build tooling is only needed when producing native installers; day-to-day
development requires nothing beyond Node.

## Setup

```bash
git clone https://github.com/earthscope-app/earthscope.git
cd earthscope
npm install
npm run dev
```

`electron-vite` starts the Vite dev server for the renderer and launches Electron with
the main/preload processes watched. Editing renderer code hot-reloads; editing main or
preload code restarts the Electron process automatically.

## Project layout

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full picture. In short:

- `src/shared` — framework-agnostic core (models, providers, services, utils)
- `src/main` — Electron main process
- `src/preload` — the context-bridge
- `src/renderer` — the React application

Path aliases (configured in `tsconfig.*.json` and `electron.vite.config.ts`):

- `@shared/*` → `src/shared/*` (usable from every process)
- `@renderer/*` → `src/renderer/src/*`

## Code style

- **TypeScript is strict.** Prefer explicit domain types over `any`.
- **Small components, clear names.** Match the density and idiom of surrounding code.
- **Comment the _why_, not the _what_.**
- Run `npm run lint` and `npm run format` before committing.

## Testing

```bash
npm run test          # once
npm run test:watch    # watch mode
npm run test:coverage # with coverage
```

Tests live next to the code they cover (`*.test.ts`). Keep business logic in
`src/shared` so it can be tested without the UI. When fixing a data bug, add a case to
`eonet.mapper.test.ts` or the relevant service test first.

## Typechecking

```bash
npm run typecheck        # both projects
npm run typecheck:web    # renderer only
npm run typecheck:node   # main/preload only
```

The renderer and the main/preload code are separate TypeScript projects with different
`lib`/`types`, so they are checked independently.

## Debugging

- **Renderer** — DevTools open with `View → Toggle Developer Tools` (or `Ctrl/Cmd+Alt+I`).
- **Main process** — set `EARTHSCOPE_DEBUG=1` to enable debug/info logging (see
  `src/main/logger.ts`).
- **Data** — the offline cache and settings are plain JSON under the app's `userData`
  directory (`app.getPath('userData')`); safe to inspect or delete.

## Working with the globe

The globe is deliberately texture-free. If you want to tune its look:

- Colours: `Earth.tsx` (ocean/coastline/border), `Atmosphere.tsx` (glow).
- Marker appearance and per-category motion: `shaders/markerShader.ts` and
  `markerVisuals.ts`.
- Camera behaviour: `CameraRig.tsx` and `globeConstants.ts`.

Keep motion subtle and easing natural — no bounce or elastic effects.
