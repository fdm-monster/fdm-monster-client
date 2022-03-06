import { PrinterFileService } from "@/backend";
import type { PrinterFileCache } from "@/models/printers/printer-file-cache.model";
import type { ClearedFilesResult, PrinterFile } from "@/models/printers/printer-file.model";
import type { PrinterFilesStore } from "@/models/store/printer-files-store.model";
import { defineStore } from "pinia";

export const usePrinterFilesStore = defineStore({
    id: 'printer-files',
    state: (): PrinterFilesStore => ({
        printerFileBuckets: [],
        lastUpdated: undefined
    }),
    getters: {
        printerFileBucket() {
            return (printerId?: string) => this.printerFileBuckets?.find((p) => p.printerId === printerId);
        },
        printerFiles() {
            return (printerId?: string) => this.printerFileBucket(printerId)?.files;
        }
    },
    actions: {
        async loadPrinterFiles({ printerId, recursive }: { printerId: string; recursive: boolean }) {
            const data = await PrinterFileService.getFiles(printerId, recursive);

            data.files.sort((f1, f2) => {
                return f1.date < f2.date ? 1 : -1;
            });

            this._setPrinterFiles({ printerId, fileList: data });

            return data;
        },
        async clearPrinterFiles(printerId?: string) {
            if (!printerId) return;
            const result = await PrinterFileService.clearFiles(printerId);

            this._clearPrinterFiles({
                printerId,
                result: result as ClearedFilesResult
            });
        },
        async deletePrinterFile({ printerId, fullPath }: { printerId: string; fullPath: string }) {
            await PrinterFileService.deleteFileOrFolder(printerId, fullPath);

            this._popPrinterFile({ printerId, fullPath });

            return this.printerFiles(printerId) as PrinterFile[];
        },
        // Mutator
        _clearPrinterFiles({
            printerId,
            result
        }: {
            printerId: string;
            result: ClearedFilesResult;
        }) {
            const bucket = this.printerFileBuckets.find((b) => b.printerId === printerId);

            if (bucket) {
                bucket.files = result.failedFiles;
            }
        },
        // Mutator
        _setPrinterFiles({
            printerId,
            fileList
        }: {
            printerId: string;
            fileList: PrinterFileCache;
        }) {
            let fileBucket = this.printerFileBuckets.find((p) => p.printerId === printerId);

            if (!fileBucket) {
                fileBucket = {
                    printerId,
                    ...fileList
                };
                this.printerFileBuckets.push(fileBucket);
            } else {
                fileBucket.files = fileList.files;
            }
        },
        // Mutator
        _popPrinterFile({ printerId, fullPath }: { printerId: string; fullPath: string }) {
            const fileBucket = this.printerFileBuckets.find((p) => p.printerId === printerId);

            if (!fileBucket?.files) {
                console.warn("Printer file list was nonexistent", printerId);
                return;
            }

            const deletedFileIndex = fileBucket.files.findIndex((f) => f.path === fullPath);

            if (deletedFileIndex !== -1) {
                fileBucket.files.splice(deletedFileIndex, 1);
            } else {
                console.warn("File was not purged as it did not occur in state", fullPath);
            }
        }
    },
});