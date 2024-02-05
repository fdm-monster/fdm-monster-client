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
            <v-btn color="primary" disabled @click="restartServer()"
              >Restart server (does not work yet)
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Batch disabling</v-list-item-title>
          <v-list-item-subtitle>
            Disable all printers in batch (will not affect print)
            <br />
            <v-btn color="primary" @click="batchToggleEnabled(false)">Batch disable</v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Batch enabling</v-list-item-title>
          <v-list-item-subtitle>
            Enabling all printers in batch (will not affect print and it will skip printers in
            maintenance mode)
            <br />
            <v-btn color="primary" @click="batchToggleEnabled(true)">Batch enable</v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Batch USB connect</v-list-item-title>
          <v-list-item-subtitle>
            Connect all USB devices
            <br />
            <v-btn :disabled="!hasConnectUsbFeature" color="primary" @click="connectUSBs()">
              <v-icon class="mr-2">usb</v-icon>
              Connect USBs
            </v-btn>
            <v-alert v-if="!hasConnectUsbFeature">
              <v-icon class="mr-2">warning</v-icon>
              This feature is not available, please update the FDM Monster server
            </v-alert>
          </v-list-item-subtitle>
          <v-list-item-subtitle class="mt-2">
            Connect all Sockets
            <br />
            <v-btn :disabled="!hasConnectSocketFeature" color="primary" @click="connectSockets()">
              <v-icon class="mr-2">hub</v-icon>
              Connect Sockets
            </v-btn>
          </v-list-item-subtitle>
          <v-alert v-if="!hasConnectSocketFeature">
            <v-icon class="mr-2">warning</v-icon>
            This feature is not available, please update the FDM Monster server
          </v-alert>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <div class="ma-3">
      <v-alert>Test all OctoPrint response times</v-alert>
      <div class="ml-6">
        <v-btn color="primary" @click="clickFetchNameState()"> Measure response times</v-btn>
      </div>
      <div class="ml-7 mt-3">
        <span v-if="namesFetched"> Response times: </span>
        <Bar v-if="namesFetched" :data="chartConfig" :options="chartOptions" height="40" />
        <span v-else>A graph will be shown, presenting the times in milliseconds (ms)</span>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { ServerPrivateService } from "@/backend/server-private.service";
import { BatchService } from "@/backend/batch.service";
import { usePrinterStore } from "@/store/printer.store";
import { useFeatureStore } from "@/store/features.store";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartData,
  ChartOptions,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "vue-chartjs";
import { IdType } from "@/utils/id.type";
import { OctoPrintSettingsDto } from "@/backend/dto/octoprint-settings.dto";
import { sleep } from "@/utils/time.utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export type BatchOctoPrintSettingsDto = {
  success: boolean;
  printerId: IdType;
  time: number;
  value?: OctoPrintSettingsDto;
  error?: string;
};

const printerStore = usePrinterStore();
const featureStore = useFeatureStore();

const namesFetched = ref(false);
const fetchedNames = ref<string[]>([]);

const failedPrinters = ref<any[]>([]);
const responseTimesAvg = ref(NaN);
const responseTimesMax = ref(NaN);
const responseTimesMin = ref(NaN);
const chartConfig = ref<ChartData>({
  labels: [],
  datasets: [
    {
      label: "OctoPrint Settings response times (ms)",
      data: [],
      borderColor: "#FF6384",
      backgroundColor: "#ffffff",
    },
  ],
});

const chartOptions: ChartOptions = {
  color: "white",
  plugins: {
    title: {
      color: "red",
      text: "Response times (ms)",
      display: true,
    },
  },
  responsive: true,
};

const hasConnectUsbFeature = computed(() => {
  return featureStore.hasFeature("batchConnectUsbCalls");
});
const hasConnectSocketFeature = computed(() => {
  return featureStore.hasFeature("batchConnectSocketCalls");
});

async function clickFetchNameState() {
  const printerIds = printerStore.printers.map((p) => p.id);
  const printerSettingsBatch = (await BatchService.batchSettingsGet(
    printerIds
  )) as BatchOctoPrintSettingsDto[];
  const names = printerSettingsBatch.map((s) => s.value?.appearance?.name || "ERROR");
  failedPrinters.value = printerSettingsBatch
    .filter((nb) => !nb.success)
    .map((e) => ({
      message: e.error,
    }));

  const times = printerSettingsBatch.map((n) => n.time);
  const labels = printerSettingsBatch.map((n) => n.value?.appearance?.name);
  responseTimesAvg.value = times.reduce((a: number, b: number) => a + b, 0) / times.length;
  responseTimesMin.value = Math.min(...times);
  responseTimesMax.value = Math.max(...times);
  chartConfig.value = {
    labels,
    datasets: [
      {
        label: "OctoPrint Settings response times (ms)",
        data: times,
        borderColor: "#FF6384",
        backgroundColor: "#ffffff",
      },
    ],
  };

  await sleep(500);

  namesFetched.value = true;
  fetchedNames.value = names;
}

async function restartServer() {
  await ServerPrivateService.restartServer();
}

async function batchToggleEnabled(enabled: boolean) {
  if (!confirm("Are you sure you want to toggle all printers?")) {
    return;
  }

  const printerIds = printerStore.printers.map((p) => p.id);
  await BatchService.batchToggleEnabled(printerIds, enabled);
}

async function connectUSBs() {
  if (!confirm("Are you sure you want to connect all USBs?")) {
    return;
  }
  const printerIds = printerStore.printers.map((p) => p.id);
  await BatchService.batchConnectUsb(printerIds);
}

async function connectSockets() {
  if (!confirm("Are you sure you want to connect all sockets?")) {
    return;
  }
  const printerIds = printerStore.printers.map((p) => p.id);
  await BatchService.batchConnectSocket(printerIds);
}
</script>
