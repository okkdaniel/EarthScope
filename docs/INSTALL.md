# Installation & packaging

## For users

Download the installer for your platform from the
[Releases](https://github.com/earthscope-app/earthscope/releases) page:

| Platform | Artifact                            |
| -------- | ----------------------------------- |
| Windows  | `EarthScope-<version>-Setup.exe`    |
| macOS    | `EarthScope-<version>-<arch>.dmg`   |
| Linux    | `EarthScope-<version>.AppImage` / `.deb` |

### Windows

Run the `Setup.exe`. The NSIS installer lets you choose the install location. If
SmartScreen warns about an unsigned binary, choose **More info → Run anyway** (signed
builds require a code-signing certificate; see below).

### macOS

Open the `.dmg` and drag EarthScope to Applications. For unsigned local builds you may
need to right-click → **Open** the first time, or allow it under
**System Settings → Privacy & Security**.

### Linux

- **AppImage** — `chmod +x EarthScope-<version>.AppImage && ./EarthScope-<version>.AppImage`
- **deb** — `sudo dpkg -i EarthScope-<version>.deb`

## For maintainers

### Building installers locally

```bash
npm run make          # current platform
npm run make:win      # Windows (NSIS)
npm run make:mac      # macOS (DMG, universal x64 + arm64)
npm run make:linux    # Linux (AppImage + deb)
```

Artifacts are written to `release/`. Cross-compiling has caveats — macOS builds must
run on macOS; Windows/Linux can build on their own platform or via the CI matrix.

### Icons

Add platform icons under `build/` before shipping (see `build/README.md`). Without
them, electron-builder uses the default Electron icon.

### Code signing & notarisation

Signing is configured through electron-builder's standard environment variables,
provided as repository secrets in `.github/workflows/release.yml`:

- **Windows / macOS certificates** — `CSC_LINK`, `CSC_KEY_PASSWORD`
- **macOS notarisation** — `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`

### Releasing

Releases are automated. Pushing a semver tag triggers the release workflow, which
builds on all three platforms and publishes the installers to a GitHub Release:

```bash
npm version minor        # bumps package.json + creates a tag
git push --follow-tags
```
