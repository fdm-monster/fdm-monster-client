import { defineStore } from "pinia";
import { CreatePrinter } from "../models/printers/crud/create-printer.model";
import { PrintersService } from "../backend";

interface State {
  testPrinter?: CreatePrinter;
  testPrinterEvents?: Record<string, any>[];
}

export const useTestPrinterStore = defineStore("TestPrinter", {
  state: (): State => ({
    testPrinter: undefined,
    testPrinterEvents: [],
  }),
  getters: {},
  actions: {
    async createTestPrinter(newPrinter: CreatePrinter) {
      this.testPrinter = newPrinter;
      const data = await PrintersService.testConnection(newPrinter);
      return data;
    },
    saveEvent(event: Record<string, any>) {
      this.testPrinterEvents?.push(event);
    },
  },
});
