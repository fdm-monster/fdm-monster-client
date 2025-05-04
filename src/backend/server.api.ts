import { IdType } from "@/utils/id.type";

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

  static readonly deleteGroupRoute = (id: IdType) => `${ServerApi.base}/printer-group/${id}`;

  static readonly updateGroupNameRoute = (id: IdType) =>
    `${ServerApi.base}/printer-group/${id}/name`;

  static readonly addPrinterToGroupRoute = (id: IdType) =>
    `${ServerApi.base}/printer-group/${id}/printer`;

  static readonly deletePrinterFromGroupRoute = ServerApi.addPrinterToGroupRoute;

  static readonly getPrinterRoute = (id: IdType) => `${ServerApi.printerRoute}/${id}`;
  static readonly postPrinterDisabledReasonRoute = (id: IdType) =>
    `${ServerApi.printerRoute}/${id}/disabled-reason`;
  static readonly getPrinterLoginDetailsRoute = (id: IdType) =>
    `${ServerApi.getPrinterRoute(id)}/login-details`;
  static readonly restartOctoPrintRoute = (id: IdType) =>
    `${ServerApi.getPrinterRoute(id)}/restart-octoprint`;

  static readonly refreshSocketRoute = (id: IdType) =>
    `${ServerApi.getPrinterRoute(id)}/refresh-socket`;
  static readonly getPrinterSettingsRoute = (id: IdType) =>
    `${ServerApi.printerSettingsRoute}/${id}`;
  static readonly setPrinterSettingsGCodeAnalysisRoute = (id: IdType) =>
    `${ServerApi.getPrinterSettingsRoute(id)}/gcode-analysis`;
  static readonly syncPrinterNameSettingRoute = (id: IdType) =>
    `${ServerApi.getPrinterSettingsRoute(id)}/sync-printername`;
  static readonly getFloorRoute = (id: IdType) => `${ServerApi.floorRoute}/${id}`;
  static readonly addOrRemovePrinterFromFloorRoute = (id: IdType) =>
    `${ServerApi.getFloorRoute(id)}/printer`;
  static readonly sendQuickStopM112Route = (id: IdType) =>
    `${ServerApi.customGCodeRoute}/send-emergency-m112/${id}`;
  static readonly updatePrinterFloorNameRoute = (id: IdType) =>
    `${ServerApi.getFloorRoute(id)}/name`;
  static readonly updatePrinterFloorNumberRoute = (id: IdType) =>
    `${ServerApi.getFloorRoute(id)}/floor-number`;
  static readonly printerFilesClearRoute = (id: IdType) =>
    `${ServerApi.printerFilesRoute}/${id}/clear`;
  static readonly printerFilesSelectAndPrintRoute = (id: IdType) =>
    `${ServerApi.printerFilesRoute}/${id}/select`;
  static readonly printerFilesUploadRoute = (id: IdType) =>
    `${ServerApi.printerFilesRoute}/${id}/upload`;
  static readonly printerFilesCacheRoute = (id: IdType) =>
    `${ServerApi.printerFilesRoute}/${id}/cache`;
  static readonly printerEnabledRoute = (id: IdType) => `${ServerApi.getPrinterRoute(id)}/enabled`;
  static readonly printerSerialConnectRoute = (id: IdType) =>
    `${ServerApi.getPrinterRoute(id)}/serial-connect`;
  static readonly printerJogCommandRoute = (id: IdType) => `${ServerApi.getPrinterRoute(id)}/jog`;
  static readonly printerHomeCommandRoute = (id: IdType) => `${ServerApi.getPrinterRoute(id)}/home`;
  static readonly printerSerialDisconnectRoute = (id: IdType) =>
    `${ServerApi.getPrinterRoute(id)}/serial-disconnect`;

  static readonly printerJobRoute = (id: IdType) => `${ServerApi.getPrinterRoute(id)}/job`;
  static readonly printerStopJobRoute = (id: IdType) => `${ServerApi.printerJobRoute(id)}/stop`;
  static readonly printerPauseJobRoute = (id: IdType) => `${ServerApi.printerJobRoute(id)}/pause`;
  static readonly printerResumeJobRoute = (id: IdType) => `${ServerApi.printerJobRoute(id)}/resume`;

  static readonly userChangeUsernameRoute = (id: IdType) =>
    `${ServerApi.userRoute}/${id}/change-username`;
  static readonly userChangePasswordRoute = (id: IdType) =>
    `${ServerApi.userRoute}/${id}/change-password`;
  static readonly userDeleteRoute = (id: IdType) => `${ServerApi.userRoute}/${id}`;
  static readonly userSetVerifiedRoute = (id: IdType) =>
    `${ServerApi.userRoute}/${id}/set-verified`;
  static readonly userSetRootUserRoute = (id: IdType) =>
    `${ServerApi.userRoute}/${id}/set-root-user`;
  static readonly userSetUserRolesRoute = (id: IdType) =>
    `${ServerApi.userRoute}/${id}/set-user-roles`;
}
