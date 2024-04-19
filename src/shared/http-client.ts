import axios, { AxiosError, AxiosRequestConfig, HttpStatusCode } from "axios";
import { useAuthStore } from "@/store/auth.store";
import { useEventBus } from "@vueuse/core";
import { convertAuthErrorReason } from "@/shared/auth.constants";
import { captureException } from "@sentry/vue";

/**
 * Made async for future possibility of getting base URI externally or asynchronously
 */
export async function getBaseUri() {
  // return process.env.NODE_ENV === "development" ? "https://demo.fdm-monster.net" : "";
  return process.env.NODE_ENV === "development" ? "http://localhost:4000/" : "/"; // Same-origin policy
}

export async function getHttpClient(withAuth: boolean = true, autoHandle401: boolean = true) {
  const instance = axios.create({
    baseURL: await getBaseUri(),
  });

  instance.interceptors.request.use((config) => {
    console.debug(
      `${config.method?.toUpperCase().padEnd(6)} ${config.url?.padEnd(25)} WithAuth: ${withAuth
        ?.toString()
        .padEnd(7)} AutoHandle401: ${autoHandle401?.toString().padEnd(7)} BaseURL: ${
        config.baseURL
      }`
    );
    return config;
  });

  if (withAuth) {
    instance.interceptors.request.use(
      async (config) => {
        const authStore = useAuthStore();
        authStore.loadTokens();
        if (authStore.hasAuthToken) {
          config.headers.Authorization = `Bearer ${authStore.token}`;
        }

        return config;
      },
      (error) => {
        console.error("Error in axios request interceptor", error);
        return Promise.reject(error);
      }
    );
  }

  if (!autoHandle401) {
    return instance;
  }

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const { response, config } = error;
      if (!response) {
        console.error("No response was returned by axios", error);
        return Promise.reject({
          message: `No response was returned by axios - URL ${config?.url}`,
          stack: error.stack,
        });
      }

      // Special code
      if (response.status === HttpStatusCode.FailedDependency) {
        return Promise.reject(error);
      }

      if (![HttpStatusCode.Unauthorized, HttpStatusCode.Forbidden].includes(response.status)) {
        // Timeout issues etc?
        console.error("Error in axios response interceptor which is not 401 or 403", error);
        captureException(error);
        return Promise.reject({
          message: `${error.message} - URL ${config?.url}`,
          stack: error.stack,
        });
      }

      if (response.status === HttpStatusCode.Forbidden) {
        const data = error?.response?.data as {
          error?: string;
          roles?: string[];
          permissions?: string[];
        };
        console.error("[HttpClient] 403 Forbidden", data);
        useEventBus("auth:permission-denied").emit({
          roles: data?.roles,
          permissions: data?.permissions,
          error: data?.error,
          url: config?.url,
        });
        return Promise.reject(error);
      }

      const authStore = useAuthStore();
      authStore.loadTokens();

      // Detect if this is a special reason code, and if so, don't handle it here
      const { reasonCode, url } = authStore.extractSpecialReasonCode(error);
      if (reasonCode) {
        await authStore.logout(false, convertAuthErrorReason(reasonCode));
        console.error(
          `[AuthStore] 401 Unauthorized - emitting 'auth:${reasonCode}' with reason ${reasonCode}`
        );
        useEventBus(`auth:${reasonCode}`).emit({
          url,
          error: error.message,
          reasonCode,
        });
        return Promise.reject(error);
      }

      // If this is called on AppLoader and failing, poll it if status 0
      await authStore.checkAuthenticationRequirements();

      // If this fails, the server is just confused
      const { success, handled } = await authStore.verifyOrRefreshLoginOnceOrLogout();
      if (handled) {
        return Promise.reject(error);
      }
      if (success) {
        if (!config?.url) {
          throw new Error("No URL in axios config, cannot retry");
        }

        console.debug("Redoing request without interceptors", config?.url);
        const newConfig: AxiosRequestConfig = config;
        if (!newConfig.headers) {
          newConfig.headers = {};
        }
        newConfig.headers.Authorization = `Bearer ${authStore.token}`;
        return axios(newConfig);
      }

      console.error("[HttpClient] 401 Unauthorized - emitting 'auth:failure'");
      useEventBus("auth:failure").emit({
        url: config?.url,
        error: error.message,
      });

      return Promise.reject(error);
    }
  );
  return instance;
}
