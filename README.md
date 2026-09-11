# TryOn - AI Virtual Try-On

AI-powered virtual try-on application built with Nuxt 4, Firebase, and FASHN AI.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password and Google providers)
3. Enable **Firestore Database**
4. Enable **Storage**
5. Copy your Firebase web config values

### 3. Configure Firebase Admin SDK (Server-Side)

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click **Generate new private key** to download a JSON file
3. Extract the `project_id`, `client_email`, and `private_key` values

### 4. Configure FASHN AI

1. Create an account at [app.fashn.ai](https://app.fashn.ai)
2. Go to **Developer API** > **API Keys** > **Create new API key**

### 5. Environment Variables

Copy `.env` and fill in your values:

```env
# Firebase Client (public - safe for browser)
NUXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NUXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# FASHN AI (server-side only - NEVER expose to browser)
FASHN_API_KEY=your_fashn_api_key

# Firebase Admin (server-side only - from service account JSON)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your-service-account@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
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
| Person photos | Firebase Storage: `users/{uid}/tryons/{tryOnId}/person.*` |
| Garment images | Firebase Storage: `users/{uid}/tryons/{tryOnId}/garment.*` |
| Try-on results | Firebase Storage: `users/{uid}/tryons/{tryOnId}/result.jpg` |
| Try-on records | Firestore: `users/{uid}/tryons/{tryOnId}` |
| Recent photos | Firestore: `users/{uid}/photos/{photoId}` |
| Saved garments | Firestore: `users/{uid}/garments/{garmentId}` |

## Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- **Framework:** Nuxt 4 (Vue 3 + TypeScript)
- **UI:** PrimeVue 4 + Tailwind CSS
- **Auth:** Firebase Authentication
- **Storage:** Firebase Storage
- **Database:** Firestore
- **AI:** FASHN AI (Try-On Max)
