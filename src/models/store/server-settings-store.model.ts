import type { ServerSettings } from "../server-settings/server-settings.model";

export interface ServerSettingsStore {
    serverSettings?: ServerSettings,
    lastUpdated?: number
};