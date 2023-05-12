import { ServerApi } from "@/backend/server.api";
import { BaseService } from "@/backend/base.service";
import {
  FrontendSettings,
  PrinterFileCleanSubSetting,
  SettingsDto,
} from "../models/settings/settings.model";
import { PrinterFileCleanSettings } from "../models/settings/printer-file-clean-settings.model";
import { WhitelistSettings } from "../models/settings/server.model";

export class SettingsService extends BaseService {
  static async getServerSettings() {
    const path = ServerApi.serverSettingsRoute;

    return (await this.getApi(path)) as SettingsDto;
  }

  static async updateFrontendSettings(frontendSettings: FrontendSettings) {
    const path = `${ServerApi.frontendSettingsRoute}`;

    return (await this.putApi(path, frontendSettings as FrontendSettings)) as SettingsDto;
  }

  static async setWhitelistSettings(subSettings: WhitelistSettings) {
    const path = `${ServerApi.serverWhitelistSettingRoute}`;

    return (await this.putApi(path, subSettings as WhitelistSettings)) as SettingsDto;
  }

  static async setFileCleanSettings(subSettings: PrinterFileCleanSettings) {
    const path = `${ServerApi.serverSettingsRoute}`;

    return (await this.putApi(path, {
      printerFileClean: subSettings,
    } as PrinterFileCleanSubSetting)) as SettingsDto;
  }
}
