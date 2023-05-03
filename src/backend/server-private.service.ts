import { apiBase, BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";
import { ExportYamlModel } from "../models/server/export-yaml.model";
import { downloadFileByBlob } from "../utils/download-file.util";
import axios from "axios";

export class ServerPrivateService extends BaseService {
  public static async restartServer() {
    const path = ServerApi.serverRestartCommandRoute;

    return await this.postApi(path);
  }

  public static async downloadYamlExport(input: ExportYamlModel) {
    const response = await axios.request<any>({
      method: "POST",
      url: `${apiBase}/api/server/export-printers-floors-yaml`,
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
}
