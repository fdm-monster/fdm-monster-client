export interface ServerModel {
  registration: boolean;
  port: number;
  loginRequired: boolean;
}

export interface PrinterFileCleanSettings {
  autoRemoveOldFilesBeforeUpload: boolean;
  autoRemoveOldFilesAtBoot: boolean;
  autoRemoveOldFilesCriteriumDays: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OnlinePollingModel {}

export type PrinterFileCleanSubSetting = {
  printerFileClean: PrinterFileCleanSettings;
};

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
