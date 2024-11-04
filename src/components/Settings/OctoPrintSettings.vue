<template>
  <v-card>
    <SettingsToolbar icon="image" title="OctoPrint" />

    <v-container>
      <v-row class="mb-6">
        <v-col>
          <v-divider />
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Pre-upload File Cleanup</v-list-item-title>
              <v-list-item-subtitle>
                Automatically cleanup old files to ensure the SD card has enough space.
                <v-checkbox
                  v-model="fileHandlingSettings.autoRemoveOldFilesBeforeUpload"
                  label="Remove old file before upload"
                ></v-checkbox>
                <v-text-field
                  v-model="fileHandlingSettings.autoRemoveOldFilesCriteriumDays"
                  :disabled="!fileHandlingSettings.autoRemoveOldFilesBeforeUpload"
                  label="Amount of days to keep files"
                  min="0"
                  outlined
                  type="number"
                />
                <v-checkbox
                  v-model="fileHandlingSettings.autoRemoveOldFilesAtBoot"
                  label="Remove old files when (re)booting the server"
                ></v-checkbox>
                <v-btn
                  :loading="loading.fileCleanSettings"
                  color="primary"
                  @click="setFileCleanSettings()"
                >
                  Save File Clean Settings
                </v-btn>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-col>
      </v-row>

      <v-row class="mb-6">
        <v-col>
          <v-divider />
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Connection Timeout</v-list-item-title>
              <v-list-item-subtitle v-if="settingsStore.settings?.timeout">
                Set the server connection timeout in milliseconds.
                <v-text-field
                  v-model="settingsStore.settings.timeout.apiTimeout"
                  label="Connection Timeout"
                  min="0"
                  outlined
                  type="number"
                />
                <v-btn
                  :loading="loading.timeoutSettings"
                  color="primary"
                  @click="updateTimeoutSettings()"
                >
                  Save Connection Timeout
                </v-btn>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-col>
      </v-row>

      <v-row class="mb-6">
        <v-col>
          <v-divider />
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Clean File References</v-list-item-title>
              <v-list-item-subtitle>
                Clear out file references without removing them from OctoPrint.
                <v-btn :loading="loading.purgeFiles" color="primary" @click="purgeFiles()">
                  Purge File References
                </v-btn>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-divider />
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Disable Inefficient GCode Analysis</v-list-item-title>
              <v-list-item-subtitle>
                Prevent CPU-intensive GCode analysis on all printers at once.
                <v-btn
                  :loading="loading.bulkDisableGCodeAnalysis"
                  color="primary"
                  @click="bulkDisableGCodeAnalysis()"
                >
                  Bulk Disable GCode Analysis
                </v-btn>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { PrinterFileService, SettingsService } from "@/backend";
import { PrinterSettingsService } from "@/backend/printer-settings.service";
import { FileCleanSettings } from "@/models/settings/printer-file-clean-settings.model";
import { usePrinterStore } from "@/store/printer.store";
import { usePrinterStateStore } from "@/store/printer-state.store";
import { useSnackbar } from "@/shared/snackbar.composable";
import { useSettingsStore } from "@/store/settings.store";
import SettingsToolbar from "@/components/Settings/Shared/SettingsToolbar.vue";

interface Data {
  fileHandlingSettings: FileCleanSettings;
  loading: {
    fileCleanSettings: boolean;
    timeoutSettings: boolean;
    purgeFiles: boolean;
    bulkDisableGCodeAnalysis: boolean;
  };
}

export default defineComponent({
  name: "FdmSettings",
  components: { SettingsToolbar },
  setup() {
    return {
      settingsStore: useSettingsStore(),
      printersStore: usePrinterStore(),
      snackbar: useSnackbar(),
      printerStateStore: usePrinterStateStore(),
    };
  },
  data(): Data {
    return {
      fileHandlingSettings: {
        autoRemoveOldFilesBeforeUpload: false,
        autoRemoveOldFilesAtBoot: false,
        autoRemoveOldFilesCriteriumDays: 7,
      },
      loading: {
        fileCleanSettings: false,
        timeoutSettings: false,
        purgeFiles: false,
        bulkDisableGCodeAnalysis: false,
      },
    };
  },
  async created() {
    const settings = await SettingsService.getSettings();
    this.fileHandlingSettings = settings.printerFileClean;
  },
  methods: {
    async updateTimeoutSettings() {
      if (!this.settingsStore.settings?.timeout?.apiTimeout) {
        this.snackbar.error("Timeout not set");
        return;
      }
      if (this.settingsStore.settings.timeout.apiTimeout < 1000) {
        this.snackbar.error("Timeout is too low - please set it to at least 1000 milliseconds");
      } else {
        this.loading.timeoutSettings = true;
        try {
          await this.settingsStore.updateTimeoutSettings(this.settingsStore.settings.timeout);
          this.snackbar.info("Timeout settings updated");
        } finally {
          this.loading.timeoutSettings = false;
        }
      }
    },
    async setFileCleanSettings() {
      this.loading.fileCleanSettings = true;
      try {
        const serverSettings = await SettingsService.setFileCleanSettings(
          this.fileHandlingSettings
        );
        this.fileHandlingSettings = serverSettings.printerFileClean;
        this.snackbar.openInfoMessage({
          title: `Successfully saved file cleanup settings`,
        });
      } finally {
        this.loading.fileCleanSettings = false;
      }
    },
    async purgeFiles() {
      this.loading.purgeFiles = true;
      try {
        await PrinterFileService.purgeFiles();
        this.snackbar.openInfoMessage({
          title: `Successfully purged all references to printer files!`,
        });
      } finally {
        this.loading.purgeFiles = false;
      }
    },
    async bulkDisableGCodeAnalysis() {
      this.loading.bulkDisableGCodeAnalysis = true;
      try {
        const printers = this.printerStateStore.onlinePrinters;
        for (const printer of Object.values(printers)) {
          await PrinterSettingsService.setGCodeAnalysis(printer.id, false);
        }
        this.snackbar.openInfoMessage({
          title: `Finished disabling GCode analysis for ${printers.length} online printers.`,
        });
      } finally {
        this.loading.bulkDisableGCodeAnalysis = false;
      }
    },
  },
});
</script>
