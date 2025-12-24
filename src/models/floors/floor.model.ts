import { newRandomNamePair } from "@/shared/noun-adjectives.data";

export interface FloorDto {
  id: number;
  name: string;
  floor: number;
  printers: PositionDto[];
}

export interface PreCreateFloor {
  id?: number;
  name: string;
  floor: string;
  printers: PositionDto[];
}

export interface PositionDto<KeyType = number> {
  x: number;
  y: number;
  printerId: KeyType;
  floorId: KeyType;
}

export const getDefaultCreateFloor = (): PreCreateFloor => ({
  id: undefined,
  name: newRandomNamePair(),
  floor: "1",
  printers: [],
});
