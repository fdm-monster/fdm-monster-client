import { defineStore } from "pinia";
import { PrinterDto } from "@/models/printers/printer.model";
import { ClearedFilesResult, FileDto } from "@/models/printers/printer-file.model";
import { PrinterFileService, PrintersService } from "@/backend";
import { CreatePrinter } from "@/models/printers/create-printer.model";
import { PrinterJobService } from "@/backend/printer-job.service";
import { usePrinterStateStore } from "./printer-state.store";
import { IdType } from "@/utils/id.type";
import {
  isPrinterDisabled,
  isPrinterDisconnected,
  isPrinterInMaintenance,
} from "@/shared/printer-state.constants";

interface State {
  printers: PrinterDto[];
  printerFileCache: Record<IdType, FileDto[]>;

  sideNavPrinter?: PrinterDto;
  updateDialogPrinter?: PrinterDto;
  selectedPrinters: PrinterDto[];
  maintenanceDialogPrinter?: PrinterDto;
}

export const usePrinterStore = defineStore("Printers", {
  state: (): State => ({
    printers: [],
    printerFileCache: {},

    sideNavPrinter: undefined,
    updateDialogPrinter: undefined,
    selectedPrinters: [],
    maintenanceDialogPrinter: undefined,
  }),
  getters: {
    printer() {
      return (printerId?: IdType) => {
        return this.printers.find((p) => p.id == printerId);
      };
    },
    isSelectedPrinter(state) {
      return (printerId?: IdType) =>
        !!state.selectedPrinters.find((p: PrinterDto) => p.id === printerId);
    },
    printerFiles() {
      return (printerId: IdType) => this.printerFileCache[printerId];
    },
    disabledCount(): number {
      return this.printers.filter(isPrinterDisabled).length;
    },
    disconnectedCount(): number {
      const printerStateStore = usePrinterStateStore();
      return this.printers.filter((p) =>
        isPrinterDisconnected(p, printerStateStore.printerEventsById[p.id])
      ).length;
    },
    maintenanceCount(): number {
      return this.printers.filter((p) => isPrinterInMaintenance(p)).length;
    },
  },
  actions: {
    async createPrinter(newPrinter: CreatePrinter, forceSave: boolean) {
      const data = await PrintersService.createPrinter(newPrinter, forceSave);
      this.printers.push(data);
      this.printers.sort((a: PrinterDto, b: PrinterDto) =>
        a.name?.toLowerCase()?.localeCompare(b?.name?.toLowerCase()) ? 1 : -1
      );
      return data;
    },
    toggleSelectedPrinter(printer: PrinterDto) {
      const printerStateStore = usePrinterStateStore();
      const selectedPrinterIndex = this.selectedPrinters.findIndex((sp) => sp.id == printer.id);
      if (selectedPrinterIndex === -1) {
        if (printerStateStore.isApiResponding(printer.id)) {
          this.selectedPrinters.push(printer);
        }
      } else {
        this.selectedPrinters.splice(selectedPrinterIndex, 1);
      }
    },
    clearSelectedPrinters() {
      this.selectedPrinters = [];
    },
    setSideNavPrinter(printer?: PrinterDto) {
      this.sideNavPrinter = printer;
    },
    setUpdateDialogPrinter(printer?: PrinterDto) {
      this.updateDialogPrinter = printer;
    },
    setMaintenanceDialogPrinter(printer?: PrinterDto) {
      this.maintenanceDialogPrinter = printer;
    },
    async updatePrinter(
      {
        printerId,
        updatedPrinter,
      }: {
        printerId: IdType;
        updatedPrinter: CreatePrinter;
      },
      forceSave: boolean
    ) {
      const data = await PrintersService.updatePrinter(printerId, updatedPrinter, forceSave);
      this._replacePrinter({ printerId, printer: data });
      return data;
    },
    async loadPrinters() {
      const data = await PrintersService.getPrinters();
      this.setPrinters(data);
      return data;
    },
    async deletePrinter(printerId: IdType) {
      const data = await PrintersService.deletePrinter(printerId);
      this._popPrinter(printerId);
      return data;
    },
    setPrinters(printers: PrinterDto[]) {
      if (!printers?.length) {
        this.printers = [];
        return;
      }
      const viewedPrinterId = this.sideNavPrinter?.id;
      if (viewedPrinterId) {
        this.sideNavPrinter = printers.find((p) => p.id === viewedPrinterId);
      }
      this.printers = printers.sort((a: PrinterDto, b: PrinterDto) =>
        a.name?.toLowerCase()?.localeCompare(b?.name?.toLowerCase()) ? 1 : -1
      );
    },
    _popPrinter(printerId: IdType) {
      const printerIndex = this.printers.findIndex((p: PrinterDto) => p.id === printerId);

      if (printerIndex !== -1) {
        this.printers.splice(printerIndex, 1);
      } else {
        console.warn("Printer was not popped as it did not occur in state", printerId);
      }
    },
    _replacePrinter({ printerId, printer }: { printerId: IdType; printer: PrinterDto }) {
      const printerIndex = this.printers.findIndex((p: PrinterDto) => p.id === printerId);

      if (printerIndex !== -1) {
        this.printers[printerIndex] = printer;
      } else {
        console.warn("Printer was not purged as it did not occur in state", printerId);
      }
    },
    async clearPrinterFiles(printerId: IdType) {
      if (!printerId) {
        throw new Error("No printerId was provided");
      }
      const result = (await PrinterFileService.clearFiles(printerId)) as ClearedFilesResult;
      if (!result?.failedFiles) {
        throw new Error("No failed files were returned");
      }
      const bucket = this.printerFileCache[printerId];
      if (bucket) {
        this.printerFileCache[printerId] = result.failedFiles;
      }
    },
    async loadPrinterFiles(printerId: IdType) {
      const files = await PrinterFileService.getFiles(printerId);

      files.sort((f1, f2) => (f1.date < f2.date ? 1 : -1));

      this.printerFileCache[printerId] = files;
      return files;
    },
    async deletePrinterFile(printerId: IdType, fullPath: string) {
      await PrinterFileService.deleteFileOrFolder(printerId, fullPath);

      const fileBucket = this.printerFileCache[printerId];
      if (!fileBucket?.length) {
        console.warn("Printer file list was nonexistent", printerId);
        return;
      }

      const deletedFileIndex = fileBucket.findIndex((f) => f.path === fullPath);

      if (deletedFileIndex !== -1) {
        fileBucket.splice(deletedFileIndex, 1);
      } else {
        console.warn("File was not purged as it did not occur in state", fullPath);
      }

      return this.printerFiles(printerId);
    },
    async sendStopJobCommand(printerId?: IdType) {
      const printerStateStore = usePrinterStateStore();
      if (!printerId) return;
      const printer = this.printer(printerId);
      if (!printer) return;

      const question = !printerStateStore.isPrinterPrinting(printerId)
        ? "The printer is still printing - are you sure to stop it?"
        : "The printer seems idle - do you want to command it to stop anyway?";

      const answer = confirm(question);
      if (answer) {
        await PrinterJobService.stopPrintJob(printer.id);
      }
    },
  },
});
