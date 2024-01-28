import { IdType } from "@/utils/id.type";
import { OctoPrintStatisticsDto, Prints, Refs } from "@/models/printers/printer-file.model";
import { GcodeAnalysisDto } from "@/models/printers/gcode/gcode-analysis.model";

interface ReprintFileDto {
  file?: CreateOrUpdatePrinterFileDto;
  reprintState: ReprintState;
  connectionState: ConnectionState | null;
  printerId: IdType;
}
enum ReprintState {
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

export class CreateOrUpdatePrinterFileDto {
  id?: IdType;
  printerId?: IdType;

  name: string;
  date: number;
  display: string;
  gcodeAnalysis?: GcodeAnalysisDto;

  hash: string;
  origin: string;
  path: string;
  prints: Prints;
  refs: Refs;
  size: number;
  statistics: OctoPrintStatisticsDto;
  type: string;
  typePath: string[]; // machinecode gcode

  customData?: OctoPrintCustomDto;
}

export interface OctoPrintCustomDto {
  // Custom metadata that is updated on hash changes only
  userdata?: any;

  // Optional parts due to plugins and such
  displayLayerProgress?: DisplayLayerProgressDto;
  thumbnail?: string;
  thumbnail_src?: string;
  [k: string]: any;
}

export interface DisplayLayerProgressDto {
  // numberstring
  totalLayerCountWithoutOffset: string;
}
