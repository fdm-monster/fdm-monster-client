import { BaseService } from "./base.service";
import { IdType } from "@/utils/id.type";

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
}
