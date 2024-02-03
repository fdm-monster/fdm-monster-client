export interface GCodeDimensions {
  depth: number;
  height: number;
  width: number;
}

export interface FilamentTool {
  length: number;
  volume: number;
}

export interface FilamentToolCollection {
  [k: string]: FilamentTool;
}

export interface PrintingArea {
  maxX: number;
  maxY: number;
  maxZ: number;
  minX: number;
  minY: number;
  minZ: number;
}

export interface GcodeAnalysisDto {
  dimensions: GCodeDimensions;
  estimatedPrintTime: number;
  filament: FilamentToolCollection;
  printingArea: PrintingArea;
}
