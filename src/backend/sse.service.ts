import type { PrinterSseMessage } from "@/models/sse-messages/printer-sse-message.model";
import { usePrintersStore } from "@/stores/printers";
import type { Store } from "pinia";
import { usePrinterGroupsStore } from "@/stores";
import type { PrinterGroupsStore } from "@/models/store/printer-groups-store.model";
import type { PrintersStore } from "@/models/store/printer-store.model";

export class SseService {
  static get printersStore() {
    return usePrintersStore();
  }

  static get printerGroupsStore() {
    return usePrinterGroupsStore();
  }

  static async onSseMessage(message: PrinterSseMessage) {
    if (message.printerGroups) {
      await this.printerGroupsStore.savePrinterGroups(message.printerGroups);
      // this.$bus.emit(sseGroups, message.printerGroups);
    }

    if (message.trackedUploads) {
      // this.$bus.emit(uploadMessageEvent, InfoEventType.UPLOAD_BACKEND, message.trackedUploads);
    }

    if (message.printers) {
      await this.printersStore.savePrinters(message.printers);

      // Emit the global update
      // this.$bus.emit(sseMessageGlobal, message);

      message.printers.forEach((p) => {
        if (!p.id) return;
        // this.$bus.emit(updatedPrinterEvent(p.id), p);
      });
    }

    if (message.testPrinter) {
      // Emit a specific testing session update
      const { testPrinter, testProgress } = message;
      if (!testPrinter?.correlationToken) return;

      // this.$bus.emit(sseTestPrinterUpdate(testPrinter.correlationToken), {
      //   testPrinter,
      //   testProgress
      // });
    }
  }
}
