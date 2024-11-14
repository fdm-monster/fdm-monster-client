export interface DebugSettings {
  debugSocketIoEvents: boolean;
  debugSocketReconnect: boolean;
  debugSocketRetries: boolean;
  debugSocketSetup: boolean;
  debugSocketMessages: boolean;
  debugSocketIoBandwidth: boolean;
}

export interface ServerSettingsDto {
  sentryDiagnosticsEnabled: boolean;
  loginRequired: boolean;
  registration: boolean;
  experimentalMoonrakerSupport: boolean;
  experimentalTypeormSupport: boolean;
  experimentalClientSupport: boolean;
}
