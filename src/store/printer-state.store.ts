import { defineStore } from "pinia";
import { Printer } from "../models/printers/printer.model";
import {
  PrinterEventsById,
  SocketStateById,
} from "../models/socketio-messages/socketio-message.model";
import { usePrinterStore } from "./printer.store";
import { PrinterFileService } from "../backend";
import { ById } from "../utils/types/byid.utils";
import { useSettingsStore } from "./settings.store";
import { CurrentOrHistoryPayload } from "../models/printers/printer-current-job.model";

interface State {
  printerIds: string[];
  printerEventsById: PrinterEventsById;
  socketStatesById: SocketStateById;
}

export const usePrinterStateStore = defineStore("PrinterState", {
  state: (): State => ({
    printerIds: [],
    printerEventsById: {},
    socketStatesById: {},
  }),
  getters: {
    operationalPrintersById() {
      const printerStore = usePrinterStore();
      const printersById: ById<Printer> = {};
      this.printerIds.forEach((id) => {
        const printerEvents = this.printerEventsById[id];
        if (printerEvents?.current?.payload?.state?.flags?.operational) {
          const printer = printerStore.printer(id);
          if (printer) {
            printersById[id] = printer;
          } else {
            throw new Error(`PrinterStore contains no printer with id ${id} but events are known`);
          }
        }
      });
      return printersById;
    },
    isPrinterOperational(): (printerId: string) => boolean {
      return (printerId: string) => {
        return Object.keys(this.operationalPrintersById).includes(printerId);
      };
    },
    printingPrintersById() {
      const printersById: PrinterEventsById = {};
      this.printerIds.forEach((id) => {
        const printerEvents = this.printerEventsById[id];
        if (printerEvents?.current?.payload?.state?.flags?.printing) {
          printersById[id] = printerEvents;
        }
      });
      return printersById;
    },
    isPrinterPrinting(): (printerId: string) => boolean {
      return (printerId: string) => {
        return Object.keys(this.printingPrintersById).includes(printerId);
      };
    },
    isPrinterStoppable(): (printerId: string) => boolean {
      return (printerId: string) => {
        const printerEvents = this.printerEventsById[printerId];
        if (!printerEvents) return false;
        const flags = printerEvents?.current?.payload.state.flags;
        console.log(flags);
        return flags?.printing || flags?.paused;
      };
    },
    onlinePrinters() {
      const printerStore = usePrinterStore();
      const onlinePrinters: ById<Printer> = {};
      this.printerIds.forEach((id) => {
        const socketState = this.socketStatesById[id];
        if (socketState?.api === "responding") {
          const printer = printerStore.printer(id);
          if (printer) {
            onlinePrinters[id] = printer;
          } else {
            throw new Error(
              `PrinterStore contains no printer with id ${id} but socket state is opened`
            );
          }
        }
      });
      return onlinePrinters;
    },
    isApiResponding() {
      return (printerId: string) => {
        return Object.keys(this.onlinePrinters).includes(printerId);
      };
    },
    isPrinterNotOnline() {
      return (printerId: string) => {
        return !this.isApiResponding(printerId);
      };
    },
    printerJobsById() {
      const printerStore = usePrinterStore();
      const jobsRendered = useSettingsStore().debugSettings.showJobsRendered;
      const printersWithJobById: ById<CurrentOrHistoryPayload> = {};
      this.printerIds.forEach((id) => {
        const printerEvents = this.printerEventsById[id];
        const flags = printerEvents?.current?.payload?.state?.flags;
        if (flags?.printing || flags?.paused) {
          const printer = printerStore.printer(id);
          if (printer) {
            printersWithJobById[printer.id] = printerEvents?.current?.payload;
          } else {
            throw new Error(`PrinterStore contains no printer with id ${id} but events are known`);
          }
        }
      });

      if (jobsRendered) {
        // TODO improve summary
        console.debug("[PrinterStateStore] rendered printerJobsById", printersWithJobById);
      }
      return printersWithJobById;
    },
    printersWithJob() {
      const printerStore = usePrinterStore();
      const printersWithJobById: { printer: Printer; job: CurrentOrHistoryPayload }[] = [];
      this.printerIds.forEach((id) => {
        const printerEvents = this.printerEventsById[id];
        const flags = printerEvents?.current?.payload?.state?.flags;
        if (flags?.printing || flags?.paused) {
          const printer = printerStore.printer(id);
          if (printer) {
            printersWithJobById.push({
              printer,
              job: printerEvents?.current?.payload,
            });
          } else {
            throw new Error(`PrinterStore contains no printer with id ${id} but events are known`);
          }
        }
      });
      return printersWithJobById;
    },
    printingFilePathsByPrinterId() {
      const printingFilesByPrinterId: ById<string> = {};
      this.printerIds.forEach((id) => {
        const printerEvents = this.printerEventsById[id];
        const flags = printerEvents?.current?.payload?.state?.flags;
        if (flags?.printing || flags?.paused) {
          // TODO decide on comparing with name or path
          printingFilesByPrinterId[id] = printerEvents?.current?.payload?.job?.file?.path;
        }
      });
      return printingFilesByPrinterId;
    },
  },
  actions: {
    setSocketStates(socketStates: SocketStateById) {
      this.socketStatesById = socketStates;
      this.printerIds = Object.keys(socketStates);
    },
    setPrinterEvents(printerEvents: PrinterEventsById) {
      this.printerEventsById = printerEvents;
      // TODO check id's different from printer events and socket states
    },
    deletePrinterEvents(printerId: string) {
      delete this.printerEventsById[printerId];
      this.printerIds = Object.keys(this.printerEventsById);
    },
    async selectAndPrintFile({ printerId, fullPath }: { printerId: string; fullPath: string }) {
      if (!printerId) return;
      const printerStore = usePrinterStore();
      const printer = printerStore.printer(printerId);
      if (!printer) return;

      if (this.isPrinterPrinting(printerId)) {
        alert("This printer is printing or not connected! Either way printing is not an option.");
        return;
      }

      await PrinterFileService.selectAndPrintFile(printerId, fullPath, true);
    },
  },
});
