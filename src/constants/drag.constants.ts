export const dragAppId = "FDM-Monster-Client-Vue2";

export enum INTENT {
  PRINTER_PLACE = "PRINTER_PLACE",
}

export function isPrinterPlaceDataTransfer(data: PrinterPlace) {
  if (!data?.appId?.length || !data?.intent?.length) return false;

  return data.appId === dragAppId && data.intent === INTENT.PRINTER_PLACE;
}

export interface PrinterPlace {
  appId: string;
  intent: string;
  printerId: string;
}
