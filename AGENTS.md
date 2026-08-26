# AGENTS.md

Interactive magazine ("megazine") app: React 19 + Vite frontend deployed on
Cloudflare Pages.

## Commands

- `npm run dev` (Vite, port 3000).
- Expose the local app publicly: `npm run tunnel` (needs `npm run dev` running). Uses the project-local `cloudflared` binary + config in `.tools/cloudflared/` and prints an ephemeral `https://*.trycloudflare.com` URL (secure context → camera hand-tracking works on real phones). See Gotchas for why it uses its own config.
- Verify: `npx tsc --noEmit` then `npm run build` (`vite build`). There is **no lint or test setup** — these two are the only checks.
- Deploy production: `npm run pages:deploy` → `https://kd-penzine.pages.dev`. Local Pages test: `npm run pages:dev`.
- The app loads at `http://localhost:3000`; the CMS/editor is at `/#/krackedmin-admin`.

## Architecture

- Entry is `index.tsx` → `App.tsx`. Svelte was fully removed — do not reintroduce svelte or its Vite plugin (`main.ts`, `*.svelte` were deleted).
- Router is **React Router v8**; imports come from `react-router`, never `react-router-dom`.
- `content/volumes.ts` holds `VOLUME_SEED` — 7 monthly volumes (Jan–Jul 2026), each ~11 markdown pages. `App.tsx` reads `localStorage['kd_volumes']` first, falling back to the seed; `PageBuilder` writes to that key. Other localStorage keys: `kd_twitter_handle`, `kd_twitter_count`.
- Content pages are plain Markdown strings parsed by `components/Megazine/Page.tsx` into a manuscript/paper layout (running head, numbered sections, folio footer, optional margin rail). Supported inline syntax: `#`/`##`/`###`, `**bold**`, `![alt](url)`, `[FIGURE: url|alt|caption]`, `[CAPTION: text]` (attaches to the preceding image), `[DATELINE: text]`, `[ABSTRACT: text]`, `[MARGIN: text]` (goes to the right-hand rail on ≥1024px screens, inline callout below), `[VIDEO: youtube_url]` (responsive 16:9 iframe embed). Images render lazy (`loading="lazy"`); content images without a caption still number as figures. All other directives (e.g. `[SOCIALS:]`, `[BADGE:]`, `[SIGNATURE:]`, `[TWITTER_FEED:]`) are treated as plain text.
- Hand tracking: `components/Megazine/useHandTracking.ts` lazy-loads `@mediapipe/tasks-vision@0.10.1` (CDN + wasm + `hand_landmarker.task` model) on a user click of the HAND pill in `Book.tsx`, requests the camera then, and maps a horizontal palm swipe to page turns (wave left = next, wave right = back) with a 1.2s cooldown. Progressive enhancement only — falls back to keyboard/drag/tap, and errors (`NotAllowedError`/`NotFoundError`/`NotReadableError`) surface in the pill tooltip without breaking the UI. `getUserMedia` requires localhost/https; the preview `<video>` is always mounted but hidden when idle.

## Design system

- Theme is Claude-editorial, defined as CSS vars in `index.css` (`:root`): accent `--kd-primary: #cc785c`, canvas `--kd-canvas: #faf9f5`, ink `--kd-ink: #141413`, hairline `--kd-hairline: #e6dfd8`, dark `--kd-dark: #181715`. Utility classes: `kd-display` (serif, Cormorant Garamond), `kd-caps`, `kd-btn`, `kd-input`, `kd-card`, `kd-badge`, `kd-border`, `kd-glow`, `kd-flicker`.
- Fonts and Tailwind are loaded from CDN in `index.html` (`cdn.tailwindcss.com`, Google Fonts). There is no Tailwind config/build step; arbitrary classes like `bg-[#faf9f5]` work at runtime. Color tokens are hardcoded as hex in JSX, not pulled from CSS vars.
- Per-volume theme: `Volume.theme: { variant, accent }` (neon/editorial/amber/teal/terra/bronze/violet/ocean) in `types.ts`. `resolveTheme(volume, index)` picks `theme`, else `themeColor`, else a per-index default (Vol 1 = neon green `#39ff14`, 2 = amber, 3 = teal, 4 = terra, 5 = bronze, 6 = violet, 7 = ocean). `MegazineReader`/`Intro` set `themeColor = accent` before passing volumes down, so `Book`/`Page` only ever read `volume.themeColor`.
- Theme backgrounds are CSS-only: put `theme-bg theme-<variant>` on the reader/intro container and an empty `<div className="kd-theme-bg" />` as its first child. Variants live in `index.css` (`kd-grid-scroll`/`kd-scan-sweep` for neon, `kd-theme-drift` for warm drift). `.kd-glow`/`.kd-flicker` use `--kd-accent`/`--kd-accent-rgb` vars so they follow the active theme. All theme animations are disabled under `prefers-reduced-motion`.
- Article pages use `kd-paper`, `kd-rail`, `kd-margin-note`, `kd-fold` (right-edge curl while flipping), `kd-page-flip` (the 880ms flip easing), `kd-ctrl-btn` (prev/next), `kd-hand-pill`/`kd-hand-video` (camera control) — all in `index.css`. Page renders semantic `header`/`main`/`aside`/`footer` so the flip stays accessible.
- Favicon is dual-sourced in `index.html`: `https://twenty-icons.com/krackeddevs.com/32` (PNG) with an inline `data:` SVG "KD" mark as fallback; `preconnect` to `cdn.jsdelivr.net` + `storage.googleapis.com` covers the hand-tracking bundle/model.

## Gotchas

- `tsconfig.json` needs `"types": ["node", "vite/client"]` for `import.meta.env` to typecheck.
- Avoid dynamic Tailwind class construction in JSX (CDN runtime can't see classes built at runtime; use inline `style` with hex tokens instead).
- Tunnel: `cloudflared` lives at `.tools/cloudflared/cloudflared.exe` (v2026.7.3, downloaded from GitHub — not on PATH, and winget's MSI needs UAC so don't rely on it). The tunnel **must** run with `--config .tools/cloudflared/tunnel-config.yml` and `--metrics 127.0.0.1:19399`: the machine has `~/.cloudflared/config.yml` owned by another project (Kim Guesthouse/DeckerGUI) whose ingress rules (incl. a catch-all `http_status:404`) otherwise swallow every tunneled request, and DeckerGUI's own cloudflared processes hold ports 4100/4101. `vite.config.ts` `server.allowedHosts` includes `.trycloudflare.com`, otherwise Vite 403s tunneled requests.
- First deploy to a brand-new Pages project can return a 522 once (cold start); a retry returns 200.

## Roadmap (agreed, not yet implemented)

Monthly compilation loop (changed from weekly): the Worker is slated to grow `/api/*` routes (volumes, inbox, compile, meta), a Cloudflare KV binding, cron triggers (first of the month), and a sourcing/pipeline layer that compiles each Volume from krackeddevs.com, a manual social inbox, RSS AI news, and an AI-tools watchlist. None of this exists in code yet — don't assume it does. (The per-volume `theme` frontend system and the 7-volume seed ARE implemented — see Design system / Architecture.)
