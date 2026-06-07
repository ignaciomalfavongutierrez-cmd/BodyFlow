---
name: Kinetic Bio-Performance
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#baccb1'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#85967d'
  outline-variant: '#3c4b36'
  surface-tint: '#13e607'
  primary: '#87ff70'
  on-primary: '#013a00'
  primary-container: '#19e80d'
  on-primary-container: '#036200'
  inverse-primary: '#036e00'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffdce0'
  on-tertiary: '#51212a'
  tertiary-container: '#ffb5bf'
  on-tertiary-container: '#7b434d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#77ff60'
  primary-fixed-dim: '#13e607'
  on-primary-fixed: '#002200'
  on-primary-fixed-variant: '#025300'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffd9dd'
  tertiary-fixed-dim: '#fdb3bd'
  on-tertiary-fixed: '#370c16'
  on-tertiary-fixed-variant: '#6c3740'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  stat-value:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  container-max: 1200px
---

## Brand & Style
This design system captures the high-intensity energy of elite sports performance and the precision of modern biohacking. The brand personality is aggressive yet calculated, aiming to evoke a sense of "unlocked potential" and immediate action. 

The aesthetic blends **High-Contrast Modernism** with **Glassmorphism**. It utilizes a "Dark Mode First" strategy to reduce eye strain during meal logging while allowing the Electric Lime accents to pop with luminous intensity. Surfaces feel like high-tech displays—translucent, layered, and surgically clean. Visuals should prioritize momentum, using sharp geometry and fluid motion to reinforce the AI-driven speed of the product.

## Colors
The palette is rooted in absolute blacks and deep charcoals to provide a canvas for high-performance data visualization.

- **Primary (Electric Lime):** Used for critical conversion points, success states, and progress indicators. It represents vitality and biological optimization.
- **Secondary (Emerald Tech):** A stabilizing green used for secondary actions and subtle health-trend indicators.
- **Surfaces:** All interactive cards utilize a glassmorphism effect: `rgba(24, 24, 27, 0.7)` with a `12px` backdrop-blur. 
- **Borders:** "Ultra-thin" 1px strokes using `rgba(255, 255, 255, 0.08)` to define shapes without adding visual bulk.

## Typography
**Outfit** is the driver for the brand's geometric and modern voice. It is used for all headings and large numerical data points to ensure a "tech-forward" feel. **Inter** provides the functional backbone for body copy, labels, and dense nutritional information, ensuring maximum legibility at small sizes.

- Use **Negative Letter Spacing** on larger headings to create a tighter, more "editorial" impact.
- **Stat Values** should always use Outfit Bold to emphasize data-driven biohacking results.
- **Label Caps** are reserved for category tags and small metadata headers.

## Layout & Spacing
The layout follows a strict 4px baseline grid to maintain surgical precision. 

- **Mobile (PWA):** Single column with high-density components. Bottom-sheet navigation is preferred for thumb-reachability during meal logging.
- **Grid:** Use a 12-column fluid grid for desktop and a 4-column grid for mobile.
- **Padding:** High internal padding (24px+) within glass cards creates the premium "airy" feel required to offset the dark background.

## Elevation & Depth
Depth is created through **translucency** rather than traditional shadows. 

- **Level 1 (Base):** Pure black `#000000`.
- **Level 2 (Surface):** Glassmorphism cards with `backdrop-filter: blur(12px)`.
- **Level 3 (Interactive):** When hovered, cards should increase in brightness (border opacity moves from 0.08 to 0.2) and gain a subtle `0 0 20px rgba(25, 232, 13, 0.1)` outer glow.
- **Gradients:** Use the `velocity_fade` gradient behind primary containers to suggest light coming from the UI elements themselves.

## Shapes
The shape language is refined and balanced. While most containers use a **16px (rounded-lg)** radius to feel approachable, buttons and input fields use a slightly tighter **12px (rounded-md)** radius to feel "performance-tuned."

- **Icons:** Use 2px stroke weight icons with rounded caps to match the typography.
- **Progress Bars:** Fully pill-shaped (999px) to communicate fluid movement and "flow."

## Components

### Buttons
- **Primary:** Background uses `kinetic_glow` gradient. Text is pure black for maximum contrast. On hover, apply a scale transform of `1.02` and increase box-shadow glow.
- **Secondary:** Transparent background with a `1px` solid `rgba(25, 232, 13, 0.4)` border. 

### Glass Cards
- Used for meal entries and macro tracking.
- **Header:** Title in Snow White, subtitle in Muted Grey.
- **Interaction:** Micro-bounce animation on press (scale 0.98).

### Progress Rings (Bio-Stats)
- Use Electric Lime for the active track and `rgba(255, 255, 255, 0.1)` for the remaining path.
- Add a subtle glow to the leading edge of the progress indicator.

### Input Fields
- Background: `rgba(255, 255, 255, 0.03)`.
- Active State: Border color shifts to Electric Lime with a subtle inner glow. 
- Floating labels using **Inter Bold** at 12px.

### Micro-Animations
- Transitions between screens should use a "Slide + Fade" with a `cubic-bezier(0.22, 1, 0.36, 1)` easing for a snappy, high-performance feel.