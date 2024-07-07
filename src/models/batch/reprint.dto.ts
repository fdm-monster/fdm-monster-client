import { IdType } from "@/utils/id.type";
import { FileDto } from "@/models/printers/printer-file.model";

export interface ReprintFileDto {
  file?: FileDto;
  reprintState: ReprintState;
  connectionState: ConnectionState | null;
  printerId: IdType;
}

export enum ReprintState {
  PrinterNotAvailable = 0,
  NoLastPrint = 1,
  LastPrintReady = 2,
}

export type ConnectionState =
  | "Operational"
  | "Printing"
  | "Starting print from SD"
  | "Starting to send file to SD"
  | "Printing from SD"
  | "Transferring file to SD"
  | "Sending file to SD"
  | "Starting"
  | "Pausing"
  | "Paused"
  | "Resuming"
  | "Finishing"
  | "Cancelling"
  | "Error"
  | "Offline"
  | "Offline after error"
  | "Opening serial connection"
  | "Detecting serial connection"
  | "Unknown State";
