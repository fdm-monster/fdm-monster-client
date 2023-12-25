import { PrinterDto } from "@/models/printers/printer.model";
import { FloorDto } from "../floors/floor.model";
import { IdType } from "@/utils/id.type";
import { CurrentOrHistoryPayload } from "@/models/printers/printer-current-job.model";

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

export interface PrinterState {
  connected: {
    payload: any;
    receivedAt: number;
  };
  plugins: any[];
  events: any[];
  current: {
    payload: CurrentOrHistoryPayload;
    receivedAt: number;
  };
  history: {
    payload: CurrentOrHistoryPayload;
    receivedAt: number;
  };
}

export interface SocketIoUpdateMessage {
  printers: PrinterDto[];
  socketStates: Record<IdType, SocketState>;
  printerEvents: Record<IdType, PrinterState>;
  trackedUploads: UploadStates;
  floors: FloorDto[];
}
