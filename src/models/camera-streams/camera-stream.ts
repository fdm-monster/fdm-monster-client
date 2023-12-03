import { PrinterDto } from "@/models/printers/printer.model";

export interface CreateCameraStreamDto {
  streamURL: string;
  name?: string;
}

export interface CameraStream {
  id: string;
  printerId?: string;
  streamURL: string;
  name?: string;
}

export interface CameraWithPrinter {
  printer: PrinterDto;
  cameraStream: CameraStream;
}
