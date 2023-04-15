export const sseMessageGlobal = "sse-message-global";
export const socketIoFloors = "sse-floors";
export const sseTestPrinterUpdate = (correlationToken: string) =>
  `sse-message-test-printer-${correlationToken}`;
