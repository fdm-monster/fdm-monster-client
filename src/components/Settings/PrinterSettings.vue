<template>
  <v-card>
    <SettingsToolbar :icon="page.icon" :title="page.title" />

    <div>
      <v-card-text>
        <SettingSection
          v-if="settingsStore.settings?.printerFileClean"
          title="Pre-upload File Cleanup"
          tooltip="Automatically cleanup old files to ensure the SD card has enough space."
        >
          <v-checkbox
            v-model="fileHandlingSettings.autoRemoveOldFilesBeforeUpload"
            class="mb-3"
            label="Remove old file before upload"
            @change="setFileCleanSettings"
          />

          <v-text-field
            v-model="fileHandlingSettings.autoRemoveOldFilesCriteriumDays"
            :disabled="!fileHandlingSettings.autoRemoveOldFilesBeforeUpload"
            label="Amount of days to keep files"
            min="0"
            type="number"
            @change="setFileCleanSettings"
          />

          <v-checkbox
            v-model="fileHandlingSettings.autoRemoveOldFilesAtBoot"
            label="Remove old files when (re)booting the server"
            @change="setFileCleanSettings"
          />

          <v-progress-circular
            v-if="loading.fileCleanSettings"
            class="ml-2"
            indeterminate
            size="30"
            width="4"
          />
        </SettingSection>

        <v-divider />

        <SettingSection
          v-if="settingsStore.settings?.timeout"
          title="API Timeout"
          tooltip="Set the server default REST API timeout in milliseconds."
        >
          <v-text-field
            v-model="settingsStore.settings.timeout.apiTimeout"
            label="Connection Timeout"
            min="0"
            type="number"
            @change="updateTimeoutSettings"
          />

          <v-progress-circular
            v-if="loading.timeoutSettings"
            class="ml-2"
            indeterminate
            size="30"
            width="4"
          />
        </SettingSection>

        <SettingSection
          v-if="settingsStore.settings?.timeout"
          title="Upload Timeout"
          tooltip="Set the server REST API file upload timeout in milliseconds."
        >
          <v-text-field
            v-model="settingsStore.settings.timeout.apiUploadTimeout"
            label="Upload Timeout"
            min="0"
            type="number"
            @change="updateTimeoutSettings"
          />

          <v-progress-circular
            v-if="loading.timeoutSettings"
            class="ml-2"
            indeterminate
            size="30"
            width="4"
          />
        </SettingSection>

        <v-divider />

        <SettingSection
          title="Clean File References"
          tooltip="Clear out file references without removing them from OctoPrint."
        >
          <v-btn
            :disabled="noPrintersOrAllDisabled || loading.purgeFiles"
            class="mb-2"
            color="primary"
            @click="purgeFiles()"
          >
            Purge File References
          </v-btn>
          <v-progress-circular
            v-if="loading.purgeFiles"
            class="ml-2"
            indeterminate
            size="30"
            width="4"
          />
          <v-icon v-if="noPrintersOrAllDisabled" class="ml-2" color="warning"> warning</v-icon>
        </SettingSection>

        <v-divider />

        <SettingSection
          title="Disable Inefficient GCode Analysis"
          tooltip="Prevent CPU-intensive GCode analysis on all printers at once."
        >
          <v-btn
            :disabled="noPrintersOrAllDisabled || loading.bulkDisableGCodeAnalysis"
            class="mb-2"
            color="primary"
            @click="bulkDisableGCodeAnalysis()"
          >
            Bulk Disable GCode Analysis
          </v-btn>
          <v-progress-circular
            v-if="loading.bulkDisableGCodeAnalysis"
            class="ml-2"
            indeterminate
            size="30"
            width="4"
          />

          <v-icon v-if="noPrintersOrAllDisabled" class="ml-2" color="warning"> warning</v-icon>
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

const page = settingsPage["printer"];
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
  settingsStore.settings.timeout.apiTimeout = parseInt(
    settingsStore.settings.timeout.apiTimeout.toString()
  );
  settingsStore.settings.timeout.apiUploadTimeout = parseInt(
    settingsStore.settings.timeout.apiUploadTimeout.toString()
  );
  if (!settingsStore.settings?.timeout?.apiTimeout) {
    snackbar.error("Timeout not set");
    return;
  }
  if (settingsStore.settings.timeout.apiTimeout < 1000) {
    snackbar.error("Timeout is too low - please set it to at least 1000 milliseconds");
    settingsStore.settings.timeout.apiTimeout = 1000;
  }
  if (settingsStore.settings.timeout.apiUploadTimeout < 10000) {
    snackbar.error("Upload timeout is too low - please set it to at least 10000 milliseconds");
    settingsStore.settings.timeout.apiUploadTimeout = 10000;
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
