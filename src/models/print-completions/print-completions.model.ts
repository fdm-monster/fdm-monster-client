import { IdType } from "@/utils/id.type";

export interface ShortEvent {
  printerId: string;
  status: string;
  fileName: string;
  createdAt: number;
  completionLog?: string;
}

export interface ContextEvent extends ShortEvent {
  context?: {
    correlationId: string;
    [k: string]:
      | string
      | {
          status: string;
          createdAt: number;
          printerId: IdType;
        };
  };
}

export type PrintJobEvents = {
  correlationId: string;
  events: ShortEvent[]; // ... others
  lastEvent: ShortEvent;
};

export interface PrinterCompletions {
  printerId: IdType;
  printCount: number;
  eventCount: number;
  successCount: number;
  failureCount: number;
  lastSuccess: ContextEvent;
  lastFailure: ContextEvent;
  failuresLastWeek: number;
  failuresLast48H: number;
  failuresLast24H: number;
  successesLastWeek: number;
  successesLast48H: number;
  successesLast24H: number;

  printJobs: PrintJobEvents[];

  correlationIds: string[];
}

export type PrintCompletionsModel = PrinterCompletions[];
