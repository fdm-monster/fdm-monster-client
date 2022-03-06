import { PrinterGroupService } from "@/backend";
import type { CreatePrinterGroup } from "@/models/printer-groups/crud/create-printer-group.model";
import type { PrinterGroup } from "@/models/printers/printer-group.model";
import type { Printer } from "@/models/printers/printer.model";
import type { PrinterGroupsStore } from "@/models/store/printer-groups-store.model";
import { defineStore } from "pinia";
import { usePrintersStore } from "./printers";
import { sortPrinterGroups } from "./utils/printer-group.utils";

const HOR_OFFSET = 1;

export const usePrinterGroupsStore = defineStore({
  id: "printer-groups",
  state: (): PrinterGroupsStore => ({
    printerGroups: [],
    lastUpdated: undefined,
    createGroupDialogOpened: false,
  }),
  getters: {
    printerGroup(): (groupId: string) => PrinterGroup | undefined {
      return (groupId: string) =>
        this.printerGroups.find((pg) => pg._id === groupId);
    },
    ungroupedPrinters(): Printer[] {
      const printersStore = usePrintersStore();
      return printersStore.printers.filter(
        (p) =>
          !this.printerGroups.find((g) =>
            g.printers.find((pgp) => pgp.printerId === p.id)
          )
      );
    },
    gridSortedPrinterGroups() {
      if (!this.printerGroups) return () => [];

      return (cols: number, rows: number) => {
        const groupMatrix: any[] = [];

        for (let i = 0; i < cols; i++) {
          groupMatrix[i] = [];
          for (let j = 0; j < rows; j++) {
            groupMatrix[i][j] = this.printerGroups.find(
              (pg) => pg.location.x + HOR_OFFSET === i && pg.location.y === j
            );
          }
        }

        return groupMatrix;
      };
    },
    printerGroupNames(): string[] {
      return this.printerGroups.map((pg: PrinterGroup) => pg.name);
    },
  },
  actions: {
    storeUpdate() {
      this.lastUpdated = Date.now();
    },
    // Dialog state
    setCreateGroupDialogOpened(opened: boolean) {
      this.createGroupDialogOpened = opened;
    },
    async createPrinterGroup(newPrinterGroup: CreatePrinterGroup) {
      const data = await PrinterGroupService.createGroup(newPrinterGroup);
      this.printerGroups.push(data);

      this.storeUpdate();
      return data;
    },
    async savePrinterGroups(printerGroups: PrinterGroup[]) {
      const sortedPrinterGroups = sortPrinterGroups(printerGroups);
      sortedPrinterGroups.forEach((pg) =>
        pg.printers.sort((p1, p2) => p1.location.localeCompare(p2.location))
      );
      this.printerGroups = sortedPrinterGroups;

      this.storeUpdate();
      return printerGroups;
    },
    async loadPrinterGroups() {
      const data = await PrinterGroupService.getGroups();
      this.savePrinterGroups(data);

      this.storeUpdate();
      return data;
    },
    async addPrinterToGroup({
      groupId,
      printerId,
      location,
    }: {
      groupId: string;
      printerId: string;
      location: string;
    }) {
      const result = await PrinterGroupService.addPrinterToGroup(groupId, {
        printerId,
        location,
      });
      this._replacePrinterGroup(result);
    },
    async deletePrinterFromGroup({
      groupId,
      printerId,
    }: {
      groupId: string;
      printerId: string;
    }) {
      const result = await PrinterGroupService.deletePrinterFromGroup(
        groupId,
        printerId
      );
      this._replacePrinterGroup(result);
    },
    async deletePrinterGroup(groupId: string) {
      await PrinterGroupService.deleteGroup(groupId);
      this._popPrinterGroup(groupId);
    },
    async updatePrinterGroupName({
      groupId,
      name,
    }: {
      groupId: string;
      name: string;
    }) {
      const group = await PrinterGroupService.updateGroupName(groupId, name);
      this._replacePrinterGroup(group);
      return group;
    },
    // Mutator
    _replacePrinterGroup(printerGroup: PrinterGroup) {
      const foundGroupIndex = this.printerGroups.findIndex(
        (pg) => pg._id === printerGroup._id
      );
      if (foundGroupIndex !== -1) {
        this.printerGroups[foundGroupIndex] = printerGroup;
        this.lastUpdated = Date.now();
      }
      this.storeUpdate();
    },
    // Mutator
    _popPrinterGroup(groupId: string) {
      const foundGroupIndex = this.printerGroups.findIndex(
        (pg) => pg._id === groupId
      );
      if (foundGroupIndex !== -1) {
        this.printerGroups.splice(foundGroupIndex, 1);
      }
      this.storeUpdate();
    },
  },
});