import { PrinterStateDto, SocketState } from "@/models/socketio-messages/socketio-message.model";
import { PrinterDto } from "@/models/printers/printer.model";
import { useSettingsStore } from "@/store/settings.store";

const COLOR = {
  danger: "danger",
  dark: "dark",
  secondary: "secondary",
  success: "success",
} as const;

const RGB = {
  DarkBlue: "#050c2e",
  Black: "#000000",
  DarkGray: "#59c500",
  LightBrown: "#ffb819",
  Brown: "#580e47",
  Red: "#bd3322",
} as const;

const LABEL = {
  Disabled: "Disabled",
  Maintenance: "Maintenance",
  Offline: "Offline",
  Finding: "Finding",
  Disconnected: "Disconnected",
  Error: "Error",
  Paused: "Paused",
  Operational: "Operational",
  Printing: "Printing",
} as const;

export function interpretStates(
  printer: PrinterDto,
  socketState: SocketState,
  printerState: PrinterStateDto
) {
  const settingsStore = useSettingsStore();
  const debugPrinterInterpretState =
    settingsStore.frontendDebugSettings.showInterpretedPrinterState;
  const state = {};

  // Disabled/maintenance printers
  if (!printer.enabled) {
    if (printer.disabledReason?.length) {
      return {
        ...state,
        color: COLOR.danger,
        rgb: RGB.Black,
        text: LABEL.Maintenance,
      };
    }
    return {
      ...state,
      color: COLOR.secondary,
      rgb: RGB.DarkBlue,
      text: LABEL.Disabled,
    };
  }

  // Basic necessity to parse API/Websocket states
  const responding = socketState?.api === "responding";
  const authFail = socketState?.api === "authFail";
  if (!responding || !socketState) {
    const noResponse = socketState?.api === "noResponse";
    return {
      ...state,
      color: COLOR.secondary,
      rgb: RGB.Red,
      text: authFail ? "API key wrong" : noResponse ? "API unreachable" : socketState?.api || "-",
    };
  }

  // Socket state and USB connected
  const socketAuthenticated = socketState.socket === "authenticated";
  const socketAuthing = socketState.socket === "authenticating";
  const currentState = printerState?.current?.payload?.state;

  // History might be way outdated
  // if (!currentState) {
  //   currentState = printerState?.history?.payload?.state;
  // }

  const flags = currentState?.flags;
  if (!socketAuthenticated || !flags) {
    const s = socketAuthenticated ? 1 : 0;
    const sa = socketAuthing ? 1 : 0;
    const p = printerState ? 1 : 0;

    if (debugPrinterInterpretState) {
      console.debug(
        `Id ${printer.id}, Socket opened ${s}, socketAuthing ${sa} printerState ${p}, 
      currentState: ${currentState}, FLAGS ${JSON.stringify(flags, null, 2)}`
      );
    }

    return {
      ...state,
      color: !printerState ? COLOR.danger : COLOR.dark,
      rgb: RGB.Red,
      text: !printerState ? "No USB" : "Awaiting state",
    };
  }

  if (!flags) {
    console.error("No flags", flags);
    return;
  }

  if (!flags.operational || flags.error || flags.closedOrError) {
    return {
      ...state,
      color: COLOR.danger,
      rgb: RGB.Red,
      text: currentState.text?.replace("Offline", "Disconnected") || LABEL.Error,
      description: currentState.error,
    };
  } else if (flags.paused || flags.pausing) {
    return {
      ...state,
      color: COLOR.success,
      rgb: RGB.Brown,
      text: LABEL.Paused,
    };
  } else if (flags.printing) {
    return {
      ...state,
      color: COLOR.success,
      rgb: RGB.LightBrown,
      text: LABEL.Printing,
    };
  } else {
    return {
      ...state,
      color: COLOR.dark,
      rgb: RGB.DarkGray,
      text: LABEL.Operational,
      description: currentState.error,
    };
  }
}

const toCurrentState = (printerState: PrinterStateDto) => printerState?.current?.payload?.state;

export const isPrinterPrinting = (printerState: PrinterStateDto) =>
  toCurrentState(printerState)?.flags?.printing;

export const isPrinterPaused = (printerState: PrinterStateDto) =>
  toCurrentState(printerState)?.flags?.paused || toCurrentState(printerState)?.flags?.pausing;

export const isPrinterDisconnected = (printer: PrinterDto, printerState: PrinterStateDto) =>
  (!isPrinterInMaintenance(printer) &&
    printer?.enabled &&
    !toCurrentState(printerState)?.flags?.operational) ||
  toCurrentState(printerState)?.flags?.error ||
  toCurrentState(printerState)?.flags?.closedOrError;

export const isPrinterDisabled = (printer: PrinterDto) =>
  !isPrinterInMaintenance(printer) && !printer?.enabled;

export const isPrinterInMaintenance = (printer?: PrinterDto) =>
  !printer?.enabled && printer?.disabledReason?.length;

export const isPrinterIdling = (printer: PrinterDto, printerState: PrinterStateDto) =>
  toCurrentState(printerState)?.flags &&
  !toCurrentState(printerState)?.flags?.printing &&
  toCurrentState(printerState)?.flags?.operational &&
  !isPrinterDisabled(printer) &&
  !isPrinterInMaintenance(printer);
