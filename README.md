<div align="center">

<img src="docs/banner.svg" alt="LAZLAB Hub: where every experiment gets wired" width="920">

# LAZLAB Hub

**Load a build. Watch it break. Fix it faster.**<br>
The command bench for single-file web apps — installable, offline-ready, and entirely yours.

![PWA](https://img.shields.io/badge/PWA-installable-bc13fe?style=flat-square)
![Offline](https://img.shields.io/badge/offline-ready-22d3ee?style=flat-square)
![Local-first](https://img.shields.io/badge/data-stays%20on%20your%20device-39ff14?style=flat-square)
![No build step](https://img.shields.io/badge/build%20step-none-ff9500?style=flat-square)

**[▶ Launch the Hub](https://johnlaz.github.io/lazlab/app/)** &nbsp;·&nbsp; **[The Studio](https://johnlaz.github.io/lazlab/)**

<br>

<img src="app/screenshots/hub-debug-wide.png" alt="LAZLAB Hub running a live debug session: event feed, error fingerprints and stats" width="920">

</div>

---

## Why it exists

Shipping lots of small apps means debugging lots of small apps. Browser DevTools are built for one tab; your portfolio is
a drawer full of them. **LAZLAB Hub is the bench you drop each build onto** — it runs it in a sandbox, listens to everything
it does, and tells you what went wrong, in a form you can paste straight into your AI of choice.

No servers. No accounts. No installers. One file, one tap, and it lives on your home screen.

## What's on the bench

| | |
|---|---|
| **🔌 App slots** | Register each product once. Every slot has a **Stable** and a **Test** channel, so you can debug the new build without touching the shipping one. Promote Test → Stable when it earns it. |
| **📦 Load it any way** | Drop in a **ZIP**, a single **HTML** file, or point at a live **URL**. |
| **🛰 Live debug sessions** | A probe is injected into your build and streams **console output, network calls, clicks and uncaught errors** into a live feed. Flag the lines that matter. |
| **🧬 Error fingerprints** | Identical errors collapse into one row with a count, so a loop that fires 400 times doesn't bury the one error that started it. |
| **✦ AI triage** | One tap sends the session to **Groq** and returns a one-line summary, likely root causes, the click path that triggered them, and concrete fixes. |
| **⬡ Send to Claude** | Packages the whole session — fingerprints, flagged events, recent log — as a clean report on your clipboard. Paste it anywhere. |
| **🧰 Power tools** | Auto-Crawler (clicks every interactive element), Record &amp; Replay scripts, a Console REPL inside the running build, DOM snapshots, Error Diff between two sessions, and a one-button Test Suite. |
| **🗂 Snapshots** | Save a session, come back next week, compare. |
| **🖼 Portfolio view** | Every slot as a card. Export the whole wall as a **PNG** or a branded **PDF**. |
| **🧠 Plan tab** | Dump raw notes, hit **AI Clean**, get a structured roadmap. |
| **🌗 Made to be read** | Light and dark themes, four text sizes, high-contrast labels, big tap targets. |

<div align="center">
<img src="app/screenshots/hub-portfolio-wide.png" alt="Portfolio view in light mode" width="760">
</div>

## Live URLs & install (10 seconds)

The Hub is a real installable app — its own icon, its own window, works with no connection.

| Where | How |
|---|---|
| **Chrome / Edge** (desktop) | Open the [Hub](https://johnlaz.github.io/lazlab/app/) → click the install icon in the address bar, or tap **⬇ Install** inside the app. |
| **Android** (Chrome) | Tap **⬇ Install** inside the Hub, or **⋮ → Install app**. |
| **iPhone / iPad** (Safari) | **Share → Add to Home Screen**. The in-app **⬇ Install** button shows these steps. |

Once installed, the **App Mode** light on the home screen reads **Installed app · offline ready**. Long-press the icon for
shortcuts straight to **Portfolio** and **Debug**.

> Only the Hub is installable. The site at the root is a plain landing page, the studio's front door.

## Quick start

<div align="center">
<img src="docs/how-it-works.svg" alt="How LAZLAB Hub works: load, sandbox, watch, fingerprint, fix" width="920">
</div>

1. **Add a slot** — tap **+ New App Slot**, name it, and load a ZIP, HTML file or URL on the Stable or Test channel.
2. **Set the target and launch** — hit ▶ on the channel, open the **Debug** tab, tap **Launch Session**.
3. **Use the app like a user would.** Errors, warnings, requests and clicks stream in live. Tap **Triage Session with Groq**
   or **Send to Claude** when something looks off.

## AI & model setup

- **Bring your own Groq key.** Paste it in **Plan → Groq API Key**. It's stored in your browser and sent only to `api.groq.com`.
- **The model picker keeps itself current.** The Hub asks Groq which chat models *your key* can use, lists the newest, and
  remembers your pick. If a model is ever retired, it re-pulls the list and retries once on a replacement.
- **Nothing is simulated.** If there's no key, the AI buttons say so. They don't fake an answer.

## Data & privacy

Everything — slots, notes, snapshots, your key — lives in your browser's `localStorage`. There is no backend and no account.
**Export** writes it all to a JSON file; **Import** restores it on another device.

The only network calls the Hub makes are to its own host, to `api.groq.com` (when you use AI), to the CDN that serves
JSZip / html2canvas / jsPDF, and to Google Fonts. The service worker caches those libraries so ZIP loading and PDF export
keep working offline.

> **Good to know:** ZIP builds are held in memory (they're too big for `localStorage`), so re-load a ZIP after fully closing
> the app. HTML and URL slots persist.

## Repo layout

<div align="center">
<img src="docs/architecture.svg" alt="LAZLAB Hub architecture" width="920">
</div>

```
lazlab/
├─ index.html              the Studio site (landing)
├─ sw.js                   retirement worker: clears the old Studio cache, then unregisters (temporary)
├─ README.md
├─ assets/                 logo-256 / 512 / 1024 (.jpg)
├─ docs/                   README visuals only (banner, how-it-works, architecture SVGs)
├─ icons/                  apple-touch-icon.png (landing)
└─ app/                    ← the Hub
   ├─ index.html           the whole app: HTML, CSS and vanilla JS in one file
   ├─ manifest.webmanifest Hub PWA manifest      (id /lazlab/app/, scope /lazlab/app/)
   ├─ sw.js                Hub service worker    (scope /lazlab/app/)
   ├─ icons/               192 / 512, maskable, Apple touch icon
   └─ screenshots/         hub-{debug,portfolio}-{narrow,wide}.png — install dialog + this README
```

**How the offline layer behaves**

| Request | Strategy |
|---|---|
| The page (navigations) | Network-first with a 4 s budget, then the cached copy — online users always get your latest deploy. |
| Icons, manifest | Stale-while-revalidate. |
| JSZip, html2canvas, jsPDF, Google Fonts | Pre-cached, then stale-while-revalidate. |
| `api.groq.com`, URL debug sessions, anything else | Untouched. |

The Hub's worker only deletes caches it created (`lazlab-hub-*`) — important, because every app on `johnlaz.github.io`
shares one origin and one cache store. The landing page has no manifest and no offline layer; the root `sw.js` is a
temporary retirement worker that cleans up the old Studio cache and can be deleted after a few weeks.

## Deploy & update

1. Edit `app/index.html` (and bump `APP_VER` plus the visible version stamp in it).
2. Bump `VERSION` in `app/sw.js` (`lazlab-hub-v…`) so it matches the stamp.
3. Push to `main`. GitHub Pages publishes in about a minute; installed copies update on their next launch.

The landing page needs no version bump: edit `index.html` and push.

## Changelog

| Version | Date | Changes |
|---|---|---|
| Hub v2.3.1 | 2026-10-08 | Landing is now a plain page (no manifest, no offline cache; old Studio worker retires itself). Repo cleanup: removed duplicate and unused icons, stray files and the duplicate `app/README.md`. Hub now precaches only the 192 / 512 icons. Studio footer updated. README restructured with SVG banner, flow and architecture visuals in `docs/`. |
| Hub v2.3 | 2026-10-01 | Phone layout fixes, Groq model picker with key-fetched refresh, split into Studio site at root and Hub in `/app`. |

## The studio

**LAZLAB Creations** is an independent studio in Florida — one developer, single-file PWAs, real APIs only.
Building something in the same key? **[lazlab.io@gmail.com](mailto:lazlab.io@gmail.com)**

<div align="center"><sub>© 2026 LAZLAB Creations. All Rights Reserved.</sub></div>
