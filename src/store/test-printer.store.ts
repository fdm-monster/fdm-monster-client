import { defineStore } from "pinia";
import { CreatePrinter } from "../models/printers/crud/create-printer.model";
import { PrintersService } from "../backend";

interface State {
  currentCorrelationToken?: string;
  testPrinter?: CreatePrinter;
  testPrinterEvents?: Record<string, any>[];
}

export const useTestPrinterStore = defineStore("TestPrinter", {
  state: (): State => ({
    currentCorrelationToken: undefined,
    testPrinter: undefined,
    testPrinterEvents: [],
  }),
  getters: {
    getEvents() {
      return () =>
        this.testPrinterEvents?.filter(
          (e) => e.correlationToken === this.currentCorrelationToken
        ) || [];
    },
  },
  actions: {
    clearEvents() {
      this.testPrinterEvents = [];
    },
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
