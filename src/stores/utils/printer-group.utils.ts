import type { PrinterGroup } from "@/models/printers/printer-group.model";

export const sortPrinterGroups = (printerGroups: PrinterGroup[]): PrinterGroup[] => {
    const sortedPrinterGroups = printerGroups.sort((g1, g2) => {
        const l1 = g1.location;
        const l2 = g2.location;
        if (l1.x < l2.x) return -1;
        if (l1.x > l2.x) return 1;
        if (l1.x === l2.x) {
            if (l1.y < l2.y) return -1;
            if (l1.y > l2.y) return 1;
            return g1.name.localeCompare(g2.name) ? -1 : 1;
        }

        // Silence TS
        return 1;
    });

    return sortedPrinterGroups;
}