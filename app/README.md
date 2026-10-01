# LAZLAB Hub — app folder

The installable Neural Command Hub. User-facing overview, install steps and screenshots are in the
[root README](../README.md). This file is the technical reference for this folder.

| File | Role |
|---|---|
| `index.html` | The entire app (HTML + CSS + vanilla JS). Links `manifest.webmanifest`, registers `sw.js` with scope `./`. |
| `manifest.webmanifest` | Identity: `id` `/lazlab/app/`, `scope` `./`, standalone display, 192/512 + maskable icons, shortcuts, screenshots. |
| `sw.js` | Offline + caching (see below). |
| `icons/` | `icon-192`, `icon-512`, maskable 192/512, `apple-touch-icon` (180), plus 96/144 for tab/tile use. |
| `screenshots/` | 1280×800 (wide) and 390×844 (narrow) images for the richer install dialog. |

## Service worker

- **Precache (required):** `./`, `index.html`, manifest, icons. If any file is missing the install fails loudly instead of shipping a half-cached app.
- **Precache (best-effort):** JSZip, html2canvas, jsPDF from cdnjs. A CDN hiccup never blocks install.
- **Navigations:** network-first, 4 s budget, falls back to the cached shell.
- **Same-origin assets and CDN/font hosts:** stale-while-revalidate.
- **Never touched:** `api.groq.com` and any other origin.
- **Cache hygiene:** only `lazlab-hub-*` caches are ever deleted. This origin (`johnlaz.github.io`) is shared by every app, so the worker must not clean up caches it didn't create.

## Release checklist

1. Bump `APP_VER` in `index.html`.
2. Bump `VERSION` in `sw.js`.
3. If you change `manifest.webmanifest`, keep `id` stable — changing it makes browsers treat the app as a *different* app.
4. Open the Hub, check the **App Mode** light on the home screen: **Installed app · offline ready** (or **Browser tab · offline ready**).

## Hash shortcuts

`/app/#portfolio` opens the portfolio, `/app/#debug` the debug view. The manifest's long-press shortcuts use these.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Old UI after a deploy | Reload once (the new worker takes over immediately). Still stale? DevTools → Application → Service Workers → **Unregister**, then Storage → **Clear site data** *for this path only*. |
| No install button | Must be served over HTTPS (GitHub Pages is). Not offered if already installed or on Firefox desktop. Safari: use Share → Add to Home Screen. |
| Wrong icon on the home screen | iOS caches the icon at add-time. Remove the app and add it again. |
| Hub opens inside the Studio app window | Install **LAZLAB Hub** from `/app/`; the two are separate apps with separate ids. |
