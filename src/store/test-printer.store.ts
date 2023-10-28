import { defineStore } from "pinia";
import { CreatePrinter } from "@/models/printers/crud/create-printer.model";
import { PrintersService } from "@/backend";

export interface TestEvent {
  correlationToken: string;
  event: string;
  payload: string;
}

interface State {
  currentCorrelationToken?: string;
  testPrinter?: CreatePrinter;
  testPrinterEvents?: TestEvent[];
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
        (
          this.testPrinterEvents?.filter(
            (e) => e.correlationToken === this.currentCorrelationToken
          ) || []
        )
          .filter(
            (e) =>
              (e.event !== "API_STATE_UPDATED" || e.payload !== "unset") &&
              (e.event !== "WS_STATE_UPDATED" || e.payload !== "unopened")
          )
          .map((e) => {
            const event = e.event.startsWith("WS_") ? "Socket" : "API";
            console.log(e.event);
            return {
              event,
              payload: e.payload
                ?.replace("noResponse", "unreachable")
                .replace("authFail", "authentication failure"),
              failure: ["authFail", "noResponse", "aborted", "globalKey"].includes(e.payload),
            };
          });
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
    saveEvent(event: TestEvent) {
      this.testPrinterEvents?.push(event);
    },
  },
});
