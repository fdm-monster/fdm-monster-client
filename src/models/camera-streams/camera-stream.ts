import { PrinterDto } from "@/models/printers/printer.model";

export interface CreateCameraStreamDto {
  streamURL: string;
  name?: string;
}

export interface CameraStream {
  id?: number;
  printerId?: number;
  streamURL: string;
  name?: string;
}

export interface CameraWithPrinter {
  printer: PrinterDto;
  cameraStream: CameraStream;
}
