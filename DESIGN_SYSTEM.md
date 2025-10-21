# 🎨 Explora Design System

**Version**: 1.0.0  
**Last Updated**: October 21, 2025  
**Maintained by**: Tomas Cormack

---

## 🎯 Design Principles

1. **Accessibility First** - WCAG 2.1 AA compliance minimum
2. **High Contrast** - All text must be easily readable
3. **Consistent Spacing** - Use Tailwind spacing scale
4. **Responsive by Default** - Mobile-first approach
5. **Emotional Connection** - Epic, refined, and inspiring

---

## 🎨 Color Palette

### Primary Colors

| Color              | Hex     | Tailwind     | Usage                            |
| ------------------ | ------- | ------------ | -------------------------------- |
| **Blue Primary**   | #2563EB | `blue-600`   | Primary CTA, links, accents      |
| **Purple**         | #7C3AED | `purple-600` | Secondary accents, gradients     |
| **Pink**           | #EC4899 | `pink-600`   | Tertiary accents, gradients      |
| **Green Success**  | #16A34A | `green-600`  | Success states, positive metrics |
| **Red Error**      | #DC2626 | `red-600`    | Errors, negative metrics         |
| **Yellow Warning** | #CA8A04 | `yellow-600` | Warnings, ratings                |

### Text Colors (HIGH CONTRAST)

| Usage                   | Color   | Tailwind                          | Contrast Ratio           |
| ----------------------- | ------- | --------------------------------- | ------------------------ |
| **Headings (H1-H2)**    | #111827 | `text-gray-900` + `font-bold`     | 14:1 ✅                  |
| **Subheadings (H3-H4)** | #111827 | `text-gray-900` + `font-semibold` | 14:1 ✅                  |
| **Labels**              | #111827 | `text-gray-900` + `font-semibold` | 14:1 ✅                  |
| **Body Text**           | #374151 | `text-gray-700`                   | 8.6:1 ✅                 |
| **Secondary Text**      | #4B5563 | `text-gray-600`                   | 7:1 ✅                   |
| **Disabled Text**       | #6B7280 | `text-gray-500`                   | 4.5:1 ⚠️ (use sparingly) |

**❌ NEVER USE** `text-gray-400` for important text (contrast ratio 2.8:1 - FAILS WCAG)

### Background Colors

| Usage                  | Color    | Tailwind                                                   |
| ---------------------- | -------- | ---------------------------------------------------------- |
| **Page Background**    | Gradient | `bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50` |
| **Card Background**    | #FFFFFF  | `bg-white`                                                 |
| **Section Background** | #F9FAFB  | `bg-gray-50`                                               |
| **Hover State**        | #F3F4F6  | `hover:bg-gray-100`                                        |

---

## 📝 Typography Scale

### Headings

```tsx
// Page Title (H1)
<h1 className='text-3xl font-bold text-gray-900 mb-6'>

// Section Title (H2)
<h2 className='text-2xl font-bold text-gray-900 mb-4'>

// Card Title (H3)
<h3 className='text-xl font-semibold text-gray-900 mb-3'>

// Component Title (H4)
<h4 className='text-lg font-semibold text-gray-900 mb-2'>
```

### Body Text

```tsx
// Primary Body
<p className='text-base text-gray-700'>

// Secondary Body
<p className='text-sm text-gray-600'>

// Caption/Helper
<p className='text-xs text-gray-600 font-medium'>
```

### Labels

```tsx
// Form Labels (MUST BE HIGH CONTRAST)
<label className='block text-sm font-semibold text-gray-900 mb-2'>

// Table Headers
<th className='text-sm font-semibold text-gray-900'>

// Stats Labels
<p className='text-sm font-semibold text-gray-700 mb-1'>
```

---

## 🔘 Components

### Buttons

```tsx
// Primary CTA
<button className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300'>

// Secondary
<button className='bg-white border-2 border-gray-300 text-gray-900 px-8 py-3 rounded-2xl font-bold hover:border-blue-600 hover:text-blue-600 transition-all duration-300'>

// Danger
<button className='bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700'>

// Success
<button className='bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700'>
```

### Cards

```tsx
// Standard Card
<div className='bg-white rounded-lg shadow p-6'>
  <h3 className='text-xl font-semibold text-gray-900 mb-4'>Title</h3>
  <p className='text-gray-700'>Content</p>
</div>

// Metric Card
<div className='bg-white rounded-lg shadow p-6'>
  <p className='text-sm font-semibold text-gray-700 mb-1'>Metric Label</p>
  <p className='text-3xl font-black text-gray-900 mb-2'>$1,234</p>
  <p className='text-sm font-medium text-green-600'>+12%</p>
</div>
```

### Forms

```tsx
// Input Group
<div>
  <label className='block text-sm font-semibold text-gray-900 mb-2'>
    Email
  </label>
  <input
    type='email'
    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900'
    placeholder='guide@example.com'
  />
  <p className='text-xs text-gray-600 mt-1 font-medium'>Helper text</p>
</div>
```

### Tables

```tsx
// Table Headers
<th className='text-left py-3 px-4 text-sm font-semibold text-gray-900'>
  Column Name
</th>

// Table Cells
<td className='py-3 px-4 text-sm text-gray-700'>
  Cell content
</td>
```

