import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import Vue from "vue";

/**
 * Made async for future possibility of getting base URI externally or asynchronously
 */
export async function getBaseUri() {
  // return Vue.config.devtools ? "https://demo.fdm-monster.net" : "";
  return Vue.config.devtools ? "http://localhost:4000/" : "/"; // Same-origin policy
}

export function getHttpClient(withAuth: boolean = true) {
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
