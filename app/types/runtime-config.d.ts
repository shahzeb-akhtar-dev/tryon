export {}

declare module '#app' {
  interface NuxtApp {
    $firebaseAuth: import('firebase/auth').Auth
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $firebaseAuth: import('firebase/auth').Auth
  }
}

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    firebaseApiKey: string
    firebaseAuthDomain: string
    firebaseProjectId: string
    firebaseStorageBucket: string
    firebaseMessagingSenderId: string
    firebaseAppId: string
  }
}
