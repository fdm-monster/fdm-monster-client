import { ServerApi } from "@/backend/server.api";
import { BaseService } from "@/backend/base.service";

export class PrinterJobService extends BaseService {
  static async stopPrintJob(printerId: number) {
    const path = ServerApi.printerStopJobRoute(printerId);
    return await this.post(path);
  }

  static async pausePrintJob(printerId: number) {
    const path = ServerApi.printerPauseJobRoute(printerId);
    return await this.post(path);
  }

  static async resumePrintJob(printerId: number) {
    const path = ServerApi.printerResumeJobRoute(printerId);
    return await this.post(path);
  }
}
