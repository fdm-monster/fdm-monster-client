import { PrinterDto } from "@/models/printers/printer.model";
import { IdType } from "@/utils/id.type";

export interface CreateCameraStreamDto {
  streamURL: string;
  name?: string;
}

export interface CameraStream {
  id: string;
  printerId?: IdType;
  streamURL: string;
  name?: string;
}

export interface CameraWithPrinter {
  printer: PrinterDto;
  cameraStream: CameraStream;
}
