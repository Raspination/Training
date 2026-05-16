# Roman's Plan — Build an APK without Android Studio

Three ways to get an APK on your phone, ranked by how much you have to install.

```
Roman_Plan_Build/
├── www/
│   ├── index.html              ← THE APP (1.4 MB, self-contained)
│   ├── manifest.webmanifest    ← PWA manifest
│   └── sw.js                   ← Service worker (offline cache)
├── icons/
│   ├── icon-192.png            ← warrior duck
│   └── icon-512.png
├── .github/workflows/
│   ├── deploy-pages.yml        ← auto-publish PWA to GitHub Pages
│   └── build-apk.yml           ← auto-build APK in GitHub's cloud
├── package.json                ← Bubblewrap CLI scripts
├── inject-pwa.js               ← one-time script to add manifest+SW to HTML
└── README.md                   ← this file
```

---

## Path 1 — PWABuilder.com (zero install, ~5 minutes)

The fastest path. Use Microsoft's free service to compile your PWA into an APK in your browser.

**Steps:**

1. **Host the PWA somewhere on HTTPS.** Easiest = GitHub Pages, free:
   - Create a GitHub account if you don't have one.
   - Create a new public repository.
   - Upload this entire `Roman_Plan_Build/` folder (drag-and-drop into the GitHub web UI works).
   - Repo → Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / `/(root)` → Save.
   - Wait ~1 minute. Your PWA is now live at `https://<your-username>.github.io/<repo-name>/www/`.

