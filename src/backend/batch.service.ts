import { BaseService } from "./base.service";

export class BatchService extends BaseService {
  static async batchConnectUsb(printerIds: string[]) {
    return await this.postApi("api/batch/connect/usb", { printerIds });
  }

  static async batchConnectSocket(printerIds: string[]) {
    return await this.postApi(`api/batch/connect/socket`, { printerIds });
  }

  static async batchToggleEnabled(printerIds: string[], enabled: boolean) {
    return await this.postApi(`api/batch/toggle-enabled`, { printerIds, enabled });
  }
}
