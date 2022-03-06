import type { OnlinePollingModel } from "@/models/server-settings/online-polling.model";
import type { ServerModel } from "@/models/server-settings/server.model";
import type { PrinterFileCleanSettings } from "@/models/server-settings/printer-file-clean-settings.model";

export type PrinterFileCleanSubSetting = { printerFileClean: PrinterFileCleanSettings };

export interface ServerSettings {
  id: string;
  onlinePolling: OnlinePollingModel; // TODO finish model
  server: ServerModel;
  printerFileClean: PrinterFileCleanSettings;

  timeout: any; // TODO model
  filamentManager: boolean;
  filament: any; // TODO model;
  history: any; // TODO model;
  influxExport: any; // TODO model;
}
