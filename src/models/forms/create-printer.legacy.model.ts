export type WebSocketProtocol = "ws" | "wss";
export type HttpProtocol = "http" | "https";

/**
 * DEPRECATED over ZOD schema + infer
 */
export interface PreCreatePrinter {
  id?: string; // Only in case of update

  enabled: boolean;
  sortIndex: number;
  printerName: string;

  websocketPrefix: WebSocketProtocol;
  printerHostPrefix: HttpProtocol;
  printerHostName: string;
  printerHostPort: number;

  apiKey: string;

  // Baby-stepping
  stepSize?: 0.1 | 1 | 10 | 100;
}

/**
 * DEPRECATED over ZOD schema + infer
 */
export interface CreatePrinter {
  id?: string; // Only in case of update

  enabled: boolean;
  sortIndex: number;
  printerName: string;

  webSocketURL: string;
  printerURL: string;

  apiKey: string;

  // Baby-stepping
  stepSize: 0.1 | 1 | 10 | 100;
}
