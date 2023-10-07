import { Printer } from "@/models/printers/printer.model";
import { Floor } from "../floors/floor.model";
import { ById } from "@/utils/types/byid.utils";
import { PrinterState } from "../printers/visual-state.model";

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

export interface SocketState {
  socket: string;
  api: string;
}

export type PrinterEvents = PrinterState;

export type SocketStateById = ById<SocketState>;
export type PrinterEventsById = ById<PrinterEvents>;

export interface SocketIoUpdateMessage {
  printers: Printer[];
  socketStates: SocketStateById;
  printerEvents: PrinterEventsById;
  trackedUploads: UploadStates;
  floors: Floor[];
}
