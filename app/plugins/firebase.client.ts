import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig();
  const firebaseConfig: FirebaseOptions = {
    apiKey: config.public.firebaseApiKey as string,
    authDomain: config.public.firebaseAuthDomain as string,
    projectId: config.public.firebaseProjectId as string,
    storageBucket: config.public.firebaseStorageBucket as string,
    messagingSenderId: config.public.firebaseMessagingSenderId as string,
    appId: config.public.firebaseAppId as string,
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const authStore = useAuthStore();

  if (import.meta.client) {
    authStore.loadTokenFromStorage();
  }

  await new Promise<void>((resolve) => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      authStore.setUser(firebaseUser);

      if (firebaseUser) {
        await authStore.setToken(firebaseUser);
      } else {
        authStore.clearAuth();
      }

      authStore.setInitialized();
      resolve();
    });
  });

  return {
    provide: { firebaseAuth: auth },
  };
});
