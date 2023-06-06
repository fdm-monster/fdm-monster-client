import { PrinterFileCache } from "./printer-file-cache.model";

export interface LoginDetails {
  apiKey: string;
  printerURL: string;
}

export interface LastPrintedFile {
  fileName: string;
  editTimestamp: number;
  parsedColor: string;
  parsedVisualizationRAL: number;
  parsedAmount: number;
  parsedMaterial: string;
  parsedOrderCode: string;
}

export interface Printer {
  id: string;
  correlationToken?: string;
  lastPrintedFile: LastPrintedFile;
  enabled: boolean;
  dateAdded: number;
  disabledReason: string;
  printerName: string;
  webSocketURL: string;
  apiKey: string;
  printerURL: string;

  fileList: PrinterFileCache;
}
