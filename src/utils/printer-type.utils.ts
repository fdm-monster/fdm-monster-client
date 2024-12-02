export function isOctoPrintType(printerType?: number) {
  return printerType === 0;
}

export function isMoonrakerType(printerType?: number) {
  return printerType === 1;
}

export function isBambuType(printerType?: number) {
  return printerType === 2;
}

export function getServiceName(printerType?: number) {
  return isOctoPrintType(printerType)
    ? "OctoPrint"
    : isMoonrakerType(printerType)
    ? "Moonraker"
    : isBambuType(printerType)
    ? "Bambu"
    : "Unknown";
}
