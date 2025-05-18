import { PrinterDto } from "@/models/printers/printer.model";
import { QueuedUpload } from "@/models/uploads/queued-upload.model";

/**
 * Multiple files => 1 printer
 */
export function convertPrinterMultiFileToQueue(printer: PrinterDto, files: File[], startPrint: boolean = true): QueuedUpload[] {
  if (!printer) return [];

  return files.map((f) => {
    return {
      file: f,
      printer,
      startPrint,
    };
  }) as QueuedUpload[];
}

export function convertMultiPrinterFileToQueue(printers: PrinterDto[], file: File, startPrint: boolean = true): QueuedUpload[] {
  if (!printers?.length || !file) return [];

  return printers.map((p) => {
    return {
      file,
      printer: p,
      startPrint,
    };
  }) as QueuedUpload[];
}
