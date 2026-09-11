// https://nuxt.com/docs/api/configuration/nuxt-config
import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

const TryOnLight = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#fdf9f0",
      100: "#f8edd3",
      200: "#f0d9a5",
      300: "#e7c477",
      400: "#d4ac5c",
      500: "#C5A059",
      600: "#b08d4a",
      700: "#8e6f3a",
      800: "#6b532b",
      900: "#49381d",
      950: "#271d0f",
    },
    colorScheme: {
      light: {
        primary: "{primary.500}",
        surface: {
          0: "#F4F4F2",
          50: "#ebebe9",
          100: "#e2e2df",
          200: "#c8c8c4",
          300: "#afafaa",
          400: "#959590",
          500: "#7c7c76",
          600: "#666666",
          700: "#4d4d4d",
          800: "#333333",
          900: "#1A1A1A",
          950: "#111111",
        },
      },
    },
  },
});

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@primevue/nuxt-module",
    "@nuxtjs/tailwindcss",
    "@nuxt/image",
    "@pinia/nuxt",
  ],
  tailwindcss: {
    configPath: "tailwind.config.ts",
  },
  css: ["@/assets/css/main.css"],
  primevue: {
    options: {
      theme: {
        preset: TryOnLight,
        options: {
          darkModeSelector: ".p-dark",
        },
      },
    },
  },
  runtimeConfig: {
    fashnApiKey: process.env.FASHN_API_KEY,
    firebaseAdminProjectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId:
        process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
    },
  },
});
