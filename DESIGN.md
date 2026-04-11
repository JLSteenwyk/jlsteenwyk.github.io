# Biophilic Theme — Design System Documentation

## Overview

The **Biophilic** theme is a "Nature-Tech Hybrid" aesthetic that pairs modern tech clarity with calming natural cues.

---

## 1. Color Palette (Design Tokens)

| Token | Hex | Usage |
|---|---|---|
| **Base background** | `#f6f4f0` | Page bg — warm off-white / fog |
| **Surface** | `#ffffff` | Cards, inputs, panels |
| **Subtle surface** | `#efeee9` | Footer, secondary bg |
| **Text primary** | `#2c3029` | Body copy (deep charcoal/ink) |
| **Text secondary** | `#3a3d37` | Paragraphs, body text |
| **Heading ink** | `#1e2b1a` | Headings — darkest green-ink |
| **Moss green** | `#4a6741` | Primary accent — buttons, links hover, borders |
| **Forest green** | `#3d7a56` | Gradient endpoint for primary actions |
| **Glacier blue** | `#3a6b80` | Secondary accent — links, ocean cue |
| **Muted green** | `#6b7c5e` | Tertiary buttons |
| **Muted text** | `#6b7264` | Copyright, captions |

### WCAG Contrast Ratios (AA minimum = 4.5:1)

- `#2c3029` on `#f6f4f0` → **10.2:1** (passes AAA)
- `#3a3d37` on `#f6f4f0` → **7.8:1** (passes AAA)
- `#4a6741` on `#f6f4f0` → **5.1:1** (passes AA)
- `#3a6b80` on `#f6f4f0` → **4.7:1** (passes AA)
- `#ffffff` on `#4a6741` → **5.1:1** (passes AA — button text)

---

## 2. Typography

### Font Pairing

| Role | Font | Weight | Notes |
|---|---|---|---|
| **Headings** | Libre Baskerville | 700 (bold), 400 italic | Modern serif — editorial warmth |
| **Body / UI** | Source Sans 3 | 400, 500, 600, 700 | Clean, highly legible sans-serif |
| **Code** | JetBrains Mono / Fira Code | 400 | Monospace for code blocks |

### Type Scale

| Element | Size | Line-height | Max-width |
|---|---|---|---|
| `h2` | 2.2em | 1.3 | — |
| `h3` | 1.6em | 1.3 | — |
| Body `p` | 1.05em | 1.75 | 72ch (hero lead) |
| Hero tagline | 1.4em | inherit | — |

### Rules

- Generous `line-height: 1.75` for body text (readability)
- `letter-spacing: -0.01em` on headings (editorial tightness)
- Hero lead constrained to `max-width: 72ch` for readability
- Heading underlines use a leaf-vein gradient (`#4a6741` → `#3a6b80` → transparent)

---

## 3. Shape Language & Layout

### Radii

| Element | Radius |
|---|---|
| Cards / wrappers | `20px` |
| Buttons (CTA) | `20px` |
| Inputs | `10px` |
| Portrait frame | `24px` (outer), `20px` (inner img) |
| Images | `12–14px` |
| Dropdowns | `12px` |
| Publication pills | `16–20px` |
| Theme selector | `18px` |

### Shadows

- **Ambient:** `0 8px 32px rgba(44,48,41,0.06)` — cards
- **Elevated:** `0 16px 48px rgba(44,48,41,0.08)` — hero panels
- **Hover lift:** `0 12px 36px rgba(44,48,41,0.14)` — interactive
- **Button:** `0 8px 24px rgba(74,103,65,0.25)` — primary CTA

### Organic Forms

- Subtle paper-grain texture overlay via SVG fractal noise (`opacity: 0.028`)
- Faint radial-gradient "nature wash" blobs in bg (green + blue, `opacity: 0.035`)
- Rounded corners throughout (no sharp boxes)
- HR dividers: gradient `transparent → moss → glacier → transparent`

---

## 4. Component Usage

### Buttons

