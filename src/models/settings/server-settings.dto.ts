export interface ServerSettingsDto {
  sentryDiagnosticsEnabled: boolean;
  loginRequired: boolean;
  registration: boolean;
  experimentalMoonrakerSupport: boolean;
  experimentalPrusaLinkSupport: boolean;
  experimentalBambuSupport: boolean;
  experimentalTypeormSupport: boolean;
  experimentalClientSupport: boolean;
  experimentalThumbnailSupport: boolean;
}
