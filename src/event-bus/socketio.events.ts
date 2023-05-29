export const sseMessageGlobal = "socketio-message-global";
export const socketIoTestPrinterUpdate = (correlationToken: string) =>
  `sse-message-test-printer-${correlationToken}`;
