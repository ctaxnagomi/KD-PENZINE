---
version: alpha
name: bottom-floating-navbar-template
description: A reusable bottom-anchored floating glass-pill navbar. Anchored to the bottom edge on every viewport, the pill is a frosted-glass capsule (backdrop blur + warm translucent fill) with an optional brand mark, a hairline divider, and a horizontally scrollable row of nav pills. Active section is tinted by the theme accent; inactive links are muted with a hover fill. On small screens the link row scrolls inside the pill instead of overflowing the viewport edge.

colors:
  canvas: "#faf9f5"
  ink: "#141413"
  ink-muted: "#6c6a64"
  ink-muted-2: "#8e8b82"
  hairline: "#e6dfd8"
  dark: "#181715"
  pill-fill: "rgba(250, 249, 245, 0.85)"
  pill-border: "rgba(230, 223, 216, 0.6)"
  logo-bg: "#050505"
  logo-fill: "#00CC00"
  on-accent: "#faf9f5"
  accent: "--kd-accent or #REPLACE_WITH_ACCENT"

typography:
  brand-label:
    fontFamily: "system-ui, sans-serif"
    fontSize: 9px
    fontWeight: 600
    letterSpacing: 0.2em
    textTransform: uppercase
  nav-link:
    fontFamily: "system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 500
    letterSpacing: 0.025em

rounded:
  pill: 9999px

spacing:
  nav-top: 20px
  nav-bottom: 24px
  pill-padding: "4px 6px"
  item-x: 12px
  item-y: 8px

components:
  bottom-nav-shell:
    position: fixed
    insetX: 0
    bottom: 0
    display: flex
    justifyContent: center
    pointerEvents: none
    paddingBottom: 20px
  nav-pill:
    display: inline-flex
    alignItems: center
    background: "{colors.pill-fill}"
    backdropFilter: "blur(20px) saturate(1.4)"
    border: "1px solid {colors.pill-border}"
    rounded: "{rounded.pill}"
    maxWidth: "calc(100vw - 24px)"
    padding: "{spacing.pill-padding}"
    boxShadow: "0 4px 24px rgba(20,20,19,0.06), 0 1px 3px rgba(20,20,19,0.04), inset 0 1px 0 rgba(255,255,255,0.5)"
  nav-link:
    background: transparent
    textColor: "{colors.ink-muted}"
    hoverText: "{colors.ink}"
    hoverBg: "rgba(20,20,19,0.04)"
    activeText: "{colors.on-accent}"
    activeBg: "{colors.accent}"
    rounded: "{rounded.pill}"
    padding: "{spacing.item-y} {spacing.item-x}"
  scrollable-link-row:
    display: flex
    overflowX: auto
    whitespace: nowrap
    scrollbar: none
    rounded: "{rounded.pill}"
    flex: "1 1 0%"
    minWidth: 0
---

## Overview

A bottom-anchored floating glass pill for global/nested navigation. Unlike a classic top nav, this shell docks to the **bottom edge of the viewport** on every breakpoint — typed as `position: fixed; bottom: 0`. The visible chrome is a single frosted capsule (`{component.nav-pill}`) holding an optional brand mark, a hairline divider, and a link row.

Three behaviors do the heavy lifting:

1. **Bottom anchor** — the shell is `pointer-events: none` so the spaced-around empty area never blocks clicks on page content; only the pill itself is `pointer-events: auto`.
2. **Mobile-safe link row** — the link row is `flex-1 min-w-0 overflow-x-auto whitespace-nowrap` with a hidden scrollbar; on narrow screens links scroll *inside the pill* instead of overflowing the screen edge. The pill is capped at `calc(100vw - 24px)` so it never bleeds off-screen.
3. **Active tint** — the current nav item takes the theme accent as a filled pill (`activeBg: {colors.accent}`); everything else is muted with a quiet hover fill. The accent, logo, and labels are placeholders to be replaced per project.

## Component Spec

