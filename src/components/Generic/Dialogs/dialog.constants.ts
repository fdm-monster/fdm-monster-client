export enum DialogName {
  // The JSON import dialog, which is used to import a JSON file with a printer array into the application.
  BatchJsonCreate = "BatchJsonCreate",
  // The YAML import and export dialog, which is used to import and export a YAML file with a printer array into and from the application.
  // This YAML is for internal backup and restore only and is not compatible with external projects.
  YamlImportExport = "YamlImportExport",
  // The printer create dialog, which is used to create a new or update a printer.
  PrinterDialog = "PrinterDialog",
  // The floor create dialog, which is used to create a new floor where printers can be placed.
  FloorDialog = "FloorDialog",
  // The printer repair dialog, which is used to mark a printer as maintenance mode.
  PrinterMaintenanceDialog = "PrinterMaintenanceDialog",
}
