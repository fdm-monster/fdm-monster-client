export interface WhitelistSettings {
  whitelistedIpAddresses: string[];
  whitelistEnabled: boolean;
}

export interface DebugSettings {
  debugSocketIoEvents: boolean;
  debugSocketReconnect: boolean;
  debugSocketRetries: boolean;
  debugSocketSetup: boolean;
  debugSocketMessages: boolean;
  debugSocketIoBandwidth: boolean;
}

export interface ServerSettingsDto extends WhitelistSettings {
  sentryDiagnosticsEnabled: boolean;
  loginRequired: boolean;
  registration: boolean;
}
