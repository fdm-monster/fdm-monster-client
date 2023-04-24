import { BaseService } from "./base.service";

export class AppService extends BaseService {
  static async updateClientDist() {
    return await this.postApi("api/server/update-client-bundle-github");
  }
}
