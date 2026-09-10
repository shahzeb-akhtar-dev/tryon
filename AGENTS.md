# AGENTS.md - TryOn Project Guidelines

## Project Overview

- **Product:** TryOn (AI-powered virtual try-on application)
- **Framework:** Nuxt 4 (Vue 3 + TypeScript)
- **UI Library:** PrimeVue 5
- **CSS Framework:** Tailwind CSS (via `@nuxtjs/tailwindcss`)
- **Icons:** Iconify (`@iconify/vue`) with Google Material Icons
- **Design Theme:** Sleek, modern, AI-forward design with dark primary and gold accents

---

## Strict Rules

### 1. Component Folder Structure

**Every page must have its own component folder.**

- Create components in `components/<PageName>/` matching the page name
- Example: `pages/about.vue` → `components/About/`
- Example: `pages/index.vue` → `components/Homepage/`
- Example: `pages/tryon.vue` → `components/TryOn/`

```
components/
├── HeaderComponent.vue          # Global shared component
├── FooterComponent.vue          # Global shared component
├── Homepage/                    # Homepage-specific components
│   ├── Hero.vue
│   ├── Features.vue
│   └── HowItWorks.vue
├── TryOn/                       # Try-on page-specific components
│   ├── UploadPanel.vue
│   ├── ResultViewer.vue
│   └── GalleryPicker.vue
└── About/                       # About page-specific components
    ├── OurStory.vue
    └── Team.vue
```

### 2. Strictly Use PrimeVue UI Components

- **ALWAYS** use PrimeVue components for forms, dialogs, tables, dropdowns, etc.
- **NEVER** use native HTML form elements when a PrimeVue equivalent exists
- Available PrimeVue components: `Button`, `InputText`, `Textarea`, `Card`, `Dialog`, `DataTable`, `Dropdown`, `Select`, `Checkbox`, `FileUpload`, `Image`, `Avatar`, `Chip`, `TabView`, `Accordion`, `Toast`, `ProgressSpinner`
- Components are auto-imported via `@primevue/nuxt-module`

```vue
<!-- CORRECT -->
<InputText v-model="name" class="w-full" />
<Button label="Start Try-On" class="w-full" />

<!-- WRONG -->
<input v-model="name" class="w-full" />
<button class="w-full">Start Try-On</button>
```

### 3. Strictly Use Tailwind CSS for Styling

- **ALWAYS** use Tailwind utility classes for styling
- **NEVER** write custom CSS in `<style>` blocks unless absolutely necessary (e.g., complex animations)
- Use Tailwind design tokens for colors and fonts:
  - `text-black` / `text-primary` / `text-tertiary` / `text-neutral`
  - `bg-primary` / `bg-primary` / `bg-tertiary` / `bg-neutral`
  - `font-primary` for all text

```vue
<!-- CORRECT -->
<h1 class="text-4xl text-black font-primary">Virtual Try-On</h1>
<section class="py-4 bg-tertiary"/>
<Button class="bg-primary text-black rounded-md duration-normal" />

<!-- WRONG -->
<h1 class="text-4xl text-[var(--color-primary)]">Title</h1>
<h1 style="font-size: 2.25rem; color: #1A1A1A;">Virtual Try-On</h1>
<style scoped>
  section { padding: 4rem 0; background: #F4F4F2; }
</style>
```

### 4. Follow the Design Theme

- **Colors:**
  - `primary` (`#1A1A1A`) -- dark backgrounds, main text, headers
  - `secondary` (`#C5A059`) -- gold accent, CTAs, highlights
  - `tertiary` (`#F4F4F2`) -- light backgrounds, cards, containers
  - `neutral` (`#666666`) -- body text, secondary labels, muted content
- **Typography scale:** `text-sm` (10.4px) → `text-4xl` (17px)
- **Spacing scale:** `p-1` (2px) → `p-8` (16px)
- **Border radius:** `rounded-xs` (2px) → `rounded-xl` (50px)
- **Transitions:** `duration-instant` (100ms), `duration-fast` (200ms), `duration-normal` (300ms)
- Maintain the **sleek, modern, AI-forward** aesthetic
- All interactive elements should have smooth transitions

