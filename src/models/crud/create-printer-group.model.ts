import { newRandomNamePair } from "@/shared/noun-adjectives.data";
import type { PrinterInGroup } from "@/models/printers/printer-group.model";

export const getDefaultCreatePrinterGroup = (): PreCreatePrinterGroup => ({
  id: undefined,
  name: newRandomNamePair(),
  location: {},
  printers: [],
});

export interface PreCreatePrinterGroup {
  id?: string; // Only in case of update

  name: string;

  printers: PrinterInGroup[];

  location: {
    x?: string;
    y?: string;
  };
}

export interface CreatePrinterGroup {
  id?: string; // Only in case of update

  name: string;

  printers: PrinterInGroup[];

  location: {
    x?: number;
    y?: number;
  };
}
