import type { InjectionKey } from "vue";
import { provide } from "vue";

interface AppConstants {
  apiKeyLength: number;
  maxPort: number;
  maxPrinterNameLength: number;
  maxPrinterGroupNameLength: number;
  maxPrinterGroupLocationX: number;
  maxPrinterGroupLocationY: number;
}

// Exported for static context which cannot inject
export const generateAppConstants = (): Readonly<AppConstants> =>
  Object.freeze({
    apiKeyLength: 32,
    maxPort: 65535,
    maxPrinterNameLength: 25,
    maxPrinterGroupNameLength: 15,
    maxPrinterGroupLocationX: 4,
    maxPrinterGroupLocationY: 4,
  }) as Readonly<AppConstants>;

export const AppConstants = Symbol() as InjectionKey<AppConstants>;

export function provideAppConstants() {
  provide(AppConstants, generateAppConstants());
}