### 5. Pages Should Only Import and Use Components

- **NEVER** write complex logic or UI directly in page files
- Pages should only:
  - Set up SEO meta with `useSeoMeta()`
  - Import and assemble page-specific components
  - Handle page-level data fetching if needed

```vue
<!-- pages/about.vue - CORRECT -->
<script setup lang="ts">
useSeoMeta({
  title: 'About Us | TryOn',
  description: 'Learn about TryOn\'s AI-powered virtual try-on technology.',
})
</script>

<template>
  <main>
    <AboutHero />
    <AboutOurStory />
    <AboutTeam />
    <AboutCta />
  </main>
</template>

<!-- WRONG -->
<template>
  <main>
    <h1>About Us</h1>
    <p>Lots of inline content...</p>
    <!-- Complex UI written directly in page -->
  </main>
</template>
```

---

## Additional Best Practices

### 6. Use TypeScript Everywhere

- Always use `<script setup lang="ts">`
- Define interfaces/types for props, emits, and data structures
- Avoid `any` type; use proper typing

```ts
interface TryOnResult {
  id: string
  originalImage: string
  resultImage: string
  garment: string
  createdAt: string
}

const results = ref<TryOnResult[]>([])
```

### 7. Use Iconify for Icons

- Use `<Icon icon="ic:baseline-photo-camera" />` for all icons
- Prefer Google Material Icons (`ic:*` prefix)
- Do not use inline SVGs or icon fonts

```vue
<Icon icon="ic:baseline-photo-camera" class="w-5 h-5" />
<Icon icon="ic:round-check-circle" class="w-5 h-5" />
```

### 8. Use NuxtImg for Images

- Always use `<NuxtImg>` instead of `<img>` for optimized loading
- Use `sizes` attribute for responsive images
- Store images in `public/images/`

```vue
<NuxtImg src="/images/tryon-hero.jpg" alt="Virtual try-on preview" sizes="sm:100vw md:50vw lg:600px" />
```

### 9. Use NuxtLink for Navigation

- Always use `<NuxtLink>` for internal navigation
- Use site constants from `~/utils/site.ts` for URLs

```vue
<NuxtLink :to="SITE_TRYON_PATH">Try It On</NuxtLink>
```

### 10. Centralize Site Constants

- Store links, paths, and config in `~/utils/site.ts`
- Import and use these constants throughout the app

```ts
// utils/site.ts
export const SITE_NAME = 'TryOn'
export const SITE_URL = ''
export const SITE_TRYON_PATH = '/tryon'
export const SITE_GALLERY_PATH = '/gallery'
export const SITE_ABOUT_PATH = '/about'
```

### 11. Component Naming Conventions

- Use **PascalCase** for component names and files
- Page-specific components: `<PageName><ComponentPurpose>.vue`
- Global shared components: `<ComponentPurpose>Component.vue`

```
components/
├── HeaderComponent.vue
├── FooterComponent.vue
├── Homepage/Hero.vue
├── TryOn/UploadPanel.vue
└── About/OurStory.vue
```

### 12. Component Import Rules (STRICT)

- **ALWAYS** create components inside `components/<PageName>/` folder matching the page name
- Example: `pages/tryon.vue` → `components/TryOn/`
- Example: `pages/gallery.vue` → `components/Gallery/`
- **NEVER** use folder prefix in component names when importing
- Import components using their short name only

```vue
<!-- CORRECT - components/TryOn/UploadPanel.vue -->
<script setup lang="ts">
import UploadPanel from '~/components/TryOn/UploadPanel.vue'
</script>

<template>
  <UploadPanel />
</template>

<!-- WRONG - using folder prefix -->
<template>
  <TryOnUploadPanel />
  <TryOnResultViewer />
</template>
```

- **NEVER** place page-specific components in the root `components/` folder
- **ALWAYS** group all components for a page under its dedicated folder
- Use meaningful short names: `UploadPanel`, `ResultViewer`, `GalleryPicker`, `Features`, `HowItWorks`

### 13. Image Usage Rules

