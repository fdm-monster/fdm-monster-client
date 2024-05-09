import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";

interface FirstTimeSetupData {
  loginRequired: boolean;
  registration: boolean;
  rootUsername: string;
  rootPassword: string;
}

export class FirstTimeSetupService extends BaseService {
  static async postFirstTimeSetup(data: FirstTimeSetupData) {
    const path = ServerApi.completeFirstTimeSetupRoute;

    return await this.post(path, data);
  }
}
