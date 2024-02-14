import { defineStore } from "pinia";
import { PrinterDto } from "@/models/printers/printer.model";
import { PrinterStateDto, SocketState } from "@/models/socketio-messages/socketio-message.model";
import { usePrinterStore } from "./printer.store";
import { PrinterFileService } from "@/backend";
import { useSettingsStore } from "./settings.store";
import { CurrentOrHistoryPayload } from "@/models/printers/printer-current-job.model";
import { IdType } from "@/utils/id.type";
import { isPrinterIdling, isPrinterPrinting } from "@/shared/printer-state.constants";

interface State {
  printerIds: IdType[];
  printerEventsById: Record<IdType, PrinterStateDto>;
  socketStatesById: Record<IdType, SocketState>;
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
      const printersById: Record<IdType, PrinterDto> = {};
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
    isPrinterOperational(): (printerId: IdType) => boolean {
      return (printerId: IdType) => {
        return !!this.operationalPrintersById[printerId];
      };
    },
    printingPrintersById() {
      const printersById: Record<IdType, PrinterStateDto> = {};
      this.printerIds.forEach((id) => {
        const printerEvents = this.printerEventsById[id];
        if (printerEvents?.current?.payload?.state?.flags?.printing) {
          printersById[id] = printerEvents;
        }
      });
      return printersById;
    },
    isPrinterPrinting(): (printerId: IdType) => boolean {
      return (printerId: IdType) => !!this.printingPrintersById[printerId];
    },
    isPrinterStoppable(): (printerId: IdType) => boolean {
      return (printerId: IdType) => {
        const printerEvents = this.printerEventsById[printerId];
        if (!printerEvents) return false;
        const flags = printerEvents?.current?.payload?.state?.flags;
        return flags?.printing || flags?.paused;
      };
    },
    isPrinterPaused(): (printerId: IdType) => boolean {
      return (printerId: IdType) => {
        const printerEvents = this.printerEventsById[printerId];
        if (!printerEvents) return false;
        const flags = printerEvents?.current?.payload?.state?.flags;
        return flags?.paused;
      };
    },
    printerCurrentEventReceivedAtById() {
      const printerCurrentEventReceivedAtById: Record<IdType, number> = {};
      this.printerIds.forEach((id) => {
        const printerEvents = this.printerEventsById[id];
        if (printerEvents?.current?.receivedAt) {
          printerCurrentEventReceivedAtById[id] = printerEvents.current.receivedAt;
        }
      });
      return printerCurrentEventReceivedAtById;
    },
    onlinePrinters() {
      const printerStore = usePrinterStore();
      const onlinePrinters: Record<IdType, PrinterDto> = {};
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
    onlinePrintersWithStates(): { printerState: PrinterStateDto; printer: PrinterDto }[] {
      return Object.values(this.onlinePrinters).map((printer) => {
        return {
          printer,
          printerState: this.printerEventsById[printer.id],
        };
      });
    },
    printingCount(): number {
      const printerStateStore = usePrinterStateStore();
      return Object.values(printerStateStore.onlinePrintersWithStates).filter((p) =>
        isPrinterPrinting(p.printerState)
      ).length;
    },
    operationalNotPrintingCount(): number {
      return this.onlinePrintersWithStates.filter((pws) =>
        isPrinterIdling(pws.printer, pws.printerState)
      ).length;
    },
    isApiResponding() {
      return (printerId: IdType) => {
        return Object.keys(this.onlinePrinters).includes(printerId.toString());
      };
    },
    isPrinterNotOnline() {
      return (printerId: IdType) => {
        return !this.isApiResponding(printerId);
      };
    },
    printerJobsById() {
      const printerStore = usePrinterStore();
      const jobsRendered = useSettingsStore().frontendDebugSettings.showJobsRendered;
      const printersWithJobById: Record<IdType, CurrentOrHistoryPayload> = {};
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
      const printersWithJobById: { printer: PrinterDto; job: CurrentOrHistoryPayload }[] = [];
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
      const printingFilesByPrinterId: Record<IdType, string> = {};
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
    setSocketStates(socketStates: Record<IdType, SocketState>) {
      this.socketStatesById = socketStates;
      this.printerIds = Object.keys(socketStates);
    },
    setPrinterEvents(printerEvents: Record<IdType, PrinterStateDto>) {
      this.printerEventsById = printerEvents;
      // TODO check id's different from printer events and socket states
    },
    deletePrinterEvents(printerId: IdType) {
      delete this.printerEventsById[printerId];
      this.printerIds = Object.keys(this.printerEventsById);
    },
    async selectAndPrintFile({ printerId, fullPath }: { printerId: IdType; fullPath: string }) {
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
