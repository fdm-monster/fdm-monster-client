import { newRandomNamePair } from "@/shared/noun-adjectives.data";

export const getDefaultCreatePrinter = (): PreCreatePrinter => ({
  id: undefined,
  name: newRandomNamePair(),
  apiKey: "",
  username: "",
  password: "",
  printerURL: "",
  printerType: 0,
  enabled: true,
});

export interface PreCreatePrinter {
  id?: number; // Only in case of update
  enabled: boolean;
  printerType: number;
  name: string;
  printerURL: string | undefined;
  apiKey: string;
  username: string;
  password: string;
}

export interface CreatePrinter {
  id?: number; // Only in case of update
  enabled: boolean;
  printerType: number;
  name: string;
  printerURL: string;
  apiKey: string;
  username: string;
  password: string;
}
