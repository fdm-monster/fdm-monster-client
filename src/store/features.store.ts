import { defineStore } from "pinia";
import { TFeatureFlags, FeaturesModel, IFeatureFlag } from "@/models/server/features.model";
import { AppService } from "@/backend/app.service";

interface State<T = any> {
  features: FeaturesModel<T> | undefined;
}

export const useFeatureStore = defineStore("Feature", {
  state: (): State => ({
    features: undefined,
  }),
  getters: {
    getFeatures(): FeaturesModel | undefined {
      return this.features;
    },
    getFeature:
      (state) =>
      <T>(feature: TFeatureFlags): IFeatureFlag<T> | undefined => {
        if (!state.features) {
          console.debug("Feature store not loaded");
          return;
        }

        return state.features[feature] as IFeatureFlag<T> | undefined;
      },
    hasFeature:
      (state) =>
      (feature: TFeatureFlags): boolean => {
        if (!state.features) {
          console.debug("Feature store not loaded");
          return false;
        }

        const featureDefined = state.features[feature] as IFeatureFlag | undefined;
        if (!featureDefined) {
          console.debug(`Feature ${feature} not defined. Options:`, Object.keys(state.features));
          return false;
        }

        return featureDefined?.available;
      },
  },
  actions: {
    async loadFeatures() {
      try {
        const features = await AppService.getFeatures();
        this.setFeatures(features);
      } catch (error) {
        this.features = {};
      }
    },
    setFeatures(features: FeaturesModel) {
      this.features = features;
    },
  },
});
