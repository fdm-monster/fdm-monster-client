export interface ExportYamlModel {
  exportPrinters: boolean;
  exportGroups: boolean;
  exportFloorGrid: boolean;
  exportFloors: boolean;
  // Used to determine import strategy
  printerComparisonStrategiesByPriority: string[];
  floorComparisonStrategiesByPriority: string;
  // Helpful reference
  notes?: string;
}
