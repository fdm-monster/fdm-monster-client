<template>
  <v-card>
    <SettingsToolbar :icon="page.icon" :title="page.title" />

    <v-card-text>
      <v-list subheader>
        <v-subheader>Emergency Commands to rectify problematic situations</v-subheader>

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
            class="ml-4"
            color="primary"
            @click="batchToggleEnabled(false)"
          >
            Batch disable
          </v-btn>
          <v-progress-circular v-if="isLoading" class="ml-2" indeterminate size="30" width="4" />
          <v-icon v-if="noPrintersOrAllDisabled" class="ml-2" color="warning"> warning</v-icon>
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
            class="ml-4"
            color="primary"
            @click="batchToggleEnabled(true)"
          >
            Batch enable
          </v-btn>
          <v-progress-circular v-if="isLoading" class="ml-2" indeterminate size="30" width="4" />
          <v-icon
            v-if="noPrintersOrAllEnabled"
            v-tooltip.bottom="'No printers available'"
            class="ml-2"
            color="warning"
          >
            warning
          </v-icon>
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
            :disabled="isLoading || noPrintersOrAllDisabled"
            class="ml-4"
            color="primary"
            @click="connectUSBs"
          >
            <v-icon class="mr-2">usb</v-icon>
            Connect USBs
          </v-btn>
          <v-progress-circular v-if="isLoading" class="ml-2" indeterminate size="30" width="4" />
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
            :disabled="isLoading || noPrintersOrAllDisabled"
            class="ml-4"
            color="primary"
            @click="connectSockets"
          >
            <v-icon class="mr-2">hub</v-icon>
            Connect Sockets
          </v-btn>
          <v-progress-circular v-if="isLoading" class="ml-2" indeterminate size="30" width="4" />
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <!-- Response Time Measurement -->
      <SettingSection :usecols="false" title="Test all printer network response times">
        <v-btn :loading="isLoading" color="primary" @click="clickFetchNameState">
          Measure network response times
        </v-btn>
      </SettingSection>

      <div class="ml-7 mt-3">
        <Bar
          v-if="namesFetched"
          :data="chartConfig"
          :options="chartOptions"
          height="100"
          style="background-color: #272727"
        />
        <span v-else>A graph will be shown, presenting the times in milliseconds (ms)</span>
        <v-progress-circular v-if="isLoading" class="ml-2" indeterminate size="30" width="4" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { BatchService } from "@/backend/batch.service";
import { usePrinterStore } from "@/store/printer.store";
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
import SettingsToolbar from "@/components/Settings/Shared/SettingsToolbar.vue";
import { settingsPage } from "@/components/Settings/Shared/setting.constants";
import SettingSection from "@/components/Settings/Shared/SettingSection.vue";

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
      label: "Response times (ms)",
      data: [],
      borderColor: "var(--v-primary-base)",
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
    const labels = printerSettingsBatch.map((n) => n.value?.appearance?.name ?? "?");
    responseTimesAvg.value = times.reduce((a: number, b: number) => a + b, 0) / times.length;
    responseTimesMin.value = Math.min(...times);
    responseTimesMax.value = Math.max(...times);
    chartConfig.value = {
      labels,
      datasets: [
        {
          label: "Settings response times (ms)",
          data: times,
          borderColor: "var(--v-primary-base)",
          backgroundColor: "#ffffff",
        },
      ],
    };

    namesFetched.value = true;
    fetchedNames.value = names;
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
