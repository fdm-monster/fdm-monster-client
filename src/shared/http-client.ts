import axios, { AxiosError, AxiosRequestConfig, HttpStatusCode } from "axios";
import { useAuthStore } from "@/store/auth.store";
import Vue from "vue";
import { useSnackbar } from "@/shared/snackbar.composable";
import { sleep } from "@/utils/time.utils";
import { useRouter } from "vue-router/composables";
import { RouteNames } from "@/router/route-names";

/**
 * Made async for future possibility of getting base URI externally or asynchronously
 */
export async function getBaseUri() {
  // return process.env.NODE_ENV === "development" ? "https://demo.fdm-monster.net" : "";
  return process.env.NODE_ENV === "development" ? "http://localhost:4000/" : "/"; // Same-origin policy
}

export async function getHttpClient(withAuth: boolean = true) {
  const instance = axios.create({
    baseURL: await getBaseUri(),
  });

  instance.interceptors.request.use((config) => {
    console.log(
      `${config.method?.toUpperCase().padEnd(6)} ${config.url?.padEnd(25)} Bearer: ${withAuth
        ?.toString()
        .padEnd(7)} BaseURL: ${config.baseURL}`
    );
    return config;
  });

  if (withAuth) {
    instance.interceptors.request.use(
      async (config) => {
        const auth = useAuthStore();
        if (auth.hasAuthToken) {
          config.headers.Authorization = `Bearer ${auth.token}`;
        }

        return config;
      },
      (error) => {
        console.error("Error in axios request interceptor", error);
        return Promise.reject(error);
      }
    );
  }

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const { response, config } = error;
      if (!response) {
        console.error("No response was returned by axios", error);
        return error;
      }

      if (![HttpStatusCode.Unauthorized, HttpStatusCode.Unauthorized].includes(response.status)) {
        // Timeout issues etc?
        console.error("Error in axios response interceptor which is not 401 or 403", error);
        return error;
      }

      if (response.status === HttpStatusCode.Unauthorized) {
        // TODO exempt hostnames from retries
        // TODO circuit breaker (max attempts) to prevent infinite retries
        // TODO retry with exponential backoff
        // TODO retry with extended timeout
        // TODO consider axios-retry package

        // try {
        //   await authStore.refreshTokens();
        // } catch (e) {
        //   console.error("Error when refreshing login.");
        //   snackbar.openErrorMessage({
        //     title: "Login error",
        //     fullSubtitle: "Error when refreshing login.",
        //   });
        //   await router.push({ name: "Login" });
        // }
        if (!withAuth) {
          console.warn(`${error.config?.url} No auth was required, but 401 was thrown`);
          useSnackbar().openErrorMessage({
            title: "Authentication bug",
            fullSubtitle:
              "Login was required, although the request was not done with authentication. This is a bug.",
          });
          // throw error;
          return;
        }

        // Check if state has changed, if so then retry
        const authStore = useAuthStore();
        if (!authStore.loginRequired) {
          await authStore.checkLoginRequired();
          if (authStore.loginRequired) {
            console.warn("Retrying request after new login state");
            await sleep(100);
            return axios(config as AxiosRequestConfig);
          } else {
            console.warn("Cannot retry request as login is still not required");
            useSnackbar().openErrorMessage({
              title: "Authentication bug",
              fullSubtitle:
                "Authentication was not required, but the server returned authentication error. This is a bug.",
            });
            return;
          }
        } else {
          console.warn("Login was required and 401 was thrown");
        }

        // Login required, so check expiry
      } else if (response.status === HttpStatusCode.Forbidden) {
        await useRouter().push({ name: RouteNames.LackingPermission });
      }
    }
  );
  return instance;
}
