export interface IFeatureFlag<T = any> {
  available: boolean;
  version: number;
  subFeatures: T;
}

export class FeaturesModel<T = any> {
  printerGroupsApi?: IFeatureFlag<T>;
  multiplePrinterServices?: IFeatureFlag<T>;
}

export type TFeatureFlags = keyof FeaturesModel;
