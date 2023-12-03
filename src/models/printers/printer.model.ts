import { PrinterFileDto } from "@/models/printers/printer-file.model";

export interface LoginDetails {
  apiKey: string;
  printerURL: string;
}

export interface PrinterDto {
  id: string;
  correlationToken?: string;
  enabled: boolean;
  dateAdded: number;
  disabledReason: string;
  name: string;
  webSocketURL: string;
  apiKey: string;
  printerURL: string;

  fileList: PrinterFileDto[];
}
