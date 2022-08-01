import type { PrinterFileCache } from "@/models/printers/printer-file-cache.model";

export interface PrinterFileBucket extends PrinterFileCache {
  printerId: string;
}
