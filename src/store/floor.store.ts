import { defineStore } from "pinia";
import { Floor } from "@/models/floors/floor.model";
import { useSettingsStore } from "./settings.store";
import { Printer } from "@/models/printers/printer.model";
import { usePrinterStore } from "./printer.store";
import { FloorService } from "@/backend/floor.service";

export interface State {
  floors: Floor[];
  selectedFloor: Floor | null;
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
      return (floorId: string) => state.floors.find((pf) => pf.id === floorId);
    },
    floorNames(state) {
      return state.floors.map((f) => f.name);
    },
    floorOfPrinter() {
      return (printerId: string) => {
        return this.floors.find((f: Floor) =>
          f.printers.map((pid) => pid.printerId).includes(printerId)
        );
      };
    },
    floorlessPrinters(state): Printer[] {
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
      const matrix: (Printer | undefined)[][] = [];
      for (let i = 0; i < gridCols; i++) {
        const row: (Printer | undefined)[] = [];
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
      const data = await FloorService.getFloors();
      this.saveFloors(data);
      return data;
    },
    async createFloor(newPrinterFloor: Floor) {
      const data = await FloorService.createFloor(newPrinterFloor);
      this.floors.push(data);
      return data;
    },
    saveFloors(floors: Floor[]) {
      if (!floors?.length) return;
      this.floors = floors.sort((f, f2) => f.floor - f2.floor);
      const floorId = this.selectedFloor?.id;
      const foundFloor = this.floors.find((f) => f.id === floorId);
      this.selectedFloor = !foundFloor ? this.floors[0] : foundFloor;
    },
    async deleteFloor(floorId: string) {
      await FloorService.deleteFloor(floorId);
      this._popPrinterFloor(floorId);
    },
    async updateFloorName({ floorId, name }: { floorId: string; name: string }) {
      const floor = await FloorService.updateFloorName(floorId, name);
      this._replaceFloor(floor);
      return floor;
    },
    async updateFloorNumber({ floorId, floorNumber }: { floorId: string; floorNumber: number }) {
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
    async changeSelectedFloorByIndex(selectedPrinterFloorIndex: number) {
      if (!this.floors?.length) return;
      if (this.floors.length <= selectedPrinterFloorIndex) return;

      const newFloor = this.floors[selectedPrinterFloorIndex];
      // TODO throw warning?
      if (!newFloor) return;
      this.selectedFloor = newFloor;
      return newFloor;
    },
    async deletePrinterFromFloor({ floorId, printerId }: { floorId: string; printerId: string }) {
      const result = await FloorService.deletePrinterFromFloor(floorId, printerId);
      this._replaceFloor(result);
    },
    _popPrinterFloor(floorId: string) {
      const foundFloorIndex = this.floors.findIndex((pg) => pg.id === floorId);
      if (foundFloorIndex !== -1) {
        this.floors.splice(foundFloorIndex, 1);
      }
    },
    _replaceFloor(printerFloor: Floor) {
      const foundFloorIndex = this.floors.findIndex((pf) => pf.id === printerFloor.id);
      if (foundFloorIndex !== -1) {
        this.floors[foundFloorIndex] = printerFloor;
      }
    },
  },
});
