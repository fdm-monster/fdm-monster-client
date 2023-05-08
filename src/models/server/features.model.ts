export interface IFeatureFlag {
  available: boolean;
  version: number;
}

export interface FeaturesModel {
  batchReprintCalls?: IFeatureFlag;
}
