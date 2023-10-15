import { defineStore } from "pinia";
import { useJwt } from "@vueuse/integrations/useJwt";
import type { JwtPayload } from "jwt-decode";
import { AuthService, type Tokens } from "@/backend/auth.service";
import { Axios, AxiosError, HttpStatusCode } from "axios";
import { WizardSettingsDto } from "@/models/settings/settings.model";
import { useSnackbar } from "@/shared/snackbar.composable";

export interface IClaims extends JwtPayload {
  name: string;
}

export interface AuthState {
  isDemoMode: boolean | null;
  loginRequired: boolean | null;
  refreshToken: string | null;
  registration: boolean | null;
  token: string | null;
  wizardState: WizardSettingsDto | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    isDemoMode: null,
    token: null,
    refreshToken: null,
    loginRequired: null,
    registration: null,
    wizardState: null,
  }),
  actions: {
    async checkAuthenticationRequirements() {
      return await AuthService.getLoginRequired()
        .then((response) => {
          this.loginRequired = response.data.loginRequired;
          this.wizardState = response.data.wizardState;
          this.registration = response.data.registration;
          this.isDemoMode = response.data.isDemoMode;
          return {
            loginRequired: this.loginRequired,
            wizardState: this.wizardState,
            registration: this.registration,
          };
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
          console.error("login: failed to login", e.response?.status);
          throw e;
        });
    },
    async logout(callServerLogout = false) {
      console.debug(`Logging out (calling server ${callServerLogout})`);
      if (callServerLogout && !!this.tokenClaims && !this.isLoginExpired) {
        try {
          await AuthService.logout();
        } catch (e) {
          console.error("Server could not process logout, but local logout was successful", e);
        }
      }
      this.setIdToken(undefined);
      this.setRefreshToken(undefined);
    },
    async verifyOrRefreshLoginOnceOrLogout() {
      try {
        await AuthService.verifyLogin();
        return true;
      } catch (e1) {
        console.error("verifyOrRefreshLoginOnce: failed to verify login", e1);

        const error = e1 as AxiosError;
        if (!error.response || error.response?.status !== HttpStatusCode.Unauthorized) {
          // Ensure no request-retry is done, nor other error processing
          console.error("verifyOrRefreshLoginOnce: unknown error", error.status);
          throw e1;
        }

        // Try to refresh the token
        if (this.hasRefreshToken) {
          try {
            await this.refreshLoginToken();
            await AuthService.verifyLogin();
          } catch (e2: any | AxiosError) {
            const error = e2 as AxiosError;
            if (error.response?.status === HttpStatusCode.Unauthorized) {
              await this.logout(false);
              console.error("verifyOrRefreshLoginOnce: failed to refresh token", error.status);
              return false;
            } else {
              // Ensure no request-retry is done, nor other error processing
              throw e2;
            }
          }
          return true;
        } else {
          await this.logout(false);
          return false;
        }
      }
    },
    loadTokens() {
      this.token = localStorage.getItem("token");
      this.refreshToken = localStorage.getItem("refreshToken");
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
            this.setTokens(undefined, undefined);
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
    setTokens(token?: string, refreshToken?: string) {
      this.setIdToken(token);
      this.setRefreshToken(refreshToken);
    },
    setIdToken(token?: string) {
      if (!token?.length) {
        localStorage.removeItem("token");
      } else {
        localStorage.setItem("token", token as string);
        this.token = token;
      }
    },
    setRefreshToken(refreshToken?: string) {
      if (!refreshToken?.length) {
        localStorage.removeItem("refreshToken");
      } else {
        localStorage.setItem("refreshToken", refreshToken as string);
        this.refreshToken = refreshToken;
      }
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
