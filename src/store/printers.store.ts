import { defineStore } from "pinia";
import { Printer } from "@/models/printers/printer.model";
import { PrinterFileBucket } from "@/models/printers/printer-file-bucket.model";
import { Floor } from "@/models/printer-floor/printer-floor.model";
import { ClearedFilesResult } from "@/models/printers/printer-file.model";
import { PrinterFileService, PrintersService } from "@/backend";
import { CreatePrinter } from "@/models/printers/crud/create-printer.model";
import { FloorService } from "../backend/floor.service";
import { PrinterJobService } from "@/backend/printer-job.service";
import { largeGridColumnCount, largeGridRowCount } from "../constants/printer-grid.constants";

interface State {
  printers: Printer[];
  testPrinters?: Printer;
  printerFileBuckets: PrinterFileBucket[];
  floors: Floor[];
  selectedFloor?: Floor;

  sideNavPrinter?: Printer;
  updateDialogPrinter?: Printer;
  selectedPrinters: Printer[];
  maintenanceDialogPrinter?: Printer;
}

export const usePrintersStore = defineStore("Printers", {
  state: (): State => ({
    printers: [],
    testPrinters: undefined,
    printerFileBuckets: [],
    floors: [],
    selectedFloor: undefined,

    sideNavPrinter: undefined,
    updateDialogPrinter: undefined,
    selectedPrinters: [],
    maintenanceDialogPrinter: undefined,
  }),
  getters: {
    sortedFloors(state) {
      return state.floors.sort((f, f2) => f.floor - f2.floor);
    },
    floor(state) {
      return (floorId: string) => state.floors.find((pf) => pf._id === floorId);
    },
    floorOfPrinter() {
      return (printerId: string) => {
        return this.floors.find((f: Floor) =>
          f.printers.map((pid) => pid.printerId).includes(printerId)
        );
      };
    },
    gridSortedPrinters() {
      if (!this.printers?.length) return [];
      if (!this.selectedFloor) return [];

      const positions = this.selectedFloor.printers;
      const gridY = largeGridRowCount * 2; // X
      const gridX = largeGridColumnCount * 2; // Y

      const matrix: (Printer | undefined)[][] = [];
      for (let i = 0; i < gridY; i++) {
        const row: (Printer | undefined)[] = [];
        matrix.push(row);
        for (let j = 0; j < gridX; j++) {
          const position = positions.find((p) => p.x === i && p.y === j);
          if (!position) {
            row.push(undefined);
          } else {
            const printer = this.printers.find((p) => p.id === position.printerId);
            row.push(printer);
          }
        }
      }
      return matrix;
    },
    floorlessPrinters(state): Printer[] {
      return state.printers.filter(
        (p) => !this.floors.find((f) => f.printers.find((fp) => fp.printerId === p.id))
      );
    },
    printer() {
      return (printerId?: string) => this.printers.find((p) => p.id === printerId);
    },
    onlinePrinters(state) {
      return state.printers.filter((p) => p.apiAccessibility.accessible);
    },
    printersWithJob(state) {
      return state.printers.filter(
        // If flags are falsy, we can skip the printer => it's still connecting
        (p) =>
          p.printerState.flags && (p.printerState.flags.printing || p.printerState.flags.printing)
      );
    },
    unpositionedPrinters(): Printer[] {
      return this.printers.filter(
        (p) => !this.floors.find((f) => f.printers.find((fp) => fp.printerId === p.id))
      );
    },
    isSelectedPrinter(state) {
      return (printerId?: string) =>
        !!state.selectedPrinters.find((p: Printer) => p.id === printerId);
    },
    isPrinterOperational() {
      return (printerId?: string) => this.printer(printerId)?.printerState?.flags?.operational;
    },
    isPrinterPrinting() {
      return (printerId?: string) => this.printer(printerId)?.printerState?.flags?.printing;
    },
    printerFileBucket() {
      return (printerId?: string) => this.printerFileBuckets.find((p) => p.printerId === printerId);
    },
    printerFiles() {
      return (printerId?: string) => this.printerFileBucket(printerId)?.files;
    },
    floorNames(state) {
      return state.floors.map((f) => f.name);
    },
  },
  actions: {
    async createPrinter(newPrinter: CreatePrinter) {
      const data = await PrintersService.createPrinter(newPrinter);
      this.printers.push(data);
      this.printers.sort((a: Printer, b: Printer) =>
        a.printerName?.toLowerCase()?.localeCompare(b?.printerName?.toLowerCase()) ? 1 : -1
      );
      return data;
    },
    async createTestPrinter(newPrinter: CreatePrinter) {
      const data = await PrintersService.testConnection(newPrinter);
      this.testPrinters = data;
      return data;
    },
    toggleSelectedPrinter(printer: Printer) {
      const selectedPrinterIndex = this.selectedPrinters.findIndex((sp) => sp.id == printer.id);
      if (selectedPrinterIndex === -1) {
        if (printer.apiAccessibility.accessible) {
          this.selectedPrinters.push(printer);
        }
      } else {
        this.selectedPrinters.splice(selectedPrinterIndex, 1);
      }
    },
    async createPrinterFloor(newPrinterFloor: Floor) {
      const data = await FloorService.createFloor(newPrinterFloor);
      this.floors.push(data);
      return data;
    },
    saveFloors(floors: Floor[]) {
      this.floors = floors.sort((f, f2) => f.floor - f2.floor);
      if (!this.selectedFloor) {
        this.selectedFloor = this.floors[0];
      } else {
        const floorId = this.selectedFloor?._id;
        const foundFloor = this.floors.find((f) => f._id === floorId);
        this.selectedFloor = foundFloor ? this.floors[0] : foundFloor;
      }
    },
    async changeSelectedFloorByIndex(selectedPrinterFloorIndex: number) {
      if (!this.floors?.length) return;
      if (this.floors.length <= selectedPrinterFloorIndex) return;

      const newFloor = this.floors[selectedPrinterFloorIndex];
      // TODO throw warning?
      if (!newFloor) return;
      this.selectedFloor = newFloor;
      return newFloor;
    },
    clearSelectedPrinters() {
      this.selectedPrinters = [];
    },
    setSideNavPrinter(printer?: Printer) {
      this.sideNavPrinter = printer;
    },
    setUpdateDialogPrinter(printer?: Printer) {
      this.updateDialogPrinter = printer;
    },
    setMaintenanceDialogPrinter(printer?: Printer) {
      this.maintenanceDialogPrinter = printer;
    },
    /* Printers */
    async updatePrinter({
      printerId,
      updatedPrinter,
    }: {
      printerId: string;
      updatedPrinter: CreatePrinter;
    }) {
      const data = await PrintersService.updatePrinter(printerId, updatedPrinter);
      this._replacePrinter({ printerId, printer: data });
      return data;
    },
    async loadPrinters() {
      const data = await PrintersService.getPrinters();
      this.setPrinters(data);
      return data;
    },
    async loadFloors() {
      const data = await FloorService.getFloors();
      this.saveFloors(data);
      return data;
    },
    async deletePrinter(printerId: string) {
      const data = await PrintersService.deletePrinter(printerId);
      this._popPrinter(printerId);
      return data;
    },
    setPrinters(printers: Printer[]) {
      const viewedPrinterId = this.sideNavPrinter?.id;
      if (viewedPrinterId) {
        this.sideNavPrinter = printers.find((p) => p.id === viewedPrinterId);
      }
      this.printers = printers.sort((a: Printer, b: Printer) =>
        a.printerName?.toLowerCase()?.localeCompare(b?.printerName?.toLowerCase()) ? 1 : -1
      );
    },
    _popPrinter(printerId: string) {
      const printerIndex = this.printers.findIndex((p: Printer) => p.id === printerId);

      if (printerIndex !== -1) {
        this.printers.splice(printerIndex, 1);
      } else {
        console.warn("Printer was not popped as it did not occur in state", printerId);
      }
    },
    _replacePrinter({ printerId, printer }: { printerId: string; printer: Printer }) {
      const printerIndex = this.printers.findIndex((p: Printer) => p.id === printerId);

      if (printerIndex !== -1) {
        this.printers[printerIndex] = printer;
      } else {
        console.warn("Printer was not purged as it did not occur in state", printerId);
      }
    },
    /* Floors */
    async deleteFloor(floorId: string) {
      await FloorService.deleteFloor(floorId);
      this._popPrinterFloor(floorId);
    },
    async updateFloorName({ floorId, name }: { floorId: string; name: string }) {
      const floor = await FloorService.updateFloorName(floorId, name);
      this._replaceFloor(floor);
      return floor;
    },
    async updatePrinterFloorNumber({
      floorId,
      floorNumber,
    }: {
      floorId: string;
      floorNumber: number;
    }) {
      const floor = await FloorService.updateFloorNumber(floorId, floorNumber);
      this._replaceFloor(floor);
      return floor;
    },
    async addPrinterToFloor({
      floorId,
      printerId,
      x,
      y,
    }: {
      floorId: string;
      printerId: string;
      x: number;
      y: number;
    }) {
      const result = await FloorService.addPrinterToFloor(floorId, {
        printerId,
        x,
        y,
      });
      this._replaceFloor(result);
    },
    async deletePrinterFromFloor({ floorId, printerId }: { floorId: string; printerId: string }) {
      const result = await FloorService.deletePrinterFromFloor(floorId, printerId);
      this._replaceFloor(result);
    },
    _popPrinterFloor(floorId: string) {
      const foundFloorIndex = this.floors.findIndex((pg) => pg._id === floorId);
      if (foundFloorIndex !== -1) {
        this.floors.splice(foundFloorIndex, 1);
      }
    },
    _replaceFloor(printerFloor: Floor) {
      const foundFloorIndex = this.floors.findIndex((pf) => pf._id === printerFloor._id);
      if (foundFloorIndex !== -1) {
        this.floors[foundFloorIndex] = printerFloor;
      }
    },
    async clearPrinterFiles(printerId: string) {
      if (!printerId) {
        throw new Error("No printerId was provided");
        return;
      }
      const result = (await PrinterFileService.clearFiles(printerId)) as ClearedFilesResult;
      if (!result?.failedFiles) {
        throw new Error("No failed files were returned");
      }
      const bucket = this.printerFileBuckets.find((b) => b.printerId === printerId);
      if (bucket) {
        bucket.files = result.failedFiles;
      }
    },
    async loadPrinterFiles({ printerId, recursive }: { printerId: string; recursive: boolean }) {
      const fileList = await PrinterFileService.getFiles(printerId, recursive);

      fileList.files.sort((f1, f2) => {
        return f1.date < f2.date ? 1 : -1;
      });

      let fileBucket = this.printerFileBuckets.find((p) => p.printerId === printerId);
      if (!fileBucket) {
        fileBucket = {
          printerId,
          ...fileList,
        };
        this.printerFileBuckets.push(fileBucket);
      } else {
        fileBucket.files = fileList.files;
      }

      // Note: just the list, not the bucket
      return fileList;
    },
    async deletePrinterFile({ printerId, fullPath }: { printerId: string; fullPath: string }) {
      await PrinterFileService.deleteFileOrFolder(printerId, fullPath);

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

      return this.printerFiles(printerId);
    },
    async sendStopJobCommand(printerId?: string) {
      if (!printerId) return;
      const printer = this.printer(printerId);
      if (!printer) return;

      if (printer.printerState.flags.printing) {
        const answer = confirm("The printer is still printing - are you sure to stop it?");
        if (answer) {
          await PrinterJobService.stopPrintJob(printer.id);
        }
      }
    },
    async batchReprintFiles() {
      const printerIds = this.selectedPrinters.map((p) => p.id);
      if (!printerIds.length) {
        throw new Error("No printers selected to reprint files");
        return;
      }

      this.clearSelectedPrinters();

      const results = await PrinterFileService.batchReprintFiles(printerIds);
      console.debug(results);
    },
    async selectAndPrintFile({ printerId, fullPath }: { printerId: string; fullPath: string }) {
      if (!printerId) return;
      const printer = this.printer(printerId);
      if (!printer) return;

      if (printer.printerState.flags.printing || !printer.apiAccessibility.accessible) {
        alert("This printer is printing or not connected! Either way printing is not an option.");
        return;
      }

      await PrinterFileService.selectAndPrintFile(printerId, fullPath, true);
    },
  },
});
