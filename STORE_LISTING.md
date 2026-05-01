# Chrome Web Store Listing — Homebase

Copy/paste these fields into the Developer Dashboard when creating the item.

---

## Name (up to 75 chars)

```
Homebase — Customizable New Tab Dashboard
```

## Short description (up to 132 chars, shown in store tile)

```
A calm, customizable new tab. Clock, weather, todos, news, and more — drag, resize, and arrange widgets the way you want.
```

## Category

`Productivity`

## Language

`English (all)`

---

## Detailed description (up to 16,000 chars)

```
Homebase turns Chrome's new tab into your personal dashboard — a calm, drag-and-drop grid of widgets you arrange exactly the way you want.

━━━━━━━━━━━━━━━━━━━━
WIDGETS
━━━━━━━━━━━━━━━━━━━━
• Clock & greeting — time, date, personal greeting
• Calendar — offline monthly calendar
• Weather — current conditions + 3-day forecast (no sign-up)
• Air quality — live AQI + PM2.5/PM10 for your location
• World clocks — search any city, track multiple timezones
• Todos — quick checklist
• Notes — persistent scratchpad
• Quick Links — curated tiles with auto-fetched favicons
• Browser history — recently visited pages
• Reading list — Chrome reading list
• Downloads — recent downloads with clear-all
• News — filter by Tech, AI, Sports, Politics, World, Science, Business, Gaming, Movies, Local, India
• Unit converter — length, weight, temperature, volume, speed, time
• Currency converter — live exchange rates
• Dictionary — English word definitions

━━━━━━━━━━━━━━━━━━━━
DESIGN YOUR DASHBOARD
━━━━━━━━━━━━━━━━━━━━
• Drag-and-drop grid with responsive breakpoints
• Per-widget size presets (S / M / L / XL)
• Multiple themes
• Command palette (⌘K / Ctrl+K) for adding widgets and switching themes
• Focus mode (F) — quiet everything when you need to concentrate
• Settings sync across your devices via Chrome sync

━━━━━━━━━━━━━━━━━━━━
PRIVACY FIRST
━━━━━━━━━━━━━━━━━━━━
• No accounts, no sign-ups
• No telemetry or analytics
• No third-party trackers
• Your data never leaves your device (except to public, no-auth APIs your chosen widgets call: Open-Meteo for weather, Reddit and Hacker News for news, Frankfurter for currency, dictionaryapi.dev for definitions)
• Open source: https://github.com/ashwyn222/homebase
• Privacy policy: https://ashwyn222.github.io/homebase/privacy-policy.html

━━━━━━━━━━━━━━━━━━━━
KEYBOARD SHORTCUTS
━━━━━━━━━━━━━━━━━━━━
⌘K / Ctrl+K — Command palette
E — Toggle customize mode
F — Toggle focus mode
Esc — Close dialog

━━━━━━━━━━━━━━━━━━━━
WHY HOMEBASE?
━━━━━━━━━━━━━━━━━━━━
Most new-tab extensions either do too much (tracking, bloated features, ads) or too little (a static image). Homebase is the middle ground: a warm, personal start screen with the utilities you actually use, all local, all customizable, and none of the cruft.
```

---

## Permission justifications

Paste one-liner per permission in the Dev Console:

### `storage`
```
Saves your dashboard layout, theme, and widget configuration to Chrome's built-in storage so your setup persists across sessions and syncs across your devices. No data is sent to any external server.
```

### `history`
```
Used solely by the "Browser history" widget to display your recently visited pages inside the new tab. History data is read locally and never transmitted off-device.
```

### `readingList`
```
Used solely by the "Reading list" widget to display entries from Chrome's built-in reading list inside the new tab. Data is read locally and never transmitted off-device.
```

### `downloads`
```
Used solely by the "Downloads" widget to display recent downloads and allow the user to clear the download history. Data is read locally and never transmitted off-device.
```

### `tabs`
```
Required for the optional "Managed homepage redirect" feature (disabled by default). When the user enables it and lists URL prefixes, matching navigations in any tab are redirected to this new-tab page. No tab content is read or stored.
```

### `webNavigation`
```
Required for the optional "Managed homepage redirect" feature (disabled by default) to observe top-frame navigations and redirect matching URLs to this new-tab page. Navigation URLs are compared locally against user-provided prefixes and are never transmitted.
```

### Host permissions (the 9 domains listed)
```
Homebase fetches public data from each listed domain only when the user enables the corresponding widget: weather (api.open-meteo.com, geocoding-api.open-meteo.com, air-quality-api.open-meteo.com), news (hacker-news.firebaseio.com, hn.algolia.com, www.reddit.com), currency (api.frankfurter.app), dictionary (api.dictionaryapi.dev), and favicon images (www.google.com/s2/favicons). No authentication is used, no user data is sent in these requests, and the results are displayed inside the extension only.
```

---

## Single purpose (required field)

```
Homebase provides a single, unified purpose: replacing Chrome's new-tab page with a customizable dashboard of widgets that help the user start their browsing session — time, weather, todos, quick links, news, and related utilities.
```

---

## Data usage disclosures (certification checkboxes)

- [x] Homebase does **not** collect or use personally identifiable information
- [x] Homebase does **not** collect or use health information
- [x] Homebase does **not** collect or use financial or payment information
- [x] Homebase does **not** collect or use authentication information
- [x] Homebase does **not** collect or use personal communications
- [x] Homebase does **not** collect or use location information (note: if a user grants geolocation to the Weather/Air Quality widget, coordinates are used transiently to fetch a forecast and are not stored by Homebase)
- [x] Homebase does **not** collect or use web history (note: local `history` permission is used only to render inside the widget; nothing is transmitted)
- [x] Homebase does **not** collect or use user activity
- [x] Homebase does **not** collect or use website content

Required certifications:
- [x] I do not sell or transfer user data to third parties (outside of approved use cases)
- [x] I do not use or transfer user data for purposes unrelated to my item's single purpose
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes

---

## Store graphic assets you need to upload

| Asset           | Size                    | Required |
| --------------- | ----------------------- | -------- |
| Store icon      | 128 × 128 PNG           | Yes (already in `icons/icon128.png`) |
| Screenshot 1    | 1280 × 800 or 640 × 400 | Yes — at least 1 |
| Screenshot 2–5  | 1280 × 800 or 640 × 400 | Recommended |
| Small promo     | 440 × 280 PNG           | Optional but improves discoverability |
| Marquee promo   | 1400 × 560 PNG          | Optional |

### Screenshot shot list (suggested)

1. Dashboard overview — mix of Clock, Weather, Calendar, Todos, Notes visible
2. News widget — showing category filter pills and 2-column grid
3. Widget library / add-widget drawer
4. Edit mode — drag handle + size switcher visible
5. Theme picker open — show the color options

---

## Support / Homepage URLs

- Homepage: `https://github.com/ashwyn222/homebase`
- Support: `https://github.com/ashwyn222/homebase/issues`
- Privacy policy: `https://ashwyn222.github.io/homebase/privacy-policy.html`