### Badges

```tsx
// Status Badge - Success
<span className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold'>
  Active
</span>

// Status Badge - Warning
<span className='px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold'>
  Pending
</span>

// Status Badge - Error
<span className='px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold'>
  Cancelled
</span>
```

---

## 🌈 Gradients

### Text Gradients

```tsx
// Primary Gradient (Blue → Purple → Pink)
<span className='bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'>
  Gradient Text
</span>

// Gold Gradient (for highlights)
<span className='bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent'>
  Starts Here
</span>
```

### Background Gradients

```tsx
// Page Background
className='bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'

// Section Background
className='bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'

// Card Glow Effect
<div className='absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-30'></div>
```

---

## ✨ Effects

### Glassmorphism

```tsx
// Backdrop Blur
className = 'backdrop-blur-md bg-white/70'

// Card with Blur
className = 'bg-white/50 backdrop-blur-sm border border-white/20'
```

### Shadows

```tsx
// Small
className = 'shadow-sm hover:shadow-md'

// Medium
className = 'shadow-md hover:shadow-lg'

// Large
className = 'shadow-xl hover:shadow-2xl'

// Colored Shadow
className = 'shadow-2xl hover:shadow-blue-500/50'
```

### Hover States

```tsx
// Scale Transform
className = 'hover:scale-105 transition-transform duration-300'

// Shadow + Scale
className = 'hover:shadow-xl hover:scale-105 transition-all duration-300'

// Background Change
className = 'hover:bg-gray-100 transition-colors duration-200'
```

---

## 📐 Spacing Scale

### Padding

| Size | Class  | Usage                     |
| ---- | ------ | ------------------------- |
| XS   | `p-2`  | Tight spacing, badges     |
| SM   | `p-4`  | Card padding (mobile)     |
| MD   | `p-6`  | Card padding (standard)   |
| LG   | `p-8`  | Page padding, large cards |
| XL   | `p-12` | Section padding           |

### Margins

| Size | Class   | Usage                 |
| ---- | ------- | --------------------- |
| XS   | `mb-2`  | Form fields spacing   |
| SM   | `mb-4`  | Component spacing     |
| MD   | `mb-6`  | Section spacing       |
| LG   | `mb-8`  | Page section spacing  |
| XL   | `mb-12` | Major section spacing |

---

## 📱 Responsive Breakpoints

```tsx
// Mobile First
className = 'grid-cols-1'

// Tablet (≥768px)
className = 'md:grid-cols-2'

// Desktop (≥1024px)
className = 'lg:grid-cols-4'

// Large Desktop (≥1280px)
className = 'xl:grid-cols-5'
```

---

## ♿ Accessibility Guidelines

### Minimum Requirements

1. **Color Contrast**:

   - Text on white: Minimum 7:1 ratio (use `text-gray-700` or darker)
   - Large text: Minimum 4.5:1 ratio
   - UI components: Minimum 3:1 ratio

2. **Focus States**:

   - All interactive elements MUST have `focus:ring-2`
   - Use `focus:ring-blue-500` for consistency

3. **Font Sizes**:

   - Minimum body text: `text-sm` (14px)
   - Minimum labels: `text-sm` (14px)
   - Buttons: `text-base` or `text-lg` (16px+)

4. **Font Weights**:
   - Labels: `font-semibold` (600) minimum
   - Headings: `font-bold` (700) or `font-black` (900)
   - Body: `font-normal` (400) or `font-medium` (500)

---

## 🚫 Common Mistakes to Avoid

### ❌ Bad Contrast (DO NOT USE)

```tsx
// BAD: Labels too light
<label className='text-gray-500'>Email</label>

// BAD: Important text too light
<p className='text-gray-400'>Important information</p>

// BAD: Heading too light
<h2 className='text-gray-600'>Section Title</h2>
```

### ✅ Good Contrast (USE THIS)

```tsx
// GOOD: Labels dark and bold
<label className='text-gray-900 font-semibold'>Email</label>

// GOOD: Important text visible
<p className='text-gray-700 font-medium'>Important information</p>

// GOOD: Heading dark and bold
<h2 className='text-gray-900 font-bold'>Section Title</h2>
```

---

## 📋 Checklist Before Shipping

- [ ] All headings use `text-gray-900` with `font-bold` or `font-black`
- [ ] All labels use `text-gray-900` with `font-semibold`
- [ ] All body text uses `text-gray-700` minimum
- [ ] Secondary text uses `text-gray-600` minimum (never 400 or 500 for important content)
- [ ] All buttons have hover states
- [ ] All inputs have focus states
- [ ] All interactive elements are keyboard accessible
- [ ] Color contrast tested with tool (e.g., WebAIM Contrast Checker)

---

## 🎬 Animation Guidelines

### Transitions

```tsx
// Fast (hover states)
transition-colors duration-200

// Medium (scales, shadows)
transition-all duration-300

// Slow (backgrounds, special effects)
transition-all duration-1000
```

### Transforms

```tsx
// Subtle scale
hover:scale-105

// Rotate
transform rotate-6 hover:rotate-0
```

---

**Use this guide to ensure visual consistency and accessibility across all pages!**
