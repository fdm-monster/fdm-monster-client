import { defineStore } from "pinia";

export interface SocketMessage {
  id: number;
  timestamp: Date;
  direction: "in" | "out";
  event: string;
  data: unknown;
}

interface State {
  messages: SocketMessage[];
  maxMessages: number;
  enabled: boolean;
  paused: boolean;
  filter: string;
}

let messageIdCounter = 0;

export const useDebugSocketStore = defineStore("DebugSocket", {
  state: (): State => ({
    messages: [],
    maxMessages: 500,
    enabled: false,
    paused: false,
    filter: "",
  }),
  getters: {
    filteredMessages(): SocketMessage[] {
      if (!this.filter) return this.messages;
      const lowerFilter = this.filter.toLowerCase();
      return this.messages.filter(
        (m) =>
          m.event.toLowerCase().includes(lowerFilter) ||
          JSON.stringify(m.data).toLowerCase().includes(lowerFilter)
      );
    },
    messageCount(): number {
      return this.messages.length;
    },
  },
  actions: {
    enable() {
      this.enabled = true;
    },
    disable() {
      this.enabled = false;
    },
    togglePause() {
      this.paused = !this.paused;
    },
    logMessage(direction: "in" | "out", event: string, data: unknown) {
      if (!this.enabled || this.paused) return;

      const message: SocketMessage = {
        id: ++messageIdCounter,
        timestamp: new Date(),
        direction,
        event,
        data,
      };

      this.messages.push(message);

      // Trim old messages if over limit
      if (this.messages.length > this.maxMessages) {
        this.messages = this.messages.slice(-this.maxMessages);
      }
    },
    clearMessages() {
      this.messages = [];
    },
    setFilter(filter: string) {
      this.filter = filter;
    },
    setMaxMessages(max: number) {
      this.maxMessages = max;
      if (this.messages.length > max) {
        this.messages = this.messages.slice(-max);
      }
    },
  },
});
