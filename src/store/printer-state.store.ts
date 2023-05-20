import { defineStore } from "pinia";
import { Printer } from "../models/printers/printer.model";
import { PrinterEvents, SocketState } from "../models/socketio-messages/socketio-message.model";
import { usePrinterStore } from "./printer.store";

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
    operationalPrintersById(state) {
      const printerStore = usePrinterStore();
      const printersById: { [printerId: string]: Printer } = {};
      state.printerIds.forEach((id) => {
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
    isPrinterOnline() {
      return (printerId: string) => {
        return Object.keys(this.onlinePrinters).includes(printerId);
      };
    },
    printingPrintersById(state) {
      const printersById: { [printerId: string]: PrinterEvents } = {};
      state.printerIds.forEach((id) => {
        const printerEvents = this.printerEventsById[id];
        if (printerEvents?.current?.payload?.state?.flags?.printing) {
          printersById[id] = printerEvents;
        }
      });
      return printersById;
    },
    isPrinterPrinting() {
      return (printerId: string) => {
        return Object.keys(this.printingPrintersById).includes(printerId);
      };
    },
    onlinePrinters(state) {
      const printerStore = usePrinterStore();
      const onlinePrinters: { [printerId: string]: Printer } = {};
      state.printerIds.forEach((id) => {
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
    printersWithJob(state) {
      const printerStore = usePrinterStore();
      return this.printingPrintersById.filter(
        (p) => {
          if (!this.isPrinterPrinting(p.id)) return false;

          const printerEvents = this.printerEventsById[p.id];
          return printerEvents?.current?.payload?.job?.file?.name;
        }
        // p.printerState.flags && (p.printerState.flags.printing || p.printerState.flags.printing)
      );
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
  },
});
