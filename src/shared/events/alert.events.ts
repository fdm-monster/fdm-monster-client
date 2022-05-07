import type { EventBusKey } from "@vueuse/core";

const piniaErrorEvent = "store-axios-error";
export const piniaErrorKey: EventBusKey<any> = Symbol(piniaErrorEvent);
const appErrorEvent = "app-error";
export const appErrorKey: EventBusKey<any> = Symbol(appErrorEvent);

// message, progress
const infoMessageEvent = "info-message";
export const infoMessageKey: EventBusKey<any> = Symbol(infoMessageEvent);
const uploadMessageEvent = "upload-message";
export const uploadMessageKey: EventBusKey<any> = Symbol(uploadMessageEvent);

export enum InfoEventType {
  UPLOAD_BACKEND,
  UPLOAD_FRONTEND,
}

export const eventTypeToMessage = (type: InfoEventType, count: number) => {
  if (type === InfoEventType.UPLOAD_BACKEND) {
    return `Server is sending file(s) (${count})`;
  } else if (type === InfoEventType.UPLOAD_FRONTEND) {
    return `Uploading file(s) to server (${count})`;
  } else {
    return `Uploading file(s)`;
  }
};
