import { PrinterState } from "../models/printers/visual-state.model";
import { Printer } from "../models/printers/printer.model";
import { SocketState } from "../models/socketio-messages/socketio-message.model";
import { useSettingsStore } from "../store/settings.store";

const COLOR = {
  danger: "danger",
  dark: "dark",
  secondary: "secondary",
  success: "success",
} as const;

const RGB = {
  DarkBlue: "#050c2e",
  Black: "#000000",
  DarkGray: "#262626",
  LightBrown: "#583c0e",
  Brown: "#580e47",
  Red: "#2e0905",
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
  printer: Printer,
  socketState: SocketState,
  printerState: PrinterState
) {
  const settingsStore = useSettingsStore();
  const debugPrinterInterpreteState = settingsStore.debugSettings.showInterpretedPrinterState;
  const state = {};

  // Disabled/maintenance printers
  if (!printer.enabled) {
    if (printer.disabledReason?.length) {
      return {
        ...state,
        color: COLOR.danger,
        rgb: RGB.Black,
        text: LABEL.Maintenance,
        description: printer.disabledReason,
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
    return {
      ...state,
      color: COLOR.secondary,
      rgb: RGB.Red,
      text: "Could not connect to API",
    };
  }

  // First level: API/socket
  const socketOpened = socketState.socket === "opened" || socketState.socket === "silent";
  const socketAuthing = socketState.socket === "authenticating";
  // Backend has concluded that things are not retryable
  if (!responding) {
    return {
      ...state,
      color: COLOR.danger,
      rgb: RGB.Red,
      text: authFail ? "API key wrong" : "No API connection",
    };
  }

  const isUsbConnected = printerState?.current?.payload.state.flags.operational;
  const currentState = printerState.current?.payload.state;
  const flags = currentState?.flags;
  if (!socketOpened || !flags) {
    const s = socketOpened ? 1 : 0;
    const sa = socketAuthing ? 1 : 0;
    const p = printerState ? 1 : 0;
    if (debugPrinterInterpreteState)
      console.debug(
        `Socket opened ${s}, socketAuthing ${sa} printerState ${p}, 
      currentState: ${currentState}, FLAGS ${flags}`
      );
    return {
      ...state,
      color: COLOR.danger,
      rgb: RGB.Red,
      // TODO provide shorter alternative that fits smaller tile mode?
      text: !isUsbConnected ? "No USB Connected" : `S${s} SA${sa} | P${p}`,
    };
  }

  // if (printerState?.expired) {
  //   return {
  //     ...state,
  //     color: COLOR.danger,
  //     rgb: RGB.Red,
  //     text: LABEL.Disconnected,
  //     description: printerState.text || "Please check if the USB cable was disconnected/broken",
  //   };

  if (!flags) {
    console.error("No flags", flags);
    return;
  }

  if (flags.error || flags.closedOrError) {
    return {
      ...state,
      color: COLOR.danger,
      rgb: RGB.Red,
      text: currentState.text || LABEL.Error,
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
