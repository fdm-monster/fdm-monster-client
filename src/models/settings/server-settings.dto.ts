export interface ServerSettingsDto {
  sentryDiagnosticsEnabled: boolean;
  loginRequired: boolean;
  registration: boolean;
  experimentalMoonrakerSupport: boolean;
  experimentalTypeormSupport: boolean;
  experimentalClientSupport: boolean;
  experimentalThumbnailSupport: boolean;
}
