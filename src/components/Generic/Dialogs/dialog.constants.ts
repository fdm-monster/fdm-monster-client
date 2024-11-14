export enum DialogName {
  // The JSON import dialog, which is used to import a JSON file with a printer array into the application.
  BatchJsonCreate = "BatchJsonCreate",
  // Stateful dialog meant for verifying the last printed file of each selected printer
  BatchReprintDialog = "BatchReprintDialog",
  // The YAML import and export dialog, which is used to import and export a YAML file with a printer array into and from the application.
  // This YAML is for internal backup and restore only and is not compatible with external projects.
  YamlImportExport = "YamlImportExport",
  // The printer create dialog, which is used to create a new or update a printer.
  AddOrUpdatePrinterDialog = "AddOrUpdatePrinterDialog",
  // The floor create dialog, which is used to create a new floor where printers can be placed.
  AddOrUpdateFloorDialog = "AddOrUpdateFloorDialog",
  // The printer repair dialog, which is used to mark a printer as maintenance mode.
  PrinterMaintenanceDialog = "PrinterMaintenanceDialog",
  // The camera create dialog, which is used to create a new or update a camera.
  AddOrUpdateCameraDialog = "AddOrUpdateCameraDialog",
  // Dialog for moving print head, homing, or retracting/extruding filament
  PrinterControlDialog = "PrinterControlDialog",
  // Dialog for creating a user which is pre-registered (no verification needed)
  CreateUserDialog = "CreateUserDialog",
  // Dialog for managing grid columns, rows, tile size and more (reference to Grid Settings page)
  GridSettingsDialog = "GridSettingsDialog",
}