2. **Go to [pwabuilder.com](https://www.pwabuilder.com)** in any browser.

3. **Paste your PWA URL.** Hit **Start**.

4. The site scores your PWA. Click **Package For Stores** → **Android** → **Generate**.

5. Download the `.zip`. Inside is `app-release-signed.apk`.

6. Email/AirDrop the APK to your phone. Open. Install. Done.

**Pros:** zero local tools. Works on any computer.
**Cons:** requires the PWA to be publicly hosted. PWABuilder occasionally has issues with niche PWAs — but a simple offline-first one like this works fine.

---

## Path 2 — GitHub Actions (zero local tools, ~10 minutes one-time setup)

GitHub's cloud builds the APK for you on every push. You get a download link in the Actions tab.

**Steps:**

1. Create a GitHub account, create a new public repo.

2. Upload this `Roman_Plan_Build/` folder into the repo (drag-and-drop in the web UI works fine).

3. Repo → **Settings → Pages → Source: GitHub Actions**.
   (Don't pick "Deploy from a branch" — pick "GitHub Actions".)

4. Push or commit any change. Two workflows trigger automatically:
   - `deploy-pages.yml` — publishes the PWA to GitHub Pages.
   - `build-apk.yml` — builds the APK.

5. Open the repo's **Actions** tab. Watch the `Build Android APK` workflow run (~5 minutes).

6. When it's green, click into the run. At the bottom under **Artifacts**, click **roman-plan-apk** to download a `.zip` containing your APK.

7. AirDrop / email it to your phone. Install.

**Pros:** completely no local installs. Every future change just requires `git push` → APK updates automatically.
**Cons:** needs a GitHub account. First Actions run takes ~10 min (downloads Android SDK in their cloud); subsequent runs are faster (~5 min).

---

## Path 3 — Bubblewrap locally (just Node.js, ~15 minutes one-time)

Build the APK on your own machine using Google's Bubblewrap CLI. Only requires Node.js — Bubblewrap silently downloads the Android SDK on first run.

**One-time requirements:**

- **Node.js 18+** — install from [nodejs.org](https://nodejs.org/) (free, ~50 MB).
- **Java 17+ JDK** — get [Temurin](https://adoptium.net/) (free, ~250 MB). Bubblewrap needs it.
- About **2 GB of disk space** for the Android SDK that Bubblewrap downloads.

**Steps:**

1. Host your PWA somewhere on HTTPS (see Path 1 step 1 — GitHub Pages is the easy free option).

2. In a terminal, in this `Roman_Plan_Build/` folder:

   ```bash
   npm install
   npm run init --manifest=https://<your-username>.github.io/<repo>/www/manifest.webmanifest
   ```

   Bubblewrap asks a few questions (package name, app name, signing key info). Accept defaults except:
   - **Application package name:** `io.romanplan.app`
   - **Application name:** `Roman's Plan`
   - **App version code:** `1`
   - **App version name:** `1.0.0`
   - **Signing key location:** press Enter for default
   - **Signing key password:** make one up and remember it

3. ```bash
   npm run build
   ```

   First run downloads Android build tools (~1.5 GB). Takes ~10 min. Subsequent builds are ~30 sec.

4. APK is at `./app-release-signed.apk`.

5. Copy to phone. Install. Done.

**Pros:** fully local, you own the keystore, can iterate quickly.
**Cons:** the 2 GB SDK download is annoying first time. Java is required.

---

## Choosing a path

| You have | Use |
|----------|-----|
| Just a web browser | **Path 1** (PWABuilder) |
| GitHub account, no installs | **Path 2** (Actions) — set it up once, push for life |
| Node.js + Java already | **Path 3** (Bubblewrap locally) |
| Disk space, want full control | **Path 3** |

**Recommendation:** start with **Path 2 (GitHub Actions)**. It's free, automates everything, and the APK builds in GitHub's cloud every time you change something. Path 1 is faster the first time but Path 2 wins long-term.

---

## What you get

Same app in all three paths. A Trusted Web Activity (TWA) APK:

- App icon: warrior duck on indigo→magenta→red gradient.
- Opens straight to the HTML app — no browser chrome.
- **Permanent data storage** — localStorage and IndexedDB live in the app's private folder, never cleared.
- Splash screen on cold start (dark ink, ~1 sec).
- Native back button works.
- Push notifications use Android's native system.
- All the in-app features (timers, recipes, voice lines, progress photos) work offline once the service worker has cached them.

APK size: ~6–8 MB (the Android shell) + ~1.4 MB embedded HTML = ~8 MB total.

---

## Updating the app

When the HTML changes (a new version of `Roman_Plan_App.html`):

1. Copy it over `www/index.html`.
2. Run `node inject-pwa.js` (re-adds manifest + SW registration; safe to run multiple times).
3. Bump `versionCode` in `twa-manifest.json` (from `1` to `2`).
4. Re-build with whichever path you used. Push triggers it automatically for Path 2.

Android sees the new APK is the same app, replaces the old one. Your data is preserved.

---

## Troubleshooting

**Path 1 — PWABuilder says "no valid manifest found"**
Make sure GitHub Pages has finished publishing. Visit the URL in your browser first. The manifest must be at `https://...github.io/<repo>/www/manifest.webmanifest`.

**Path 2 — GitHub Actions workflow fails on "init"**
This is the trickiest step. First run, the workflow can't init Bubblewrap automatically because it needs interactive input. Fix:
- Run Path 3 locally once on your machine (you need Node + Java).
- Commit the generated `twa-manifest.json` and `app-release-signed.keystore` back to the repo (they go in .gitignore by default — remove from .gitignore).
- After that, all future Actions runs work.
- Or: skip Path 2 and use Path 3.

**Path 3 — "Bubblewrap: command not found"**
You skipped `npm install`. Run it first.

**Path 3 — "Java not found"**
Install Temurin JDK from adoptium.net.

**App opens but data is lost between launches**
This is unrelated to the APK build — it's the WebView itself. The TWA WebView uses Chrome's data persistence, which is much more reliable than a regular browser's. But ensure you haven't been clearing app data manually.

**App icon is the default Android icon, not the duck**
The icons in `icons/` must be exactly 192×192 and 512×512 PNGs with proper transparency. They are correct in this folder. If you replace them, regenerate at exact sizes.

---

## Notes on the previous Capacitor / Native Android approaches

I also generated `Roman_Plan_Android/` (Capacitor) and `Roman_Plan_Native_Android/` (pure Java + Android Studio) earlier. Both work but require more local tools than this folder. Use whichever path fits your toolchain best — they all produce equivalent APKs that wrap the same HTML app.

---

*Take care of the knee. Take care of the head. Show up daily — that's the whole game.*
