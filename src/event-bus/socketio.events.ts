export const sseMessageGlobal = "socketio-message-global";
export const socketIoFloors = "socketio-floors";
export const sseTestPrinterUpdate = (correlationToken: string) =>
  `sse-message-test-printer-${correlationToken}`;
