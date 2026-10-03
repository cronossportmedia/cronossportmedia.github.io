# Plan — Radio Popup on Home ("La radio viene a ti")

**Branch:** `feat/radio-popup` (created from `origin/main`, no upstream yet)
**Status:** Phases 0–2 done (popup works locally; QA items for Phases 1–2 checked below). Phase 3 (admin) and the rest of Phase 4 pending.
**Merge policy:** open a PR `feat/radio-popup → main` only after local QA; the owner (Michel) approves before merge. Never push to `main` directly.

---

## 1. Goal

Crono Play is being promoted on partner radio circuits in Venezuela. People who hear about it and visit
`cronoplay.com` should immediately get the radio player in front of them, ideally already playing, and
see a promo for the new news-highlights program **"Compacto Deportivo Venezolano"** (official name).
It may air weekly or daily, so the popup is **not tied to a schedule** in this first stage.

## 2. Decisions (approved by owner, 2026-10-03)

| Topic | Decision |
|---|---|
| Autoplay | Popup opens and **tries** `audio.play()`. If the browser blocks it (`NotAllowedError`, the normal case on a first visit and always on iOS), the popup shows a large **"Escuchar ahora"** button. No hijacking of other clicks on the page. |
| Frequency | **Once per browser session** (`sessionStorage`). |
| Content | The existing **24/7 Zeno live stream** + a promo block for **"Compacto Deportivo Venezolano"** (name only; day/time optional, empty for now). |
| Control | **Admin card** in `admin/site-settings.html` → Firestore doc `site_config/radio_popup` (on/off + texts). |
| Scope | **`index.html` only.** The other 8 pages keep their current players untouched. |
| "Window" | An **in-page modal (dialog)**, NOT `window.open()`. Pop-up blockers kill real windows opened without a click. |

## 3. Current architecture (facts verified in the code)

- Static site on GitHub Pages (`CNAME` = cronoplay.com). Deploy happens on push to `main`. No build step, no framework.
- A bot commits `chore(sitemap)` to `main` every day. Merge `main` into the branch before opening the PR. Only `sitemap.xml` changes, so no conflicts are expected.
- **Each page duplicates its own player.** In `index.html`:
  - `<audio id="radioAudio" preload="none">` with `https://stream.zeno.fm/twjyzsaviyivv` (~line 1603).
  - **Classic `<script>`** (~line 1605) holds the player: top-level `const audio`, `let playing`, `let loading`,
    `updateAllPlayIcons()`, `setLoadingState()`, `setPlaying(val)`, plus the `'playing'` event listener.
    Button ID lists live there: `['cardPlayBtn','heroPlayBtn','broadcastPlayBtn','headerPlayBtn','spPlayBtn']`
    (icons/loading) and `['heroPlayBtn','cardPlayBtn','headerPlayer','broadcastPlayBtn','mobilePlayBtn']` (click).
  - `setPlaying(true)` calls `audio.load()` then `audio.play()`. Keep `load()`: it is the iOS fix from commit `c6a5c33`.
    On a rejected promise it writes **"Error al conectar"** into `#cardStatus`, which is wrong for an autoplay block, so the popup needs its own path.
  - Sticky bottom player `#stickyPlayer` (z-index 180) is revealed by `setPlaying(true)`.
  - Volume is persisted in `localStorage['crono-vol']`, and the theme in `localStorage['crono-theme']` (`data-theme="light"|"dark"` on `<html>`).
  - **Module `<script type="module">`** (~line 1877) loads Firestore config: `applySiteConfig()` → `loadSiteConfig()` from
    `js/firebase-loader.js`, then `Promise.all([applySiteConfig(), loadNews()])` (~line 2172).
    Module scripts can read the classic script's globals (`setPlaying`, `playing`) but should go through an explicit API (see Phase 1).
- `js/firebase-loader.js#loadSiteConfig()` reads `site_config/{hero,banner,sections_visibility,social_links}`
  and caches the result in `sessionStorage['crono_site_config']` with a 5‑minute TTL. Error fallback: `{ hero:{}, banner:{}, sections:{}, social_links:{} }`.
- `sections_visibility` has legacy + new keys. `index.html` uses `config.sections.radio === false` to hide radio sections.
- Admin: `admin/site-settings.html` has a `#tab-secciones` panel with toggle rows (`.toggle-row`, `.toggle-switch`),
  saves with `setDoc(doc(db,'site_config',X), {...,updated_at: serverTimestamp()}, {merge:true})`, and uses the helpers
  `setBtnLoading(btn,bool)` and `showToast(msg,'success'|'error')`. `loadAllSettings()` fetches docs with `Promise.all`.
