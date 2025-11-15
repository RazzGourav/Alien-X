# Design Tokens - LUMEN-Agent

## Color System

### Primary Colors
```
Purple (Primary)
  Hex: #8B5CF6
  RGB: 139, 92, 246
  Usage: Buttons, active states, highlights
  Tailwind: from-primary, bg-primary, text-primary

Green (Success)
  Hex: #22C55E
  RGB: 34, 197, 94
  Usage: Success messages, positive trends
  Tailwind: text-green-500, bg-green-500

Indigo (Accent)
  Hex: #4F46E5
  RGB: 79, 70, 229
  Usage: Secondary actions, accents
  Tailwind: from-accent, bg-accent

Red (Destructive)
  Hex: #EF4444
  RGB: 239, 68, 68
  Usage: Errors, delete actions
  Tailwind: bg-destructive, text-destructive
```

### Neutral Colors
```
Background (Dark)
  Hex: #0F172A
  RGB: 15, 23, 42
  Usage: Main background
  Tailwind: bg-background

Card
  Hex: #1E293B
  RGB: 30, 41, 59
  Usage: Card backgrounds
  Tailwind: bg-card

Foreground (Light)
  Hex: #F1F5F9
  RGB: 241, 245, 249
  Usage: Text color
  Tailwind: text-foreground

Muted
  Hex: #94A3B8
  RGB: 148, 163, 184
  Usage: Secondary text
  Tailwind: text-muted-foreground
```

### Status Colors
```
Success: #22C55E (Green)
Warning: #F59E0B (Amber)
Error: #EF4444 (Red)
Info: #3B82F6 (Blue)
Pending: #6B7280 (Gray)
```

---

## Typography

### Font Family
```
Sans: Geist Sans (default)
Mono: Geist Mono (code)
```

### Font Sizes
```
xs:  12px (0.75rem)
sm:  14px (0.875rem)
base: 16px (1rem)
lg:  18px (1.125rem)
xl:  20px (1.25rem)
2xl: 24px (1.5rem)
3xl: 30px (1.875rem)
4xl: 36px (2.25rem)
5xl: 48px (3rem)
6xl: 60px (3.75rem)
7xl: 72px (4.5rem)
8xl: 96px (6rem)
```

### Font Weights
```
Light:       300
Normal:      400
Medium:      500
Semibold:    600
Bold:        700
Extrabold:  800
Black:      900
```

### Line Heights
```
Tight:    1.25
Snug:     1.375
Normal:   1.5
Relaxed:  1.625
Loose:    2
```

---

## Spacing

### Scale
```
0:    0px
1:    0.25rem (4px)
2:    0.5rem (8px)
3:    0.75rem (12px)
4:    1rem (16px)
5:    1.25rem (20px)
6:    1.5rem (24px)
7:    1.75rem (28px)
8:    2rem (32px)
9:    2.25rem (36px)
10:   2.5rem (40px)
12:   3rem (48px)
14:   3.5rem (56px)
16:   4rem (64px)
20:   5rem (80px)
24:   6rem (96px)
28:   7rem (112px)
32:   8rem (128px)
36:   9rem (144px)
40:   10rem (160px)
44:   11rem (176px)
48:   12rem (192px)
52:   13rem (208px)
56:   14rem (224px)
60:   15rem (240px)
64:   16rem (256px)
72:   18rem (288px)
80:   20rem (320px)
96:   24rem (384px)
```

### Common Spacing Patterns
```
Padding:
  p-4   - Standard padding
  px-6  - Horizontal padding
  py-3  - Vertical padding

Margin:
  m-4   - Standard margin
  mx-auto - Center horizontally
  mb-8  - Bottom margin

Gap:
  gap-4 - Gap between items
  gap-6 - Larger gap
```

---

## Border Radius

### Scale
```
none:    0px
sm:      0.125rem (2px)
base:    0.375rem (6px)
md:      0.5rem (8px)
lg:      0.625rem (10px)
xl:      0.75rem (12px)
2xl:     1rem (16px)
3xl:     1.5rem (24px)
full:    9999px
```

### Usage
```
Buttons:      rounded-md
Cards:        rounded-lg
Modals:       rounded-lg
Icons:        rounded-full
Inputs:       rounded-md
```

---

## Shadows

### Scale
```
none:      no shadow
xs:        0 1px 2px 0 rgba(0, 0, 0, 0.05)
sm:        0 1px 2px 0 rgba(0, 0, 0, 0.05)
base:      0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
md:        0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
lg:        0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
xl:        0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
2xl:       0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

### Glow Effects
```
Primary Glow:     0 0 20px rgba(139, 92, 246, 0.5)
Secondary Glow:   0 0 20px rgba(34, 197, 94, 0.5)
```

---

## Transitions

### Duration
```
75ms:   Instant feedback
100ms:  Quick interactions
150ms:  Standard
200ms:  Smooth
300ms:  Smooth (default)
500ms:  Slow
700ms:  Very slow
1000ms: Animation
```

### Timing Functions
```
linear:      Constant speed
ease-in:     Slow start
ease-out:    Slow end
ease-in-out: Slow start and end
```

### Common Transitions
```
Button Hover:    transition-all duration-200
Card Hover:      transition-all duration-300
Page Load:       transition-all duration-500
```

---

## Breakpoints

### Responsive Sizes
```
Mobile:    < 640px (sm)
Tablet:    640px - 1024px (md, lg)
Desktop:   > 1024px (lg, xl)
```

### Tailwind Breakpoints
```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

