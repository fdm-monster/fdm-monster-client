import { defineStore } from "pinia";
import { FloorDto } from "@/models/floors/floor.model";
import { useSettingsStore } from "./settings.store";
import { PrinterDto } from "@/models/printers/printer.model";
import { usePrinterStore } from "./printer.store";
import { FloorService } from "@/backend/floor.service";
import { IdType } from "@/utils/id.type";

export interface State {
  floors: FloorDto[];
  selectedFloor: FloorDto | null;
}

export const useFloorStore = defineStore("Floors", {
  state: (): State => ({
    floors: [],
    selectedFloor: null,
  }),
  getters: {
    sortedFloors(state) {
      return state.floors.sort((f, f2) => f.floor - f2.floor);
    },
    floor(state) {
      return (floorId: IdType) => state.floors.find((pf) => pf.id === floorId);
    },
    floorNames(state) {
      return state.floors.map((f) => f.name);
    },
    floorOfPrinter() {
      return (printerId: IdType) => {
        return this.floors.find((f: FloorDto) =>
          f.printers.map((pid) => pid.printerId).includes(printerId)
        );
      };
    },
    floorlessPrinters(state): PrinterDto[] {
      const printersStore = usePrinterStore();
      return printersStore.printers.filter(
        (p) => !state.floors.find((f) => f.printers.find((fp) => fp.printerId === p.id))
      );
    },
    gridSortedPrinters() {
      const settingsStore = useSettingsStore();
      const gridCols = settingsStore.gridCols;
      const gridRows = settingsStore.gridRows;

      const printersStore = usePrinterStore();
      const printers = printersStore.printers;
      if (!printers.length) return [];
      if (!this.selectedFloor) return [];

      const positions = this.selectedFloor.printers;
      const matrix: (PrinterDto | undefined)[][] = [];
      for (let i = 0; i < gridCols; i++) {
        const row: (PrinterDto | undefined)[] = [];
        matrix.push(row);
        for (let j = 0; j < gridRows; j++) {
          const position = positions.find((p) => p.x === i && p.y === j);
          if (!position) {
            row.push(undefined);
          } else {
            const printer = printers.find((p) => p.id === position.printerId);
            row.push(printer);
          }
        }
      }
      return matrix;
    },
  },
  actions: {
    async loadFloors() {
      const floors = await FloorService.getFloors();
      this.saveFloors(floors);
      return floors;
    },
    async createFloor(newPrinterFloor: FloorDto) {
      const data = await FloorService.createFloor(newPrinterFloor);
      this.floors.push(data);
      return data;
    },
    saveFloors(floors: FloorDto[]) {
      if (!floors?.length) return;
      this.floors = floors.sort((f, f2) => f.floor - f2.floor);
      const floorId = this.selectedFloor?.id;
      const foundFloor = this.floors.find((f) => f.id === floorId);
      this.selectedFloor = !foundFloor ? this.floors[0] : foundFloor;
    },
    async deleteFloor(floorId: IdType) {
      await FloorService.deleteFloor(floorId);
      this._popPrinterFloor(floorId);
    },
    async updateFloorName({ floorId, name }: { floorId: IdType; name: string }) {
      const floor = await FloorService.updateFloorName(floorId, name);
      this._replaceFloor(floor);
      return floor;
    },
    async updateFloorNumber({ floorId, floorNumber }: { floorId: IdType; floorNumber: number }) {
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
      floorId: IdType;
      printerId: IdType;
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
    async changeSelectedFloorByIndex(selectedPrinterFloorIndex: number) {
      if (!this.floors?.length) return;
      if (this.floors.length <= selectedPrinterFloorIndex) return;

      const newFloor = this.floors[selectedPrinterFloorIndex];
      // TODO throw warning?
      if (!newFloor) return;
      this.selectedFloor = newFloor;
      return newFloor;
    },
    async deletePrinterFromFloor({ floorId, printerId }: { floorId: IdType; printerId: IdType }) {
      const result = await FloorService.deletePrinterFromFloor(floorId, printerId);
      this._replaceFloor(result);
    },
    _popPrinterFloor(floorId: IdType) {
      const foundFloorIndex = this.floors.findIndex((pg) => pg.id === floorId);
      if (foundFloorIndex !== -1) {
        this.floors.splice(foundFloorIndex, 1);
      }
    },
    _replaceFloor(printerFloor: FloorDto) {
      const foundFloorIndex = this.floors.findIndex((pf) => pf.id === printerFloor.id);
      if (foundFloorIndex !== -1) {
        this.floors[foundFloorIndex] = printerFloor;
      }
    },
  },
});
