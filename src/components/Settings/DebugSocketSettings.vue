<template>
  <v-card>
    <SettingsToolbar :icon="page.icon" :title="page.title" />
    <v-card-text class="pa-2">
      <!-- Controls -->
      <div class="d-flex align-center flex-wrap gap-2 mb-2">
        <v-btn
          :color="debugStore.enabled ? 'error' : 'success'"
          small
          @click="toggleCapture"
        >
          <v-icon small class="mr-1">{{
            debugStore.enabled ? "stop" : "play_arrow"
          }}</v-icon>
          {{ debugStore.enabled ? "Stop" : "Start" }}
        </v-btn>

        <v-btn
          :disabled="!debugStore.enabled"
          :color="debugStore.paused ? 'warning' : 'default'"
          small
          @click="debugStore.togglePause()"
        >
          <v-icon small class="mr-1">{{
            debugStore.paused ? "play_arrow" : "pause"
          }}</v-icon>
          {{ debugStore.paused ? "Resume" : "Pause" }}
        </v-btn>

        <v-btn small color="default" @click="debugStore.clearMessages()">
          <v-icon small class="mr-1">delete</v-icon>
          Clear
        </v-btn>

        <v-spacer />

        <v-chip small outlined>
          {{ debugStore.filteredMessages.length }} /
          {{ debugStore.messageCount }} messages
        </v-chip>

        <v-text-field
          v-model="filterText"
          dense
          hide-details
          outlined
          placeholder="Filter..."
          prepend-inner-icon="search"
          clearable
          style="max-width: 200px"
          @input="onFilterChange"
        />

        <v-checkbox
          v-model="autoScroll"
          dense
          hide-details
          label="Auto-scroll"
          class="mt-0 pt-0"
        />
      </div>

      <!-- Messages List -->
      <div ref="messagesContainer" class="messages-container">
        <div
          v-for="msg in debugStore.filteredMessages"
          :key="msg.id"
          class="message-row"
          @click="openJsonViewer(msg)"
        >
          <span class="msg-time">{{ formatTime(msg.timestamp) }}</span>
          <v-chip
            x-small
            :color="msg.direction === 'in' ? 'blue' : 'green'"
            class="msg-direction"
          >
            {{ msg.direction === "in" ? "IN" : "OUT" }}
          </v-chip>
          <span class="msg-event">{{ msg.event }}</span>
          <span class="msg-preview">{{ getPreview(msg.data) }}</span>
        </div>

        <div v-if="debugStore.filteredMessages.length === 0" class="no-messages">
          <v-icon large color="grey">speaker_notes_off</v-icon>
          <div class="mt-2 grey--text">
            {{
              debugStore.enabled
                ? "Waiting for messages..."
                : "Click Start to begin capturing"
            }}
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick } from "vue";
import { useDebugSocketStore, SocketMessage } from "@/store/debug-socket.store";
import { useDialog } from "@/shared/dialog.composable";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import SettingsToolbar from "@/components/Settings/Shared/SettingsToolbar.vue";
import { settingsPage } from "@/components/Settings/Shared/setting.constants";

const page = settingsPage["debugSocket"];
const debugStore = useDebugSocketStore();
const jsonViewerDialog = useDialog(DialogName.JsonViewerDialog);

const filterText = ref("");
const autoScroll = ref(true);
const messagesContainer = ref<HTMLElement | null>(null);

function toggleCapture() {
  if (debugStore.enabled) {
    debugStore.disable();
  } else {
    debugStore.enable();
  }
}

function onFilterChange() {
  debugStore.setFilter(filterText.value || "");
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
}

function getPreview(data: unknown): string {
  try {
    const str = JSON.stringify(data);
    return str.length > 100 ? str.substring(0, 100) + "..." : str;
  } catch {
    return String(data);
  }
}

function openJsonViewer(msg: SocketMessage) {
  jsonViewerDialog.openDialog({
    title: `${msg.event} (${msg.direction === "in" ? "Received" : "Sent"})`,
    data: msg.data,
  });
}

// Auto-scroll when new messages arrive
watch(
  () => debugStore.messages.length,
  async () => {
    if (autoScroll.value && messagesContainer.value) {
      await nextTick();
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  }
);
</script>

<style scoped>
.messages-container {
  height: calc(100vh - 280px);
  min-height: 300px;
  overflow-y: auto;
  background-color: #1a1a1a;
  border-radius: 4px;
  font-family: "Fira Code", "Consolas", monospace;
  font-size: 11px;
}

.message-row {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-bottom: 1px solid #2a2a2a;
  cursor: pointer;
  gap: 8px;
}

.message-row:hover {
  background-color: #2a2a2a;
}

.msg-time {
  color: #888;
  white-space: nowrap;
  flex-shrink: 0;
}

.msg-direction {
  flex-shrink: 0;
}

.msg-event {
  color: #e5c07b;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.msg-preview {
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.no-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
}

.gap-2 {
  gap: 8px;
}
</style>