### Usage
```
Mobile First:
  <div className="text-sm md:text-base lg:text-lg">

Hidden on Mobile:
  <div className="hidden lg:flex">

Full Width Mobile:
  <div className="w-full lg:w-1/2">
```

---

## Component Sizes

### Button Sizes
```
sm:  height: 32px (h-8)
md:  height: 36px (h-9) - default
lg:  height: 40px (h-10)
icon: 36px (size-9)
```

### Card Sizes
```
Compact:  p-4
Standard: p-6
Large:    p-8
```

### Icon Sizes
```
xs:  16px (w-4 h-4)
sm:  20px (w-5 h-5)
md:  24px (w-6 h-6)
lg:  32px (w-8 h-8)
xl:  40px (w-10 h-10)
```

---

## Opacity Scale

```
0:    0%
5:    5%
10:   10%
20:   20%
25:   25%
30:   30%
40:   40%
50:   50%
60:   60%
70:   70%
75:   75%
80:   80%
90:   90%
95:   95%
100:  100%
```

### Usage
```
Hover State:     opacity-90
Disabled:        opacity-50
Subtle:          opacity-60
```

---

## Z-Index Scale

```
0:    0
10:   10
20:   20
30:   30
40:   40
50:   50
auto: auto
```

### Common Usage
```
Sidebar:         z-40
Header:          z-40
Modal Overlay:   z-50
Tooltip:         z-50
Dropdown:        z-40
```

---

## Animation Presets

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
animation: fadeIn 0.3s ease-in-out;
```

### Slide Up
```css
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
animation: slideUp 0.3s ease-out;
```

### Scale
```css
@keyframes scale {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
animation: scale 0.2s ease-out;
```

---

## Gradient Presets

### Primary Gradient
```
from-primary via-accent to-primary
Linear 45deg
```

### Card Gradient
```
from-card to-card/80
Linear 145deg
```

### Background Gradient
```
from-blue-900/50 via-background to-background
Linear to bottom-right
```

---

## Accessibility

### Contrast Ratios
```
WCAG AA:  4.5:1 (normal text)
WCAG AA:  3:1 (large text)
WCAG AAA: 7:1 (normal text)
WCAG AAA: 4.5:1 (large text)
```

### Focus States
```
Outline:   2px solid primary
Offset:    2px
Color:     primary with 50% opacity
```

### Disabled States
```
Opacity:   50%
Cursor:    not-allowed
Pointer:   none
```

---

## CSS Variables

### Dark Theme
```css
--background: #0F172A;
--foreground: #F1F5F9;
--card: #1E293B;
--card-foreground: #F1F5F9;
--primary: #8B5CF6;
--primary-foreground: #FFFFFF;
--secondary: #22C55E;
--secondary-foreground: #0F172A;
--accent: #4F46E5;
--accent-foreground: #FFFFFF;
--destructive: #EF4444;
--border: rgba(255, 255, 255, 0.1);
--input: #334155;
--ring: rgba(139, 92, 246, 0.5);
```

---

## Component Tokens

### Button
```
Default:     bg-primary text-primary-foreground
Outline:     border bg-background
Ghost:       hover:bg-accent
Disabled:    opacity-50 cursor-not-allowed
```

### Card
```
Background:  bg-card
Border:      border-border
Padding:     p-6
Radius:      rounded-lg
Shadow:      shadow-lg
```

### Input
```
Background:  bg-input
Border:      border-border
Focus:       ring-ring
Padding:     px-3 py-2
Radius:      rounded-md
```

### Badge
```
Padding:     px-2.5 py-0.5
Radius:      rounded-full
Font Size:   text-xs
Font Weight: font-semibold
```

---

## Utility Classes

### Commonly Used
```
Flexbox:       flex items-center justify-between
Grid:          grid grid-cols-3 gap-4
Centering:     flex items-center justify-center
Spacing:       p-4 m-4 gap-4
Text:          text-sm font-semibold text-foreground
Responsive:    md:grid-cols-2 lg:grid-cols-3
Hover:         hover:bg-primary/10 transition-all
```

---

## Best Practices

1. **Use CSS Variables** - Always use --primary, --secondary, etc.
2. **Consistent Spacing** - Use multiples of 4px (p-4, p-8, etc.)
3. **Responsive First** - Design mobile-first, enhance for larger screens
4. **Semantic Colors** - Use primary for actions, destructive for deletions
5. **Smooth Transitions** - Always add transition-all duration-200+
6. **Accessibility** - Maintain 4.5:1 contrast ratio minimum
7. **Performance** - Avoid inline styles, use Tailwind classes

---

*Design Tokens Reference - LUMEN-Agent*
*Last Updated: November 15, 2025*
