import {
  PrinterFileService,
  PrinterJobService,
  PrintersService,
} from "@/backend";
import type { Printer } from "@/models/printers/printer.model";
import type { PrintersStore } from "@/models/store/printer-store.model";
import { defineStore } from "pinia";
import type { CreatePrinter } from "@/models/forms/create-printer.legacy.model";

export const usePrintersStore = defineStore({
  id: "printers",
  state: (): PrintersStore => ({
    printers: [],
    lastUpdated: undefined,
    testPrinter: undefined,
    sideNavPrinter: undefined,
    updateDialogPrinter: undefined,
    batchJsonCreateDialogOpened: false,
    createDialogOpened: false,
    selectedPrinters: [],
  }),
  getters: {
    onlinePrinters(): Printer[] {
      return this.printers.filter((p) => p.apiAccessibility.accessible);
    },
    printer(): (printerId?: string) => Printer | undefined {
      return (printerId?: string) =>
        this.printers.find((p) => p.id === printerId);
    },
    isSelectedPrinter() {
      return (printerId?: string) =>
        !!this.selectedPrinters.find((p: Printer) => p.id === printerId);
    },
    isPrinterOperational() {
      return (printerId?: string) =>
        this.printer(printerId)?.printerState?.flags?.operational;
    },
    isPrinterPrinting() {
      return (printerId?: string) =>
        this.printer(printerId)?.printerState?.flags?.printing;
    },
    printersWithJob(): Printer[] {
      return this.printers.filter(
        // If flags are falsy, we can skip the printer => its still connecting
        (p) =>
          p.printerState.flags &&
          (p.printerState.flags.printing || p.printerState.flags.printing)
      );
    },
  },
  actions: {
    storeUpdate() {
      this.lastUpdated = Date.now();
    },
    // Sidenav state
    setSideNavPrinter(printer?: Printer) {
      this.sideNavPrinter = printer;
      this.storeUpdate();
    },
    // Dialog state
    setUpdateDialogPrinter(printer?: Printer) {
      this.updateDialogPrinter = printer;
      this.storeUpdate();
    },
    setBatchJsonCreateDialogOpened(opened: boolean) {
      this.batchJsonCreateDialogOpened = opened;
      this.storeUpdate();
    },
    // Dialog state
    setCreateDialogOpened(opened: boolean) {
      this.createDialogOpened = opened;
      this.storeUpdate();
    },
    resetSelectedPrinters() {
      this.selectedPrinters = [];
      this.storeUpdate();
    },
    toggleSelectedPrinter(printer: Printer) {
      const selectedPrinterIndex = this.selectedPrinters.findIndex(
        (sp) => sp.id == printer.id
      );
      if (selectedPrinterIndex === -1) {
        if (printer.apiAccessibility.accessible) {
          this.selectedPrinters.push(printer);
        }
      } else {
        this.selectedPrinters.splice(selectedPrinterIndex, 1);
      }
      this.storeUpdate();
    },
    async loadPrinters() {
      const data = await PrintersService.getPrinters();
      this._setPrinters(data);
      return data;
    },
    async savePrinters(newPrinters: Printer[]) {
      this._setPrinters(newPrinters);

      return newPrinters;
    },
    async createPrinter(newPrinter: CreatePrinter) {
      const data = await PrintersService.createPrinter(newPrinter);
      this._addPrinter(data);
      return data;
    },
    async updatePrinter({
      printerId,
      updatedPrinter,
    }: {
      printerId: string;
      updatedPrinter: CreatePrinter;
    }) {
      const data = await PrintersService.updatePrinter(
        printerId,
        updatedPrinter
      );

      this._replacePrinter({ printerId, printer: data });

      return data;
    },
    async selectAndPrintFile({
      printerId,
      fullPath,
    }: {
      printerId: string;
      fullPath: string;
    }) {
      if (!printerId) return;
      const printer = this.printer(printerId);
      if (!printer) return;

      if (
        printer.printerState.flags.printing ||
        !printer.apiAccessibility.accessible
      ) {
        alert(
          "This printer is printing or not connected! Either way printing is not an option."
        );
        return;
      }

      await PrinterFileService.selectAndPrintFile(printerId, fullPath);
    },
    async sendStopJobCommand(printerId?: string) {
      if (!printerId) return;
      const printer = this.printer(printerId);
      if (!printer) return;

      if (printer.printerState.flags.printing) {
        const answer = confirm(
          "The printer is still printing - are you sure to stop it?"
        );
        if (answer) {
          await PrinterJobService.stopPrintJob(printer.id);
        }
      }
    },
    async createTestPrinter(newPrinter: CreatePrinter) {
      this.testPrinter = await PrintersService.testConnection(newPrinter);
      this.storeUpdate();
      return this.testPrinter;
    },
    async deletePrinter(printerId: string) {
      const data = await PrintersService.deletePrinter(printerId);
      this._popPrinter(printerId);
      return data;
    },
    // Mutator
    _popPrinter(printerId: string) {
      const printerIndex = this.printers.findIndex(
        (p: Printer) => p.id === printerId
      );

      if (printerIndex !== -1) {
        this.printers.splice(printerIndex, 1);
      } else {
        console.warn(
          "Printer was not popped as it did not occur in state",
          printerId
        );
      }
      this.storeUpdate();
    },
    // Mutator
    _addPrinter(printer: Printer) {
      this.printers.push(printer);
      this.printers.sort((a: Printer, b: Printer) =>
        a.sortIndex > b.sortIndex ? 1 : -1
      );
      this.storeUpdate();
    },
    // Mutator
    _setPrinters(printers: Printer[]) {
      const viewedPrinterId = this.sideNavPrinter?.id;
      if (viewedPrinterId) {
        this.sideNavPrinter = printers.find((p) => p.id === viewedPrinterId);
      }
      this.printers = printers;
      this.storeUpdate();
    },
    // Mutator
    _replacePrinter({
      printerId,
      printer,
    }: {
      printerId: string;
      printer: Printer;
    }) {
      const printerIndex = this.printers.findIndex(
        (p: Printer) => p.id === printerId
      );

      if (printerIndex !== -1) {
        this.printers[printerIndex] = printer;
      } else {
        console.warn(
          "Printer was not purged as it did not occur in state",
          printerId
        );
      }
      this.storeUpdate();
    },
  },
});
