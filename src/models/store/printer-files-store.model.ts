import type { PrinterFileBucket } from "../printers/printer-file-bucket.model";

export interface PrinterFilesStore {
    printerFileBuckets: PrinterFileBucket[],
    lastUpdated?: number
}