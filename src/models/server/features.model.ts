export interface IFeatureFlag {
  available: boolean;
  version: number;
}

export class FeaturesModel {
  batchReprintCalls?: IFeatureFlag;
  batchConnectUsbCalls?: IFeatureFlag;
  batchConnectSocketCalls?: IFeatureFlag;
}

export type TFeatureFlags = keyof FeaturesModel;
export const featureFlagsList: TFeatureFlags[] = [
  "batchReprintCalls",
  "batchConnectUsbCalls",
  "batchConnectSocketCalls",
];
