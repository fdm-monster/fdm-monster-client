export const OctoPrintType = 0;
export const MoonrakerType = 1;
export const PrusaLinkType = 2;
export const BambuType = 3;

export function isOctoPrintType(printerType?: number) {
  return printerType === OctoPrintType;
}

export function isMoonrakerType(printerType?: number) {
  return printerType === MoonrakerType;
}

export function isPrusaLinkType(printerType?: number) {
  return printerType === PrusaLinkType;
}

export function isBambuType(printerType?: number) {
  return printerType === BambuType;
}

export function getServiceName(printerType?: number) {
  if (isOctoPrintType(printerType)) {
    return "OctoPrint";
  } else if (isMoonrakerType(printerType)) {
    return "Moonraker";
  } else if (isPrusaLinkType(printerType)) {
    return "PrusaLink";
  } else if (isBambuType(printerType)) {
    return "Bambu";
  } else {
    return "Unknown";
  }
}