**`bottom-nav-shell`** — `position: fixed; left/right: 0; bottom: 0`, flex-centered, `pointer-events: none`, bottom padding ~20px (adjust to taste). This is the only *shell*; it contains the single pill.

**`nav-pill`** — the frosted capsule. Translucent warm fill (`rgba(250,249,245,0.85)`) + `backdrop-filter: blur(20px) saturate(1.4)` + a 1px hairline border + a soft triple-layer shadow (two ambient drops + an inner top highlight). `border-radius: 9999px`. Max width `calc(100vw - 24px)`.

Inside the pill (left → right): brand mark (optional square logo chip) → hairline vertical divider → scrollable link row.

**`nav-link`** — pill-shaped link/button. Base text `{colors.ink-muted}`, hover text `{colors.ink}` with `hoverBg rgba(20,20,19,0.04)`. When active: text `{colors.on-accent}` with `activeBg {colors.accent}`. Padding 8px × 12px, `font-size 11px`, medium weight, letter-spacing ~0.025em.

**`scrollable-link-row`** — `display: flex; gap: 4px; overflow-x: auto; white-space: nowrap; flex: 1 1 0%; min-width: 0`. Hide scrollbar via `scrollbarWidth: none` / `msOverflowStyle: none` (+ `::-webkit-scrollbar { display: none }`).

## Code Template (React + Tailwind CDN)

Replace every UPPERCASE placeholder (`NAV_ITEMS`, `BRAND_MARK`, `ACCENT`, etc.) with your project values. `activeId` / `onNavigate` are the caller's state + handler.

