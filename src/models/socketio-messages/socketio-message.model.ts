import { Printer } from "@/models/printers/printer.model";
import { Floor } from "../floors/floor.model";
import { ById } from "../../utils/types/byid.utils";

export interface TestProgressDetails {
  connected: boolean;
  isOctoPrint?: boolean;
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

export interface SocketIoTestPrinterMessage {
  testPrinter: Printer;
  testProgress: TestProgressDetails;
}

export interface SocketState {
  socket: string;
  api: string;
}

export interface PrinterEvents {
  current: any;
  events: any;
  plugins: any;
}

export type SocketStateById = ById<SocketState>;
export type PrinterEventsById = ById<PrinterEvents>;

export interface SocketIoUpdateMessage {
  printers: Printer[];
  socketStates: SocketStateById;
  printerEvents: PrinterEventsById;
  trackedUploads: UploadStates;
  floors: Floor[];
}
