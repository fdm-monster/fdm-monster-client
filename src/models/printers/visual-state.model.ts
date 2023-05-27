import { CurrentOrHistoryPayload } from "./printer-current-job.model";

export interface PrinterState {
  connected: {
    payload: any;
    receivedAt: number;
  };
  plugins: any[];
  events: any[];
  current: {
    payload: CurrentOrHistoryPayload;
    receivedAt: number;
  };
  history: {
    payload: CurrentOrHistoryPayload;
    receivedAt: number;
  };
}
