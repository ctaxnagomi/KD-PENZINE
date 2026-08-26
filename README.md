
# KRACKED DEVS Megazine Engine v2.0

Interactive editorial megazine with 3D page-flipping, volume management, and hand-tracking gestures. Created by @RikayuWilzam.

## Stack

- React 19 + Vite (entry: `index.tsx` → `App.tsx`)
- React Router v8 (hash router)
- Tailwind (CDN) + Claude-editorial design tokens in `index.css`

## Getting Started

```bash
npm install
npm run dev          # Vite on http://localhost:3000
```

## Deploy

```bash
npm run pages:deploy            # builds dist/, uploads → https://kd-penzine.pages.dev
npm run pages:dev               # local Pages test
```

## Features

### 1. High-Density Magazine Format
Dense editorial layout with dynamic font scaling and multi-column CSS.

- **Bolding**: Markdown `**` tags render as high-contrast editorial bold blocks.
- **Auto-Fit**: Aggressively scales font sizes to fit character counts from 500 to 3000+.
- **Content**: Text (`#`/`##`/`###`, `**bold**`, `- lists`), images (`![alt](url)`), and figures (`[FIGURE: url|alt|caption]`).

### 2. Hand Tracking
Camera-based page turning via MediaPipe hand landmark detection.

- Wave left → next page, wave right → previous page.
- Click the HAND pill to enable; auto-calibrates on first hand detection.
- Falls back to keyboard arrows, drag, wheel, and tap.

### 3. Volume Builder (CMS)
`/#/krackedmin-admin` — edit page Markdown per volume, import a JSON volume structure, toggle publish status, and save to `localStorage` (`kd_volumes`).

### 4. Embed & Shortcodes
Volumes can be embedded externally. The Intro UI provides current shortcodes and iframe snippets.

- **Shortcode Format**: `[VOL_VIEW_X]`
- **Embed URL**: `.../embed/volume-name`

### 5. Visitor Sync
- Global visitor count is tracked via countapi.xyz with graceful fallback.

## Directory

- `App.tsx` — router + bundled Volume 1 content
- `pages/MegazineReader.tsx` — reader shell
- `components/Megazine/` — `Book`, `Page`, `Intro`, `VolumeSelector`, `useHandTracking`
- `components/CMS/PageBuilder.tsx` — volume editor
