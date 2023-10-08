import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";
import { ExportYamlModel } from "@/models/server/export-yaml.model";
import { downloadFileByBlob } from "@/utils/download-file.util";
import axios from "axios";
import { getBaseUri, getHttpClient } from "@/shared/http-client";

export class ServerPrivateService extends BaseService {
  public static async restartServer() {
    const path = ServerApi.serverRestartCommandRoute;

    return await this.postApi(path);
  }

  public static async downloadYamlExport(input: ExportYamlModel) {
    const client = await getHttpClient();
    const response = await client.request<any>({
      method: "POST",
      url: `api/server/export-printers-floors-yaml`,
      data: input,
      responseType: "blob",
    });
    await downloadFileByBlob(
      (response as any).data as any,
      "export-fdm-monster-" + Date.now() + ".yaml"
    );
  }

  public static async uploadAndImportYaml(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return await this.postUploadApi("api/server/import-printers-floors-yaml", formData, {});
  }

  public static async downloadLogDump() {
    const client = await getHttpClient();
    const response = await client.request<any>({
      method: "POST",
      url: `api/server/dump-fdm-monster-logs`,
      responseType: "blob",
    });
    await downloadFileByBlob((response as any).data, "logs-fdm-monster-" + Date.now() + ".zip");
  }

  public static async clearLogFilesOlderThanWeek() {
    const path = `api/server/clear-outdated-fdm-monster-logs`;
    return await this.deleteApi(path);
  }
}
