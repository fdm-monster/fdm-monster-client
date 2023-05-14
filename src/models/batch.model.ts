export interface BatchSingletonModel {
  success?: boolean;
  failure?: boolean;
  printerId: string;
  time: number;
  error?: string;
}

export type BatchModel = BatchSingletonModel[];
