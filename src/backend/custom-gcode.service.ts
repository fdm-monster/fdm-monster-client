import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";
import { IdType } from "@/utils/id.type";

export class CustomGcodeService extends BaseService {
  static async postQuickStopM112Command(printerId: IdType) {
    const path = ServerApi.sendQuickStopM112Route(printerId);

    return await this.postApi(path);
  }
}
