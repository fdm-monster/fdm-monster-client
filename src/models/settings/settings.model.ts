import { ServerSettingsDto } from "./server-settings.dto";
import { FileCleanSettings } from "./printer-file-clean-settings.model";

export type FileCleanSubSetting = {
  fileClean: FileCleanSettings;
};

export interface FrontendSettings {
  largeTiles: boolean;
  gridCols: number;
  gridRows: number;
}

export interface ConnectionInfo {
  clientIp: string;
  ip: string;
  version: string;
}

export interface TimeoutSettings {
  apiTimeout: number;
}

export interface WizardSettingsDto {
  wizardCompleted: boolean;
  wizardVersion: number;
  latestWizardVersion: number;
}

export interface SettingsDto {
  server: ServerSettingsDto;
  wizard: WizardSettingsDto;
  frontend: FrontendSettings;
  printerFileClean: FileCleanSettings;
  timeout: TimeoutSettings;
  connection?: ConnectionInfo;
}

export interface CredentialSettingsDto {
  jwtExpiresIn: number;
  refreshTokenAttempts: number;
  refreshTokenExpiry: number;
}

export interface ServerSettingsSensitiveDto {
  debugSettings: {
    debugSocketIoEvents: boolean;
    debugSocketReconnect: boolean;
    debugSocketRetries: boolean;
    debugSocketSetup: boolean;
    debugSocketMessages: boolean;
    debugSocketIoBandwidth: boolean;
  };
  whitelistEnabled: boolean;
  whitelistedIpAddresses: string[];
}

export interface SettingsSensitiveDto {
  server: ServerSettingsSensitiveDto;
  credentials: CredentialSettingsDto;
}
