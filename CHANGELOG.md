# Changelog

All notable changes to EarthScope are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial application: Electron + React + TypeScript desktop shell.
- Interactive vector globe (React Three Fiber) with coastlines, country borders,
  atmosphere glow, starfield, inertial controls and smooth fly-to.
- GPU-instanced event markers with per-category animated visual language.
- NASA EONET provider behind a pluggable `DataProvider` abstraction and registry.
- Offline-first data layer with retries, timeouts, caching and graceful fallback.
- Views: Dashboard, Explore, Timeline, Analytics, Settings, About.
- Command palette (⌘/Ctrl+K), keyboard shortcuts, bookmarks, CSV/JSON export.
- Desktop notifications for new events in chosen categories (opt-in per category).
- Persistent settings (theme, refresh interval, globe/animation behaviour, more).
- Unit test suite for the shared core (mapper, aggregation, search, geo/time).
- CI (lint · typecheck · test · cross-platform build) and tagged release workflow.
