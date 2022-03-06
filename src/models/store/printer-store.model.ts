import type { Printer } from "../printers/printer.model";

export interface PrintersStore {
    printers: Printer[],
    testPrinter?: Printer,
    lastUpdated?: number,
    sideNavPrinter?: Printer,
    updateDialogPrinter?: Printer,
    createDialogOpened?: boolean,
    selectedPrinters: Printer[]
}