- CSS: design tokens on `:root` (`--orange` accent, `--bg --surface --card --border --border-hi --text --muted --font-d --font-b --r --r-lg`)
  with `[data-theme="light"]` overrides. Existing z-index layers: header 100, mobile overlay/menu 150/160, sticky player 180, tweak panel 300.
- Firestore security rules are **not in this repo** (Firebase console).
  - **Public read: verified 2026-10-03.** Anonymous `getDoc` on `site_config/radio_popup` (and on a random doc id) succeeds, so reads use a `site_config/{docId}` wildcard.
  - **Admin write: not yet verified.** It is very likely covered, because admins already save `hero`, `banner`, `sections_visibility`, `social_links` and `live_players`.
    Confirm in Phase 3: saving the new card must show "Cambios guardados ✓". A `permission-denied` error in the console means the rules need a change. **Never test writes anonymously** (it would touch production data).

## 4. Data model — `site_config/radio_popup`

```js
{
  activo:        true,                       // false → the popup never shows
  titulo:        "¡Crono Play está en vivo!",
  subtitulo:     "Escucha la radio mientras navegas.",
  show_nombre:   "Compacto Deportivo Venezolano", // empty → hide promo block
  show_horario:  "",                         // OPTIONAL free text ("Lunes a viernes · 7:00 AM"); empty → show only the name
  updated_at:    serverTimestamp()
}
```
If the doc is missing, the popup is **on** with default texts (same `!== false` convention as `sections_visibility`).

> ✅ Official program name confirmed by the owner: **Compacto Deportivo Venezolano**. Its frequency (weekly or daily) isn't fixed, so no schedule ships now.
> The title and subtitle copy are reasonable defaults the team can edit from the admin.

---

## 5. Phases

