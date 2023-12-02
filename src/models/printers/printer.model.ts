import { PrinterFileCache } from "./printer-file-cache.model";

export interface LoginDetails {
  apiKey: string;
  printerURL: string;
}

export interface Printer {
  id: string;
  correlationToken?: string;
  enabled: boolean;
  dateAdded: number;
  disabledReason: string;
  name: string;
  webSocketURL: string;
  apiKey: string;
  printerURL: string;

  fileList: PrinterFileCache;
}
