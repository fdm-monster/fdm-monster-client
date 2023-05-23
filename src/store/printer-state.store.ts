import { defineStore } from "pinia";
import { Printer } from "../models/printers/printer.model";
import { PrinterEvents, SocketState } from "../models/socketio-messages/socketio-message.model";
import { usePrinterStore } from "./printer.store";
import { PrinterCurrentJob, PrinterJob } from "../models/printers/printer-current-job.model";
import { PrinterFileService } from "../backend";

interface State {
  printerIds: string[];
  printerEventsById: { [printerId: string]: PrinterEvents };
  socketStatesById: { [printerId: string]: SocketState };
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
      const printersById: { [printerId: string]: Printer } = {};
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
      const printersById: { [printerId: string]: PrinterEvents } = {};
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
        return flags?.printing || flags?.paused;
      };
    },
    onlinePrinters() {
      const printerStore = usePrinterStore();
      const onlinePrinters: { [printerId: string]: Printer } = {};
      this.printerIds.forEach((id) => {
        const socketState = this.socketStatesById[id];
        if (socketState?.socketState === "opened") {
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
    isPrinterOnline() {
      return (printerId: string) => {
        return Object.keys(this.onlinePrinters).includes(printerId);
      };
    },
    printerJobsById() {
      const printerStore = usePrinterStore();
      const printersWithJobById: { [k: string]: PrinterJob | PrinterCurrentJob } = {};
      this.printerIds.forEach((id) => {
        const printerEvents = this.printerEventsById[id];
        const flags = printerEvents?.current?.payload?.state?.flags;
        if (flags?.printing || flags?.paused) {
          const printer = printerStore.printer(id);
          if (printer) {
            printersWithJobById[printer.id] = printerEvents?.current?.payload?.state;
          } else {
            throw new Error(`PrinterStore contains no printer with id ${id} but events are known`);
          }
        }
      });
      return printersWithJobById;
    },
    printersWithJob() {
      const printerStore = usePrinterStore();
      const printersWithJobById: { printer: Printer; job: any }[] = [];
      this.printerIds.forEach((id) => {
        const printerEvents = this.printerEventsById[id];
        const flags = printerEvents?.current?.payload?.state?.flags;
        if (flags?.printing || flags?.paused) {
          const printer = printerStore.printer(id);
          if (printer) {
            printersWithJobById.push({
              printer,
              job: printerEvents?.current?.payload?.state,
            });
          } else {
            throw new Error(`PrinterStore contains no printer with id ${id} but events are known`);
          }
        }
      });
      return printersWithJobById;
    },
  },
  actions: {
    setSocketStates(socketStates: { [printerId: string]: SocketState }) {
      this.socketStatesById = socketStates;
      this.printerIds = Object.keys(socketStates);
    },
    setPrinterEvents(printerEvents: { [printerId: string]: PrinterEvents }) {
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
