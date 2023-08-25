import axios from "axios";
import Vue from "vue";

/**
 * Made async for future possibility of getting base URI externally or asynchronously
 */
export async function getBaseUri() {
  return Vue.config.devtools ? "http://127.0.0.1:4000" : ""; // Same-origin policy
}

export function getHttpClient(withAuth: boolean = true) {
  axios.interceptors.request.use(async (config) => {
    config.baseURL = await getBaseUri();
    return config;
  });
  return axios;
}
