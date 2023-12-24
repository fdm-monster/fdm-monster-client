import { newRandomNamePair } from "@/shared/noun-adjectives.data";

export interface PrinterInFloorDto {
  id?: string;
  printerId: string;
  x: number;
  y: number;
}

export interface FloorDto {
  id: string;
  name: string;
  floor: number;
  printers: PrinterInFloorDto[];
}

export interface PreCreateFloor {
  id?: string;
  name: string;
  floor: string;
  printers: PrinterInFloorDto[];
}

export const getDefaultCreateFloor = (): PreCreateFloor => ({
  id: undefined,
  name: newRandomNamePair(),
  floor: "1",
  printers: [],
});
