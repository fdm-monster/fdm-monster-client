import { newRandomNamePair } from "@/constants/noun-adjectives.data";

export interface PrinterInFloor {
  _id?: string;
  printerId: string;
  x: number;
  y: number;
}

export interface Floor {
  __v?: number;
  _id: string;
  name: string;
  floor: number;
  printers: PrinterInFloor[];
}

export interface PreCreateFloor {
  _id?: string;
  name: string;
  floor: string;
  printers: PrinterInFloor[];
}

export const getDefaultCreatePrinterFloor = (): PreCreateFloor => ({
  _id: undefined,
  name: newRandomNamePair(),
  floor: "1",
  printers: [],
});
