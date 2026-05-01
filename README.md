# Homebase

A customizable, widget-based new tab for Chrome. Built as an MV3 extension with Vite + React + TypeScript.

## Features

- Drag-and-drop widget grid (responsive breakpoints: `lg`, `md`, `sm`)
- Separate **view** and **edit** modes — toggle via the right rail, `E` hotkey, or `⌘K`
- Per-widget size presets (S / M / L / XL) and configuration popovers
- **Themes**: Indigo, Emerald, Amber, Rose, and more
- **Command palette** (`⌘K` / `Ctrl+K`) — add widgets, switch theme, toggle modes
- **Focus mode** (`F` hotkey)
- Settings synced across devices via `chrome.storage.sync`
- Optional **managed-homepage redirect** for enterprise policies
- Export / import settings as JSON

## Widgets

| Widget           | Source                                    |
| ---------------- | ----------------------------------------- |
| Clock & date     | Local, with time-based greeting           |
| Calendar         | Offline monthly calendar                  |
| Quick Links      | Curated tiles with auto-fetched favicons  |
| Notes            | Persistent scratchpad                     |
| Todos            | Checklist                                 |
| Browser history  | Chrome history API                        |
| Reading list     | Chrome reading list API                   |
| Downloads        | Chrome downloads API                      |
| Weather          | Open-Meteo (no key)                       |
| Air quality      | Open-Meteo Air Quality API                |
| World clocks     | Open-Meteo geocoding                      |
| Currency         | Frankfurter API                           |
| Dictionary       | dictionaryapi.dev                         |
| Unit converter   | Local (length, weight, temp, speed, etc.) |
| News             | Reddit + Hacker News (Algolia fallback)   |

## Build & load

Requires Node 18+.

```bash
npm install
npm run build
```

Then in Chrome:

1. Open `chrome://extensions`
2. Toggle **Developer mode** on
3. Click **Load unpacked** and pick the `dist/` folder
4. Open a new tab

For live development:

```bash
npm run dev
```

To produce an upload-ready zip for the Chrome Web Store:

```bash
npm run package
# → releases/homebase-v<version>.zip
```

## Keyboard shortcuts

| Key             | Action                    |
| --------------- | ------------------------- |
| `⌘K` / `Ctrl+K` | Command palette           |
| `E`             | Toggle customize mode     |
| `F`             | Toggle focus mode         |
| `Esc`           | Close open dialog/palette |

## Storage & permissions

- `storage` — sync state across devices
- `tabs`, `webNavigation` — for the optional managed-homepage redirect
- `history`, `readingList`, `downloads` — for the respective widgets

No telemetry, no third-party scripts. Network calls go directly from your browser to:

- `hacker-news.firebaseio.com`, `hn.algolia.com` (news)
- `www.reddit.com` (news)
- `api.open-meteo.com`, `geocoding-api.open-meteo.com`, `air-quality-api.open-meteo.com` (weather + AQI + geocoding)
- `api.frankfurter.app` (currency)
- `api.dictionaryapi.dev` (dictionary)
- `www.google.com/s2/favicons` (favicon images)

See [PRIVACY.md](./PRIVACY.md) for the full privacy policy.

## Managed-homepage redirect

If your org uses a Chrome Enterprise policy to force a corporate homepage on every new tab, enable **Advanced settings → Managed Homepage Redirect** and list URL prefixes. Matching navigations are redirected to Homebase. Disabled by default.

## License

MIT.
