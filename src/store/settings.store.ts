import { defineStore } from "pinia";
import { FrontendSettings, SettingsDto, TimeoutSettings } from "@/models/settings/settings.model";
import { SettingsService } from "@/backend";
import { ServerSettingsDto } from "@/models/settings/server-settings.dto";

export interface FrontendDebugSettings {
  showPrinterStateUpdateSideNav: boolean;
  showInterpretedPrinterState: boolean;
  showJobsRendered: boolean;
}

export interface SettingsState {
  settings?: SettingsDto;
  frontendDebugSettings: FrontendDebugSettings;
}

export const useSettingsStore = defineStore({
  id: "Settings",
  state: (): SettingsState => ({
    settings: undefined,
    frontendDebugSettings: {
      showPrinterStateUpdateSideNav: false,
      showInterpretedPrinterState: false,
      showJobsRendered: false,
    },
  }),
  actions: {
    async loadSettings(): Promise<SettingsDto> {
      const response = await SettingsService.getSettings();
      this.settings = response;
      return response;
    },
    async updateFrontendSettings(update: FrontendSettings): Promise<SettingsDto> {
      const response = await SettingsService.updateFrontendSettings(update);
      this.settings = response;
      return response;
    },
    async updateTimeoutSettings(update: TimeoutSettings): Promise<SettingsDto> {
      const response = await SettingsService.updateTimeoutSettings(update);
      this.settings = response;
      return response;
    },
  },
  getters: {
    serverSettings(): ServerSettingsDto | undefined {
      return this.settings?.server;
    },
    frontendSettings(): FrontendSettings | undefined {
      return this.settings?.frontend;
    },
    preferCancelOverQuickStop(): boolean {
      return this.settings?.frontend?.tilePreferCancelOverQuickStop || false;
    },
    thumbnailsEnabled(): boolean {
      return this.settings?.server.experimentalThumbnailSupport || false;
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
