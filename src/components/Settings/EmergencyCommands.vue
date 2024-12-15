<template>
  <v-card>
    <SettingsToolbar :icon="page.icon" :title="page.title" />

    <v-list subheader>
      <v-subheader>Emergency Commands to rectify problematic situations</v-subheader>

      <!-- Server Commands -->
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Server commands</v-list-item-title>
          <v-list-item-subtitle>
            <span>Restart the server to resolve any active issues</span>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-btn :disabled="isLoading" color="primary" @click="restartServer" class="ml-4">
          Restart server
        </v-btn>
        <v-progress-circular v-if="isLoading" indeterminate size="30" width="4" class="ml-2" />
      </v-list-item>

      <!-- Batch Disabling -->
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Batch disabling</v-list-item-title>
          <v-list-item-subtitle>
            <span>Disable all printers at once without affecting ongoing prints</span>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-btn
          :disabled="isLoading || noPrintersOrAllDisabled"
          color="primary"
          @click="batchToggleEnabled(false)"
          class="ml-4"
        >
          Batch disable
        </v-btn>
        <v-progress-circular v-if="isLoading" indeterminate size="30" width="4" class="ml-2" />
        <v-icon v-if="noPrintersOrAllDisabled" color="warning" class="ml-2"> warning </v-icon>
      </v-list-item>

      <!-- Batch Enabling -->
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Batch enabling</v-list-item-title>
          <v-list-item-subtitle>
            <span>Enable all printers, excluding those in maintenance mode</span>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-btn
          :disabled="isLoading || noPrintersOrAllEnabled"
          color="primary"
          @click="batchToggleEnabled(true)"
          class="ml-4"
        >
          Batch enable
        </v-btn>
        <v-progress-circular v-if="isLoading" indeterminate size="30" width="4" class="ml-2" />
        <v-icon
          v-if="noPrintersOrAllEnabled"
          color="warning"
          class="ml-2"
          v-tooltip.bottom="'No printers available'"
          >warning</v-icon
        >
      </v-list-item>

      <!-- USB Connect -->
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Batch USB connect</v-list-item-title>
          <v-list-item-subtitle>
            <span>Connect all available USB devices</span>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-btn
          :disabled="!hasConnectUsbFeature || isLoading || noPrintersOrAllDisabled"
          color="primary"
          @click="connectUSBs"
          class="ml-4"
        >
          <v-icon class="mr-2">usb</v-icon> Connect USBs
        </v-btn>
        <v-alert v-if="!hasConnectUsbFeature" class="ml-4 mt-2" type="warning" color="orange">
          <v-icon class="mr-2">warning</v-icon> This feature requires an FDM Monster server update.
        </v-alert>
        <v-progress-circular v-if="isLoading" indeterminate size="30" width="4" class="ml-2" />
      </v-list-item>

      <!-- Socket Connect -->
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Batch socket connect</v-list-item-title>
          <v-list-item-subtitle>
            <span>Connect all sockets in a batch process</span>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-btn
          :disabled="!hasConnectSocketFeature || isLoading || noPrintersOrAllDisabled"
          color="primary"
          @click="connectSockets"
          class="ml-4"
        >
          <v-icon class="mr-2">hub</v-icon> Connect Sockets
        </v-btn>
        <v-alert v-if="!hasConnectSocketFeature" class="ml-4 mt-2" type="warning" color="orange">
          <v-icon class="mr-2">warning</v-icon> This feature requires an FDM Monster server update.
        </v-alert>
        <v-progress-circular v-if="isLoading" indeterminate size="30" width="4" class="ml-2" />
      </v-list-item>
    </v-list>

    <!-- Response Time Measurement -->
    <v-divider></v-divider>
    <v-card-actions class="mt-3">
      <v-alert border="left" type="info" color="blue"> Test all OctoPrint response times </v-alert>
      <v-btn color="primary" @click="clickFetchNameState" :loading="isLoading" class="ml-4">
        Measure response times
      </v-btn>
      <v-progress-circular v-if="isLoading" indeterminate size="30" width="4" class="ml-2" />
    </v-card-actions>
    <div class="ml-7 mt-3">
      <span v-if="namesFetched"> Response times: </span>
      <Bar v-if="namesFetched" :data="chartConfig" :options="chartOptions" height="40" />
      <span v-else>A graph will be shown, presenting the times in milliseconds (ms)</span>
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
import SettingsToolbar from "@/components/Settings/Shared/SettingsToolbar.vue";
import { settingsPage } from "@/components/Settings/Shared/setting.constants";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export type BatchOctoPrintSettingsDto = {
  success: boolean;
  printerId: IdType;
  time: number;
  value?: OctoPrintSettingsDto;
  error?: string;
};

const page = settingsPage["emergencyCommands"];
const printerStore = usePrinterStore();
const featureStore = useFeatureStore();

const isLoading = ref(false);
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

const noPrintersOrAllDisabled = computed(() => {
  return (
    printerStore.printers.length === 0 || printerStore.printers.every((printer) => !printer.enabled)
  );
});

const noPrintersOrAllEnabled = computed(() => {
  return (
    printerStore.printers.length === 0 ||
    printerStore.printers.every((printer) => !!printer.enabled)
  );
});

const hasConnectUsbFeature = computed(() => {
  return featureStore.hasFeature("batchConnectUsbCalls");
});

const hasConnectSocketFeature = computed(() => {
  return featureStore.hasFeature("batchConnectSocketCalls");
});

async function clickFetchNameState() {
  try {
    isLoading.value = true;
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
  } finally {
    isLoading.value = false;
  }
}

async function restartServer() {
  isLoading.value = true;
  try {
    await ServerPrivateService.restartServer();
    isLoading.value = false;
  } finally {
    isLoading.value = false;
  }
}

async function batchToggleEnabled(enabled: boolean) {
  if (!confirm("Are you sure you want to toggle all printers?")) {
    return;
  }

  isLoading.value = true;
  try {
    await BatchService.batchToggleEnabled(
      printerStore.printers.map((p) => p.id),
      enabled
    );
  } finally {
    isLoading.value = false;
  }
}

async function connectUSBs() {
  if (!confirm("Are you sure you want to connect all USBs?")) {
    return;
  }
  try {
    await BatchService.batchConnectUsb(printerStore.printers.map((p) => p.id));
  } finally {
    isLoading.value = false;
  }
}

async function connectSockets() {
  if (!confirm("Are you sure you want to connect all sockets?")) {
    return;
  }
  isLoading.value = true;
  await BatchService.batchConnectSocket(printerStore.printers.map((p) => p.id));
  isLoading.value = false;
}
</script>
