import { ServerApi } from "@/backend/server.api";
import { BaseService } from "@/backend/base.service";
import { IdType } from "@/utils/id.type";

export class PrinterJobService extends BaseService {
  static async stopPrintJob(printerId: IdType) {
    const path = ServerApi.printerStopJobRoute(printerId);
    return await this.postApi(path);
  }

  static async pausePrintJob(printerId: IdType) {
    const path = ServerApi.printerPauseJobRoute(printerId);
    return await this.postApi(path);
  }

  static async resumePrintJob(printerId: IdType) {
    const path = ServerApi.printerResumeJobRoute(printerId);
    return await this.postApi(path);
  }
}
