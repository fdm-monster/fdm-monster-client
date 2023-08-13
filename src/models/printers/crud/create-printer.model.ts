import { newRandomNamePair } from "@/shared/noun-adjectives.data";

export const getDefaultCreatePrinter = (): PreCreatePrinter => ({
  id: undefined,
  printerName: newRandomNamePair(),
  apiKey: "",
  printerURL: "",
  enabled: true,
});

export interface PreCreatePrinter {
  id?: string; // Only in case of update
  enabled: boolean;
  printerName: string;
  printerURL: string | undefined;
  apiKey: string;
}

export interface CreatePrinter {
  id?: string; // Only in case of update
  enabled: boolean;
  printerName: string;
  printerURL: string;
  apiKey: string;
}
