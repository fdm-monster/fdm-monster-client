import { newRandomNamePair } from "@/shared/noun-adjectives.data";
import { IdType } from "@/utils/id.type";

export interface PrinterInFloorDto {
  id?: IdType;
  printerId: IdType;
  x: number;
  y: number;
}

export interface FloorDto {
  id: IdType;
  name: string;
  floor: number;
  printers: PrinterInFloorDto[];
}

export interface PreCreateFloor {
  id?: IdType;
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
