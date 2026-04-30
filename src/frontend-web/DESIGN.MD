---
name: Serene Professional
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#44474e'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#4a5f86'
  primary: '#40557b'
  on-primary: '#ffffff'
  primary-container: '#586d95'
  on-primary-container: '#ebefff'
  inverse-primary: '#b1c7f4'
  secondary: '#5a5f63'
  on-secondary: '#ffffff'
  secondary-container: '#dce0e5'
  on-secondary-container: '#5e6367'
  tertiary: '#525557'
  on-tertiary: '#ffffff'
  tertiary-container: '#6a6d6f'
  on-tertiary-container: '#eef0f2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e3ff'
  primary-fixed-dim: '#b1c7f4'
  on-primary-fixed: '#001b3f'
  on-primary-fixed-variant: '#31476c'
  secondary-fixed: '#dfe3e8'
  secondary-fixed-dim: '#c3c7cc'
  on-secondary-fixed: '#171c20'
  on-secondary-fixed-variant: '#42474b'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  caption:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
---

## Brand & Style

This design system is built on the principles of **Soft Minimalism** and **Modern Professionalism**. It prioritizes a sense of calm and "digital sanctuary" through the use of expansive white space, a muted color palette, and organic 3D elements that provide visual depth without clutter. 

The target audience expects a premium, trustworthy experience where complexity is hidden behind a clean, approachable interface. The emotional response should be one of peace, reliability, and modern efficiency. High-quality 3D renders with soft lighting and pastel gradients are used as key visual anchors to differentiate the interface from standard corporate designs.

## Colors

The palette is anchored in grayscale and cool-toned blues to project stability.
- **Primary:** A desaturated slate blue used for call-to-action buttons and key interactive states.
- **Secondary:** A soft, grayish-blue used for input backgrounds and subtle dividers.
- **Backgrounds:** Pure white is the primary surface color, contrasted by very light gray-blue backgrounds for secondary sections or cards.
- **Typography:** Deep charcoal and muted grays ensure high readability while maintaining the "soft" aesthetic.

## Typography

This design system uses **Manrope** for its clean, geometric, yet friendly personality. The type hierarchy is highly structured:
- **Headlines:** Feature heavy weights (Bold/ExtraBold) and tight letter spacing to create a modern, impactful look.
- **Body Text:** Uses generous line heights and a lighter weight to ensure the "soft" feel and prevent the UI from feeling dense.
- **Secondary Elements:** Labels and secondary links use medium weights and subtle uppercase styling to create clear hierarchy without relying on color alone.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for centralized containers (like login cards) while using a **Fluid** approach for background decorative elements. 

Spacing is airy and intentional. High-level sections are separated by large margins (48px-80px), while internal component spacing remains tight (12px-24px) to keep related information grouped. A consistent 8px base unit (8, 16, 24, 32...) ensures a rhythmic vertical flow across all screen sizes.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layers** rather than harsh borders.
- **Soft Shadows:** Main containers (cards) use very diffused, low-opacity shadows (e.g., `0 20px 50px rgba(0,0,0, 0.05)`) to appear as if floating gently above the background.
- **Interactive Depth:** Buttons use subtle shadows to provide a tactile feel, while inputs remain flat but are distinguished by light background fills.
- **Atmosphere:** Depth is further enhanced by overlapping 2D content with 3D organic shapes, creating a "glass-like" spatial relationship.

## Shapes

The shape language is defined by "Softened Geometric" forms.
- **Containers:** Large cards and major UI blocks use a `24px` to `32px` corner radius to reinforce the friendly and modern aesthetic.
- **Components:** Buttons and input fields use a consistent `8px` to `12px` radius (rounded-lg) to provide a soft touch that is not fully pill-shaped but noticeably curved.
- **Decorative:** Background elements should be organic, blob-like, or spherical, avoiding sharp corners entirely.

## Components

### Buttons
Primary buttons are solid slate-blue with white text and a slightly rounded profile. They should include a transition icon (e.g., an arrow) to signify action. Secondary/Social buttons use a light gray fill with minimal borders.

### Input Fields
Inputs feature a light gray-blue background (`#E9EDF2`) and no visible border in their default state. Icons are placed on the left, using a muted gray tone. Labels are positioned clearly above the field with refined typography.

### Cards
Cards are the primary container. They must be white, feature a high corner radius, and be surrounded by a soft, expansive shadow. Padding inside cards should be generous (typically 40px+) to maintain the minimalist feel.

### Chips / Badges
Used for decorative tags (like "MODERNIDADE SOFT"). These should have high transparency backgrounds or very light fills, with centered text and a pill-shaped radius.

### Social Login
Social buttons (Google/Apple) are treated as equal-width blocks with minimal styling, emphasizing the brand icon over text.