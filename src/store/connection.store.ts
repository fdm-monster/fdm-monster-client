import { io, Socket } from "socket.io-client";

export let appSocketIO: Socket | null = null;

export function constructSocket(apiBase: string, token?: string | null) {
  appSocketIO = io(apiBase, {
    auth: token?.length ? { token } : undefined,
  });
}

export function getSocketState() {
  if (!appSocketIO) {
    return {
      setup: false,
    };
  }

  return {
    setup: true,
    active: appSocketIO.active,
    connected: appSocketIO.connected,
    id: appSocketIO.id,
    recovered: appSocketIO.recovered,
  };
}
