import { AxiosRequestConfig } from "axios";
import { getHttpClient } from "@/shared/http-client";
import { downloadFileByBlob } from "@/utils/download-file.util";

export class BaseService {
  protected static async get<R>(path: string) {
    const httpClient = await getHttpClient(true);
    const response = await httpClient.get<R>(path);
    return response.data;
  }

  protected static async putApi<T>(path: string, body?: any) {
    const httpClient = await getHttpClient(true);
    const response = await httpClient.put<T>(path, body);
    return response.data;
  }

  protected static async post<T>(path: string, body?: any) {
    const httpClient = await getHttpClient(true);
    const response = await httpClient.post<T>(path, body);
    return response.data;
  }

  protected static async postUploadApi<FormData>(
    path: string,
    formData: FormData,
    config: AxiosRequestConfig
  ) {
    const httpClient = await getHttpClient(true);
    return await httpClient.post(path, formData, config);
  }

  protected static async getDownload<T = ArrayBuffer>(uri: string, body?: any) {
    const httpClient = await getHttpClient(true);
    return await httpClient.request<T>({
      method: "GET",
      url: uri,
      data: body,
      responseType: "arraybuffer",
    });
  }

  protected static async delete<T>(path: string, body?: any) {
    const httpClient = await getHttpClient(true);
    const response = await httpClient.request<T>({
      url: path,
      method: "delete",
      data: body,
    });
    return response.data;
  }

  protected static async patchApi<T>(path: string, body: any) {
    const httpClient = await getHttpClient(true);
    const response = await httpClient.patch<T>(path, body);
    return response.data;
  }
}
