import { defineStore } from "pinia";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isInitialized: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: null,
    refreshToken: null,
    isInitialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.token,
    currentUser: (state) => state.user,
    authToken: (state) => state.token,
  },

  actions: {
    setUser(userData: AuthUser | null) {
      this.user = userData;
    },

    setSession(userData: AuthUser, idToken: string, refreshToken?: string) {
      this.user = userData;
      this.token = idToken;
      this.refreshToken = refreshToken || null;
      if (import.meta.client) {
        sessionStorage.setItem("auth_token", idToken);
        sessionStorage.setItem("auth_user", JSON.stringify(userData));
        if (refreshToken) {
          sessionStorage.setItem("auth_refresh_token", refreshToken);
        }
      }
    },

    loadFromStorage() {
      if (import.meta.client) {
        const token = sessionStorage.getItem("auth_token");
        const refreshToken = sessionStorage.getItem("auth_refresh_token");
        const userStr = sessionStorage.getItem("auth_user");
        if (token) {
          this.token = token;
          this.refreshToken = refreshToken;
          if (userStr) {
            try {
              this.user = JSON.parse(userStr);
            } catch {
              this.user = null;
            }
          }
        }
      }
    },

    clearAuth() {
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      if (import.meta.client) {
        sessionStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_user");
        sessionStorage.removeItem("auth_refresh_token");
      }
    },

    setInitialized() {
      this.isInitialized = true;
    },
  },
});
