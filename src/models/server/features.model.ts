export interface IFeatureFlag<T = any> {
  available: boolean;
  version: number;
  subFeatures: T;
}

export class FeaturesModel<T = any> {
  multiplePrinterServices?: IFeatureFlag<T>;
}

export type TFeatureFlags = keyof FeaturesModel;
