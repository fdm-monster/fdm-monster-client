import type {
  HostState,
  PrinterState,
  WebsocketState,
} from "@/models/printers/visual-state.model";
import type { CostSettings } from "@/models/printers/cost-settings.model";
import type {
  PrinterCurrentJob,
  PrinterJob,
} from "@/models/printers/printer-current-job.model";
import type { ConnectionOptions } from "@/models/printers/connection-options.model";
import type { PrinterProfile } from "@/models/printers/printer-profile.model";

export interface ApiAccessibility {
  accessible: boolean;
  retryable: boolean;
  reason: string;
}

export const UUID_LENGTH = 32;

export interface LoginDetails {
  apiKey: string;
  printerURL: string;
}

export interface Printer {
  id: string;
  correlationToken?: string;
  printerState: PrinterState;
  hostState: HostState;
  apiAccessibility: ApiAccessibility;
  webSocketState: WebsocketState;
  costSettings: CostSettings;
  currentJob: PrinterCurrentJob | PrinterJob;

  enabled: boolean;
  display: true;
  sortIndex: number;
  printerName: string;
  webSocketURL: string;
  camURL: string;
  apiKey: string;
  printerURL: string;
  group: string;

  connectionOptions: ConnectionOptions;
  currentProfile: PrinterProfile;
  octoPrintSystemInfo: any;
  corsCheck: true;
  stepSize: 0.1 | 1 | 10 | 100;
  alerts: null;
  otherSettings: {
    temperatureTriggers: any;
    system: {
      commands: any;
    };
    webCamSettings: any;
  };
  octoPi: {
    version: string;
    model: string;
  };
  tools: {
    time: number;
    bed: { actual: number };
    chamber: {
      actual: number;
    };
  }[];
  gcodeScripts: any;
  octoPrintVersion: string;
  selectedFilament: any[];
}
