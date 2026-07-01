# Build resources

electron-builder reads packaging assets from this directory (`buildResources`).

Add the following before producing signed, store-ready installers:

| File            | Purpose                                   | Recommended size |
| --------------- | ----------------------------------------- | ---------------- |
| `icon.icns`     | macOS application icon                    | 1024×1024        |
| `icon.ico`      | Windows application icon                  | 256×256          |
| `icon.png`      | Linux application icon                    | 512×512          |
| `background.png`| macOS DMG background (optional)           | 540×380          |

Until platform icons are added, electron-builder falls back to the default
Electron icon. This does not affect development (`npm run dev`) in any way.
