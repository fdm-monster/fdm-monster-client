import type { PrinterGroup } from "../printers/printer-group.model";

export interface PrinterGroupsStore {
    printerGroups: PrinterGroup[],
    lastUpdated?: number,
    createGroupDialogOpened?: boolean
}