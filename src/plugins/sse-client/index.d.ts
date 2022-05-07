export type MessageFormatter<T> = (event: MessageEvent) => T;
export type MessageHandler = (data: any, lastEventId: string) => void;

export interface SSEConfig {
  format?: "plain" | "json" | MessageFormatter<any>;
  handlers?: Partial<Record<string, MessageHandler>>;
  polyfill?: boolean;
  url: string;
  withCredentials?: boolean;
  polyfillOptions?: any;
  forcePolyfill?: boolean;
}
