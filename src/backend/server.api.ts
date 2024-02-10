import { IdType } from "@/utils/id.type";

export class ServerApi {
  static base = "/api";

  static firstTimeSetupRoute = `${ServerApi.base}/first-time-setup`;
  static completeFirstTimeSetupRoute = `${ServerApi.firstTimeSetupRoute}/complete`;

  static printerRoute = `${ServerApi.base}/printer`;
  static printerBatchRoute = `${ServerApi.printerRoute}/batch`;
  static printerTestConnectionRoute = `${ServerApi.printerRoute}/test-connection`;

  static printerSettingsRoute = `${ServerApi.base}/printer-settings`;

  static floorRoute = `${ServerApi.base}/floor`;

  static batchRoute = `${ServerApi.base}/batch`;
  static batchGetLastPrintedFilesRoute = `${ServerApi.batchRoute}/reprint/list`;
  static batchReprintFilesRoute = `${ServerApi.batchRoute}/reprint/execute`;

  static printCompletionRoute = `${ServerApi.base}/print-completion`;

  static printerFilesRoute = `${ServerApi.base}/printer-files`;
  static printerFilesPurgeRoute = `${ServerApi.printerFilesRoute}/purge`;

  static printerGroupsRoute = `${ServerApi.base}/printer-groups`;
  static addPrinterToGroupRoute = (id: IdType) => `${ServerApi.base}/printer-groups/${id}/printer`;

  static customGCodeRoute = `${ServerApi.base}/custom-gcode`;

  static userRoute = `${ServerApi.base}/user`;
  static rolesRoute = `${ServerApi.base}/user/roles`;
  static userProfileRoute = `${ServerApi.userRoute}/profile`;

  static settingsRoute = `${ServerApi.base}/settings`;
  static settingsSensitiveRoute = `${ServerApi.settingsRoute}/sensitive`;
  static updateLoginRequiredRoute = `${ServerApi.settingsRoute}/login-required`;
  static updateRegistrationEnabledRoute = `${ServerApi.settingsRoute}/registration-enabled`;
  static updateCredentialSettings = `${ServerApi.settingsRoute}/credential`;
  static serverSettingsRoute = `${ServerApi.settingsRoute}/server`;
  static fileCleanSettingsRoute = `${ServerApi.settingsRoute}/file-clean`;
  static updateFrontendSettingsRoute = `${ServerApi.settingsRoute}/frontend`;
  static updateServerWhitelistSettingRoute = `${ServerApi.settingsRoute}/whitelist`;
  static updateTimeoutSettingRoute = `${ServerApi.settingsRoute}/timeout`;
  static serverSentryDiagnosticsSettingRoute = `${ServerApi.settingsRoute}/sentry-diagnostics`;

  static serverPrivateRoute = `${ServerApi.base}/server`;
  static serverRestartCommandRoute = `${ServerApi.serverPrivateRoute}/restart`;

  static pluginRoute = `${ServerApi.base}/plugin`;
  static pluginFirmwareUpdateRoute = `${ServerApi.pluginRoute}/firmware-update`;
  static pluginFirmwareReleasesRoute = `${ServerApi.pluginFirmwareUpdateRoute}/releases`;

  static getPrinterRoute = (id: IdType) => `${ServerApi.printerRoute}/${id}`;
  static postPrinterDisabledReasonRoute = (id: IdType) =>
    `${ServerApi.printerRoute}/${id}/disabled-reason`;
  static getPrinterLoginDetailsRoute = (id: IdType) =>
    `${ServerApi.getPrinterRoute(id)}/login-details`;
  static restartOctoPrintRoute = (id: IdType) =>
    `${ServerApi.getPrinterRoute(id)}/restart-octoprint`;

  static refreshSocketRoute = (id: IdType) => `${ServerApi.getPrinterRoute(id)}/refresh-socket`;
  static getPrinterSettingsRoute = (id: IdType) => `${ServerApi.printerSettingsRoute}/${id}`;
  static setPrinterSettingsGCodeAnalysisRoute = (id: IdType) =>
    `${ServerApi.getPrinterSettingsRoute(id)}/gcode-analysis`;
  static syncPrinterNameSettingRoute = (id: IdType) =>
    `${ServerApi.getPrinterSettingsRoute(id)}/sync-printername`;
  static getFloorRoute = (id: IdType) => `${ServerApi.floorRoute}/${id}`;
  static setSelectedFloorRoute = (floorId: IdType) =>
    `${ServerApi.floorRoute}/selected-floor/${floorId}`;
  static addOrRemovePrinterFromFloorRoute = (id: IdType) =>
    `${ServerApi.getFloorRoute(id)}/printer`;
  static sendEmergencyM112Route = (id: IdType) =>
    `${ServerApi.customGCodeRoute}/send-emergency-m112/${id}`;
  static installFirmwareUpdatePluginRoute = (id: IdType) =>
    `${ServerApi.pluginFirmwareUpdateRoute}/${id}/install-firmware-update-plugin`;
  static configurePluginSettingsRoute = (id: IdType) =>
    `${ServerApi.pluginFirmwareUpdateRoute}/${id}/configure-plugin-settings`;
  static flashFirmwareRoute = (id: IdType) =>
    `${ServerApi.pluginFirmwareUpdateRoute}/${id}/flash-firmware`;
  static updatePrinterFloorNameRoute = (id: IdType) => `${ServerApi.getFloorRoute(id)}/name`;
  static updatePrinterFloorNumberRoute = (id: IdType) =>
    `${ServerApi.getFloorRoute(id)}/floor-number`;
  static printerFilesClearRoute = (id: IdType) => `${ServerApi.printerFilesRoute}/${id}/clear`;
  static printerFilesSelectAndPrintRoute = (id: IdType) =>
    `${ServerApi.printerFilesRoute}/${id}/select`;
  static printerFilesUploadRoute = (id: IdType) => `${ServerApi.printerFilesRoute}/${id}/upload`;
  static printerFilesCacheRoute = (id: IdType) => `${ServerApi.printerFilesRoute}/${id}/cache`;
  static printerEnabledRoute = (id: IdType) => `${ServerApi.getPrinterRoute(id)}/enabled`;
  static printerSerialConnectRoute = (id: IdType) =>
    `${ServerApi.getPrinterRoute(id)}/serial-connect`;
  static printerSerialDisconnectRoute = (id: IdType) =>
    `${ServerApi.getPrinterRoute(id)}/serial-disconnect`;

  static printerJobRoute = (id: IdType) => `${ServerApi.getPrinterRoute(id)}/job`;
  static printerStopJobRoute = (id: IdType) => `${ServerApi.printerJobRoute(id)}/stop`;
  static printerPauseJobRoute = (id: IdType) => `${ServerApi.printerJobRoute(id)}/pause`;
  static printerResumeJobRoute = (id: IdType) => `${ServerApi.printerJobRoute(id)}/resume`;

  static userChangeUsernameRoute = (id: IdType) => `${ServerApi.userRoute}/${id}/change-username`;
  static userChangePasswordRoute = (id: IdType) => `${ServerApi.userRoute}/${id}/change-password`;
  static userDeleteRoute = (id: IdType) => `${ServerApi.userRoute}/${id}`;
  static userSetVerifiedRoute = (id: IdType) => `${ServerApi.userRoute}/${id}/set-verified`;
  static userSetRootUserRoute = (id: IdType) => `${ServerApi.userRoute}/${id}/set-root-user`;
}
