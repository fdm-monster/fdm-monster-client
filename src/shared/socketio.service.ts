import { io, Socket } from "socket.io-client";
import { VueBus } from "vue-bus";
import {
  SocketIoTestPrinterMessage,
  SocketIoUpdateMessage,
} from "../models/socketio-messages/socketio-message.model";
import {
  socketIoFloors,
  sseMessageGlobal,
  sseTestPrinterUpdate,
} from "../event-bus/socketio.events";
import { InfoEventType, uploadMessageEvent } from "@/event-bus/alert.events";
import { updatedPrinterEvent } from "@/event-bus/printer.events";
import { usePrinterStore } from "../store/printer.store";
import { apiBase } from "@/backend/base.service";
import { useFloorStore } from "../store/floor.store";
import { usePrinterStateStore } from "../store/printer-state.store";

enum IO_MESSAGES {
  LegacyUpdate = "legacy-update",
  LegacyPrinterTest = "legacy-printer-test",
  CompletionEvent = "completion-event",
  HostState = "host-state",
  ApiAccessibility = "api-accessibility",
}

export class SocketIoService {
  socket: Socket;
  $bus: VueBus;
  printerStore = usePrinterStore();
  floorStore = useFloorStore();
  printerStateStore = usePrinterStateStore();

  setupSocketConnection($bus: VueBus) {
    this.socket = io(apiBase); // Same-origin policy);
    this.$bus = $bus;
    this.socket.on(IO_MESSAGES.LegacyUpdate, (data) => this.onMessage(JSON.parse(data)));
    this.socket.on(IO_MESSAGES.LegacyPrinterTest, (data) =>
      this.onPrinterTestMessage(JSON.parse(data))
    );
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  onPrinterTestMessage(message: SocketIoTestPrinterMessage) {
    if (message.testPrinter) {
      // Emit a specific testing session update
      const { testPrinter, testProgress } = message;
      if (!testPrinter?.correlationToken) return;

      this.$bus.emit(sseTestPrinterUpdate(testPrinter.correlationToken), {
        testPrinter,
        testProgress,
      });
    }
  }

  onMessage(message: SocketIoUpdateMessage) {
    if (message.trackedUploads) {
      this.$bus.emit(uploadMessageEvent, InfoEventType.UPLOAD_BACKEND, message.trackedUploads);
    }

    if (message.floors) {
      this.floorStore.saveFloors(message.floors);
      this.$bus.emit(socketIoFloors, message.floors);
    }

    if (message.printers) {
      this.printerStore.setPrinters(message.printers);

      // Emit the global update
      this.$bus.emit(sseMessageGlobal, message);

      message.printers.forEach((p) => {
        if (!p.id) return;
        this.$bus.emit(updatedPrinterEvent(p.id), p);
      });
    }

    if (message.socketStates) {
      console.debug(`Got ${Object.keys(message.socketStates).length} socketStates update`);
      this.printerStateStore.setSocketStates(message.socketStates);
      // console.debug(message.socketStates);
    }

    if (message.printerEvents) {
      console.debug(`Got ${Object.keys(message.printerEvents).length} printerEvents update`);
      this.printerStateStore.setPrinterEvents(message.printerEvents);
      // console.debug(message.printerEvents);
    }
  }
}
