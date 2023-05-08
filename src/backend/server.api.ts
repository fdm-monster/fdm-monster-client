export class ServerApi {
  static base = "api";
  static amIAliveRoute = `${ServerApi.base}/amialive`;
  static printerRoute = `${ServerApi.base}/printer`;
  static printerBatchRoute = `${ServerApi.printerRoute}/batch`;
  static printerTestConnectionRoute = `${ServerApi.printerRoute}/test-connection`;
  static printerSettingsRoute = `${ServerApi.base}/printer-settings`;
  static floorRoute = `${ServerApi.base}/floor`;
  static printCompletionRoute = `${ServerApi.base}/print-completion`;
  static printerFilesRoute = `${ServerApi.base}/printer-files`;
  static printerFilesBatchReprintRoute = `${ServerApi.printerFilesRoute}/batch/reprint-files`;
  static printerFilesUploadStubRoute = `${ServerApi.base}/printer-files/upload-stub`;
  static serverPrivateRoute = `${ServerApi.base}/server`;
  static serverRestartCommandRoute = `${ServerApi.serverPrivateRoute}/restart`;
  static printerFilesPurgeRoute = `${ServerApi.printerFilesRoute}/purge`;
  static customGCodeRoute = `${ServerApi.base}/custom-gcode`;
  static userRoute = `${ServerApi.base}/user`;
  static settingsRoute = `${ServerApi.base}/settings`;
  static serverSettingsRoute = `${ServerApi.settingsRoute}/server`;
  static serverWhitelistSettingRoute = `${ServerApi.settingsRoute}/server/whitelist`;
  static serverRestartRoute = `${ServerApi.serverSettingsRoute}/restart`;
  static customGCodeSettingsRoutes = `${ServerApi.settingsRoute}/custom-gcode`;
  static pluginRoute = `${ServerApi.base}/plugin`;
  static pluginFirmwareUpdateRoute = `${ServerApi.pluginRoute}/firmware-update`;
  static pluginFirmwareReleasesRoute = `${ServerApi.pluginFirmwareUpdateRoute}/releases`;

  static getPrinterRoute = (id: string) => `${ServerApi.printerRoute}/${id}`;
  static postPrinterDisabledReasonRoute = (id: string) =>
    `${ServerApi.printerRoute}/${id}/disabled-reason`;
  static getPrinterLoginDetailsRoute = (id: string) =>
    `${ServerApi.getPrinterRoute(id)}/login-details`;
  static restartOctoPrintRoute = (id: string) =>
    `${ServerApi.getPrinterRoute(id)}/restart-octoprint`;
  static getPrinterSettingsRoute = (id: string) => `${ServerApi.printerSettingsRoute}/${id}`;
  static setPrinterSettingsGCodeAnalysisRoute = (id: string) =>
    `${ServerApi.getPrinterSettingsRoute(id)}/gcode-analysis`;
  static syncPrinterNameSettingRoute = (id: string) =>
    `${ServerApi.getPrinterSettingsRoute(id)}/sync-printername`;
  static getFloorRoute = (id: string) => `${ServerApi.floorRoute}/${id}`;
  static setSelectedFloorRoute = (floorId: string) =>
    `${ServerApi.floorRoute}/selected-floor/${floorId}`;
  static addOrRemovePrinterFromFloorRoute = (id: string) =>
    `${ServerApi.getFloorRoute(id)}/printer`;
  static sendEmergencyM112Route = (id: string) =>
    `${ServerApi.customGCodeRoute}/send-emergency-m112/${id}`;
  static installFirmwareUpdatePluginRoute = (id: string) =>
    `${ServerApi.pluginFirmwareUpdateRoute}/${id}/install-firmware-update-plugin`;
  static configurePluginSettingsRoute = (id: string) =>
    `${ServerApi.pluginFirmwareUpdateRoute}/${id}/configure-plugin-settings`;
  static flashFirmwareRoute = (id: string) =>
    `${ServerApi.pluginFirmwareUpdateRoute}/${id}/flash-firmware`;
  static updatePrinterFloorNameRoute = (id: string) => `${ServerApi.getFloorRoute(id)}/name`;
  static updatePrinterFloorNumberRoute = (id: string) =>
    `${ServerApi.getFloorRoute(id)}/floor-number`;
  static printerFilesClearRoute = (id: string) => `${ServerApi.printerFilesRoute}/${id}/clear`;
  static printerFilesSelectAndPrintRoute = (id: string) =>
    `${ServerApi.printerFilesRoute}/${id}/select`;
  static printerFilesUploadRoute = (id: string) => `${ServerApi.printerFilesRoute}/${id}/upload`;
  static printerFilesCacheRoute = (id: string) => `${ServerApi.printerFilesRoute}/${id}/cache`;
  static printerEnabledRoute = (id: string) => `${ServerApi.getPrinterRoute(id)}/enabled`;
  static printerSerialConnectRoute = (id: string) =>
    `${ServerApi.getPrinterRoute(id)}/serial-connect`;
  static printerSerialDisconnectRoute = (id: string) =>
    `${ServerApi.getPrinterRoute(id)}/serial-disconnect`;

  static printerJobRoute = (id: string) => `${ServerApi.getPrinterRoute(id)}/job`;
  static printerStopJobRoute = (id: string) => `${ServerApi.printerJobRoute(id)}/stop`;
}