```tsx
// ├── State supplied by the parent:
// │   const [activeId, setActiveId] = useState('nav-item1');
// │   const scrollTo = useCallback((id) => { /* scroll logic here */ }, []);
// └── Usage: <BottomNavbar activeId={activeId} onNavigate={scrollTo} />

import { useCallback } from 'react';

// Replace with your real nav destinations (id + label)
const NAV_ITEMS = [
  { id: 'nav-item1', label: 'Item 1' },
  { id: 'nav-item2', label: 'Item 2' },
  { id: 'nav-item3', label: 'Item 3' },
  { id: 'nav-item4', label: 'Item 4' },
  { id: 'nav-item5', label: 'Item 5' },
];

interface BottomNavbarProps {
  activeId: string;
  onNavigate: (id: string) => void;
}

const ACCENT = '#REPLACE_WITH_ACCENT';        // e.g. theme accent hex
const ON_ACCENT = '#faf9f5';                   // text/icon color on the active pill
const BRAND_LABEL = 'My Brand';                // shown next to the logo chip (desktop only)

export default function BottomNavbar({ activeId, onNavigate }: BottomNavbarProps) {
  const isActive = useCallback((id: string) => activeId === id, [activeId]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1200] flex items-center justify-center pb-5 md:pb-6 pointer-events-none">
      <div className="inline-flex items-center max-w-[calc(100vw-24px)] rounded-full px-1.5 py-1 pointer-events-auto"
           style={{
             background: 'rgba(250,249,245,0.85)',
             backdropFilter: 'blur(20px) saturate(1.4)',
             WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
             border: '1px solid rgba(230,223,216,0.6)',
             boxShadow: '0 4px 24px rgba(20,20,19,0.06), 0 1px 3px rgba(20,20,19,0.04), inset 0 1px 0 rgba(255,255,255,0.5)'
           }}>
        <div className="flex items-center w-full min-w-0">
          {/* Brand mark — replace with your own logo */}
          <button
            onClick={() => onNavigate('nav-item1')}
            className="flex items-center gap-2 pl-3 pr-1 py-2 rounded-full hover:bg-[#141413]/5 transition-colors flex-shrink-0"
            aria-label="Go home"
          >
            <div className="w-7 h-7 rounded-[6px] bg-[#050505] flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 80 40" preserveAspectRatio="xMidYMid meet" className="w-full h-full" aria-hidden="true">
                <g fill="#00CC00">
                  <rect x="10" y="8" width="4" height="24" />
                  <rect x="40" y="8" width="4" height="24" opacity="0.6" />
                  <rect x="44" y="8" width="8" height="4" opacity="0.6" />
                  <rect x="44" y="28" width="8" height="4" opacity="0.6" />
                  <rect x="52" y="12" width="4" height="16" opacity="0.6" />
                </g>
              </svg>
            </div>
            <span className="hidden md:inline text-[9px] font-semibold uppercase tracking-[0.2em] text-[#6c6a64]">
              {BRAND_LABEL}
            </span>
          </button>

          {/* Hairline divider */}
          <div className="w-px h-5 bg-[#e6dfd8] flex-shrink-0" />

          {/* Scrollable link row */}
          <div
            className="flex items-center gap-1 overflow-x-auto whitespace-nowrap rounded-r-full flex-1 min-w-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-2 rounded-full text-[11px] font-medium tracking-wide transition-all duration-300 flex-shrink-0 ${
                  isActive(item.id)
                    ? 'text-[#faf9f5]'
                    : 'text-[#6c6a64] hover:text-[#141413] hover:bg-[#141413]/[0.04]'
                }`}
                style={isActive(item.id) ? { background: ACCENT } : {}}
                aria-current={isActive(item.id) ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

Supporting CSS (if you're not using Tailwind arbitrary values) — the pill and hidden scrollbar can also live in a stylesheet:

```css
.bottom-nav-pill {
  display: inline-flex;
  align-items: center;
  background: rgba(250, 249, 245, 0.85);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid rgba(230, 223, 216, 0.6);
  border-radius: 9999px;
  box-shadow: 0 4px 24px rgba(20, 20, 19, 0.06), 0 1px 3px rgba(20, 20, 19, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  max-width: calc(100vw - 24px);
}

.bottom-nav-links {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge legacy */
}
.bottom-nav-links::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}
```

## Placement Rule

- Only the **pill** catches clicks (`pointer-events: auto`). The shell around it is `pointer-events: none` so the empty bottom strip never intercepts taps/clicks.
- If the page already has a bottom element (e.g. section indicator dots, a sticky bar), move it to the right edge vertically centered, or dock the dots along `right` — do not stack two fixed elements at the bottom center.
- Ensure section content still has bottom padding (`py-12`+) so the fixed pill doesn't cover the last line of content.

## Do's and Don'ts

### Do
- Keep the shell `pointer-events: none`; clickability lives only on the pill.
- Cap the pill at `max-width: calc(100vw - 24px)` on every viewport.
- Keep the link row `overflow-x-auto` + `whitespace-nowrap` + hidden scrollbar so it degrades gracefully on phones.
- Give each item the `flex-shrink-0` class so the row scroll math is stable.
- Use the theme accent for exactly the active item; keep inactive links muted.

### Don't
- Don't anchor it top and bottom on the same page.
- Don't use `position: sticky` when the content behind is a horizontal scroll container — `position: fixed` is required so the pill stays put while sections slide.
- Don't hide the scrollbar without providing another way to reach overflow items (the row must still be draggable/scrollable, or items must be reachable via a drawer).
- Don't put more than ~7–9 items in one row; beyond that, group into a drawer or secondary pill.

## Responsive Behavior

| Viewport | Behavior |
|---|---|
| Desktop (≥ 1024px) | Full link row in one line, brand label visible, `md:pb-6` bottom offset |
| Tablet | Same as desktop; brand label may hide below `md` if signed in |
| Phone (< 768px) | Link row scrolls horizontally inside the pill (`flex-1 min-w-0 overflow-x-auto`); brand label hidden; `pb-5` bottom offset |

Touch targets: item pills are ≥ 32px tall (11px text + 16px vertical padding); increase to `py-3` (44px+ total) if mobile-first ergonomics matter more than density.

## Known Gaps

- The backdrop blur radius and saturation are production defaults (`blur(20px) saturate(1.4)`); adjust per platform/surface.
- The logo SVG is a placeholder geometric mark; replace with the project's own logo chip.
- No hamburger/menu drawer variant is included — for >9 items extend with an overflow "more" pill.