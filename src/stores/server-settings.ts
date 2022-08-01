import { SettingsService } from "@/backend";
import type { ServerSettingsStore } from "@/models/store/server-settings-store.model";
import { defineStore } from "pinia";

export const useServerSettingsStore = defineStore({
  id: "server-settings",
  state: (): ServerSettingsStore => ({
    serverSettings: undefined,
    lastUpdated: undefined,
  }),
  actions: {
    storeUpdate() {
      this.lastUpdated = Date.now();
    },
    async loadServerSettings() {
      const response = await SettingsService.getServerSettings();
      this.serverSettings = response;
      this.storeUpdate();
      return response;
    },
  },
});
