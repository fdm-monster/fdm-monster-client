export interface WhitelistSettings {
  whitelistedIpAddresses: string[];
  whitelistEnabled: boolean;
}

export interface ServerSettings extends WhitelistSettings {
  registration: boolean;
  port: number;
  loginRequired: boolean;
  anonymousDiagnosticsEnabled: boolean;
}