### Phase 0 — Setup ✅ (done)
- Branch `feat/radio-popup`.
- `scripts/dev-server.js`: a zero-dependency Node static server (Python isn't installed). `npm run dev` → http://localhost:5510.
  It serves extensionless URLs as `.html`, like GitHub Pages does.
  **Port 5510 on purpose:** the owner runs another local Node app (Finanzas Personales). Never use 3000/8080 or kill
  other Node processes. If 5510 is busy, the server exits with a message; use `PORT=5511 npm run dev`.
- `.claude/launch.json`: config `cronoplay-dev`, so Claude can use `preview_start` with name `cronoplay-dev`.
- Verified: home loads, Firestore config and news load from localhost. The console shows one **expected 403** from the
  YouTube Data API (`js/youtube-live.js`): the key is referrer-restricted to the production domain. Ignore it.

### Phase 1 — Data layer + player API
**Files:** `js/firebase-loader.js`, `index.html` (classic script only)

1. `loadSiteConfig()`: add `getDoc(doc(db,'site_config','radio_popup'))` to the `Promise.all` and expose it as
   `radio_popup: snap.exists() ? snap.data() : {}`. Add `radio_popup: {}` to the catch fallback.
   Old cached entries won't have the key, so consumers must use `config.radio_popup || {}`.
2. In the classic player script, add a small public API **without changing existing behavior**:
   ```js
   window.CronoRadio = {
     isPlaying: () => playing,
     play:  () => { if (!playing) setPlaying(true); },
     tryAutoplay,          // () => Promise<boolean>
   };
   ```
   `tryAutoplay()` mirrors the start of `setPlaying(true)` (loading state, show sticky player, `audio.load()`, `audio.play()`),
   but on rejection it resets **silently**: `playing=false`, `setLoadingState(false)`, `updateAllPlayIcons(false)`,
   re-hide `#stickyPlayer`, restore `#cardStatus` to "Presiona play para escuchar", and resolve `false`. Resolve `true` on success.
   Don't duplicate code if it's avoidable. Extracting a shared `startPlayback({silentFail})` used by both paths is fine.
3. Add `'popupPlayBtn'` to the icon/loading ID arrays and the `is-playing` toggle list, so the popup button reflects state
   automatically. Do **not** add it to the generic click list; the popup wires its own click to `CronoRadio.play()` / toggle.

**Done when:** every existing play button behaves exactly as before; `await CronoRadio.tryAutoplay()` in the console returns
`false` on a fresh tab (blocked) and leaves no "Error al conectar" text and no visible sticky player.

### Phase 2 — Popup UI + controller
**File:** `index.html` (CSS in the `<style>` block, markup before `<audio id="radioAudio">`, logic in the module script)

1. **Markup** (Spanish copy):
   ```html
   <div class="radio-popup" id="radioPopup" hidden>
     <div class="radio-popup__backdrop" data-popup-close></div>
     <div class="radio-popup__card" role="dialog" aria-modal="true" aria-labelledby="radioPopupTitle">
       <button class="radio-popup__close" id="popupClose" data-popup-close aria-label="Cerrar">×</button>
       <!-- logo assets/Crono_Logo_Sin_Fondo.png + "● EN VIVO" badge (reuse .dot-live) -->
       <h2 id="radioPopupTitle"></h2>
       <p class="radio-popup__sub" id="radioPopupSub"></p>
       <div class="radio-popup__show" id="radioPopupShow" hidden>
         <span>Nuevo</span> <b id="radioPopupShowName"></b><span id="radioPopupShowTime" hidden></span>
       </div>
       <button class="radio-popup__play" id="popupPlayBtn" aria-label="Escuchar ahora">
         <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> <span>Escuchar ahora</span>
       </button>
       <p class="radio-popup__status" id="popupStatus" aria-live="polite"></p>
       <button class="radio-popup__secondary" data-popup-close>Seguir navegando</button>
     </div>
   </div>
   ```
   Note: `updateAllPlayIcons` replaces `svg.innerHTML`. Keep the label `<span>` **outside** the `<svg>` and give the svg `fill="currentColor"`.
2. **CSS:** fixed overlay `z-index: 400`; backdrop `rgba(0,0,0,.6)` + `backdrop-filter: blur(4px)`; centered card using the tokens
   (`--card`, `--border-hi`, `--r-lg`, `--orange` for the play button, `--font-d` for the title). Add a `[data-theme="light"]` override
   matching `.radio-card`. At ≤640px, render as a bottom sheet with full width and 16px side padding. Add a pulse on `#popupPlayBtn`
   while idle, disabled under `@media (prefers-reduced-motion: reduce)`. Use an enter transition (fade + translateY). Add `is-playing` styles.
3. **Controller** (module script). Create `const configPromise = loadSiteConfig();` and pass it to `applySiteConfig(config)`
   (refactor it to accept the config) and to `maybeShowRadioPopup(config)`, so the first visit doesn't fire duplicate Firestore reads.
   `maybeShowRadioPopup(config)` rules, in order:
   - `?radio=0` → never show. `?radio=1` (or bare `?radio`) → **force show**, ignoring the session flag. Partners can share
     `cronoplay.com/?radio=1`, and QA uses it too.
   - Skip if `config.sections?.radio === false`, `config.radio_popup?.activo === false`, `sessionStorage['crono-radio-popup']` is set
     (unless forced), or `CronoRadio.isPlaying()`.
   - Fill texts from `config.radio_popup` with defaults. Show the promo block only if `show_nombre` is non-empty (default `"Compacto Deportivo Venezolano"`). Show `#radioPopupShowTime` (prefixed with " · ") only if `show_horario` is non-empty. Use `textContent` only (no innerHTML).
   - Open: remove `hidden`, `document.body.style.overflow='hidden'` (same pattern as `openMenu`), focus `#popupPlayBtn`,
     set `sessionStorage['crono-radio-popup']='1'` (wrap storage calls in try/catch).
   - Then `const ok = await CronoRadio.tryAutoplay()`. If true: status "● Escuchando en vivo" and the button shows pause.
     If false: status "Toca el botón para escuchar en vivo" and the pulse is on.
   - `#popupPlayBtn` click: if not playing → `CronoRadio.play()`, else `setPlaying(false)` via an API method (add `pause` to `CronoRadio`).
     Keep status text in sync by listening to `audio` `playing`/`pause` events (or extend the API with a callback).
   - Close via any `[data-popup-close]`, **Esc**, or the backdrop. Hide, restore `body.style.overflow`, return focus to the element that had it
     before opening. **Closing does not stop audio.** If it's playing, the sticky player stays visible.
   - Basic focus trap: Tab and Shift+Tab cycle among the popup's buttons while it's open.
4. Don't block the page: the popup appears after config resolves (cached = instant; first visit ≈ <1s).

**Done when:** the QA checklist (Phase 4) passes locally.

### Phase 3 — Admin control
**File:** `admin/site-settings.html`

1. In `#tab-secciones`, add a new `.card-section` titled **"Popup de Radio"** after the visibility card:
   - toggle `#popupActivo` ("Mostrar popup de radio al entrar al inicio")
   - inputs `#popupTitulo`, `#popupSubtitulo`, `#popupShowNombre` (label "Programa destacado"), `#popupShowHorario` (label "Día y hora (opcional)", placeholder "Ej: Lunes a viernes · 7:00 AM"). Pre-fill `#popupShowNombre` with "Compacto Deportivo Venezolano" when the doc is missing.
   - link "Vista previa" → `/?radio=1` with `target="_blank"`
   - button `#btnSavePopup` (same markup as `#btnSaveSecciones`: `.btn-spinner` + `.btn-label`)
2. `loadAllSettings()`: add `getDoc(doc(db,'site_config','radio_popup'))` and populate the fields (`activo !== false` → checked).
3. Save handler: copy the `btnSaveSecciones` pattern → `setDoc(doc(db,'site_config','radio_popup'), {activo, titulo, subtitulo, show_nombre, show_horario, updated_at: serverTimestamp()}, {merge:true})`.
4. Tell the team in the UI hint that visitors may take up to 5 minutes to see changes (sessionStorage TTL).

**Done when:** saving from the admin locally (http://localhost:5510/admin/, log in with a real admin account; Firebase Auth allows `localhost` by default)
updates the doc, and the home popup reflects it after clearing `sessionStorage`.

### Phase 4 — QA, then PR
Run `npm run dev` (or `preview_start` → `cronoplay-dev`) and check:

> Phase 1–2 QA run in the Claude preview browser (it allows autoplay, so the *blocked* path was simulated by stubbing `audio.play()` to reject with `NotAllowedError`). Still worth one real-Chrome incognito pass in Session C.

- [~] New incognito window at `http://localhost:5510/`: popup appears in ~1s. Chrome blocks autoplay → big button pulses. One click → stream plays; the sticky player, header mini player and hero card all show the playing state. *(Popup appears, one-click path + all players sync verified; real Chrome-blocked case simulated, not seen.)*
- [x] **Autoplay success path:** audio starts with no click and the popup shows "Escuchando" (the preview browser allows autoplay).
- [x] Close via X, Esc, backdrop and "Seguir navegando". Audio keeps playing; the sticky player remains. *(Focus-return code is in place, but not meaningfully exercised: nothing had focus before open.)*
- [x] Reload → no popup (session). `/?radio=1` → popup. `/?radio=0` → no popup.
- [~] Admin toggle off → no popup (clear `sessionStorage` first). Empty `show_nombre` → no promo block. Empty `show_horario` → name only, no stray " · ". *(Verified by injecting configs into the `crono_site_config` cache; real admin flow is Phase 3.)*
- [~] Light and dark themes. Mobile 375px (bottom sheet, no horizontal scroll). Keyboard-only use. `prefers-reduced-motion`. *(Light/dark, 375px sheet, no h-scroll and the Tab focus trap verified; reduced-motion is CSS-only, not exercised.)*
- [ ] Phone on the same Wi‑Fi: `http://<PC-LAN-IP>:5510` (allow Node through the Windows firewall). On iPhone Safari autoplay is always blocked, so check the one-tap path.
- [x] Other pages (`en-vivo`, `noticias`, …) are unchanged (diff touches only `index.html` + `js/firebase-loader.js`); no new console errors besides the known YouTube 403. The fresh-session cache now contains `radio_popup` (public Firestore read works; `{}` because the doc doesn't exist yet).
- [ ] Firestore rules allow public read and admin write on `site_config/radio_popup` (Firebase console).

Then: `git fetch && git merge origin/main`, then commit (conventional prefixes: `feat:`, `chore:`), push `feat/radio-popup`, and open the PR to `main`
with screenshots (desktop dark/light + mobile). **Wait for the owner's approval before merging.**

---

## 6. Suggested session split (Sonnet 5.5)

Each new conversation should start with: *"Read `.claude/plans/radio-popup.md` and do Phase N on branch `feat/radio-popup`."*

| Session | Scope | Commit |
|---|---|---|
| A | Phase 1 + Phase 2 | `feat(radio): popup de radio en inicio con intento de autoplay` |
| B | Phase 3 | `feat(admin): control del popup de radio en ajustes del sitio` |
| C | Phase 4 QA + fixes + PR | `fix(radio): …` as needed, then the PR |

Each session updates the **Status** line at the top of this file and checks off the QA items it verified.

## 7. Out of scope / later ideas
- On-demand episodes of Compacto Deportivo Venezolano (would need an audio URL per episode).
- A fixed schedule for the program once its frequency is decided (just fill `show_horario` from the admin).
- Analytics (the site has none today). Could track `?utm_source=` from partner radios later.
- Persisting playback across page navigation (each page reloads its own `<audio>`; would need an SPA or iframe shell).
