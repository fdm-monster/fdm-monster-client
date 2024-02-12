import { io, Socket } from "socket.io-client";
import { reactive } from "vue";

export let appSocketIO: Socket | null = null;

export const socketState = reactive({
  connected: false,
  setup: false,
  id: "",
});

export function constructSocket(apiBase: string, token?: string | null) {
  socketState.setup = false;
  appSocketIO = io(apiBase, {
    auth: token?.length ? { token } : undefined,
  });
  socketState.setup = true;

  appSocketIO.on("connect", () => {
    socketState.id = appSocketIO!.id || "";
    socketState.connected = true;
  });

  appSocketIO.on("disconnect", () => {
    socketState.id = "";
    socketState.connected = false;
  });
}

export function getSocketState() {
  if (!appSocketIO) {
    console.warn("Socket not set-up");
    return {
      setup: false,
    };
  }

  const state = {
    setup: true,
    active: appSocketIO.active,
    connected: appSocketIO.connected,
    id: appSocketIO.id,
    recovered: appSocketIO.recovered,
  };
  console.warn(state);
  return state;
}
