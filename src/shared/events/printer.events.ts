import type { EventBusKey } from "@vueuse/core";

const updatedPrinterEvent = `printer-update`;
export const updatedPrinterKey: EventBusKey<any> = Symbol(updatedPrinterEvent);
