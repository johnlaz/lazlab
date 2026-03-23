# NEXUS Listener — Quick Install Guide

## What You Need To Do (Once Per App)

Copy `nexus-listener.js` into each app's GitHub repo root, then add ONE line
to the bottom of each app's `index.html`, just before `</body>`:

```html
<script src="nexus-listener.js"></script>
```

That's it. Commit and push. The app is now NEXUS-aware.

---

## What It Enables

| Feature | What happens |
|---------|-------------|
| **⚡ Capture All Apps** | Nexus silently loads each app in a hidden iframe, the snippet responds with the app's full localStorage snapshot |
| **↓ Master JSON** | All captured snapshots bundled into one file with your Nexus config |
| **↑ Import & Inject** | On import, when you launch any app, the snippet automatically restores that app's localStorage before the UI loads |
| **Key Vault** | API key from Nexus config injected into `localStorage['groq-api-key']` on every launch |

---

## Customising Per App

Open `nexus-listener.js` and edit these two lines at the top of the config block:

```js
// Keys to skip on restore (don't overwrite these)
const SKIP_KEYS_ON_INJECT = [
  // 'my-auth-token',
];

// Where your app stores its API key in localStorage
const API_KEY_STORAGE_KEY = 'groq-api-key';
```

If your app uses a different localStorage key name for the API key (e.g. `openai-key`,
`app-license`, `api_key`), change `API_KEY_STORAGE_KEY` to match.

---

## Listening for Restored Data

If your app needs to re-render after data is injected (e.g. reload the UI),
add this anywhere in your app:

```js
window.addEventListener('nexus-data-restored', (e) => {
  console.log('NEXUS restored', e.detail.keys, 'keys');
  // e.g. location.reload(), or re-init your app state
  initApp(); // call your app's init function
});
```

---

## Your Apps

| App | Repo | listener.js added? |
|-----|------|-------------------|
| APEX | johnlaz.github.io/apex | ☐ |
| ARMORY | johnlaz.github.io/armory | ☐ |
| UNPLUGGED | johnlaz.github.io/unplugged | ☐ |
| LAZ LAB | johnlaz.github.io/lazlab | ☐ |
| INFUSE | johnlaz.github.io/infuse | ☐ |
| AXIOM | johnlaz.github.io/axiom | ☐ |
| Listener Pro | johnlaz.github.io/listenerpro | ☐ |
| Odoo Email Link | johnlaz.github.io/odoolink | ☐ |
| TRSAV | johnlaz.github.io/trsav | ☐ |
| Story Magic | johnlaz.github.io/storymagic | ☐ |
| Kinetic | johnlaz.github.io/kinetic | ☐ |
