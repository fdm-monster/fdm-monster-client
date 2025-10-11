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
import { useTrackedUploadsStore } from "@/store/tracked-uploads.store";
import { io, Socket } from "socket.io-client";
import { reactive } from "vue";
import { useEventBus } from "@vueuse/core";

enum IO_MESSAGES {
  LegacyUpdate = "legacy-update",
  TestPrinterState = "test-printer-state",
}

let appSocketIO: Socket | null = null;
export const socketState = reactive({
  connected: false,
  setup: false,
  id: "",
  active: false,
});

export class SocketIoService {
  private readonly printerStore = usePrinterStore();
  private readonly floorStore = useFloorStore();
  private readonly printerStateStore = usePrinterStateStore();
  private readonly testPrinterStore = useTestPrinterStore();
  private readonly trackedUploadsStore = useTrackedUploadsStore();
  private readonly snackbar = useSnackbar();
  private readonly authStore = useAuthStore();

  socketState() {
    if (!appSocketIO) {
      console.debug("Returning default socket state, socket was not set up");
      return { setup: false };
    }

    return {
      setup: true,
      connected: appSocketIO.connected,
      active: appSocketIO.active,
      id: appSocketIO.id,
    };
  }

  async setupSocketConnection() {
    console.debug("Setting up socket.io client");

    if (socketState.setup) {
      throw new Error("Cant setup socket, socket already created");
    }
    socketState.setup = false;

    const apiBase = await getBaseUri();
    this.authStore.loadTokens();

    appSocketIO = io(apiBase, {
      auth: async (cb) => {
        if (!this.authStore.loginRequired) {
          return cb({});
        }

        try {
          if (this.authStore.isLoginExpired) {
            console.warn("Login expired, attempting to refresh token");
            await this.authStore.refreshLoginToken();
          }

          if (this.authStore.token) {
            cb({ token: this.authStore.token });
          } else {
            console.error("No token available after refresh");
            cb({});
          }
        } catch (err) {
          console.error("Token refresh failed:", err);
          cb({});
        }
      },
    });

    this.setupConnectionHandlers();
    this.registerMessageHandlers();

    socketState.setup = true;
  }

  disconnect() {
    if (!appSocketIO) {
      throw new Error("Cant disconnect socket, socket not created");
    }

    appSocketIO.close();
    appSocketIO = null;
    socketState.setup = false;
    socketState.connected = false;
    socketState.active = false;
    socketState.id = "";
  }

  reconnect() {
    if (!appSocketIO) {
      throw new Error("Cant reconnect socket, socket not created");
    }

    console.debug("Resetting socket connection. Previous state:", {
      connected: appSocketIO.connected,
      active: appSocketIO.active,
      id: appSocketIO.id,
    });

    appSocketIO.close();
    appSocketIO.connect();
  }

  onMessage(message: SocketIoUpdateMessage) {
    if (message.trackedUploads.current?.length) {
      this.trackedUploadsStore.setUploads(message?.trackedUploads.current);

      this.trackedUploadsStore.activeUploads.forEach((u) => {
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

  private setupConnectionHandlers() {
    if (!appSocketIO) {
      throw new Error("Cant bind socket events, socket not created");
    }

    appSocketIO.on("connect", () => {
      socketState.id = appSocketIO?.id ?? "";
      socketState.connected = true;
      socketState.active = appSocketIO?.active ?? false;
      console.debug("Socket connected:", socketState.id, "Active:", socketState.active);
      useEventBus("server:connected").emit({});
    });

    appSocketIO.on("disconnect", () => {
      socketState.id = "";
      socketState.connected = false;
      socketState.active = false;
      console.debug("Socket disconnected");
      useEventBus("server:disconnected").emit({});
    });

    appSocketIO.on("connect_error", async (error) => {
      console.error("Socket connection error:", error.message);
      if (
        error.message.includes("Authentication") ||
        error.message.includes("jwt") ||
        error.message.includes("token") ||
        error.message.includes("auth")
      ) {
        console.warn("Possible JWT authentication issue detected");
        try {
          await this.authStore.refreshLoginToken();
          this.reconnect();
        } catch (e) {
          console.error("Error refreshing token");
          this.disconnect();
          await this.authStore.logout();
        }
      } else {
        useEventBus("server:disconnected").emit({});
      }
    });
  }

  private registerMessageHandlers() {
    if (!appSocketIO) {
      throw new Error("Cant bind socket app events, socket not created");
    }

    // Register legacy update handler
    appSocketIO.on(IO_MESSAGES.LegacyUpdate, (data) => this.onMessage(data));

    // Register test printer state handler
    appSocketIO.on(IO_MESSAGES.TestPrinterState, (data) => {
      this.testPrinterStore.saveEvent(data);
    });
  }
}
