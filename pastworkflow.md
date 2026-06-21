# JusticeBridge — Past Work Log
> Date: 21 June 2026 | Branch history tracked in Git

---

## ✅ 1. Mobile Responsiveness (Branch: `mobile-responsive`)

**Goal:** Make the entire app fully fluid on phones, tablets, and desktops.

**What was done:**
- Replaced all fixed pixel widths with fluid/percentage-based sizing
- **Navbar (Home page):** Added hamburger menu (`Menu` / `X` icons from lucide-react) that appears on screens ≤768px; tapping opens a slide-down dropdown with all nav links
- **Chat bubbles:** Constrained to percentage of container width so they never overflow
- **App layout:** Sidebar becomes an overlay panel on mobile (slides in/out via toggle button)
- **Grids (About, Insights, Articles, Footer):** Changed from `repeat(3, 1fr)` → `repeat(2, 1fr)` → `1fr` at `1024px` and `768px` breakpoints
- **Chat input bar:** Made fully fluid; mic and send buttons stay tappable at minimum `44px` touch target
- Rebuilt `App.css` and `Home.css` responsive `@media` blocks

---

## ✅ 2. Device Safe Areas (Part of `mobile-responsive`)

**Goal:** Prevent content from going under iPhone notch / home indicator / status bar.

**What was done:**
- Added `viewport-fit=cover` to the HTML `<meta name="viewport">` tag
- Applied `env(safe-area-inset-top)` as padding on the sticky home header
- Applied `env(safe-area-inset-bottom)` to the chat input area so send/mic buttons stay above home bar
- Fixed sidebar on iOS to not be hidden behind the notch
- Tested layout classes: `.chat-input-area`, `.home-header`, `.app-header`, `.sidebar`

---

## ✅ 3. Framer Motion Animations (Branch: `framer-motion-polish`)

**Goal:** Add tasteful, polished animations — not overdone.

**What was done:**

| File | Animations Added |
|---|---|
| `Home.jsx` | Staggered hero entrance (badge → h1 → p → buttons, 80ms stagger), hero visual scale-up, `whileInView` scroll-triggered reveals on About / Insights / Articles (once only), hover lift + tap compress on all buttons and nav links |
| `Home.jsx` | Mobile hamburger menu smooth slide/fade open-close via Framer Motion variants |
| `App.jsx` | Chat messages slide + fade in as they render (`AnimatePresence`), glassmorphic typing indicator with 3 bouncing dots, sidebar section expand/collapse via `AnimatePresence`, Legal Library fade-in |
| `Auth.jsx` | Overlay fade-in, auth card scale/slide-up on open, hover/tap on submit & social buttons |
| `Profile.jsx` | Container fade-in, staggered grid card load |
| `App.css` | Added `.typing-indicator`, `.typing-dot`, `@keyframes bounce-dot` styles |
| All files | `useReducedMotion()` hook in `Home.jsx` — respects OS accessibility setting |

**Installed:** `framer-motion@^12.40.0`

---

## ✅ 4. PWA — Progressive Web App (Branch: `pwa-install`) ← Today's session

**Goal:** Make the app installable like a native app on Android/iOS/Desktop.

### 4a. Assets & Manifest
- Generated **3 PNG icons** programmatically using PowerShell + `System.Drawing`:
  - `public/icon-192.png` — standard 192×192
  - `public/icon-512.png` — standard 512×512
  - `public/icon-maskable.png` — 512×512 with safe-zone padding for Android adaptive icons
- Created `public/manifest.json`:
  - `name`: "JusticeBridge AI", `short_name`: "JusticeBridge"
  - `theme_color`: `#0f172a`, `background_color`: `#020617` (brand dark colors)
  - `display`: "standalone", `start_url`: "/"
  - Icons mapped with `purpose: "any"` and `purpose: "maskable"`
- Updated `index.html`:
  - Linked manifest: `<link rel="manifest" href="/manifest.json">`
  - Added `<link rel="apple-touch-icon" href="/icon-192.png">`
  - Added `<meta name="theme-color" content="#0f172a">`
  - Confirmed `viewport-fit=cover` already present

### 4b. Service Worker (vite-plugin-pwa)
- Installed: `vite-plugin-pwa@^1.3.0` (dev dependency)
- Updated `vite.config.js` to include `VitePWA()` plugin:
  - `registerType: 'autoUpdate'` — auto-updates SW on new deploys
  - `workbox.globPatterns` caches all JS/CSS/HTML/PNG/SVG
  - Manifest config duplicated inside plugin for Vite's injection pipeline
- Updated `main.jsx`:
  - Imported `registerSW` from `virtual:pwa-register`
  - Called `registerSW({ immediate: true })` to boot SW on first load
- **Build output:** `dist/sw.js` + `dist/workbox-*.js` generated ✅, 13 entries precached (~586 KB)

### 4c. "Download App" Button
- **Logic in `App.jsx`:**
  - State: `deferredPrompt`, `showInstallBtn`, `isIOS`, `showIOSTip`
  - Listens for `beforeinstallprompt` (Chrome/Android/Desktop) — saves event, shows button
  - Detects iOS Safari via user-agent — shows button with different flow
  - Detects standalone mode — hides button if already installed
  - `handleInstallClick()`: triggers native prompt on Chrome, or shows iOS guide modal on Safari
- **Locations button is shown:**
  - `Home.jsx` — inside desktop/mobile hamburger nav bar
  - `Home.jsx` — inside the hero section CTA buttons row
  - `App.jsx` — inside the app shell header (right side, beside insights toggle)
  - `App.jsx` — inside the sidebar footer (above Logout)

### 4d. iOS Safari Install Guide Modal
- Custom full-screen glassmorphic overlay (`ios-prompt-overlay`)
- Shows 3-step instructions:
  1. Tap Share button in Safari
  2. Select "Add to Home Screen"
  3. Tap "Add"
- Dismissable by tapping outside or the X button
- Rendered in both the landing page return and the main app shell return

### 4e. Styling
- `Home.css`: Added `.nav-download-btn`, `.hero-download-btn` styles (blue glassmorphism border, hover lift)
- `App.css`: Added `.header-download-btn` (hides text label on ≤640px, becomes icon-only circle), `.nav-download-item`, `.ios-prompt-overlay`, `.ios-prompt-card`, `.ios-step`, `.step-num`, `.step-text`, `.ios-prompt-btn`

### 4f. Build Verification
- `npm run build` passed ✅ — 2375 modules, zero errors
- Service worker generated: `dist/sw.js`, `dist/workbox-9c191d2f.js`
- Manifest: `dist/manifest.webmanifest` (0.54 KB)

---

## 📌 Git Branch Summary

| Branch | Status | Contents |
|---|---|---|
| `main` | Base — no new features | Original release |
| `mobile-responsive` | ✅ Pushed | Responsive layout + safe areas |
| `framer-motion-polish` | ✅ Pushed | All Framer Motion animations |
| `pwa-install` | ✅ Local (not yet pushed) | PWA manifest, icons, SW, install button, iOS modal |

---

## 🔜 Remaining / Next Steps

- Push `pwa-install` branch to GitHub and create PR
- Test on real Android device (Chrome install prompt)
- Test on real iPhone (Safari share sheet modal)
- Replace placeholder icons with the real JusticeBridge logo when ready
- Optionally: add `npm run audit fix` to clear vulnerability warnings
