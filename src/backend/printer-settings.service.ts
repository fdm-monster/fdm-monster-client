import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";
import { IdType } from "@/utils/id.type";

export class PrinterSettingsService extends BaseService {
  static async getSettings(printerId: IdType) {
    const path = `${ServerApi.getPrinterSettingsRoute(printerId)}`;

    return await this.get(path);
  }

  /**
   * Enabled: true => idle, enabled: false => disabled
   * @param printerId
   * @param enabled
   */
  static async setGCodeAnalysis(printerId: IdType, enabled = false) {
    const path = `${ServerApi.setPrinterSettingsGCodeAnalysisRoute(printerId)}`;

    return await this.post(path, { enabled });
  }

  static async syncPrinterName(printerId: IdType) {
    const path = `${ServerApi.syncPrinterNameSettingRoute(printerId)}`;

    return await this.post(path);
  }
}
