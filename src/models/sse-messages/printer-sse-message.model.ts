import type { Printer } from "@/models/printers/printer.model";
import type { PrinterGroup } from "@/models/printers/printer-group.model";

export interface TestProgressDetails {
  connected: boolean;
  apiOk?: boolean;
  apiKeyNotGlobal?: boolean;
  apiKeyOk?: boolean;
  websocketBound?: boolean;
}

export interface TrackedUpload {
  correlationToken: string;
  startedAt: number;
  multerFile: {
    originalname: string;
    [k: string]: any;
  };
  progress: {
    percent: number;
    [k: string]: number;
  };
}

export interface UploadStates {
  current: TrackedUpload[];
  done: TrackedUpload[];
  failed: TrackedUpload[];
}

export interface PrinterSseMessage {
  printers: Printer[];
  printerGroups: PrinterGroup[];
  testPrinter: Printer;
  trackedUploads: UploadStates;
  testProgress: TestProgressDetails;
}
