import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";

export class CustomGcodeService extends BaseService {
  static async postEmergencyM112Command(printerId: string) {
    const path = ServerApi.sendEmergencyM112Route(printerId);

    return await this.postApi(path);
  }
}
