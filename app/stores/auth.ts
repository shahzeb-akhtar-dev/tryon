import { defineStore } from "pinia";
import type { User } from "firebase/auth";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isInitialized: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: null,
    isInitialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.token,
    currentUser: (state) => state.user,
    authToken: (state) => state.token,
  },

  actions: {
    setUser(firebaseUser: User | null) {
      if (firebaseUser) {
        this.user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
      } else {
        this.user = null;
      }
    },

    async setToken(firebaseUser: User) {
      try {
        const token = await firebaseUser.getIdToken();
        this.token = token;
        if (import.meta.client) {
          sessionStorage.setItem("auth_token", token);
        }
      } catch (error) {
        console.error("Failed to get token:", error);
        this.token = null;
      }
    },

    loadTokenFromStorage() {
      if (import.meta.client) {
        const token = sessionStorage.getItem("auth_token");
        if (token) {
          this.token = token;
        }
      }
    },

    clearAuth() {
      this.user = null;
      this.token = null;
      if (import.meta.client) {
        sessionStorage.removeItem("auth_token");
      }
    },

    setInitialized() {
      this.isInitialized = true;
    },
  },
});
