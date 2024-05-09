import { PrinterDto } from "@/models/printers/printer.model";
import { QueuedUpload } from "@/models/uploads/queued-upload.model";

/**
 * Multiple files => 1 printer
 * @param printer
 * @param files
 */
export function convertPrinterMultiFileToQueue(printer: PrinterDto, files: File[]): QueuedUpload[] {
  if (!printer) return [];

  return files.map((f) => {
    return {
      file: f,
      printer,
    };
  }) as QueuedUpload[];
}

export function convertMultiPrinterFileToQueue(printers: PrinterDto[], file: File) {
  if (!printers?.length || !file) return [];

  return printers.map((p) => {
    return {
      file,
      printer: p,
    };
  }) as QueuedUpload[];
}
