import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";

export class PrinterSettingsService extends BaseService {
  /**
   * Enabled: true => idle, enabled: false => disabled
   * @param printerId
   * @param enabled
   */
  static async setGCodeAnalysis(printerId: number, enabled = false) {
    const path = `${ServerApi.setPrinterSettingsGCodeAnalysisRoute(printerId)}`;

    return await this.post(path, { enabled });
  }

  static async syncPrinterName(printerId: number) {
    const path = `${ServerApi.syncPrinterNameSettingRoute(printerId)}`;

    return await this.post(path);
  }
}
