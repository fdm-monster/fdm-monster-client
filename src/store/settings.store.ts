import { defineStore } from "pinia";
import { FrontendSettings, SettingsDto } from "@/models/settings/settings.model";
import { SettingsService } from "@/backend";
import { ServerSettings } from "@/models/settings/serverSettings";

export interface DebugSettings {
  showPrinterStateUpdateSideNav: boolean;
  showInterpretedPrinterState: boolean;
  showJobsRendered: boolean;
}

export interface SettingsState {
  settings?: SettingsDto;
  debugSettings: DebugSettings;
}

export const useSettingsStore = defineStore({
  id: "Settings",
  state: (): SettingsState => ({
    settings: undefined,
    debugSettings: {
      showPrinterStateUpdateSideNav: false,
      showInterpretedPrinterState: false,
      showJobsRendered: false,
    },
  }),
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
    serverSettings(): ServerSettings | undefined {
      return this.settings?.server;
    },
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
