# Assets

Static assets bundled into the renderer. Import them with the `@renderer` alias
so Vite fingerprints and inlines/copies them at build time (keeping the app
offline-first — nothing is fetched at runtime):

```ts
import wordmark from '@renderer/assets/brand/wordmark.svg'
```

## Layout

| Folder     | Contents                                                              |
| ---------- | -------------------------------------------------------------------- |
| `brand/`   | Wordmark, monogram, and the topographic contour mark (SVG).          |
| `patterns/`| Reusable background/texture SVGs (e.g. contour variants).            |
| `images/`  | Raster imagery — warm-neutral CAD renders / bench photography only.  |

## Conventions (per the design system)

- **Vector first.** Prefer SVG; it recolours cleanly with `currentColor` and
  stays crisp at any zoom.
- **No icon library.** Directional marks are drawn inline at 1px stroke in
  `src/renderer/src/components/editorial/Glyph.tsx`, not stored here.
- **Imagery is warm-neutral**, low-saturation — never cool-tone or high-contrast
  product shots. Images sit on the page with no border, shadow, or rounding.
- **Fonts are not here.** Typefaces load from the bundled `@fontsource` packages
  (see `src/renderer/src/main.tsx`), not from this folder.

> The brand contour mark currently renders procedurally from
> `components/editorial/ContourMark.tsx`. To swap in bespoke artwork, drop an SVG
> in `brand/` and point the component at it — nothing else needs to change.
