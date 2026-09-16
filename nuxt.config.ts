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
    openaiApiKey: process.env.OPENAI_API_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
});
