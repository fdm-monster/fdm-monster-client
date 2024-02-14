export interface IFeatureFlag {
  available: boolean;
  version: number;
}

export class FeaturesModel {
  batchReprintCalls?: IFeatureFlag;
  batchConnectSocketCalls?: IFeatureFlag;
  batchConnectUsbCalls?: IFeatureFlag;
  newSockets?: IFeatureFlag;
  anonymousDiagnosticsToggle?: IFeatureFlag;
  pauseResumePrinterCommand?: IFeatureFlag;
  logDumpZip?: IFeatureFlag;
  clearLogFiles?: IFeatureFlag;
  batchTogglePrinterEnabled?: IFeatureFlag;
  cameraStream?: IFeatureFlag;
  printerGroupsApi?: IFeatureFlag;
  printerControlApi?: IFeatureFlag;
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
];
