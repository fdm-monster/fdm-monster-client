export interface IFeatureFlag<T = any> {
  available: boolean;
  version: number;
  subFeatures: T;
}

export class FeaturesModel<T = any> {
  batchReprintCalls?: IFeatureFlag<T>;
  batchConnectSocketCalls?: IFeatureFlag<T>;
  batchConnectUsbCalls?: IFeatureFlag<T>;
  newSockets?: IFeatureFlag<T>;
  anonymousDiagnosticsToggle?: IFeatureFlag<T>;
  pauseResumePrinterCommand?: IFeatureFlag<T>;
  logDumpZip?: IFeatureFlag<T>;
  clearLogFiles?: IFeatureFlag<T>;
  batchTogglePrinterEnabled?: IFeatureFlag<T>;
  cameraStream?: IFeatureFlag<T>;
  printerGroupsApi?: IFeatureFlag<T>;
  printerControlApi?: IFeatureFlag<T>;
  githubRateLimitApi?: IFeatureFlag<T>;
  multiplePrinterServices?: IFeatureFlag<T>;
}

export type TFeatureFlags = keyof FeaturesModel;
export const featureFlagsList: TFeatureFlags[] = [
  "batchReprintCalls",
  "batchConnectUsbCalls",
  "batchConnectSocketCalls",
  "newSockets",
  "anonymousDiagnosticsToggle",
  "pauseResumePrinterCommand",
  "logDumpZip",
  "clearLogFiles",
  "batchTogglePrinterEnabled",
  "cameraStream",
  "printerGroupsApi",
  "printerControlApi",
  "githubRateLimitApi",
  "multiplePrinterServices",
];
