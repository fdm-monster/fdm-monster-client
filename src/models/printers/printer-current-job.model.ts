export interface BusyFile {
  origin: string;
  path: string;
}

export interface Marking {
  time: number;
  type: string;
}

export interface Offsets {
  bedTemp?: number;
  tool0Temp?: number;
  tool1Temp?: number;
}

export interface Temp {
  bed: number;
  chamber: number;
  time: number;
  tool0: number;
  tool1?: number;
}

export interface PrinterJob {
  busyFiles: BusyFile[];
  currentZ?: number;
  markings: Marking[];
  logs: string[];
  messages: string[];
  offsets: Offsets;
  progress: {
    completion: number;
    filepos: number;
    printTime: number;
    printTimeLeft: number;
    printTimeLeftOrigin: string;
  };
  job: {
    file: {
      date: number;
      display: string;
      name: string;
      origin: string;
      path: string;
      size: number;
    };
    averagePrintTime: number;
    estimatedPrintTime: number;
    filament: {
      tool0: {
        length: number;
        volume: number;
      };
    };
    lastPrintTime: number;
    user: string;
  };
  resends: {
    count: number;
    ratio: number;
    transmitted: number;
  };
  serverTime: number;
  state: {
    error: string;
    flags: {
      cancelling: boolean;
      closedOrError: boolean;
      error: boolean;
      finishing: boolean;
      operational: boolean;
      paused: boolean;
      pausing: boolean;
      printing: boolean;
      ready: boolean;
      resuming: boolean;
      sdReady: boolean;
      starting: boolean;
      updating: boolean;
    };
    text: string;
  };
  temps: Temp[];
}
