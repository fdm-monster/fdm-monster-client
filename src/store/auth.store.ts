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
          console.error("authRequired: failed to check login required", e.response?.status);
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
      console.debug("Logging out");
      this.setIdToken(null);
      this.setRefreshToken(null);
    },
    async verifyOrRefreshLoginOnce() {
      try {
        await AuthService.verifyLogin();
        return true;
      } catch (e1) {
        const canRefresh = this.hasAuthToken && this.isLoginExpired && this.hasRefreshToken;
        if (canRefresh) {
          try {
            await this.refreshLoginToken();
            await AuthService.verifyLogin();
          } catch (e2) {
            return false;
          }
          return true;
        } else {
          return false;
        }
      }
    },
    loadTokens() {
      const tokenRef = useLocalStorage<string | null>("token", null);
      const refreshTokenRef = useLocalStorage<string | null>("refreshToken", null);
      this.token = tokenRef.value;
      this.refreshToken = refreshTokenRef.value;
    },
    async refreshLoginToken() {
      if (!this.refreshToken) {
        throw new Error("refreshLoginToken: no refresh token");
      }
      return await AuthService.refreshLogin(this.refreshToken)
        .then((response) => {
          if (response?.data?.token) {
            this.setIdToken(response.data.token);
          }

          return true;
        })
        .catch((e: AxiosError) => {
          if (e.response?.status == HttpStatusCode.Unauthorized) {
            this.setTokens(null, null);
            console.error(
              "refreshLoginToken: authentication error, failed to refresh tokens",
              e.response?.status
            );
          } else {
            console.error(
              "refreshLoginToken: unknown error, failed to refresh tokens",
              e.response?.status
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
