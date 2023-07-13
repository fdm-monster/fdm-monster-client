import { newRandomNamePair } from "../../../shared/noun-adjectives.data";

export type HttpProtocol = "http" | "https";

export const getDefaultCreatePrinter = (): PreCreatePrinter => ({
  id: undefined,
  printerName: newRandomNamePair(),
  printerHostPrefix: "http",
  printerHostPort: 80,
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

  printerHostPrefix: HttpProtocol;
  printerHostName: string;
  printerHostPort: number | undefined;

  apiKey: string;
}

/**
 * DEPRECATED over ZOD schema + infer
 */
export interface CreatePrinter {
  id?: string; // Only in case of update

  enabled: boolean;
  printerName: string;

  printerURL: string;

  apiKey: string;
}
