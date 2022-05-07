import type { App, Plugin } from "vue";
import { SseClientManager } from "@/plugins/sse-client/sse-client-manager";
import type SseClient from "./sse-client";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $sse: SseClientManager;
    // Other example
    // $translate: (key: string) => string
  }
}

export const sseClientPlugin: Plugin = {
  install: (app: App, options: any) => {
    app.config.globalProperties.$sse = new SseClientManager(options);

    if (options && options.polyfill) {
      import("event-source-polyfill");
    }

    // This mixin allows components to specify that all clients that were
    // created within it should be automatically disconnected (cleanup)
    // when the component is destroyed.
    app.mixin({
      beforeCreate() {
        if (this.$options.sse && this.$options.sse.cleanup) {
          // We instantiate an SseClientManager for this specific instance
          // in order to track it (see discussions in #13 for rationale).
          this.$sse = new SseClientManager();

          // We also set $clients to an empty array, as opposed to null,
          // so that beforeDestroy and create know to use it.
          this.$sse.$clients = [];
        }
      },
      beforeDestroy() {
        if (this.$sse.$clients !== null) {
          this.$sse.$clients.forEach((c: SseClient) => c.disconnect());
          this.$sse.$clients = [];
        }
      },
    });
  },
};
