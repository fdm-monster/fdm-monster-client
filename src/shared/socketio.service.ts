import {
  PrinterStateDto,
  SocketIoUpdateMessage,
} from "@/models/socketio-messages/socketio-message.model";
import { usePrinterStore } from "@/store/printer.store";
import { useFloorStore } from "@/store/floor.store";
import { usePrinterStateStore } from "@/store/printer-state.store";
import { useTestPrinterStore } from "@/store/test-printer.store";
import { useSnackbar } from "./snackbar.composable";
import { getBaseUri } from "@/shared/http-client";
import { useAuthStore } from "@/store/auth.store";
import { IdType } from "@/utils/id.type";
import {
  appSocketIO,
  constructSocket,
  deconstructSocket,
  getSocketState,
  resetSocketConnection,
} from "@/store/connection.store";
import { useTrackedUploadsStore } from "@/store/tracked-uploads.store";

enum IO_MESSAGES {
  LegacyUpdate = "legacy-update",
  TestPrinterState = "test-printer-state",
}

export class SocketIoService {
  private readonly printerStore = usePrinterStore();
  private readonly floorStore = useFloorStore();
  private readonly printerStateStore = usePrinterStateStore();
  private readonly testPrinterStore = useTestPrinterStore();
  private readonly trackedUploadsStore = useTrackedUploadsStore();
  private readonly snackbar = useSnackbar();

  socketState() {
    return getSocketState();
  }

  async setupSocketConnection() {
    console.debug("Setting up socket.io client");
    const apiBase = await getBaseUri();
    const authStore = useAuthStore();
    authStore.loadTokens();
    constructSocket(apiBase, authStore.loginRequired ? authStore.token : undefined);

    appSocketIO?.on(IO_MESSAGES.LegacyUpdate, (data) => this.onMessage(data));
    appSocketIO?.on(IO_MESSAGES.TestPrinterState, (data) => {
      this.testPrinterStore.saveEvent(data);
    });
  }

  disconnect() {
    deconstructSocket();
  }

  reconnect() {
    if (appSocketIO) {
      console.debug("Resetting socket.io client connection");
      resetSocketConnection();
    }
  }

  onMessage(message: SocketIoUpdateMessage) {
    if (message.trackedUploads.current?.length) {
      this.trackedUploadsStore.setUploads(message?.trackedUploads.current);
      const activeUploads = this.trackedUploadsStore.activeUploads;

      activeUploads.forEach((u) => {
        this.snackbar.openProgressMessage(
          u.correlationToken,
          u.multerFile.originalname,
          (u.progress || 0) * 100,
          u.completed
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
      this.printerStateStore.setPrinterEvents(
        message.printerEvents as Record<IdType, PrinterStateDto>
      );
    }
  }
}
