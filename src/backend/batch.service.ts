import { BaseService } from "./base.service";
import { IdType } from "@/utils/id.type";
import { ServerApi } from "@/backend/server.api";
import { ReprintFileDto } from "@/models/batch/reprint.dto";

export class BatchService extends BaseService {
  static async batchConnectUsb(printerIds: IdType[]) {
    return await this.postApi("api/batch/connect/usb", { printerIds });
  }

  static async batchConnectSocket(printerIds: IdType[]) {
    return await this.postApi(`api/batch/connect/socket`, { printerIds });
  }

  static async batchToggleEnabled(printerIds: IdType[], enabled: boolean) {
    return await this.postApi(`api/batch/toggle-enabled`, { printerIds, enabled });
  }

  static async batchGetLastPrintedFiles(printerIds: IdType[]) {
    const path = ServerApi.batchGetLastPrintedFilesRoute;
    return await this.postApi<ReprintFileDto[]>(path, { printerIds });
  }

  static async batchReprintFiles(prints: { printerId: IdType; path: string }[]) {
    const path = ServerApi.batchReprintFilesRoute;
    return await this.postApi(path, { prints });
  }
}
