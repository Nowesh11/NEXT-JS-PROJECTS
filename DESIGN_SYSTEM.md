# TLS Design System Documentation

## Overview
This design system provides a comprehensive guide for maintaining visual consistency and user experience across the Tamil Language Sangam (TLS) web applications.

## Design Philosophy

### Core Principles
1. **Cultural Heritage**: Honoring Tamil culture through thoughtful design choices
2. **Modern Accessibility**: Ensuring inclusive design for all users
3. **Performance First**: Optimized for 60fps animations and fast loading
4. **Mobile-First**: Responsive design that works beautifully on all devices
5. **Glassmorphic Aesthetics**: Modern glass-like effects with depth and transparency

## Color Palette

### Primary Colors
- **Cultural Blue**: `#667eea` - Primary brand color
- **Digital Purple**: `#764ba2` - Secondary brand color
- **Tamil Red**: `#dc2626` - Accent color for Tamil elements
- **Heritage Gold**: `#f59e0b` - Highlight color

### Gradient Combinations
```css
/* Primary Gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Cultural Gradient */
background: linear-gradient(135deg, #dc2626 0%, #f59e0b 100%);

/* Glassmorphic Background */
background: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.1) 0%,
  rgba(255, 255, 255, 0.05) 100%
);
```

### Semantic Colors
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Error**: `#ef4444` (Red)
- **Info**: `#3b82f6` (Blue)

## Typography

### Font Families
- **Primary**: Inter (Latin text)
- **Tamil**: Noto Sans Tamil (Tamil text)
- **Fallback**: system-ui, -apple-system, sans-serif

### Font Weights
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extrabold: 800

### Typography Scale
```css
/* Headings */
.text-6xl { font-size: 3.75rem; line-height: 1; }
.text-5xl { font-size: 3rem; line-height: 1; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }

/* Body Text */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
```

## Glassmorphism Effects

### Base Glass Effect
```css
.glass-morphism {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}
```

### Variants
- **Light Glass**: Higher opacity for prominent elements
- **Heavy Glass**: Stronger blur for background elements
- **Gradient Glass**: Combined with gradients for depth

## Animation System

### Timing Functions
```css
/* Smooth transitions */
.ease-smooth { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }

/* Bouncy animations */
.ease-bounce { transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55); }

/* Spring animations */
.ease-spring { transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94); }
```

### Animation Durations
- **Fast**: 150ms - Micro-interactions
- **Normal**: 300ms - Standard transitions
- **Slow**: 500ms - Page transitions
- **Slower**: 1000ms - Complex animations

### Common Animations
```css
/* Hover Effects */
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Floating Animation */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Component Library

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

/* Glass Button */
.btn-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
}
```

### Cards
```css
/* Glass Card */
.card-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}

/* Hover Card */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}
```

## Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Container System
```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container { max-width: 640px; padding: 0 1.5rem; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; padding: 0 2rem; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
```

## Accessibility Guidelines

### Color Contrast
- **Normal Text**: Minimum 4.5:1 contrast ratio
- **Large Text**: Minimum 3:1 contrast ratio
- **UI Components**: Minimum 3:1 contrast ratio

### Focus States
```css
.focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
  border-radius: 0.375rem;
}
```

### Screen Reader Support
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Performance Optimization

### GPU Acceleration
```css
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}
```

### Efficient Animations
- Use `transform` and `opacity` for animations
- Avoid animating layout properties
- Use `will-change` sparingly
- Remove `will-change` after animation completes

### Image Optimization
- Use WebP format when possible
- Implement lazy loading
- Provide appropriate sizes and srcset
- Use CSS for simple graphics

## Dark Mode Support

### CSS Variables
```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #1f2937;
  --glass-bg: rgba(255, 255, 255, 0.1);
}

.dark {
  --bg-primary: #0f172a;
  --text-primary: #f8fafc;
  --glass-bg: rgba(15, 23, 42, 0.1);
}
```

### Implementation
```css
.bg-primary {
  background-color: var(--bg-primary);
}

.text-primary {
  color: var(--text-primary);
}
```

## Internationalization (i18n)

### Language Support
- **English**: Primary language
- **Tamil**: Secondary language with proper font support

### Text Direction
```css
[dir="rtl"] {
  text-align: right;
}

[dir="ltr"] {
  text-align: left;
}
```

## Usage Guidelines

### Do's
✅ Use consistent spacing (8px grid system)
✅ Implement proper focus states
✅ Test with screen readers
✅ Optimize for mobile first
✅ Use semantic HTML elements
✅ Maintain color contrast ratios

### Don'ts
❌ Don't use fixed pixel values for responsive design
❌ Don't animate layout properties
❌ Don't rely solely on color for information
❌ Don't use auto-playing media without controls
❌ Don't ignore keyboard navigation
❌ Don't use low contrast color combinations

## File Structure

```
styles/
├── globals.css          # Global styles and CSS reset
├── components.css       # Component-specific styles
├── responsive.css       # Responsive design utilities
├── performance.css      # Performance optimizations
├── accessibility.css    # Accessibility features
└── glassmorphism.css   # Glassmorphic effects
```

## Maintenance

### Regular Updates
- Review and update color contrast ratios
- Test accessibility features quarterly
- Optimize performance metrics monthly
- Update documentation with new components

### Version Control
- Use semantic versioning for design system updates
- Document breaking changes
- Provide migration guides for major updates

---

*This design system is a living document that evolves with the TLS applications. Regular updates ensure consistency and modern best practices.*