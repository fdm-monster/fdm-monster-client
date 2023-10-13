import { ServerApi } from "@/backend/server.api";
import { BaseService } from "@/backend/base.service";
import {
  FrontendSettings,
  FileCleanSubSetting,
  SettingsDto,
  TimeoutSettings,
  SettingsSensitiveDto,
} from "@/models/settings/settings.model";
import { FileCleanSettings } from "@/models/settings/printer-file-clean-settings.model";
import { WhitelistSettings } from "@/models/settings/server-settings.dto";

export class SettingsService extends BaseService {
  static async getSettings() {
    const path = ServerApi.settingsRoute;
    return (await this.getApi(path)) as SettingsDto;
  }

  static async getSettingsSensitive() {
    const path = ServerApi.settingsSensitiveRoute;
    return (await this.getApi(path)) as SettingsSensitiveDto;
  }

  static async updateLoginRequiredSettings(loginRequired: boolean) {
    const path = `${ServerApi.updateLoginRequiredRoute}`;

    return (await this.putApi(path, { loginRequired })) as SettingsDto;
  }

  static async updateRegistrationEnabledSettings(registrationEnabled: boolean) {
    const path = `${ServerApi.updateRegistrationEnabledRoute}`;

    return (await this.putApi(path, { registrationEnabled })) as SettingsDto;
  }

  static async updateFrontendSettings(frontendSettings: FrontendSettings) {
    const path = `${ServerApi.updateFrontendSettingsRoute}`;

    return (await this.putApi(path, frontendSettings as FrontendSettings)) as SettingsDto;
  }

  static async setSentryDiagnosticsSettings(enabled: boolean) {
    const path = `${ServerApi.serverSentryDiagnosticsSettingRoute}`;
    return await this.patchApi(path, { enabled });
  }

  static async setWhitelistSettings(subSettings: WhitelistSettings) {
    const path = `${ServerApi.updateServerWhitelistSettingRoute}`;

    return (await this.putApi(path, subSettings as WhitelistSettings)) as SettingsDto;
  }

  static async updateTimeoutSettings(subSettings: TimeoutSettings) {
    const path = `${ServerApi.updateTimeoutSettingRoute}`;

    return (await this.putApi(path, subSettings as TimeoutSettings)) as SettingsDto;
  }

  static async setFileCleanSettings(subSettings: FileCleanSettings) {
    const path = `${ServerApi.fileCleanSettingsRoute}`;

    return (await this.putApi(path, {
      fileClean: subSettings,
    } as FileCleanSubSetting)) as SettingsDto;
  }
}
