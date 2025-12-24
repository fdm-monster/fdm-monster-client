import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";

export class PrinterSettingsService extends BaseService {
  static async getSettings(printerId: number) {
    const path = `${ServerApi.getPrinterSettingsRoute(printerId)}`;

    return await this.get(path);
  }

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
