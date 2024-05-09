import { PrinterDto } from "@/models/printers/printer.model";
import { QueuedUpload } from "@/models/uploads/queued-upload.model";

export function convertMultiPrinterFileToQueue(printers: PrinterDto[], file: File) {
  if (!printers?.length || !file) return [];

  return printers.map((p) => {
    return {
      file,
      printer: p,
    };
  }) as QueuedUpload[];
}
