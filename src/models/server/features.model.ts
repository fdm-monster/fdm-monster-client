export interface IFeatureFlag {
  available: boolean;
  version: number;
}

export class FeaturesModel {
  batchReprintCalls?: IFeatureFlag;
}

export type TFeatureFlags = keyof FeaturesModel;
export const featureFlagsList: TFeatureFlags[] = ["batchReprintCalls"];
