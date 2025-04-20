import { IdType } from "@/utils/id.type";

export interface LoginDetails {
  apiKey: string;
  printerURL: string;
  printerType: number;
}

export interface PrinterDto {
  id: IdType;
  printerType: number;
  correlationToken?: string;
  enabled: boolean;
  dateAdded: number;
  disabledReason: string;
  name: string;
  webSocketURL: string;
  apiKey: string;
  username: string;
  password: string;
  printerURL: string;
}
