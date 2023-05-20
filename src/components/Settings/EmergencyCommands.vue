<template>
  <v-card>
    <v-toolbar color="primary">
      <v-avatar>
        <v-icon>settings</v-icon>
      </v-avatar>
      <v-toolbar-title>Emergency Commands</v-toolbar-title>
    </v-toolbar>
    <v-list subheader three-line>
      <v-subheader>Emergency Commands to rectify problematic situations</v-subheader>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Server commands</v-list-item-title>
          <v-list-item-subtitle>
            Restart the server
            <br />
            <v-btn color="primary" @click="restartServer()">Restart server</v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Batch USB connect</v-list-item-title>
          <v-list-item-subtitle>
            Connect all USB devices
            <br />
            <v-btn color="primary" @click="connectUSBs()" :disabled="!hasConnectUsbFeature">
              <v-icon class="mr-2">usb</v-icon>
              Connect USBs</v-btn
            >
            <v-alert v-if="!hasConnectUsbFeature">
              <v-icon class="mr-2">warning</v-icon>
              This feature is not available, please update the FDM Monster server
            </v-alert>
          </v-list-item-subtitle>
          <v-list-item-subtitle class="mt-2">
            Connect all Sockets
            <br />
            <v-btn color="primary" @click="connectSockets()" :disabled="!hasConnectSocketFeature">
              <v-icon class="mr-2">hub</v-icon>
              Connect Sockets</v-btn
            >
          </v-list-item-subtitle>
          <v-alert v-if="!hasConnectSocketFeature">
            <v-icon class="mr-2">warning</v-icon>
            This feature is not available, please update the FDM Monster server
          </v-alert>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ServerPrivateService } from "@/backend/server-private.service";
import { BatchService } from "../../backend/batch.service";
import { usePrinterStore } from "../../store/printer.store";
import { useFeatureStore } from "../../store/features.store";

interface Data {
  property: number;
}

export default defineComponent({
  name: "EmergencyCommands",
  setup: () => {
    return {
      printerStore: usePrinterStore(),
      featureStore: useFeatureStore(),
    };
  },
  props: {},
  data: (): Data => ({
    property: 0,
  }),
  async created() {},
  async mounted() {},
  computed: {
    hasConnectUsbFeature() {
      return this.featureStore.hasFeature("batchConnectUsbCalls");
    },
    hasConnectSocketFeature() {
      return this.featureStore.hasFeature("batchConnectSocketCalls");
    },
  },
  methods: {
    async restartServer() {
      await ServerPrivateService.restartServer();
    },
    async connectUSBs() {
      if (!confirm("Are you sure you want to connect all USBs?")) {
        return;
      }
      const printerIds = this.printerStore.printers.map((p) => p.id);
      await BatchService.batchConnectUsb(printerIds);
    },
    async connectSockets() {
      if (!confirm("Are you sure you want to connect all sockets?")) {
        return;
      }
      const printerIds = this.printerStore.printers.map((p) => p.id);
      await BatchService.batchConnectSocket(printerIds);
    },
  },
  watch: {},
});
</script>
