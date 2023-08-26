import { defineStore } from "pinia";
import { useJwt } from "@vueuse/integrations/useJwt";
import type { JwtPayload } from "jwt-decode";
import { AuthService, type Tokens } from "@/backend/auth.service";
import { AxiosError, HttpStatusCode } from "axios";
import { RemovableRef, useLocalStorage } from "@vueuse/core";

export interface IClaims extends JwtPayload {
  name: string;
}

export interface AuthState {
  refreshToken: RemovableRef<string> | null;
  token: RemovableRef<string> | null;
  loginRequired: boolean | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: null,
    refreshToken: null,
    loginRequired: null,
  }),
  actions: {
    async checkLoginRequired() {
      return await AuthService.getLoginRequired()
        .then((response) => {
          this.loginRequired = response.data.loginRequired;
          return this.loginRequired;
        })
        .catch((e: AxiosError) => {
          console.error("authRequired: failed to check login required", e.code);
          throw e;
        });
    },
    async login(username: string, password: string): Promise<Tokens | null> {
      return await AuthService.postLogin(username, password)
        .then((response) => {
          this.setTokens(response.data.token, response.data.refreshToken);
          return response.data;
        })
        .catch((e: AxiosError) => {
          console.error("login: failed to login", e.code);
          throw e;
        });
    },
    logout() {
      this.setIdToken(null);
      this.setRefreshToken(null);
      console.warn("Logged out");
    },
    async verifyLogin() {
      return await AuthService.verifyLogin();
    },
    loadTokens() {
      const tokenRef = useLocalStorage<string | null>("token", null);
      const refreshTokenRef = useLocalStorage<string | null>("refreshToken", null);
      this.token = tokenRef.value;
      this.refreshToken = refreshTokenRef.value;
    },
    async refreshTokens() {
      if (!this.refreshToken) {
        throw new Error("refreshTokens: no refresh token");
      }
      return await AuthService.refreshLogin(this.refreshToken)
        .then((response) => {
          this.setIdToken(response.data.token);
        })
        .catch((e: AxiosError) => {
          if (e.status == HttpStatusCode.Unauthorized) {
            this.setTokens(null, null);
            console.error("refreshTokens: authentication error, failed to refresh tokens", e.code);
          } else {
            console.error(
              "refreshTokens: unknown error, failed to refresh tokens",
              e.status,
              e.code
            );
          }
          throw e;
        });
    },
    setTokens(token: string | null, refreshToken: string | null) {
      this.setIdToken(token);
      this.setRefreshToken(refreshToken);
    },
    setIdToken(token: string | null) {
      if (token == null) {
        localStorage.removeItem("token");
      }
      localStorage.setItem("token", token as string);
      this.token = token;
    },
    setRefreshToken(refreshToken: string | null) {
      if (refreshToken == null) {
        localStorage.removeItem("refreshToken");
      }
      localStorage.setItem("refreshToken", refreshToken as string);
      this.refreshToken = refreshToken;
    },
  },
  getters: {
    hasRefreshToken(): boolean {
      return !!this.refreshToken;
    },
    isLoginExpired(): boolean {
      const claims = this.tokenClaims;
      if (!claims?.exp) return false;
      return claims.exp < Date.now() / 1000;
    },
    hasAuthToken() {
      return !!this.tokenClaims;
    },
    tokenClaims(): IClaims | null {
      if (!this.token) return null;
      const data = useJwt<IClaims>(this.token, { fallbackValue: null });
      if (!data) return null;
      return data.payload.value;
    },
  },
});
