import SseClient, { formatText } from "@/plugins/sse-client/sse-client";
import type { SSEConfig } from "@/plugins/sse-client/index";

export class SseClientManager {
  readonly $defaultConfig: SSEConfig;
  $clients: SseClient[] | null;

  constructor(config?: SSEConfig) {
    this.$defaultConfig = Object.assign(
      {
        format: formatText,
        sendCredentials: false,
      },
      config
    );

    this.$clients = null;
  }

  public create(configOrURL?: SSEConfig | string): SseClient {
    let config;
    if (typeof configOrURL === "object") {
      config = configOrURL;
    } else if (typeof configOrURL === "string") {
      config = {
        url: configOrURL,
      };
    } else {
      config = {};
    }

    const client = new SseClient(
      Object.assign({}, this.$defaultConfig, config)
    );

    // If $clients is not null, then it's array that we should push this
    // client into for later cleanup in our mixin's beforeDestroy.
    if (this.$clients !== null) {
      this.$clients.push(client);
    }

    return client;
  }
}
