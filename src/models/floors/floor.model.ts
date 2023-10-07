import { newRandomNamePair } from "@/shared/noun-adjectives.data";

export interface PrinterInFloor {
  id?: string;
  printerId: string;
  x: number;
  y: number;
}

export interface Floor {
  id: string;
  name: string;
  floor: number;
  printers: PrinterInFloor[];
}

export interface PreCreateFloor {
  id?: string;
  name: string;
  floor: string;
  printers: PrinterInFloor[];
}

export const getDefaultCreateFloor = (): PreCreateFloor => ({
  id: undefined,
  name: newRandomNamePair(),
  floor: "1",
  printers: [],
});