- **ALWAYS** use existing images from `public/images/`
- **NEVER** reference images that do not exist in the project
- Check available images before using them in components
- Use `<NuxtImg>` with proper `sizes` attribute
- Use `alt` text that describes the image content

```vue
<!-- CORRECT -->
<NuxtImg src="/images/tryon-hero.jpg" alt="TryOn virtual fitting room" sizes="sm:100vw md:50vw lg:700px" />

<!-- WRONG - image does not exist -->
<NuxtImg src="/images/missing-image.jpg" alt="..." />
```

### 14. Reusable Component Design

- Create reusable components that accept props for content variation
- Use TypeScript interfaces for all props
- Provide default values where appropriate
- Keep components focused on single responsibility
- Design components to work across multiple pages with different content

### 15. Form Handling

- Use `reactive()` for form state
- Use PrimeVue form components exclusively
- Validate forms before submission

```ts
const form = reactive({
  email: '',
  image: null as File | null,
  garmentType: '',
})

const submitForm = () => {
  // validation and submission logic
}
```

### 16. SEO Best Practices

- Every page must have `useSeoMeta()` with:
  - `title` (include brand name)
  - `description`
  - `og:title`, `og:description`, `og:image`
  - `twitter:card`, `twitter:title`, `twitter:description`

```ts
useSeoMeta({
  title: 'Virtual Try-On | TryOn',
  description: 'Try on clothes virtually with AI-powered technology.',
  ogTitle: 'Virtual Try-On | TryOn',
  ogDescription: 'Try on clothes virtually with AI-powered technology.',
  ogImage: '/images/og-tryon.jpg',
  twitterCard: 'summary_large_image',
})
```

### 17. Responsive Design

- Design mobile-first, then enhance for larger screens
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Test all components at breakpoints: 640px, 768px, 1024px, 1280px, 1536px

### 18. Accessibility

- Use semantic HTML elements (`<main>`, `<section>`, `<nav>`, `<header>`, `<footer>`)
- Add `alt` attributes to all images
- Ensure sufficient color contrast (WCAG 2.2 AA target)
- Use `aria-label` for interactive elements without visible text
- Focus-visible rules required for keyboard navigation

### 19. Code Organization

- Keep components under 200 lines when possible
- Extract reusable logic into composables (`composables/`)
- Group imports: Vue/Nuxt → PrimeVue → Components → Utils → Types

```ts
import { ref, reactive } from 'vue'
import HeaderComponent from '~/components/HeaderComponent.vue'
import { SITE_TRYON_PATH } from '~/utils/site'
```

### 20. Git Commit Conventions

- Use conventional commits: `type: description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

```
feat: add try-on upload page components
fix: resolve mobile navigation overflow
docs: update AGENTS.md with new guidelines
```

### 21. Performance

- Use `<NuxtImg>` with proper `sizes` for responsive images
- Lazy load below-the-fold components with `defineAsyncComponent` if needed
- Avoid unnecessary re-renders by using `computed` for derived state

### 22. Error Handling

- Use try/catch for async operations
- Display user-friendly error messages using PrimeVue `Toast` or `Dialog`
- Log errors appropriately for debugging

### 23. Testing

- Write unit tests for composables and utilities
- Test critical user flows (image uploads, try-on submissions, navigation)
- Use Vue Test Utils for component testing

### 24. Server-Side API Routes (STRICT)

**ALL external API calls MUST go through Nuxt server routes. Never call external APIs directly from composables or client-side code.**

- **ALWAYS** create server routes in `server/api/<domain>/` grouped by domain
- **NEVER** call external API URLs directly from composables — call your own server routes instead
- **ALWAYS** store external API base URLs and paths in `api/endpoints.ts`
- Server routes act as a proxy: they receive the client request, call the external API, and return the response

#### Folder Structure

```
server/
├── api/
│   ├── tryon/
│   │   ├── generate.post.ts         # POST /api/tryon/generate
│   │   ├── [id].get.ts              # GET /api/tryon/:id
│   │   └── list.get.ts              # GET /api/tryon/list
│   ├── auth/
│   │   ├── login.post.ts            # POST /api/auth/login
│   │   ├── logout.post.ts           # POST /api/auth/logout
│   │   └── me.get.ts                # GET /api/auth/me
│   └── gallery/
│       ├── list.get.ts              # GET /api/gallery/list
│       └── upload.post.ts           # POST /api/gallery/upload
```

#### Naming Convention

- File name = `<action>.<method>.ts`
- Method suffix defines the HTTP method: `.get.ts`, `.post.ts`, `.put.ts`, `.patch.ts`, `.delete.ts`
- Dynamic params use bracket syntax: `[id].get.ts` → `/api/tryon/:id`

#### Server Route Pattern

```ts
// server/api/tryon/list.get.ts
import { ENDPOINTS } from '~/api-config/endpoints'

