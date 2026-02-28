# StellarBoat Demo Site — Design & Visual Identity

> **Purpose:** This document defines the visual identity, design system, and component usage for the official StellarBoat demo site available at the live deployment.

---

## Overview

The demo site demonstrates StellarBoat's complete component library, design token system, and recommended patterns for marketing mini-sites. It serves as a living styleguide and architectural reference alongside the code.

### Demo Site Audience

- **Prospective forkers** — exploring what's possible with StellarBoat
- **AI agents** — analyzing patterns and component usage before writing code
- **Core contributors** — testing changes in a realistic context
- **Brand partners & case studies** — showcasing StellarBoat capabilities

---

## Visual Identity

### Overall Aesthetic

The demo site showcases StellarBoat with a **2D flat vector interface** in a futuristic **"Deep Space" theme**. The visual language is:

- **Flat, geometric, and minimal** — no realism, textures, or skeuomorphism
- **High contrast and neon-accented** — dark backgrounds with vibrant accent highlights
- **Atmospheric and subtle** — glow effects and gradients feel like starlight, not decoration
- **Clean and spacious** — generous negative space, clear visual hierarchy

### Color Palette

The demo site establishes a futuristic deep space brand using dark backgrounds and high-contrast neon accents.

#### Primitive Scale (Tailwind utilities)

Defined in `src/styles/tokens.css` under `@theme`:

| Role | Color | Hex | Usage |
|---|---|---|---|
| **Midnight** (primary bg) | Deep blue-black | `#0a0e27` | Page background, starfield |
| **Space Blue** | Dark neutral blue-gray | `#1a1f3a` | Elevated surfaces, cards |
| **Starfield** | Pure black | `#000000` | Deep space areas, minimal use |
| **Neon Cyan** (accent 1) | Electric cyan | `#00d9ff` | Interactive elements, glows, focus states |
| **Neon Purple** (accent 2) | Electric purple | `#c000ff` | Accent highlights, gradients |
| **Text White** | Bright white | `#ffffff` | Primary text, high contrast |
| **Text Gray** | Soft gray-white | `#b0b8c8` | Secondary text, meta |
| **Border** | Subtle light tone | `#2d3a5a` | Subtle dividers |

#### Semantic Aliases (CSS variables, fork customization zone)

Defined in `@layer base` of `tokens.css` — Deep Space theme only (dark mode is canonical):

| Variable | Value | Used for |
|---|---|---|
| `--color-bg` | `#0a0e27` (Midnight) | Page background |
| `--color-surface` | `#1a1f3a` (Space Blue) | Card and elevated surfaces |
| `--color-text` | `#ffffff` (Text White) | Primary text, high contrast |
| `--color-text-muted` | `#b0b8c8` (Text Gray) | Secondary text, meta, captions |
| `--color-border` | `#2d3a5a` (Subtle Border) | Dividers, input borders |
| `--color-accent` | `#00d9ff` (Neon Cyan) | CTAs, interactive elements, focus outlines |
| `--color-accent-secondary` | `#c000ff` (Neon Purple) | Gradient accents, decorative highlights |

#### Gradient Usage

- **Radial nebula gradients:** Midnight → Electric Purple (background depth)
- **Diagonal transitions:** Space Blue → Neon Cyan (hover states, decorative elements)
- **Smooth, atmospheric flows** — no harsh banding or multicolor effects
- Avoid pure decorative color rainbows; gradients should feel like starlight and cosmic atmosphere

### Typography

**Bold geometric sans-serif** for a modern, minimal, highly legible appearance:

| Family | Font | Usage | Style |
|---|---|---|---|
| Heading | Inter, Geist Sans, or similar geometric sans | `<h1>` through `<h6>` | Bold, tight spacing |
| Body | Same as heading | Paragraph text, body content | Regular weight, moderate line height |
| Mono | JetBrains Mono | Code blocks, inline `<code>` | Single-weight (no variants) |

#### Font Scale

Defined in component styles and Tailwind utilities. Weight hierarchy emphasizes contrast without serif alternatives:

