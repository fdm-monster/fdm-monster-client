import { PrinterDto } from "@/models/printers/printer.model";

export interface QueuedUpload {
  printer: PrinterDto;
  file: File;
  startPrint: boolean;
}

export interface FailedQueuedUpload extends QueuedUpload {
  error: any;
}