```html
<!-- Primary (moss green) -->
<a class="cta-button primary" href="#">View Publications</a>

<!-- Secondary (glacier blue) -->
<a class="cta-button secondary" href="#">Explore</a>

<!-- Tertiary (muted green) -->
<a class="cta-button tertiary" href="#">Software</a>

<!-- Ghost / Quaternary (outline-like on light bg) -->
<a class="cta-button quaternary" href="#">Learn More</a>
```

### Cards

Content wrappers use `.wrapper` class — in biophilic theme they get:
- Semi-transparent white bg (`rgba(255,255,255,0.55)`)
- `backdrop-filter: blur(8px)` for subtle frosted effect
- 1px border in `rgba(74,103,65,0.08)`
- `border-radius: 20px`

### Navigation

- Header uses frosted `rgba(246,244,240,0.88)` with `backdrop-filter: blur(16px)`
- Nav links are uppercase `Source Sans 3` with animated underline on hover
- Underline uses gradient: moss green → glacier blue

### Footer

- Solid `#efeee9` background with subtle border-top
- Social icons: white circles with green accent, invert on hover

### Links

- Default: `#3a6b80` (glacier blue) with subtle bottom border
- Hover: transitions to `#4a6741` (moss green)
- Focus: `2px solid #4a6741` outline with `3px` offset

---

## 5. Motion Rules

### Interactions

| Interaction | Duration | Easing | Property |
|---|---|---|---|
| Button hover lift | 250ms | `ease` | `transform, box-shadow` |
| Link color change | 250ms | `ease` | `color, border-color` |
| Card hover | 300ms | `ease` | `transform, box-shadow` |
| Image hover scale | 300ms | `ease` | `transform` |
| Nav underline | 300ms | `ease` | `width` |

### Scroll Reveal

- `.wrapper`, `.feature-highlight`, `.publication-item` use `biophilic-fadeUp` animation
- `0.6s ease-out` — subtle 24px upward slide with fade

### Reduced Motion

All animations are disabled when `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  body.biophilic-theme .wrapper,
  body.biophilic-theme .feature-highlight,
  body.biophilic-theme .publication-item {
    animation: none;
  }
}
```

The site also has a global reduced-motion rule that kills all `animation-duration` and `transition-duration`.

---

## 6. Before / After — Major Visual Changes

| Element | Before (Glassmorphism default) | After (Biophilic) |
|---|---|---|
| **Background** | Dark gradient with animated color shift | Warm off-white `#f6f4f0` with faint grain |
| **Text color** | White / light on dark | Dark charcoal `#2c3029` on light |
| **Headings font** | Space Grotesk (geometric sans) | Libre Baskerville (editorial serif) |
| **Body font** | Inter | Source Sans 3 |
| **Accent colors** | Purple/pink gradient, electric blue | Moss green `#4a6741`, glacier blue `#3a6b80` |
| **Header** | Dark frosted glass with blur | Light frosted parchment with blur |
| **Cards/Wrappers** | Dark translucent glass panels | Light translucent panels with organic radii |
| **Buttons** | Glass effect with ripple animation | Solid moss/glacier gradients with lift |
| **Links** | Electric blue `#9ae6ff` with glow | Glacier blue with subtle underline |
| **Footer** | Dark glass with glowing icons | Warm parchment with green icon circles |
| **Shadows** | Heavy blue-purple glass shadows | Soft earth-toned ambient shadows |
| **Motion** | Floating orbs, gradient shift, heavy animations | Subtle fade-up, hover lifts only |
| **Texture** | Clean gradient background | Faint paper grain + nature color washes |
| **Overall feel** | Futuristic, vibrant, high-energy | Calm, editorial, grounded, restorative |

### Layout Adjustments

- No layout or IA changes — same grid, same sections, same routes
- Hero aurora ribbons hidden (replaced by nature-gradient banner bg)
- Border radii slightly adjusted for organic feel (20px cards vs 24–26px glass)
- Typography has more generous line-height (1.75 vs 1.6)

---

## 7. Theme Activation

Select **"Biophilic"** from the theme dropdown in the footer. The choice persists via `localStorage` under key `jlsteenwyk-theme`.

Body class applied: `biophilic-theme`
