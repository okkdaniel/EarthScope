# Architecture

EarthScope is structured around a strict separation between **the Electron shell**
(privileged, native), **the renderer** (the React UI), and a **shared, runtime-
agnostic core**. Rendering logic never contains API logic, and business logic never
depends on the UI.

```
┌────────────────────────────────────────────────────────────────┐
│                         Electron Main                            │
│  window · menu · settings store · event cache · IPC handlers     │
│                          (src/main)                              │
└───────────────▲───────────────────────────────┬─────────────────┘
                │  typed IPC (src/shared/ipc.ts) │
┌───────────────┴───────────────────────────────▼─────────────────┐
│                     Preload (context bridge)                     │
│         exposes a narrow, typed `window.earthscope`              │
│                        (src/preload)                             │
└───────────────▲──────────────────────────────────────────────── ┘
                │
┌───────────────┴─────────────────────────────────────────────────┐
│                          Renderer (React)                        │
│  features/ · components/ · hooks/ · state/ (Zustand) · api/       │
│                       (src/renderer)                             │
└──────────────────────────────────────────────────────────────── ┘

        shared, no framework/runtime imports (src/shared)
   models · providers (EONET + registry) · services · utils
```

## Layers

### `src/shared` — the core

Pure TypeScript with **no Electron and no React imports**. This is where the value
lives and where testing is concentrated.

- **`models/`** — the domain: `NaturalEvent`, `EventCategory`, `GeoPoint`, `AppSettings`.
- **`providers/`** — the data abstraction. `DataProvider` is the contract; `EonetProvider`
  is the reference implementation; `ProviderRegistry` aggregates many providers and
  merges/deduplicates their results.
- **`services/`** — business logic: aggregation/analytics (`aggregate.ts`) and
  filtering/search (`search.ts`).
- **`utils/`** — geo math, time formatting, and a `Result` type for error handling.
- **`ipc.ts`** — the single source of truth for IPC channel names and payload types.

### `src/main` — the Electron shell

Owns all privileged operations: window lifecycle, the application menu, disk
persistence (settings + offline cache), notifications, and the IPC handlers that call
the provider registry. The renderer cannot touch the network or filesystem directly.

### `src/preload` — the bridge

Exposes exactly one object, `window.earthscope`, matching the `EarthScopeBridge`
interface. Context isolation is on and Node integration is off, so this narrow surface
is the renderer's only path to native capability.

### `src/renderer` — the UI

Organised by **feature**, not by file type:

```
renderer/src/
  api/         client wrapper over the bridge + React Query client
  components/  cross-feature UI (ui primitives, common, layout)
  features/    dashboard · explore (+ globe) · timeline · analytics · settings · about · search · events · event-detail
  hooks/       data + interaction hooks (useEvents, useFilteredEvents, useKeyboardShortcuts, …)
  state/       Zustand stores (ui, filter, settings, bookmarks)
  utils/       renderer-only helpers (cn, export)
```

## Key flows

### Fetching events

1. `useEvents` (React Query) calls `client.fetchEvents(...)`.
2. The preload bridge forwards it over IPC to the main process.
3. `ipc.ts` in main asks the `ProviderRegistry` to `fetchAll`.
4. On success, results are written to the offline cache and returned.
5. On failure, the cached snapshot is returned with an attached error, so the UI can
   show "cached data" rather than an empty screen.

A single broad query backs the whole app; **filtering and search run client-side**
against the cache for instant interaction.

### Rendering the globe

- The Earth's coastlines and borders are generated once from bundled `world-atlas`
  TopoJSON into line geometry on a unit sphere (`globe/geo/worldGeometry.ts`).
- Every event is a vertex in a single `THREE.Points` cloud; a custom shader
  (`shaders/markerShader.ts`) animates each category's distinct visual language and
  keeps the whole set to one draw call.
- Camera focus, selection, and filtering are driven by the Zustand `uiStore`, so the
  3D scene and the surrounding React UI share one source of truth.

## Adding a new data provider

The data layer is intentionally future-proof. To add, e.g., an earthquake feed:

1. Implement `DataProvider` in `src/shared/providers/<name>/`.
2. Map the feed's records into `NaturalEvent` (reuse categories or extend
   `EVENT_CATEGORY_IDS`).
3. Register it in `createDefaultRegistry`.

No UI, state, or IPC changes are required — the registry merges and deduplicates
across providers automatically.

## Testing strategy

Core logic (`src/shared`) is covered by fast, UI-free unit tests (Vitest): the EONET
mapper's defensive parsing, analytics aggregation, filtering/ranking, and geo/time
utilities. Because these modules never import Electron or React, they run in
milliseconds and document the intended behaviour.
