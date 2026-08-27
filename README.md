# KRACKED DEVS Megazine Engine v2.0

Interactive editorial megazine with a horizontal scroll landing page, 3D page-flipping, volume management, and hand-tracking gestures. Created by @RikayuWilzam.

**Live:** https://kd-penzine.pages.dev · **Alias:** https://master.kd-penzine.pages.dev

## Stack

- React 19 + Vite (entry: `index.tsx` → `App.tsx`)
- React Router v8 (hash router, imports from `react-router`)
- Tailwind (CDN) + Claude-editorial design tokens in `index.css`
- Deployed on **Cloudflare Pages** (project `kd-penzine`). Static only — no Worker, no API keys.

## Getting Started

```bash
npm install
npm run dev          # Vite on http://localhost:3000
```

## Deploy

```bash
npm run pages:deploy            # builds dist/, uploads → https://kd-penzine.pages.dev
npm run pages:dev               # local Pages test
npm run tunnel                  # expose localhost publicly (needs dev running)
```

## Verify

```bash
npx tsc --noEmit
npm run build
```

There is **no lint or test setup** — `tsc` + `build` are the only checks.

## Features

### 1. Landing Page (HorizontalLanding.tsx)
Seven snap-scroll sections — **Hero · Archives · FAQ · Blog · About · Roadmap · Connect** — with a floating glass nav pill, noise-grain overlay, bottom section dots, and a mouse-tracking KD pixel logo. FAQ content is sourced from the real krackeddevs.com ecosystem (Guilds, KD Labs, KD Academy, Bounties, etc).

### 2. High-Density Magazine Format
Dense editorial layout with dynamic font scaling and multi-column CSS.

- **Bolding**: Markdown `**` tags render as high-contrast editorial bold blocks.
- **Auto-Fit**: Aggressively scales font sizes to fit character counts from 500 to 3000+.
- **Content**: text (`#`/`##`/`###`, `**bold**`, `- lists`), images (`![alt](url)`), figures (`[FIGURE: url|alt|caption]`), captions (`[CAPTION: text]`), datelines, abstracts, margin notes (`[MARGIN: text]`), and video (`[VIDEO: youtube_url]`).
- Legacy `[SOCIALS:]`, `[BADGE:]`, `[SIGNATURE:]`, `[TWITTER_FEED:]` directives are treated as plain text.

### 3. Hand Tracking
Camera-based page turning via MediaPipe hand landmark detection (loaded on demand, progressive enhancement).

- Wave left → next page, wave right → previous page.
- Click the HAND pill to enable; auto-calibrates on first hand detection.
- Falls back to keyboard arrows, drag, wheel, and tap.

### 4. Volume Builder (CMS)
`/#/krackedmin-admin` — edit page markdown per volume, import a JSON volume structure, toggle publish status, and save to `localStorage` (`kd_volumes`).

### 5. Embed & Shortcodes
- **Shortcode Format**: `[VOL_VIEW_X]`
- **Embed URL**: `.../embed/volume-name`

### 6. Per-Volume Theme System
Each volume carries a theme (`neon/editorial/amber/teal/terra/bronze/violet/ocean`) resolved by `resolveTheme(volume, index)`. CSS-only theme backgrounds via `theme-bg theme-<variant>`.

## Directory

- `App.tsx` — router + content bootstrapping (seed vs localStorage)
- `pages/MegazineReader.tsx` — reader shell
- `components/Megazine/` — `Book`, `Page`, `Intro` (legacy), `HorizontalLanding`, `VolumeSelector`, `useHandTracking`
- `components/CMS/PageBuilder.tsx` — volume editor
- `content/volumes.ts` — `VOLUME_SEED`, 7 volumes of markdown (Jan–Jul 2026)
