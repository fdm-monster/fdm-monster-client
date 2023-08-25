import { io, Socket } from "socket.io-client";
import {
  PrinterEventsById,
  SocketIoUpdateMessage,
} from "@/models/socketio-messages/socketio-message.model";
import { usePrinterStore } from "@/store/printer.store";
import { useFloorStore } from "@/store/floor.store";
import { usePrinterStateStore } from "@/store/printer-state.store";
import { useTestPrinterStore } from "@/store/test-printer.store";
import { useSnackbar } from "./snackbar.composable";
import { getBaseUri } from "@/shared/http-client";

enum IO_MESSAGES {
  LegacyUpdate = "legacy-update",
  TestPrinterState = "test-printer-state",
  CompletionEvent = "completion-event",
  HostState = "host-state",
  ApiAccessibility = "api-accessibility",
}

export class SocketIoService {
  private socket: Socket;
  private printerStore = usePrinterStore();
  private floorStore = useFloorStore();
  private printerStateStore = usePrinterStateStore();
  private testPrinterStore = useTestPrinterStore();
  private snackbar = useSnackbar();

  async setupSocketConnection() {
    const apiBase = await getBaseUri();
    this.socket = io(apiBase);
    this.socket.on(IO_MESSAGES.LegacyUpdate, (data) => this.onMessage(JSON.parse(data)));
    this.socket.on(IO_MESSAGES.TestPrinterState, (data) => {
      this.testPrinterStore.saveEvent(data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  onMessage(message: SocketIoUpdateMessage) {
    if (message.trackedUploads.current?.length || message.trackedUploads.failed?.length) {
      console.debug("[SocketIO] trackedUploads message received");
      message.trackedUploads.current.forEach((u) => {
        this.snackbar.openProgressMessage(
          u.correlationToken,
          u.multerFile.originalname,
          (u.progress?.percent || 0) * 100,
          false
        );
      });
    }

    if (message.floors?.length) {
      this.floorStore.saveFloors(message.floors);
    }

    if (message.printers?.length) {
      this.printerStore.setPrinters(message.printers);
    }

    if (message.socketStates) {
      this.printerStateStore.setSocketStates(message.socketStates);
    }

    if (message.printerEvents) {
      this.printerStateStore.setPrinterEvents(message.printerEvents as PrinterEventsById);
    }
  }
}
