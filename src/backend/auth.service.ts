import { getHttpClient } from "@/shared/http-client";

export interface Tokens {
  token: string;
  refreshToken: string;
}

export class AuthService {
  static async getLoginRequired() {
    const httpClient = await getHttpClient(false, false);
    return await httpClient.get<{ loginRequired: boolean }>("api/auth/login-required");
  }

  static async postLogin(username: string, password: string) {
    const httpClient = await getHttpClient(false, false);
    return await httpClient.post<Tokens>("api/auth/login", {
      username,
      password,
    });
  }

  static async refreshLogin(refreshToken: string) {
    const httpClient = await getHttpClient(false, false);
    return await httpClient.post<{ token: string }>("api/auth/refresh", { refreshToken });
  }

  static async verifyLogin() {
    const httpClient = await getHttpClient(true, false);
    return await httpClient.post("api/auth/verify");
  }
}
