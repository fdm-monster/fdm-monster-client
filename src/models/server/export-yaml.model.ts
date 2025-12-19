export interface ExportYamlModel {
  exportPrinters: boolean;
  exportGroups: boolean;
  exportFloorGrid: boolean;
  exportFloors: boolean;
  exportSettings: boolean;
  exportUsers: boolean;
  exportUserRoles: boolean;
  // Used to determine import strategy
  printerComparisonStrategiesByPriority: string[];
  floorComparisonStrategiesByPriority: string;
  // Helpful reference
  notes?: string;
}
