import { IdType } from "@/utils/id.type";

export interface LoginDetails {
  apiKey: string;
  printerURL: string;
}

export interface PrinterDto {
  id: IdType;
  correlationToken?: string;
  enabled: boolean;
  dateAdded: number;
  disabledReason: string;
  name: string;
  webSocketURL: string;
  apiKey: string;
  printerURL: string;
}