export default defineEventHandler(async (event) => {
  const response = await $fetch(ENDPOINTS.TRYON_LIST, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  })
  return response
})
```

#### Composable Pattern (Client-Side)

```ts
// composables/useGetTryOnResults.ts
import { ref } from 'vue'

export interface TryOnResult {
  id: string
  originalImage: string
  resultImage: string
  garment: string
  createdAt: string
}

export function useGetTryOnResults() {
  const loading = ref(false)
  const data = ref<TryOnResult[] | null>(null)
  const error = ref<string | null>(null)

  const fetchResults = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<TryOnResult[]>('/api/tryon/list')
      data.value = response
    } catch (e: any) {
      error.value = e?.message || 'Failed to fetch results'
    } finally {
      loading.value = false
    }
  }

  return { loading, data, error, fetchResults }
}
```

#### Key Rules

- **Composables** call internal server routes: `$fetch('/api/tryon/list')`
- **Server routes** call external APIs using endpoints from `api/endpoints.ts`
- **NEVER** expose external API URLs or secrets to the client
- Server routes keep API keys, tokens, and tenant headers secure on the server
- Every domain (tryon, auth, gallery, etc.) gets its own folder under `server/api/`
- Every composable MUST return `{ loading, data, error }` pattern

---

## Quick Reference

### Colors
| Tailwind Class | Value | Usage |
|---------------|-------|-------|
| `text-black` / `bg-primary` | `#1A1A1A` | Dark backgrounds, main text, headers |
| `text-primary` / `bg-primary` | `#C5A059` | Gold accent, CTAs, highlights |
| `text-tertiary` / `bg-tertiary` | `#F4F4F2` | Light backgrounds, cards, containers |
| `text-neutral` / `bg-neutral` | `#666666` | Body text, secondary labels, muted content |

### Font
| Tailwind Class | Value | Usage |
|---------------|-------|-------|
| `font-primary` | `Arial, sans-serif` | All text |

### Typography Scale
| Tailwind Class | Size |
|---------------|------|
| `text-sm` | `10.4px` |
| `text-md` | `13px` |
| `text-lg` | `14px` |
| `text-xl` | `14.4px` |
| `text-2xl` | `15px` |
| `text-3xl` | `16px` |
| `text-4xl` | `17px` |

### Spacing Scale
| Tailwind Class | Size |
|---------------|------|
| `p-1` / `m-1` | `2px` |
| `p-2` / `m-2` | `5px` |
| `p-3` / `m-3` | `8px` |
| `p-4` / `m-4` | `10px` |
| `p-5` / `m-5` | `12px` |
| `p-6` / `m-6` | `14px` |
| `p-7` / `m-7` | `15px` |
| `p-8` / `m-8` | `16px` |

### Border Radius
| Tailwind Class | Value |
|---------------|-------|
| `rounded-xs` | `2px` |
| `rounded-sm` | `3px` |
| `rounded-md` | `4px` |
| `rounded-lg` | `5px` |
| `rounded-xl` | `50px` |

### Transitions
| Tailwind Class | Duration |
|---------------|----------|
| `duration-instant` | `100ms` |
| `duration-fast` | `200ms` |
| `duration-normal` | `300ms` |

### Container Pattern
```vue
<section class="max-w-[1520px] mx-auto px-5 sm:px-8 lg:px-10 2xl:px-12">
```

### Standard Transition
```vue
class="transition duration-normal hover:scale-105"
```
