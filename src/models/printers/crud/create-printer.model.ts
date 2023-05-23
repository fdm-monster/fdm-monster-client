import { newRandomNamePair } from "@/constants/noun-adjectives.data";

export type WebSocketProtocol = "ws" | "wss";
export type HttpProtocol = "http" | "https";

export const getDefaultCreatePrinter = (): PreCreatePrinter => ({
  id: undefined,
  printerName: newRandomNamePair(),
  printerHostPrefix: "http",
  printerHostPort: 80,
  websocketPrefix: "ws",
  printerHostName: "",
  apiKey: "",
  enabled: true,
});

/**
 * DEPRECATED over ZOD schema + infer
 */
export interface PreCreatePrinter {
  id?: string; // Only in case of update

  enabled: boolean;
  printerName: string;

  websocketPrefix: WebSocketProtocol;
  printerHostPrefix: HttpProtocol;
  printerHostName: string;
  printerHostPort: number;

  apiKey: string;
}

/**
 * DEPRECATED over ZOD schema + infer
 */
export interface CreatePrinter {
  id?: string; // Only in case of update

  enabled: boolean;
  printerName: string;

  webSocketURL: string;
  printerURL: string;

  apiKey: string;
}
