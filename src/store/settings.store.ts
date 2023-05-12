import { defineStore } from "pinia";
import { FrontendSettings, SettingsDto } from "../models/settings/settings.model";
import { SettingsService } from "@/backend";

export interface SettingsState {
  settings?: SettingsDto;
}

export const useSettingsStore = defineStore({
  id: "Settings",
  state: (): SettingsState => ({ settings: undefined }),
  actions: {
    async loadSettings(): Promise<SettingsDto> {
      const response = await SettingsService.getServerSettings();
      this.settings = response;
      return response;
    },
    async updateFrontendSettings(update: FrontendSettings): Promise<SettingsDto> {
      const response = await SettingsService.updateFrontendSettings(update);
      this.settings = response;
      return response;
    },
  },
  getters: {
    largeTiles(): boolean {
      return this.settings?.frontend?.largeTiles || false;
    },
    gridCols(): number {
      return this.settings?.frontend?.gridCols || 8;
    },
    gridRows(): number {
      return this.settings?.frontend?.gridRows || 8;
    },
  },
});
