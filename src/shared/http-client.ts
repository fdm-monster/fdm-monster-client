import axios, { AxiosError, AxiosRequestConfig, HttpStatusCode } from "axios";
import { useAuthStore } from "@/store/auth.store";
import { useEventBus } from "@vueuse/core";

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

      if (![HttpStatusCode.Unauthorized, HttpStatusCode.Forbidden].includes(response.status)) {
        // Timeout issues etc?
        console.error("Error in axios response interceptor which is not 401 or 403", error);
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
        console.error("403 Forbidden", data);
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

      // If this is called on AppLoader and failing, poll it if status 0
      await authStore.checkLoginRequired();

      // If this fails, the server is just confused
      const success = await authStore.verifyOrRefreshLoginOnce();
      if (success) {
        console.debug("Redoing request without interceptors", config?.url);
        return axios(config as AxiosRequestConfig);
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
