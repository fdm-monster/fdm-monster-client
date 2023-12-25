import { IdType } from "@/utils/id.type";

export interface BatchSingletonModel {
  success?: boolean;
  failure?: boolean;
  printerId: IdType;
  time: number;
  error?: string;
}

export type BatchModel = BatchSingletonModel[];
