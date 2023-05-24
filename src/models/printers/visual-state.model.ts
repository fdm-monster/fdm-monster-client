export type PSTATE = string;
export type CATEGORY = string;
export type ColourLabel = "dark" | "success" | "warning" | "danger" | "secondary";

export interface StateFlags {
  operational: boolean;
  printing?: boolean;
  cancelling?: boolean;
  pausing?: boolean;
  resuming?: boolean;
  finishing?: boolean;
  closedOrError?: boolean;
  error?: boolean;
  paused?: boolean;
  ready?: boolean;
  sdReady?: boolean;
}

export interface PrinterState {
  current: {
    payload: {
      progress: {
        completion: number;
        filepos: number;
        printTime: number;
        printTimeLeft: number;
        printTimeLeftOrigin: string;
      };
      state: {
        flags: StateFlags;
        error: string;
        text: string;
      };
      receivedAt: number;
    };
  };
}
