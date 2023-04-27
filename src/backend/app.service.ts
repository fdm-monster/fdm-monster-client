import { BaseService } from "./base.service";
import { VersionModel } from "../models/server/version.model";

export class AppService extends BaseService {
  static async updateClientDist() {
    return await this.postApi("api/server/update-client-bundle-github");
  }

  static async getVersion() {
    return (await this.getApi(`api/version`)) as VersionModel;
  }
}
