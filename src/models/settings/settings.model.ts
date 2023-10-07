import { ServerSettings, TimeoutSettings } from "./serverSettings";
import { FileCleanSettings } from "./printer-file-clean-settings.model";

export type FileCleanSubSetting = {
  fileClean: FileCleanSettings;
};

export interface FrontendSettings {
  largeTiles: boolean;
  gridCols: number;
  gridRows: number;
}

export interface SettingsDto {
  id: string;
  server: ServerSettings;
  frontend: FrontendSettings;
  fileClean: FileCleanSettings;
  timeout: TimeoutSettings;
}
