export interface ServerSettingsDto {
  sentryDiagnosticsEnabled: boolean;
  loginRequired: boolean;
  registration: boolean;
  experimentalMoonrakerSupport: boolean;
  experimentalClientSupport: boolean;
  experimentalThumbnailSupport: boolean;
}
