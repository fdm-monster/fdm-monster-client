export interface ExportYamlModel {
  exportPrinters: boolean;
  exportFloorGrid: boolean;
  exportFloors: boolean;
  // Used to determine import strategy
  printerComparisonStrategiesByPriority: string[];
  floorComparisonStrategiesByPriority: string;
  // Helpful reference
  notes?: string;
}
