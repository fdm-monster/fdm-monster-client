export interface WhitelistSettings {
  whitelistedIpAddresses: string[];
  whitelistEnabled: boolean;
}

export interface TimeoutSettings {
  apiTimeout: number;
}

export interface DebugSettings {
  debugSocketIoEvents: boolean;
  debugSocketReconnect: boolean;
  debugSocketRetries: boolean;
  debugSocketSetup: boolean;
  debugSocketMessages: boolean;
  debugSocketIoBandwidth: boolean;
}

export interface ServerSettings extends WhitelistSettings {
  sentryDiagnosticsEnabled: boolean;
  debugSettings: DebugSettings;
  loginRequired: boolean;
  registration: boolean;
}
