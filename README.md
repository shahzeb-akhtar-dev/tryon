# TryOn - AI Virtual Try-On

AI-powered virtual try-on application built with Nuxt 4, Supabase, and FASHN AI / OpenAI.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at [app.supabase.com](https://app.supabase.com)
2. Enable **Authentication** (Email/Password and Google providers)
3. Run the SQL schema from `supabase-schema.sql` in the SQL Editor
4. Create a storage bucket named `tryon-images` (public)
5. Copy your Supabase URL and keys from Settings > API

### 3. Configure FASHN AI

1. Create an account at [app.fashn.ai](https://app.fashn.ai)
2. Go to **Developer API** > **API Keys** > **Create new API key**

### 4. Configure OpenAI (Optional)

1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Go to **API Keys** > **Create new secret key**

### 5. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Supabase Client (public - safe for browser)
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Supabase Server (server-side only - NEVER expose to browser)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI API Keys (server-side only)
FASHN_API_KEY=your_fashn_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 6. Start Development Server

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Usage

1. **Sign up / Log in** with email or Google
2. **Upload your photo** - a clear, full-body photo works best
3. **Upload a garment** - a clear image of the clothing item
4. **Click Generate Try-on** - wait for the AI to process
5. **View & Download** your virtual try-on result

## Where Data Is Stored

| Data | Location |
|------|----------|
| Person photos | Supabase Storage: `tryon-images/users/{uid}/tryons/{tryOnId}/person.*` |
| Garment images | Supabase Storage: `tryon-images/users/{uid}/tryons/{tryOnId}/garment.*` |
| Try-on results | Supabase Storage: `tryon-images/users/{uid}/tryons/{tryOnId}/result.jpg` |
| Try-on records | Supabase Database: `tryons` table |
| Recent photos | Supabase Database: `photos` table |
| Saved garments | Supabase Database: `garments` table |
| User profiles | Supabase Database: `users` table (synced with Auth) |

## Database Schema

The database uses the following tables:

- **users** - User profiles (auto-created on signup)
- **tryons** - Try-on generation records
- **photos** - Recent photos library
- **garments** - Saved garments library

All tables have Row Level Security (RLS) policies to ensure users can only access their own data.

## Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- **Framework:** Nuxt 4 (Vue 3 + TypeScript)
- **UI:** PrimeVue 4 + Tailwind CSS
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Database:** Supabase (PostgreSQL)
- **AI:** FASHN AI (Try-On Max) / OpenAI GPT-Image-1
