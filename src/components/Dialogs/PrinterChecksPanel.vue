<template>
  <v-col :cols="cols">
    <strong>Checks:</strong>
    <v-alert
      v-if="testProgress && isSet(testProgress.connected)"
      :type="testProgress.connected ? 'success' : 'error'"
      dense
    >
      <small>Connected</small>
    </v-alert>
    <v-alert
      v-if="testProgress && isSet(testProgress.apiOk)"
      :type="testProgress.apiOk ? 'success' : 'error'"
      dense
    >
      <small>API ok</small>
    </v-alert>
    <v-alert
      v-if="testProgress && isSet(testProgress.apiKeyNotGlobal)"
      :type="testProgress.apiKeyNotGlobal ? 'success' : 'error'"
      dense
    >
      <small>Key not Global API Key</small>
    </v-alert>
    <v-alert
      v-if="testProgress && isSet(testProgress.apiKeyOk)"
      :type="testProgress.apiKeyOk ? 'success' : 'error'"
      dense
    >
      <small>Key accepted</small>
    </v-alert>
    <v-alert
      v-if="testProgress && isSet(testProgress.websocketBound)"
      :type="testProgress.websocketBound ? 'success' : 'error'"
      dense
    >
      <small>WebSocket bound</small>
    </v-alert>

    <slot></slot>
  </v-col>
</template>

<script lang="ts" setup>
import type { TestProgressDetails } from "@/models/sse-messages/printer-sse-message.model";
const { testProgress } = defineProps<{ testProgress: TestProgressDetails }>();

const cols = 4;

function isSet(value?: boolean) {
  return value === true || value === false;
}
</script>
