export type OctoPrintSettingsDto = {
  api: {
    allowCrossOrigin?: boolean;
    key?: string;
  };
  appearance: {
    closeModalsWithClick?: boolean;
    color?: string;
    colorIcon?: boolean;
    colorTransparent?: boolean;
    defaultLanguage?: string;
    fuzzyTimes?: boolean;
    name?: string;
    showFahrenheitAlso?: boolean;
    showInternalFilename?: boolean;
  };
  devel: {
    pluginTimings?: boolean;
  };
  feature: {
    autoUppercaseBlacklist?: Array<string>;
    g90InfluencesExtruder?: boolean;
    keyboardControl?: boolean;
    modelSizeDetection?: boolean;
    pollWatched?: boolean;
    printCancelConfirmation?: boolean;
    printStartConfirmation?: boolean;
    sdSupport?: boolean;
    temperatureGraph?: boolean;
  };
  folder: {
    logs?: string;
    timelapse?: string;
    timelapseTmp?: string;
    uploads?: string;
    watched?: string;
  };
  gcodeAnalysis: {
    runAt?: string;
  };
  printer: {
    defaultExtrusionLength?: number;
  };
  scripts: {
    gcode?: {
      afterPrintCancelled?: string;
      "snippets/disable_bed"?: string;
      "snippets/disable_hotends"?: string;
    };
  };
  serial: {
    abortHeatupOnCancel?: boolean;
    ackMax?: number;
    additionalBaudrates?: Array<Record<string, any>>;
    additionalPorts?: Array<Record<string, any>>;
    alwaysSendChecksum?: boolean;
    autoconnect?: boolean;
    baudrate?: number;
    baudrateOptions?: Array<number>;
    blacklistedBaudrates?: Array<Record<string, any>>;
    blacklistedPorts?: Array<Record<string, any>>;
    blockWhileDwelling?: boolean;
    blockedCommands?: Array<string>;
    capAutoreportSdStatus?: boolean;
    capAutoreportTemp?: boolean;
    capBusyProtocol?: boolean;
    capEmergencyParser?: boolean;
    checksumRequiringCommands?: Array<string>;
    disableSdPrintingDetection?: boolean;
    disconnectOnErrors?: boolean;
    emergencyCommands?: Array<string>;
    exclusive?: boolean;
    externalHeatupDetection?: boolean;
    firmwareDetection?: boolean;
    helloCommand?: string;
    ignoreErrorsFromFirmware?: boolean;
    ignoreIdenticalResends?: boolean;
    log?: boolean;
    logPositionOnCancel?: boolean;
    logPositionOnPause?: boolean;
    longRunningCommands?: Array<string>;
    maxTimeoutsIdle?: number;
    maxTimeoutsLong?: number;
    maxTimeoutsPrinting?: number;
    neverSendChecksum?: boolean;
    notifySuppressedCommands?: string;
    pausingCommands?: Array<string>;
    port?: number;
    portOptions?: Array<Record<string, any>>;
    repetierTargetTemp?: boolean;
    resendRatioStart?: number;
    resendRatioThreshold?: number;
    sanityCheckTools?: boolean;
    sdAlwaysAvailable?: boolean;
    sdRelativePath?: boolean;
    sendM112OnError?: boolean;
    supportResendsWithoutOk?: string;
    swallowOkAfterResend?: boolean;
    timeoutBaudrateDetectionPause?: number;
    timeoutCommunication?: number;
    timeoutCommunicationBusy?: number;
    timeoutConnection?: number;
    timeoutDetectionConsecutive?: number;
    timeoutDetectionFirst?: number;
    timeoutPositionLogWait?: number;
    timeoutSdStatus?: number;
    timeoutSdStatusAutoreport?: number;
    timeoutTemperature?: number;
    timeoutTemperatureAutoreport?: number;
    timeoutTemperatureTargetSet?: number;
    triggerOkForM29?: boolean;
    useParityWorkaround?: string;
    waitForStart?: boolean;
  };
  server: {
    allowFraming?: boolean;
    commands?: {
      serverRestartCommand?: string;
      systemRestartCommand?: string;
      systemShutdownCommand?: string;
    };
    diskspace?: {
      critical?: number;
      warning?: number;
    };
    onlineCheck?: {
      enabled?: boolean;
      host?: string;
      interval?: number;
      name?: string;
      port?: number;
    };
    pluginBlacklist?: {
      enabled?: boolean;
      ttl?: number;
      url?: string;
    };
  };
  system: {
    actions?: Array<Record<string, any>>;
    events?: Record<string, any>;
  };
  temperature: {
    cutoff?: number;
    profiles?: Array<Record<string, any>>;
    sendAutomatically?: boolean;
    sendAutomaticallyAfter?: number;
  };
  terminalFilters?: Array<Record<string, any>>;
  webcam: {
    bitrate?: string;
    ffmpegPath?: string;
    ffmpegThreads?: number;
    ffmpegVideoCodec?: string;
    flipH?: boolean;
    flipV?: boolean;
    rotate90?: boolean;
    snapshotSslValidation?: boolean;
    snapshotTimeout?: number;
    snapshotUrl?: string;
    streamRatio?: string;
    streamTimeout?: number;
    streamUrl?: string;
    timelapseEnabled?: boolean;
    watermark?: boolean;
    webcamEnabled?: boolean;
  };
};
