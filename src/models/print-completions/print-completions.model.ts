import { IdType } from "@/utils/id.type";

export interface ShortEvent {
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
  failureCount: number;
  lastFailure: ContextEvent;
  failureEventsLastWeek: number;
  failureEventsLast48H: number;
  failureEventsLast24H: number;
  successCount: number;
  lastSuccess: ContextEvent;
  successEventsLastWeek: number;
  successEventsLast48H: number;
  successEventsLast24H: number;

  printJobs: PrintJobEvents[];

  correlationIds: IdType[];
}

export type PrintCompletionsModel = PrinterCompletions[];
