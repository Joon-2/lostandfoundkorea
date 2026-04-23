# DESIGN.md — Design System

## Color Palette

### Primary
| Token | Hex | Usage |
|-------|-----|-------|
| primary | #059669 | CTA buttons, links, accents |
| primaryHover | #047857 | Button hover state |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| text | #1a202c | Headings, primary text |
| textMuted | #4a5568 | Body text, descriptions |
| textLight | #718096 | Subtle text, placeholders, footnotes |

### Background
| Token | Hex | Usage |
|-------|-----|-------|
| background | #ffffff | Main background |
| backgroundAlt | #f8fafb | Alternating section backgrounds |
| card | #ffffff | Card backgrounds |
| border | #e2e8f0 | Borders, dividers |

### Status
| Token | Hex | Usage |
|-------|-----|-------|
| success | #10b981 | Success states, confirmations |
| warning | #f59e0b | Warnings, pending states |
| error | #ef4444 | Errors, destructive actions |
| info | #3b82f6 | Info, links |

### Status Badges
| Status | Background | Text |
|--------|-----------|------|
| Pending | #fef3c7 | #92400e |
| Found | #dbeafe | #1e40af |
| Paid | #d1fae5 | #065f46 |
| Closed | #e5e7eb | #374151 |

## Typography

### Fonts
| Token | Value | Usage |
|-------|-------|-------|
| heading | 'DM Serif Display', Georgia, serif | h1, h2, section titles |
| body | 'Inter', -apple-system, sans-serif | All body text, UI elements |

### Sizes
| Element | Desktop | Mobile |
|---------|---------|--------|
| h1 (hero) | 48px | 32px |
| h2 (section) | 32px | 24px |
| h3 (card title) | 18px | 16px |
| body | 16px | 15px |
| small/muted | 14px | 13px |
| footnote | 13px | 12px |

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| section | 80px | Between landing page sections (desktop) |
| sectionMobile | 48px | Between sections (mobile) |
| card | 24px | Card internal padding |
| gap | 16px | Default gap between elements |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 8px | Inputs, small elements |
| md | 12px | Cards, buttons |
| lg | 16px | Large cards, modals |
| full | 9999px | Pills, badges, round buttons |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| card | 0 1px 3px rgba(0,0,0,0.08) | Default card shadow |
| hover | 0 4px 12px rgba(0,0,0,0.1) | Hover state shadow |

## Component Styles

### Buttons
- Primary: bg-primary, text-white, rounded-md, px-6 py-3, hover:bg-primaryHover
- Secondary: bg-transparent, border border-border, text-text, rounded-md
- Danger: bg-transparent, border border-error, text-error, rounded-md
- All buttons: font-body, font-semibold, transition

### Inputs
- bg-white, border border-border, rounded-sm, px-4 py-3
- Focus: ring-2 ring-primary/30, border-primary
- Label: text-textMuted, text-sm, font-medium, uppercase, tracking-wide, mb-2

### Cards
- bg-card, border border-border, rounded-lg, shadow-card, p-card
- Hover (if interactive): shadow-hover

### Badges
- rounded-full, px-3 py-1, text-xs, font-semibold
- Colors based on status (see Status Badges above)

## Layout Rules

### Header
- White background, sticky, border-bottom border-border
- Height: 60px
- Logo left, nav center-left, CTA right
- Mobile: hamburger menu

### Landing Page Sections
- Alternate between background and backgroundAlt
- Max content width: 1200px, centered
- Section padding: section (desktop) / sectionMobile (mobile)

### Footer
- Dark navy (#1e293b) background, white text
- Compact, single row on desktop

### Forms
- Max width: 560px, centered
- Labels above inputs
- Required fields marked with * in primary color

## Do NOT Use
- Dark theme (except footer)
- Italic fonts for logos
- Purple/blue gradients
- More than 2 font families
- Hardcoded color values in components — always use tokens
