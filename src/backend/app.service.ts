import { BaseService } from "./base.service";
import { VersionModel } from "@/models/server/version.model";
import { FeaturesModel } from "@/models/server/features.model";
import { IClientReleases } from "@/models/server/client-releases.model";
import { getHttpClient } from "@/shared/http-client";
import { GithubRateLimit } from "@/models/server/github-rate-limit.model";

export class AppService extends BaseService {
  static async updateClientDistGithub(version?: string, allowDowngrade?: boolean) {
    return await this.post("/api/server/update-client-bundle-github", {
      downloadRelease: version,
      allowDowngrade,
    });
  }

  static async getGithubRateLimit() {
    return await this.get<GithubRateLimit>("/api/server/github-rate-limit");
  }

  static async getClientReleases() {
    return await this.get<IClientReleases>("/api/server/client-releases");
  }

  static async getVersion() {
    return await this.get<VersionModel>("/api/version");
  }

  static async getFeatures() {
    return await this.get<FeaturesModel>("/api/features");
  }

  static async test() {
    const httpClient = await getHttpClient(false, false);
    return await httpClient.get<{ message: string }>("/api/test");
  }
}
