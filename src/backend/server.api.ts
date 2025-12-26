export class ServerApi {
  static readonly base = "/api";
  static readonly firstTimeSetupRoute = `${ServerApi.base}/first-time-setup`;
  static readonly completeFirstTimeSetupRoute = `${ServerApi.firstTimeSetupRoute}/complete`;
  static readonly printerRoute = `${ServerApi.base}/printer`;
  static readonly printerBatchRoute = `${ServerApi.printerRoute}/batch`;
  static readonly printerTestConnectionRoute = `${ServerApi.printerRoute}/test-connection`;
  static readonly printerSettingsRoute = `${ServerApi.base}/printer-settings`;
  static readonly floorRoute = `${ServerApi.base}/floor`;
  static readonly batchRoute = `${ServerApi.base}/batch`;
  static readonly batchGetLastPrintedFilesRoute = `${ServerApi.batchRoute}/reprint/list`;
  static readonly batchReprintFilesRoute = `${ServerApi.batchRoute}/reprint/execute`;
  static readonly printCompletionRoute = `${ServerApi.base}/print-completion`;
  static readonly printerFilesRoute = `${ServerApi.base}/printer-files`;
  static readonly printerFilesPurgeRoute = `${ServerApi.printerFilesRoute}/purge`;
  static readonly printerGroupRoute = `${ServerApi.base}/printer-group`;
  static readonly createGroupRoute = `${ServerApi.base}/printer-group`;
  static readonly customGCodeRoute = `${ServerApi.base}/custom-gcode`;
  static readonly userRoute = `${ServerApi.base}/user`;
  static readonly rolesRoute = `${ServerApi.base}/user/roles`;
  static readonly userProfileRoute = `${ServerApi.userRoute}/profile`;
  static readonly settingsRoute = `${ServerApi.base}/settings`;
  static readonly settingsSensitiveRoute = `${ServerApi.settingsRoute}/sensitive`;
  static readonly updateLoginRequiredRoute = `${ServerApi.settingsRoute}/login-required`;
  static readonly updateRegistrationEnabledRoute = `${ServerApi.settingsRoute}/registration-enabled`;
  static readonly updateCredentialSettings = `${ServerApi.settingsRoute}/credential`;
  static readonly fileCleanSettingsRoute = `${ServerApi.settingsRoute}/file-clean`;
  static readonly updateFrontendSettingsRoute = `${ServerApi.settingsRoute}/frontend`;
  static readonly updateTimeoutSettingRoute = `${ServerApi.settingsRoute}/timeout`;
  static readonly serverSentryDiagnosticsSettingRoute = `${ServerApi.settingsRoute}/sentry-diagnostics`;
  static readonly updateExperimentalMoonrakerSupportRoute = `${ServerApi.settingsRoute}/experimental-moonraker-support`;
  static readonly updateExperimentalThumbnailSupportRoute = `${ServerApi.settingsRoute}/experimental-thumbnail-support`;
  static readonly updateExperimentalClientSupportRoute = `${ServerApi.settingsRoute}/experimental-client-support`;
  static readonly updateExperimentalPrusaLinkSupportRoute = `${ServerApi.settingsRoute}/experimental-prusa-link-support`;
  static readonly updateExperimentalBambuSupportRoute = `${ServerApi.settingsRoute}/experimental-bambu-support`;

  static readonly deleteGroupRoute = (id: number) => `${ServerApi.base}/printer-group/${id}`;

  static readonly updateGroupNameRoute = (id: number) =>
    `${ServerApi.base}/printer-group/${id}/name`;

  static readonly addPrinterToGroupRoute = (id: number) =>
    `${ServerApi.base}/printer-group/${id}/printer`;

  static readonly deletePrinterFromGroupRoute = ServerApi.addPrinterToGroupRoute;

  static readonly getPrinterRoute = (id: number) => `${ServerApi.printerRoute}/${id}`;
  static readonly postPrinterDisabledReasonRoute = (id: number) =>
    `${ServerApi.printerRoute}/${id}/disabled-reason`;
  static readonly getPrinterLoginDetailsRoute = (id: number) =>
    `${ServerApi.getPrinterRoute(id)}/login-details`;
  static readonly restartOctoPrintRoute = (id: number) =>
    `${ServerApi.getPrinterRoute(id)}/restart-octoprint`;

  static readonly refreshSocketRoute = (id: number) =>
    `${ServerApi.getPrinterRoute(id)}/refresh-socket`;
  static readonly getPrinterSettingsRoute = (id: number) =>
    `${ServerApi.printerSettingsRoute}/${id}`;
  static readonly setPrinterSettingsGCodeAnalysisRoute = (id: number) =>
    `${ServerApi.getPrinterSettingsRoute(id)}/gcode-analysis`;
  static readonly syncPrinterNameSettingRoute = (id: number) =>
    `${ServerApi.getPrinterSettingsRoute(id)}/sync-printername`;
  static readonly getFloorRoute = (id: number) => `${ServerApi.floorRoute}/${id}`;
  static readonly addOrRemovePrinterFromFloorRoute = (id: number) =>
    `${ServerApi.getFloorRoute(id)}/printer`;
  static readonly sendQuickStopM112Route = (id: number) =>
    `${ServerApi.customGCodeRoute}/send-emergency-m112/${id}`;
  static readonly updatePrinterFloorNameRoute = (id: number) =>
    `${ServerApi.getFloorRoute(id)}/name`;
  static readonly updatePrinterFloorNumberRoute = (id: number) =>
    `${ServerApi.getFloorRoute(id)}/floor-number`;
  static readonly printerFilesClearRoute = (id: number) =>
    `${ServerApi.printerFilesRoute}/${id}/clear`;
  static readonly printerFilesStartPrintRoute = (id: number) =>
    `${ServerApi.printerFilesRoute}/${id}/select`;
  static readonly printerFilesUploadRoute = (id: number) =>
    `${ServerApi.printerFilesRoute}/${id}/upload`;
  static readonly printerFilesCacheRoute = (id: number) =>
    `${ServerApi.printerFilesRoute}/${id}/cache`;
  static readonly printerEnabledRoute = (id: number) => `${ServerApi.getPrinterRoute(id)}/enabled`;
  static readonly printerSerialConnectRoute = (id: number) =>
    `${ServerApi.getPrinterRoute(id)}/serial-connect`;
  static readonly printerJogCommandRoute = (id: number) => `${ServerApi.getPrinterRoute(id)}/jog`;
  static readonly printerHomeCommandRoute = (id: number) => `${ServerApi.getPrinterRoute(id)}/home`;
  static readonly printerSerialDisconnectRoute = (id: number) =>
    `${ServerApi.getPrinterRoute(id)}/serial-disconnect`;

  static readonly printerJobRoute = (id: number) => `${ServerApi.getPrinterRoute(id)}/job`;
  static readonly printerStopJobRoute = (id: number) => `${ServerApi.printerJobRoute(id)}/stop`;
  static readonly printerPauseJobRoute = (id: number) => `${ServerApi.printerJobRoute(id)}/pause`;
  static readonly printerResumeJobRoute = (id: number) => `${ServerApi.printerJobRoute(id)}/resume`;

  static readonly userChangeUsernameRoute = (id: number) =>
    `${ServerApi.userRoute}/${id}/change-username`;
  static readonly userChangePasswordRoute = (id: number) =>
    `${ServerApi.userRoute}/${id}/change-password`;
  static readonly userDeleteRoute = (id: number) => `${ServerApi.userRoute}/${id}`;
  static readonly userSetVerifiedRoute = (id: number) =>
    `${ServerApi.userRoute}/${id}/set-verified`;
  static readonly userSetRootUserRoute = (id: number) =>
    `${ServerApi.userRoute}/${id}/set-root-user`;
  static readonly userSetUserRolesRoute = (id: number) =>
    `${ServerApi.userRoute}/${id}/set-user-roles`;
}
