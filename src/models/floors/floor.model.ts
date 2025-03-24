import { newRandomNamePair } from "@/shared/noun-adjectives.data";
import { IdType } from "@/utils/id.type";

export interface FloorDto {
  id: IdType;
  name: string;
  floor: number;
  printers: PositionDto[];
}

export interface PreCreateFloor {
  id?: IdType;
  name: string;
  floor: string;
  printers: PositionDto[];
}

export interface PositionDto<KeyType = IdType> {
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
