import { BaseService } from "./base.service";
import { VersionModel } from "../models/server/version.model";
import { FeaturesModel } from "../models/server/features.model";
import { IClientReleases } from "../models/server/client-releases.model";

export class AppService extends BaseService {
  static async updateClientDistGithub(tag_name: string) {
    return await this.postApi("api/server/update-client-bundle-github", { tag_name });
  }

  static async getClientReleases() {
    return (await this.getApi(`api/server/client-releases`)) as IClientReleases;
  }

  static async getVersion() {
    return (await this.getApi(`api/version`)) as VersionModel;
  }

  static async getFeatures() {
    return (await this.getApi(`api/features`)) as FeaturesModel;
  }
}
