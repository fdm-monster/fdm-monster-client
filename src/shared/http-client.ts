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
  axios.interceptors.request.use(async (config) => {
    config.baseURL = await getBaseUri();
    if (withAuth) {
      const auth = useAuthStore();
      if (auth.isLoggedIn) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    }
    return config;
  });
  return axios;
}
