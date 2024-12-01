import { ServerApi } from "@/backend/server.api";
import { BaseService } from "@/backend/base.service";
import {
  FrontendSettings,
  SettingsDto,
  TimeoutSettings,
  SettingsSensitiveDto,
} from "@/models/settings/settings.model";
import { FileCleanSettings } from "@/models/settings/printer-file-clean-settings.model";

export class SettingsService extends BaseService {
  static async getSettings() {
    const path = ServerApi.settingsRoute;
    return (await this.get(path)) as SettingsDto;
  }

  static async getSettingsSensitive() {
    const path = ServerApi.settingsSensitiveRoute;
    return (await this.get(path)) as SettingsSensitiveDto;
  }

  static async updateLoginRequiredSettings(loginRequired: boolean) {
    const path = `${ServerApi.updateLoginRequiredRoute}`;

    return (await this.put(path, { loginRequired })) as SettingsDto;
  }

  static async updateRegistrationEnabledSettings(registrationEnabled: boolean) {
    const path = `${ServerApi.updateRegistrationEnabledRoute}`;

    return (await this.put(path, { registrationEnabled })) as SettingsDto;
  }

  static async updateCredentialSettings(
    jwtExpiresIn: number,
    refreshTokenAttempts: number,
    refreshTokenExpiry: number
  ) {
    const path = `${ServerApi.updateCredentialSettings}`;

    return await this.put(path, { jwtExpiresIn, refreshTokenAttempts, refreshTokenExpiry });
  }

  static async updateFrontendSettings(frontendSettings: FrontendSettings) {
    const path = `${ServerApi.updateFrontendSettingsRoute}`;

    return (await this.put(path, frontendSettings as FrontendSettings)) as SettingsDto;
  }

  static async setSentryDiagnosticsSettings(enabled: boolean) {
    const path = `${ServerApi.serverSentryDiagnosticsSettingRoute}`;
    return await this.patch(path, { enabled });
  }

  static async updateTimeoutSettings(subSettings: TimeoutSettings) {
    const path = `${ServerApi.updateTimeoutSettingRoute}`;

    return (await this.put(path, subSettings as TimeoutSettings)) as SettingsDto;
  }

  static async setFileCleanSettings(subSettings: FileCleanSettings) {
    const path = `${ServerApi.fileCleanSettingsRoute}`;

    return (await this.put(path, subSettings)) as SettingsDto;
  }

  static async updateExperimentalMoonrakerSupport(enabled: boolean) {
    const path = ServerApi.updateExperimentalMoonrakerSupportRoute;
    return (await this.put(path, { enabled })) as SettingsDto; // Assuming it returns SettingsDto
  }

  static async updateExperimentalThumbnailSupport(enabled: boolean) {
    const path = ServerApi.updateExperimentalThumbnailSupportRoute;
    return (await this.put(path, { enabled })) as SettingsDto; // Assuming it returns SettingsDto
  }

  static async updateExperimentalClientSupport(enabled: boolean) {
    const path = ServerApi.updateExperimentalClientSupportRoute;
    return (await this.put(path, { enabled })) as SettingsDto; // Assuming it returns SettingsDto
  }
}
