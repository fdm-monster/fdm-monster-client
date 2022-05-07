import { EventSourcePolyfill } from "event-source-polyfill";
import type {
  MessageFormatter,
  MessageHandler,
  SSEConfig,
} from "@/plugins/sse-client/index";

export const formatText = (e: any) => e.data;

export const formatJSON = (e: any) => JSON.parse(e.data);

export default class SseClient {
  url: string;
  withCredentials: boolean;

  _format: MessageFormatter<any>;
  _handlers: Partial<Record<string, MessageHandler[]>> = {};
  _listeners: Partial<Record<string, EventListener>>;
  _source: EventSource | null;

  polyfillOptions: any;
  forcePolyfill: boolean;

  constructor(config: SSEConfig) {
    this._handlers = {};
    this._listeners = {};
    this._source = null;

    if (config.format) {
      if (typeof config.format === "string") {
        if (config.format === "plain") {
          this._format = formatText;
        } else if (config.format === "json") {
          this._format = formatJSON;
        } else {
          this._format = formatText;
        }
      } else if (typeof config.format === "function") {
        this._format = config.format;
      } else {
        this._format = formatText;
      }
    } else {
      this._format = formatText;
    }

    if (config.handlers) {
      for (const event in config.handlers) {
        this.on(event, config.handlers[event]);
      }
    }

    this.url = config.url;
    this.withCredentials = !!config.withCredentials;
    this.polyfillOptions = config.polyfillOptions || {};
    this.forcePolyfill = !!config.forcePolyfill;
  }

  get source() {
    return this._source;
  }

  connect(): Promise<SseClient> {
    if (this.forcePolyfill) {
      this._source = new EventSourcePolyfill(
        this.url,
        Object.assign({}, this.polyfillOptions, {
          withCredentials: this.withCredentials,
        })
      );
    } else {
      this._source = new window.EventSource(this.url, {
        withCredentials: this.withCredentials,
      });
    }

    return new Promise((resolve, reject) => {
      if (!this._source) {
        reject();
        return;
      }
      this._source.onopen = () => {
        // Add event listeners that were added before we connected
        for (let event in this._listeners) {
          this._source!.addEventListener(event, this._listeners[event]!);
        }

        this._source!.onerror = null;

        resolve(this);
      };

      this._source.onerror = reject;
    });
  }

  disconnect() {
    if (this._source !== null) {
      this._source.close();
      this._source = null;
    }
  }

  on(event: any, handler: any) {
    if (!event) {
      // Default "event-less" event
      event = "message";
    }

    if (!this._listeners[event]) {
      this._create(event);
    }

    this._handlers[event]?.push(handler);

    return this;
  }

  once(event: any, handler: any) {
    this.on(event, (e: any) => {
      this.off(event, handler);

      handler(e);
    });

    return this;
  }

  off(event: any, handler: any) {
    if (!this._handlers[event]) {
      // no handlers registered for event
      return this;
    }

    const idx = this._handlers[event]!.indexOf(handler);
    if (idx === -1) {
      // handler not registered for event
      return this;
    }

    // remove handler from event
    this._handlers[event]!.splice(idx, 1);

    if (!this._handlers[event]?.length) {
      // remove listener since no handlers exist
      this._source!.removeEventListener(event, this._listeners[event]!);
      delete this._handlers[event];
      delete this._listeners[event];
    }

    return this;
  }

  _create(event: any) {
    this._handlers[event] = [];

    this._listeners[event] = (message: any) => {
      let data: any;

      try {
        data = this._format(message);
      } catch (err: any) {
        if (typeof this._source!.onerror === "function") {
          this._source!.onerror(err);
        }
        return;
      }

      this._handlers[event]?.forEach((handler: any) =>
        handler(data, message.lastEventId)
      );
    };

    if (this._source) {
      this._source.addEventListener(event, this._listeners[event]!);
    }
  }
}
