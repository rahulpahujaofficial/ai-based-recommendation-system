# Development Guide

## Prerequisites

- Node.js 18+ (get it from [nodejs.org](https://nodejs.org))
- npm 9+ (comes with Node.js)
- Git
- A code editor (VS Code recommended)

## Project Setup

### 1. Clone & Install

```bash
git clone <repository-url>
cd ai-recommendation-system
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:5173`

## Project Structure

### `/src/components`
- **`ui/`** — Reusable components (Button, Card, Input, Badge, Progress, Label, Tabs)
- **`layout/`** — Navbar and Footer
- **`landing/`** — Landing page sections (Hero, Features, Pricing, Testimonials, CTA)
- **`three/`** — 3D scenes using React Three Fiber
- **`dashboard/`** - All dashboard pages and layout

### `/src/pages`
- `LandingPage.jsx` — Main landing page combining all sections

### `/src/data`
- `mockData.js` — All mock products, analytics, testimonials, plans, and features

### `/src/lib`
- `utils.js` — Utility functions for formatting, classnames, embed code generation

### Root Files
- `App.jsx` — React Router setup with all routes
- `main.jsx` — Entry point
- `index.css` — Global styles and Tailwind configuration
- `tailwind.config.js` — Tailwind theming
- `postcss.config.js` — CSS processing
- `vite.config.js` — Vite build configuration

## Key Features

### 1. Responsive Layout

The app is fully responsive with breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 2. Dark Theme

All colors use CSS variables defined in `src/index.css`:
```css
--background: 224 71% 4%;
--primary: 263 70% 60%;
--secondary: 222 47% 11%;
```

### 3. 3D Scenes

Using React Three Fiber:
- `HeroCanvas.jsx` — Landing page 3D with rotating objects
- `DashboardCanvas.jsx` — Dashboard AI visualization

### 4. Animation

Using Framer Motion:
- Page transitions
- Hover effects
- Scroll animations
- Staggered list items

### 5. Charts

Using Recharts:
- Revenue trends
- Conversion funnel
- Category distribution
- Daily click data

## Adding New Components

### Create a UI Component

```jsx
// src/components/ui/example.jsx
import { cn } from '@/lib/utils'

export function Example({ children, className, ...props }) {
  return (
    <div className={cn('base-styles', className)} {...props}>
      {children}
    </div>
  )
}
```

### Create a Page Component

```jsx
// src/components/dashboard/ExamplePage.jsx
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ExamplePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Example Page</h2>
      {/* Content here */}
    </div>
  )
}
```

### Add Route

Edit `src/App.jsx`:
```jsx
<Route path="/dashboard/example" element={<ExamplePage />} />
```

## Common Tasks

### Update Colors

Edit `tailwind.config.js` in the `extend.colors` section.

### Change Mock Data

Edit `src/data/mockData.js` and export new data sets.

### Modify Landing Page

Edit sections in `src/components/landing/` and import in `LandingPage.jsx`.

### Update Dashboard Layout

Edit `DashboardLayout.jsx` for sidebar, header, or navigation changes.

### Add Analytics Chart

Add data to `mockData.js`, import chart component, and use Recharts:

```jsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={yourData}>
    <XAxis dataKey="name" />
    <YAxis />
    <CartesianGrid />
    <Tooltip />
    <Line type="monotone" dataKey="value" stroke="#8b5cf6" />
  </LineChart>
</ResponsiveContainer>
```

## Styling Guidelines

### Class Naming

Use Tailwind utilities with the `cn()` helper:

```jsx
import { cn } from '@/lib/utils'

<div className={cn('base-class', condition && 'conditional-class')}>
```

### Custom Classes

Available in `src/index.css`:
- `.gradient-text` — Gradient effect
- `.glass-card` — Glassmorphic card
- `.glass-card-hover` — Glass card with hover
- `.grid-bg` — Grid pattern
- `.glow-violet` — Violet glow effect

### Responsive Classes

```jsx
<div className="text-sm md:text-lg lg:text-xl">
  Responsive text
</div>
```

### Dark Theme

All components use dark theme by default. Colors:
- Dark backgrounds: `bg-background`, `bg-white/5`, `bg-white/10`
- Text: `text-white`, `text-white/50`, `text-white/70`
- Borders: `border-white/8`, `border-white/20`

## Building & Deployment

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Optimized output in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deployment

**Vercel:**
```bash
npm i -g vercel
vercel deploy
```

**Netlify:**
```bash
npm run build
# Connect dist/ in Netlify dashboard
```

**Docker:**
```bash
docker build -t recoai .
docker run -p 3000:3000 recoai
```

## Performance Tips

1. **Code Splitting** — Routes are automatically code-split
2. **Image Optimization** — Use external CDN URLs
3. **Component Memoization** — Use `memo()` for expensive components
4. **Lazy Loading** — Use `Suspense` with `lazy()` for heavy components
5. **Bundle Analysis** — Use Vite's built-in bundle analyzer

## Debugging

### Browser DevTools
- React DevTools — Inspect component hierarchy
- Network tab — Monitor API calls
- Performance tab — Profile rendering

### VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier Code Formatter

### Common Issues

**Styles not applying:**
- Clear browser cache (`Cmd+Shift+R` or `Ctrl+Shift+R`)
- Check Tailwind class names
- Verify CSS import in component

**3D not rendering:**
- Check browser console for Three.js errors
- Ensure WebGL is enabled
- Try disabling browser hardware acceleration

## Environment Variables

Create `.env.local`:

```env
VITE_API_BASE=https://api.example.com
VITE_STORE_ID=your_store_id
```

Access in code:
```jsx
const apiBase = import.meta.env.VITE_API_BASE
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes, commit
git add .
git commit -m "Add my feature"

# Push and create PR
git push origin feature/my-feature
```

## Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Framer Motion](https://www.framer.com/motion/)
- [Vite Documentation](https://vitejs.dev/)
- [Recharts](https://recharts.org/en-US)

## Questions?

1. Check the README.md for features overview
2. Look at similar components for patterns
3. Check console for error messages
4. Review Vite/React documentation

Happy coding! 🚀
