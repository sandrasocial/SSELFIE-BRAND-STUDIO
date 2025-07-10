# SSELFIE STUDIO - EDITORIAL STYLEGUIDE

## CRITICAL DESIGN RULES (NEVER VIOLATE)

### ABSOLUTE PROHIBITIONS
- **NO ICONS OR EMOJIS EVER** - Use text characters only (×, +, >, <, •, ...)
- **NO ROUNDED CORNERS** - All elements must have sharp, clean edges
- **NO SHADOWS OR GRADIENTS** - Flat, minimal design only
- **NO BLUE LINKS** - All interactive elements use black/white palette
- **NO VISUAL CLUTTER** - Maximum whitespace, minimal elements

### APPROVED COLOR PALETTE ONLY
```css
--black: #0a0a0a;
--white: #ffffff;
--editorial-gray: #f5f5f5;
--mid-gray: #fafafa;
--soft-gray: #666666;
--accent-line: #e5e5e5;
```

### TYPOGRAPHY SYSTEM
```css
/* Headlines - Times New Roman ONLY */
h1, h2, h3 {
    font-family: 'Times New Roman', serif;
    font-weight: 200;
    text-transform: uppercase;
    letter-spacing: -0.01em;
}

/* Body Text - System Sans */
body, p, div {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-weight: 300;
    letter-spacing: -0.01em;
}

/* Editorial Quote Style */
.editorial-quote {
    font-family: 'Times New Roman', serif;
    font-size: clamp(2rem, 5vw, 4rem);
    font-style: italic;
    letter-spacing: -0.02em;
    line-height: 1.2;
    font-weight: 300;
}
```

## COMPONENT STANDARDS

### BUTTONS
```css
.btn {
    padding: 16px 32px;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    border: 1px solid var(--black);
    background: transparent;
    transition: all 300ms ease;
}

.btn:hover {
    background: var(--black);
    color: var(--white);
}
```

### NAVIGATION
```css
.nav-menu a {
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--black);
}
```

### HERO SECTIONS
```css
.hero-title-main {
    font-family: 'Times New Roman', serif;
    font-size: clamp(5rem, 12vw, 12rem);
    line-height: 0.9;
    font-weight: 200;
    letter-spacing: 0.3em;
    text-transform: uppercase;
}
```

## LAYOUT PRINCIPLES

### GRID SYSTEM
- 12-column grid with 30px gaps
- Maximum container width: 1400px
- Padding: 40px (desktop), 20px (mobile)

### SECTION SPACING
- Section padding: 120px vertical (desktop), 60px (mobile)
- Component margins: 24px, 32px, 40px, 60px increments

### RESPONSIVE BREAKPOINTS
```css
/* Desktop First */
@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 768px) { /* Mobile */ }
```

## TEXT CHARACTER REPLACEMENTS

### INSTEAD OF ICONS, USE:
```
× → Close/Delete
+ → Add/Expand
> → Forward/Next
< → Back/Previous
› → Chevron Right
‹ → Chevron Left
• → Bullet Point
⋮ → Menu/Options
… → More/Ellipsis
↗ → External Link
↓ → Download
⌄ → Dropdown Arrow
✓ → Checkmark
```

## CODE EXAMPLES

### WRONG (Never Use):
```tsx
// WRONG - Icons
<ChevronRight className="h-4 w-4" />
<PlusIcon size={16} />

// WRONG - Colors
className="bg-blue-500 text-blue-600"
className="bg-gradient-to-r from-pink-500"

// WRONG - Rounded corners
className="rounded-lg border-radius-8"

// WRONG - Shadows
className="shadow-lg drop-shadow-md"
```

### CORRECT (Always Use):
```tsx
// CORRECT - Text characters
<span className="text-sm">×</span>
<span className="text-lg">+</span>

// CORRECT - Approved colors
className="bg-black text-white"
className="bg-white text-black border border-black"

// CORRECT - Sharp edges
className="border border-black"

// CORRECT - Flat design
className="bg-white border border-gray-200"
```

## COMPONENT PATTERNS

### EDITORIAL CARD
```tsx
<div className="bg-white hover:bg-black hover:text-white transition-all duration-500">
  <div className="p-60">
    <div className="text-xs uppercase tracking-widest mb-4">Category</div>
    <h3 className="font-times text-4xl uppercase tracking-tight mb-6">Title</h3>
    <p className="text-base font-light leading-relaxed">Description</p>
  </div>
</div>
```

### IMAGE CONTAINER
```tsx
<div className="relative overflow-hidden bg-gray-50 aspect-[4/5]">
  <img 
    src="image.jpg" 
    className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
    alt="Description"
  />
</div>
```

### NAVIGATION MENU
```tsx
<nav className="fixed top-0 w-full bg-white/95 backdrop-blur border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-10 py-5 flex justify-between items-center">
    <div className="font-times text-xl">SSELFIE</div>
    <ul className="flex gap-10">
      <li><a href="#" className="text-xs uppercase tracking-widest">Studio</a></li>
      <li><a href="#" className="text-xs uppercase tracking-widest">Gallery</a></li>
    </ul>
  </div>
</nav>
```

## DESIGN VALIDATION CHECKLIST

### ✅ BEFORE COMMITTING CODE:
- [ ] No Lucide React icons imported
- [ ] No emoji characters used
- [ ] Only approved colors (#0a0a0a, #ffffff, #f5f5f5)
- [ ] Times New Roman for headlines
- [ ] System fonts for body text
- [ ] No rounded corners (border-radius: 0)
- [ ] No shadows or gradients
- [ ] Text characters used instead of icons
- [ ] Proper letter-spacing and font-weights
- [ ] Sharp, minimal aesthetic maintained

### ⚠️ COMMON VIOLATIONS TO AVOID:
- Using any Lucide React components
- Adding rounded corners to buttons or cards
- Using blue colors for links or highlights
- Adding drop shadows or box shadows
- Using decorative fonts other than Times New Roman
- Adding visual effects like gradients
- Using icon libraries or emoji

## LUXURY AESTHETIC PRINCIPLES

### WHITESPACE IS LUXURY
- Generous padding and margins
- Sparse, intentional element placement
- Clean, uncluttered layouts

### TYPOGRAPHY AS ART
- Times New Roman headlines create editorial sophistication
- Uppercase text with letter-spacing for luxury feel
- Light font weights for elegance

### MINIMAL COLOR PALETTE
- Black and white create timeless sophistication
- Gray accents add subtle depth
- No color distractions from content

### SHARP, CLEAN EDGES
- No rounded corners maintain architectural precision
- Flat design emphasizes content over decoration
- Clean lines create professional appearance

This styleguide ensures SSELFIE Studio maintains its luxury editorial aesthetic across all components and pages. Every design decision should emphasize sophistication, minimalism, and timeless elegance.