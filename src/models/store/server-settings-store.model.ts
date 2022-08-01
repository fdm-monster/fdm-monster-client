import type { ServerSettings } from "../server-settings.model";

export interface ServerSettingsStore {
  serverSettings?: ServerSettings;
  lastUpdated?: number;
}
