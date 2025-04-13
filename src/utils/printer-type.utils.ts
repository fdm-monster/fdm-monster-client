export const OctoPrintType = 0;
export const MoonrakerType = 1;
export const PrusaLinkType = 2;

export function isOctoPrintType(printerType?: number) {
  return printerType === OctoPrintType;
}

export function isMoonrakerType(printerType?: number) {
  return printerType === MoonrakerType;
}

export function isPrusaLinkType(printerType?: number) {
  return printerType === PrusaLinkType;
}

export function getServiceName(printerType?: number) {
  return isOctoPrintType(printerType)
    ? "OctoPrint"
    : isMoonrakerType(printerType)
    ? "Moonraker"
    : isPrusaLinkType(printerType)
    ? "PrusaLink"
    : "Unknown";
}
