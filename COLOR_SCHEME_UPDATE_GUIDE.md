# Burgundy & Beige Color Scheme - Update Guide

## ✅ COMPLETED:
- [x] Created centralized color theme (`src/theme/colors.js`)
- [x] Updated global CSS variables in `src/index.css`
- [x] Updated utility classes (buttons, cards, dividers)

## 🎨 COLOR MAPPINGS:

### OLD → NEW Replacements:

| Old Color | New Color | Usage |
|-----------|-----------|-------|
| `#242120` | `#3D2A2A` | Card backgrounds |
| `#171614` | `#2E1E1E` | Main background, dark surfaces |
| `#F3EBDD` | `#F3E9D2` | Primary text (beige) |
| `#D8C7AE` | `#C8A165` | Accent color (gold/tan) |
| `#B6A58F` | `#7E5A5F` | Muted text (mauve) |
| `#8B4513` | `#5C1D24` | Primary actions (burgundy) |
| `#9A7650` | `#C8A165` | Highlights, CTAs |

## 📋 FILES TO UPDATE:

The color changes will automatically apply through:

1. **CSS Variables** - Already updated in `index.css`
   - All components using CSS variables will update automatically
   
2. **Utility Classes** - Already updated
   - `.equestrian-card`
   - `.btn-primary-equestrian`
   - `.btn-secondary-equestrian`
   - `.bronze-accent` → now burgundy
   - `.eyebrow-label`

3. **Inline Styles** - Need manual updates in:
   - Components with hardcoded hex colors
   - SVG elements with fill/stroke colors
   - Gradient definitions
   
## 🔄 REFRESH YOUR BROWSER

After these changes:
1. **Hard refresh** your browser (Ctrl+Shift+R or Ctrl+F5)
2. **Clear cache** if colors don't update
3. The new Burgundy & Beige theme should be active!

## 🎨 NEW COLOR PALETTE:

### Primary Colors:
- **Burgundy**: `#5C1D24` - Headers, primary actions
- **Beige**: `#F3E9D2` - Text, light backgrounds
- **Gold/Tan**: `#C8A165` - Accents, CTAs, highlights
- **Mauve**: `#E5A5F` - Secondary text, muted elements
- **Dark Brown**: `#2E1E1E` - Main background

### Usage Guidelines:
- **Backgrounds**: Dark brown (`#2E1E1E`) for main, lighter (`#3D2A2A`) for cards
- **Text**: Beige (`#F3E9D2`) for primary, Gold (`#C8A165`) for highlights
- **Actions**: Gold (`#C8A165`) for buttons, Burgundy (`#5C1D24`) for headers
- **Borders**: Gold with opacity `rgba(200,161,101,0.15)`

## 🚀 TESTING:

Check these pages after refresh:
- ✅ Homepage - hero section, cards
- ✅ Products page - product cards
- ✅ Admin panel - all admin pages
- ✅ Forms - inputs, buttons
- ✅ Navigation - navbar, footer

## 📝 NOTES:

- The theme is now centralized in `src/theme/colors.js`
- Import and use these colors in new components:
  ```javascript
  import colors from '../theme/colors'
  
  style={{ background: colors.primary, color: colors.beige }}
  ```

- For gradients, use:
  ```javascript
  import { gradients } from '../theme/colors'
  
  style={{ background: gradients.accent }}
  ```
