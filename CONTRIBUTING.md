# Contributing to EarthScope

Thanks for your interest in improving EarthScope. This project values calm, intentional
software — please keep contributions aligned with that spirit.

## Getting set up

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for environment setup and scripts.

## Before opening a pull request

Run the full local check:

```bash
npm run lint
npm run typecheck
npm run test
```

All three must pass. CI runs the same checks plus a cross-platform build.

## Guidelines

- **Match the surrounding code.** Naming, comment density, and structure should be
  indistinguishable from neighbouring files.
- **Keep business logic in `src/shared`** and cover it with tests. UI should be thin.
- **Prefer clarity over cleverness.** Small components, explicit types, no magic values.
- **Design for calm.** New UI should follow the project's restraint: whitespace over
  borders, subtle motion, a single accent colour, saturated colour reserved for events.
- **Adding a data source?** Implement `DataProvider` and register it — no UI changes
  should be necessary (see [ARCHITECTURE.md](docs/ARCHITECTURE.md)).

## Commit messages

Use clear, imperative summaries (e.g. "Add continent filter to analytics"). Group
related changes; avoid noisy formatting-only diffs mixed with logic.

## Reporting bugs

Open an issue with steps to reproduce, expected vs. actual behaviour, your OS, and the
app version (see the About screen). For data issues, include the event id where
possible.