| Level | Size | Line Height | Weight | Letter Spacing | Usage |
|---|---|---|---|---|---|
| XL | 2.5rem (40px) | 1.1 | 700 (bold) | +1px | Page titles (`<h1>` on hero) |
| LG | 1.75rem (28px) | 1.2 | 600 (semibold) | +0.5px | Section headings (`<h2>`) |
| Base | 1rem (16px) | 1.6 | 400 (regular) | 0 | Body text |
| SM | 0.875rem (14px) | 1.6 | 500 (medium) | 0 | Small labels, captions |
| XS | 0.75rem (12px) | 1.4 | 500 (medium) | 0 | Badges, tags, UI labels |

**Typography principles:**
- Headings are bold and tight (emphasize geometric structure)
- Body text has moderate line height (1.6) for legibility on dark backgrounds
- Secondary text uses soft gray-white; do not reduce font size excessively
- No serif, script, or decorative fonts
- Slightly increased letter spacing on large headings (1em or greater)

### Spacing & Layout

Tailwind's 8px baseline grid with emphasis on **generous negative space**. Low to medium visual density — breathing room is essential:

| Token | Value | Tailwind class | Usage |
|---|---|---|---|
| `.spacing-xs` | 0.5rem (8px) | `gap-2` | Tight internal component spacing |
| `.spacing-md` | 1.5rem (24px) | `gap-6` | Default padding/gaps between elements |
| `.spacing-lg` | 2rem (32px) | — | Section internal padding |
| `.spacing-section` | 6rem (96px) | — | **Large whitespace between major sections** |
| `.width-container` | 72rem (1152px) | `max-w-6xl` | Content max-width (centered) |
| `.spacing-container` | 2rem (32px) | — | Horizontal gutters (site padding) |

**Layout principles:**
- Centered hero composition
- Horizontal feature grids with strict column alignment
- Symmetrical balance; no asymmetric layouts
- **Whitespace is a design element** — use it to create visual hierarchy and breathing room
- Clear separation between sections via spacing, not dividers

### Shadows & Glow Effects

Shadows are **minimal and soft**. Glow effects provide the primary visual language:

| Effect | CSS | Usage |
|---|---|---|
| **No shadow (default)** | None | Buttons, text, most components |
| **Soft shadow** | `0 2px 8px rgba(0,0,0,0.3)` | Elevated cards on hover |
| **Neon glow (Cyan)** | `0 0 16px rgba(0,217,255,0.5)` | Interactive element focus, hover accent |
| **Gradient glow** | `0 0 24px rgba(192,0,255,0.4)` | Decorative accents, featured sections |

**Glow Effect Rules:**
- Use glows sparingly (interactive states, not background decoration)
- Glows are 16px–24px blur radius, 20%–50% opacity
- Allowed: neon cyan focus outline, subtle purple glow on hover
- **Not allowed:** heavy drop shadows, blur-heavy glassmorphism, noise textures

### Border Radius

Geometric, clean corners (not overly rounded):

| Token | Value | Tailwind class | Usage |
|---|---|---|---|
| `--radius-md` | 0.5rem (8px) | `rounded` | Buttons, input fields, small badges |
| `--radius-lg` | 1rem (16px) | `rounded-lg` | Cards, larger components |
| `--radius-full` | 9999px | `rounded-full` | Avatar circles, icon badges |

---

## Component Showcase

The demo site includes live examples of all core components. Each is displayed with its intended context and common configurations.

### Page Sections

#### Hero Section (`/demo`)
- Full-width dark gradient background (Midnight → Electric Purple radial gradient)
- **Starfield effect:** Small scattered white dots (opacity 0.3–0.5) for depth
- Central focal illustration (flat vector, clean lines, neon accent highlights)
- Text positioned centered or below illustration
- Generous vertical padding (6rem–8rem top/bottom)
- CTA button with neon cyan text and subtle hover glow
- **No photorealism or texture overlays**

#### Features Section
- 3-column horizontal grid with equal-width cards
- Dark Space Blue `#1a1f3a` card backgrounds with subtle borders
- Icon + title + description stacked vertically
- Icons are flat, minimalist, single-color (white or neon cyan)
- Hover state: **slight upward lift** (transform: translateY(-4px)) + **neon cyan glow**
- No heavy shadows; elevation via glow only
- Consistent internal padding (1.5rem)

