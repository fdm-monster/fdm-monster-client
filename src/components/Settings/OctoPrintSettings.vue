<template>
  <v-card>
    <SettingsToolbar :icon="page.icon" :title="page.title" />

    <div>
      <v-card-text>
        <SettingSection
          title="Pre-upload File Cleanup"
          v-if="settingsStore.settings?.printerFileClean"
          tooltip="Automatically cleanup old files to ensure the SD card has enough space."
        >
          <v-checkbox
            class="mb-3"
            @change="setFileCleanSettings"
            v-model="fileHandlingSettings.autoRemoveOldFilesBeforeUpload"
            label="Remove old file before upload"
          />

          <v-text-field
            @change="setFileCleanSettings"
            v-model="fileHandlingSettings.autoRemoveOldFilesCriteriumDays"
            :disabled="!fileHandlingSettings.autoRemoveOldFilesBeforeUpload"
            label="Amount of days to keep files"
            min="0"
            type="number"
          />

          <v-checkbox
            @change="setFileCleanSettings"
            v-model="fileHandlingSettings.autoRemoveOldFilesAtBoot"
            label="Remove old files when (re)booting the server"
          />

          <v-progress-circular
            v-if="loading.fileCleanSettings"
            indeterminate
            size="30"
            width="4"
            class="ml-2"
          />
        </SettingSection>

        <v-divider />

        <SettingSection
          title="Connection Timeout"
          v-if="settingsStore.settings?.timeout"
          tooltip="Set the server connection timeout in milliseconds."
        >
          <v-text-field
            @change="updateTimeoutSettings"
            v-model="settingsStore.settings.timeout.apiTimeout"
            label="Connection Timeout"
            min="0"
            type="number"
          />

          <v-progress-circular
            v-if="loading.timeoutSettings"
            indeterminate
            size="30"
            width="4"
            class="ml-2"
          />
        </SettingSection>

        <v-divider />

        <SettingSection
          title="Clean File References"
          tooltip="Clear out file references without removing them from OctoPrint."
        >
          <v-btn
            :disabled="noPrintersOrAllDisabled || loading.purgeFiles"
            color="primary"
            class="mb-2"
            @click="purgeFiles()"
          >
            Purge File References
          </v-btn>
          <v-progress-circular
            v-if="loading.purgeFiles"
            indeterminate
            size="30"
            width="4"
            class="ml-2"
          />
          <v-icon v-if="noPrintersOrAllDisabled" color="warning" class="ml-2"> warning </v-icon>
        </SettingSection>

        <v-divider />

        <SettingSection
          title="Disable Inefficient GCode Analysis"
          tooltip="Prevent CPU-intensive GCode analysis on all printers at once."
        >
          <v-btn
            :disabled="noPrintersOrAllDisabled || loading.bulkDisableGCodeAnalysis"
            color="primary"
            class="mb-2"
            @click="bulkDisableGCodeAnalysis()"
          >
            Bulk Disable GCode Analysis
          </v-btn>
          <v-progress-circular
            v-if="loading.bulkDisableGCodeAnalysis"
            indeterminate
            size="30"
            width="4"
            class="ml-2"
          />

          <v-icon v-if="noPrintersOrAllDisabled" color="warning" class="ml-2"> warning </v-icon>
        </SettingSection>
      </v-card-text>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { PrinterFileService, SettingsService } from "@/backend";
import { PrinterSettingsService } from "@/backend/printer-settings.service";
import { usePrinterStore } from "@/store/printer.store";
import { usePrinterStateStore } from "@/store/printer-state.store";
import { useSnackbar } from "@/shared/snackbar.composable";
import { useSettingsStore } from "@/store/settings.store";
import SettingsToolbar from "@/components/Settings/Shared/SettingsToolbar.vue";
import { settingsPage } from "@/components/Settings/Shared/setting.constants";
import SettingSection from "@/components/Settings/Shared/SettingSection.vue";

const page = settingsPage["octoprint"];
const settingsStore = useSettingsStore();
const printerStateStore = usePrinterStateStore();
const snackbar = useSnackbar();
const printerStore = usePrinterStore();

const noPrintersOrAllDisabled = computed(() => {
  return (
    printerStore.printers.length === 0 || printerStore.printers.every((printer) => !printer.enabled)
  );
});

const fileHandlingSettings = ref({
  autoRemoveOldFilesBeforeUpload: false,
  autoRemoveOldFilesAtBoot: false,
  autoRemoveOldFilesCriteriumDays: 7,
});

const loading = ref({
  fileCleanSettings: false,
  timeoutSettings: false,
  purgeFiles: false,
  bulkDisableGCodeAnalysis: false,
});

onMounted(async () => {
  const settings = await SettingsService.getSettings();
  fileHandlingSettings.value = settings.printerFileClean;
});

async function updateTimeoutSettings() {
  if (!settingsStore.settings?.timeout?.apiTimeout) {
    snackbar.error("Timeout not set");
    return;
  }
  if (settingsStore.settings.timeout.apiTimeout < 1000) {
    snackbar.error("Timeout is too low - please set it to at least 1000 milliseconds");
  } else {
    loading.value.timeoutSettings = true;
    try {
      await settingsStore.updateTimeoutSettings(settingsStore.settings.timeout);
      snackbar.info("Timeout settings updated");
    } finally {
      loading.value.timeoutSettings = false;
    }
  }
}

async function setFileCleanSettings() {
  loading.value.fileCleanSettings = true;
  try {
    const serverSettings = await SettingsService.setFileCleanSettings(fileHandlingSettings.value);
    fileHandlingSettings.value = serverSettings.printerFileClean;
    snackbar.openInfoMessage({
      title: `Successfully saved file cleanup settings`,
    });
  } finally {
    loading.value.fileCleanSettings = false;
  }
}
async function purgeFiles() {
  loading.value.purgeFiles = true;
  try {
    await PrinterFileService.purgeFiles();
    snackbar.openInfoMessage({
      title: `Successfully purged all references to printer files!`,
    });
  } finally {
    loading.value.purgeFiles = false;
  }
}
async function bulkDisableGCodeAnalysis() {
  loading.value.bulkDisableGCodeAnalysis = true;
  try {
    const printers = printerStateStore.onlinePrinters;
    for (const printer of Object.values(printers)) {
      await PrinterSettingsService.setGCodeAnalysis(printer.id, false);
    }
    snackbar.openInfoMessage({
      title: `Finished disabling GCode analysis for ${printers.length} online printers.`,
    });
  } finally {
    loading.value.bulkDisableGCodeAnalysis = false;
  }
}
</script>
