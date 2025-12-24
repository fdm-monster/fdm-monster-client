import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";

export class CustomGcodeService extends BaseService {
  static async postQuickStopM112Command(printerId: number) {
    const path = ServerApi.sendQuickStopM112Route(printerId);

    return await this.post(path);
  }
}