#### Testimonials Section
- Quote cards with author bio (name, title, avatar)
- 1-column on mobile, 2–3 columns on desktop
- Dark Space Blue background matching feature cards
- Avatar: flat vector illustration, 64px square, `rounded` (8px) corners
- Quote text in Text White with secondary attribution in Text Gray
- Optional neon cyan accent bar/border left side

#### Pricing Section
- Comparison table (if 3+ plans) or card grid (if 2 plans)
- Cards: dark Space Blue with neon cyan accent border on "recommended" plan
- "Recommended" card has subtle glow highlight; others are flat
- Per-plan feature checklist with checkmark icons
- Annual/monthly toggle (static in v1; CSS only, no JS required)

#### Logo Bar Section
- Horizontal icon/logo grid (brands, partners, integrations)
- Minimal styling (logo icons in Text Gray, opacity 0.6–0.8)
- Hover: neon cyan glow or color shift on individual logos
- Use for "Featured In" and partnership credibility

#### CTA Section ("Call-to-Action")
- Headline, optional subheadline, button(s)
- Center-aligned text composition
- Optional decorative neon purple gradient background bar
- Direct conversion driver before footer
- Button uses neon cyan accent with hover glow

## UI Components

#### Button
- **Default (primary):** Neon cyan text on transparent background with neon cyan border
- **Hover:** Neon cyan glow box-shadow, slight background fill (rgba(0,217,255,0.1))
- **Active:** Intensified neon cyan color + glow
- **Focus:** Thin neon cyan outline (2px)
- Three sizes: `sm` (py-1 px-3), `md` (py-2 px-4), `lg` (py-3 px-6)
- Disabled state: Text Gray color, no glow
- Icon support (left/right slots)
- Full-width variant (mobile CTA)

#### Card
- Dark Space Blue `#1a1f3a` background
- `rounded-lg` (16px) corners; subtle `#2d3a5a` border (1px)
- Internal padding: `p-6` (24px) default
- Optional header/footer sections
- Hover: slight upward shift + neon cyan glow (optional)
- Very minimal shadow (only on hover); flat by default

#### Badge & Tag
- Dark Space Blue background with neon cyan text
- Sizes: `sm` (text-xs, py-1 px-2), `md` (text-sm, py-1 px-3)
- Variants: solid (cyan on space blue), outline (cyan border, transparent bg)
- Rounded corners (0.5rem or `rounded-full` for pill style)

#### Alert
- Solid colored background: info (space blue + cyan text), success (dark green), warning (dark amber), error (dark red)
- Icon (left) + title + description + close button
- High contrast text (white or neon accent)
- No drop shadows; flat design

#### Divider
- Horizontal line separator
- Color: `#2d3a5a` subtle border
- Optional centered label in Text Gray

#### Icon
- Astro-icon wrapper for Iconify library
- Flat or thin-line style (no gradients inside icons)
- Single-color: white or neon cyan depending on context
- 24px or 32px default sizes (consistent stroke width)
- Geometric and simplified shapes (technical, lightweight, precise appearance)

#### Button Group
- Horizontal layout of related buttons
- Buttons joined with shared borders
- Active button shows neon cyan highlight
- Use for pagination, view toggles, filter buttons

### Form Components

#### Contact Form
- Fields: name, email, message (textarea)
- Optional phone field for lead capture variant
- Required field indicators (asterisk, `aria-required`)
- Inline error messages in red
- Success state (confirmation message or redirect)

#### Newsletter Form
- Single email input with CTA button
- Inline layout (mobile stacks)
- Minimal, fast conversion UI

#### Form Field (base component)
- Label with optional required indicator
- Input (text, email, tel, textarea, select)
- Below-input error area (`role="alert"`)
- Helper text option

### Header & Footer

#### Header
- Dark Space Blue `#1a1f3a` background (or transparent on hero)
- Logo/site name (left, Text White, bold)
- Navigation items (center/right, Text Gray on default, Text White on hover with neon cyan underline)
- CTA button (neon cyan, right side on desktop)
- Mobile hamburger menu (responsive nav collapse at 768px, neon cyan icon color)
- Optional: sticky positioning with subtle top border/glow

#### Footer
- Deep Midnight `#0a0e27` background (darker than page bg for depth)
- Logo or site name (top, Text White)
- Column layout: product, company, legal, social
- Footer links in Text Gray with neon cyan on hover
- Copyright year (auto-updated)
- Optional: subtle top border in `#2d3a5a`

