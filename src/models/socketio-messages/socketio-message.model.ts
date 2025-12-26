import { PrinterDto } from "@/models/printers/printer.model";
import { FloorDto } from "../floors/floor.model";
import { CurrentOrHistoryPayload } from "@/models/printers/printer-current-job.model";

export interface TrackedUpload {
  correlationToken: string;
  printerId: number;
  startedAt: number;
  multerFile: {
    originalname: string;
    [k: string]: any;
  };
  progress: number;
  completed: boolean;
  completedAt?: number;
  success?: boolean;
  reason?: string;
}

export interface UploadStates {
  current: TrackedUpload[];
}

export interface SocketState {
  socket: string;
  api: string;
}

export interface ConnectionMessageDto {
  version?: string;
  display_version?: string;
  branch?: string;
  plugin_hash?: string;
  config_hash?: string;
  python_version?: string;
  online?: boolean;
  debug?: boolean;
  safe_mode?: null;
  permissions?: {
    key: string;
    name: string;
    dangerous: boolean;
    default_groups: string[];
    description: string;
    needs: {
      role?: string[];
    };
    plugin: string;
  }[];
}

export interface PrinterStateDto {
  connected: {
    payload?: ConnectionMessageDto;
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
  socketStates: Record<number, SocketState>;
  printerEvents: Record<number, PrinterStateDto>;
  trackedUploads: UploadStates;
  floors: FloorDto[];
  [k: string]: any;
}