---

## Typography & Content Patterns

### Heading Hierarchy

```
<h1> — Page title; one per page, in hero or intro (neon cyan accent optional)
<h2> — Major section divider (Text White, bold)
<h3> — Subsection within major section (Text White, semibold)
<h4> — Minor subheading (rarely used)
```

Headings are bold, geometric sans-serif with tight line-height (1.1–1.2). Large headings use increased letter spacing (+1px) for emphasis and visual impact.

### Prose Styling

The `src/styles/prose.css` file defines typography for MDX-rendered content (blog posts, static pages):

- **Paragraph line-height:** 1.6 (spacious, readable on dark backgrounds)
- **Text color:** Text White (#ffffff) for body, Text Gray (#b0b8c8) for secondary
- **Code blocks:** Dark background (#0a0e27), neon cyan syntax highlighting, line numbers (optional)
- **Blockquotes:** Neon cyan left border accent (4px), Text Gray italic text
- **Lists:** Bullets (unordered) or numbers (ordered) in Text White; list items use Text Gray for secondary content
- **Links:** Neon cyan color with underline; underline transitions to glow on hover

### Content Tone

The demo site's content exemplifies:
- **Professional yet futuristic** — embrace the "space" metaphor without being corny
- **Benefit-focused** — describe *why* features matter to users
- **Concise** — long paragraphs should be split into multiple shorter ones
- **Action-oriented** — CTAs use imperative verbs ("Deploy Now", "Explore", "Launch")
- **Honest** — non-goals are stated; no exaggerated claims

---

## Responsive Behavior

Tailwind's mobile-first breakpoints with emphasis on **clear visual hierarchy at all sizes**:

| Breakpoint | Size | Tailwind prefix | Usage |
|---|---|---|---|
| Base (mobile) | 0–767px | (no prefix) | Single column, stacked sections, hamburger nav |
| Tablet | 768px+ | `md:` | 2-column layouts, visible menu bar |
| Desktop | 1024px+ | `lg:` | 3-column layouts, full hero experiences |
| Wide desktop | 1280px+ | `xl:` | Full-width sections, gallery layouts |

The demo site renders correctly at all sizes:
- **Mobile (375px):** Single column, stacked sections, icons above text, minimal spacing
- **Tablet (768px):** Two columns, medium spacing, horizontal nav
- **Desktop (1024px+):** Three-column grids, generous whitespace, full animations

---

## Dark Mode

**Dark mode (Deep Space theme) is the canonical and only color scheme for the demo site.** No light mode toggle.

```css
/* src/styles/tokens.css */
@layer base {
  :root {
    --color-bg: #0a0e27;           /* Midnight deep space */
    --color-surface: #1a1f3a;       /* Space Blue cards */
    --color-text: #ffffff;          /* Text White */
    --color-text-muted: #b0b8c8;    /* Text Gray */
    --color-border: #2d3a5a;        /* Subtle borders */
    --color-accent: #00d9ff;        /* Neon Cyan */
    --color-accent-secondary: #c000ff; /* Neon Purple */
  }
}
```

Dark mode colors are chosen for:
- **Contrast:** Text and accents meet WCAG AA accessibility standards (4.5:1 minimum)
- **Vibrancy:** Neon accents glow against the dark background without straining eyes
- **Atmosphere:** Deep space blues and cyans evoke the desired futuristic aesthetic

**A user-controlled dark/light toggle is not planned for v1** (the entire site *is* dark). A toggle is a post-v1 enhancement if needed for accessibility customization.

---

## Accessibility

All demo components meet **WCAG 2.1 Level AA** standards on dark backgrounds:

### Visual Accessibility
- **Contrast ratio:** Minimum 4.5:1 (Text White on Space Blue), 7:1+ (Neon Cyan for accents)
- **Text legibility:** Line-height 1.6+ on dark backgrounds; font size minimum 16px for body
- **Large touch targets:** Buttons ≥ 44×44px (or padded to that size)
- **Color not only:** Icons + color or text redundancy; no color-only status indicators
- **Focus indicators:** Visible neon cyan 2px outline, no transparency

### Semantic HTML & ARIA
- Native `<button>`, `<input>`, `<label>` elements (not divs)
- Form fields have associated `<label>` elements with clear text
- Error messages use `role="alert"` and `aria-live="polite"`
- Buttons have clear visible text in Text White (no icon-only buttons without labels)
- Navigation uses semantic `<nav>`, `<ul>`, `<li>`
- Headings follow proper nesting (`<h1>` → `<h2>` → `<h3>`)

### Motion & Animation
- Reduced motion respected: animations are skipped if `prefers-reduced-motion: reduce` is set
- No auto-playing videos or animations
- Focus states are visible and use neon cyan outline (high contrast)
- Hover states are optional enhancements, not required for functionality

### Testing
- Demo site is tested with Lighthouse CI (accessibility ≥ 95)
- Manual testing with screen readers (NVDA, VoiceOver, JAWS)
- Keyboard navigation verification (Tab, Enter, Escape flow)
- Color contrast verification (use WebAIM or similar tools)

---

## Performance Considerations

The demo site is optimized for Core Web Vitals (target: Lighthouse 95+):

### Image Optimization
- All images passed through Astro's `<Image />` component
- Automatic AVIF/WebP generation with WebP fallback
- Lazy loading by default for below-fold images
- Proper aspect ratios to prevent layout shift (Cumulative Layout Shift)

### Code Splitting
- CSS is scoped per component (Astro scoped styles)
- No global JavaScript in the hero or critical rendering path
- Form submission is progressive enhancement (works without JS)
- Icon library (Iconify) is tree-shaken — only used icons are shipped

### Asset Size
- No heavy icon libraries; use Iconify for zero-runtime icon loading
- No animation libraries; CSS transitions only
- Third-party scripts (GTM) loaded asynchronously
- CSS is minimized; no unnecessary utilities shipped

### Visual Optimization
- Starfield effects use CSS (not canvas or heavy SVG)
- Glow effects are CSS-only (no image overlays)
- Gradients are CSS-native (not image-based)

---

## Content Guidelines

### Headlines
- **Page `<h1>`:** Benefit-focused, technically grounded, futuristic tone
  - Example: "Deploy a production site in minutes"
  - Avoid: "Welcome to StellarBoat" or vague taglines
- **Section `<h2>`:** Action-oriented or feature-focused
  - Example: "Built for the modern web"
  - Avoid: "Next Section" or unclear category names

### Copy Patterns
- **Hero section:** Headline (1 line) + 1–2 sentence subheadline + CTA button
- **Feature card:** Icon + title (2–4 words) + 1 sentence description
- **Testimonial:** Quote (1–3 sentences) + author attribution (name, title)
- **Pricing:** Plan name + price + 3–5 benefit bullets + CTA
- **Footer:** Legal links, social icons, copyright year

### Links & CTAs
- CTA buttons use neon cyan with hover glow
- CTA text: action verbs ("Deploy Now", "Explore", "Get Started")
- Blog links stay on-domain
- External links open in new tab (`target="_blank"`) with icon indicator:
  ```html
  <a href="..." rel="noopener noreferrer">
    Link <Icon name="external-link" class="text-cyan-400" />
  </a>
  ```
- Internal navigation links use Text Gray with neon cyan underline on hover

---

## File Organization

```
src/demo/
├── content/
│   ├── blog/               # demo .mdx blog posts
│   │   └── *.mdx
│   └── authors/            # demo author profiles
│       └── *.json
└── README.md               # demo-specific notes

src/pages/demo/
├── index.astro             # /demo/
├── components.astro        # /demo/components — component showcase
├── design.astro            # /demo/design — design tokens showcase
├── blog-example.astro      # /demo/blog-example — blog template example
└── ...                     # additional demo routes as needed
```

---

## Future Enhancements (Post-v1)

- **Starfield interactive effect** — Animated starfield background with parallax (low performance impact)
- **Component Storybook** — Interactive component browser with all variants
- **Design tokens playground** — Visual color picker and token customization preview
- **Figma design file** — Wireframes, component specs, grid system, icon set
- **Accessibility audit checklist** — Detailed WCAG 2.1 checklist for forks
- **Dark/light mode toggle** — User option for potential future light mode variant

---

*This design document is the visual reference for the StellarBoat demo site. It should be updated whenever visual or component changes are made. It serves as a resource for forkers, AI agents, and contributors building with or extending StellarBoat.*
