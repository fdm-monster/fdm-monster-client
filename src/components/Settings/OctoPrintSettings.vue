<template>
  <v-card>
    <SettingsToolbar icon="image" title="OctoPrint" />

    <v-list subheader three-line>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Pre-upload file cleanup</v-list-item-title>
          <v-list-item-subtitle>
            Automatically cleanup old files to ensure the SD card has enough space.
            <br />
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
            <v-btn color="primary" @click="setFileCleanSettings()">save file clean settings</v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Connection Timeout</v-list-item-title>
          <v-list-item-subtitle v-if="settingsStore.settings?.timeout">
            The connection timeout is the amount of time in milliseconds that the server will wait
            for OctoPrint to respond before giving up
            <v-text-field
              v-model="settingsStore.settings.timeout.apiTimeout"
              label="Connection Timeout"
              min="0"
              outlined
              type="number"
            />
            <v-btn color="primary" @click="updateTimeoutSettings()">save connection timeout</v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Clean file references</v-list-item-title>
          <v-list-item-subtitle>
            Clear out the file references for all printers - this does not remove them from
            OctoPrint!
            <br />
            <v-btn color="primary" @click="purgeFiles()">Purge file references</v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Disable inefficient GCode analysis</v-list-item-title>
          <v-list-item-subtitle>
            Disable GCode analysis on all printers at once, preventing CPU intensive and inaccurate
            time/size estimates.
            <br />
            <v-btn color="primary" @click="bulkDisableGCodeAnalysis()">
              Bulk disable GCode Analysis
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
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
}

export default defineComponent({
  name: "FdmSettings",
  components: { SettingsToolbar },
  setup: () => {
    return {
      settingsStore: useSettingsStore(),
      printersStore: usePrinterStore(),
      snackbar: useSnackbar(),
      printerStateStore: usePrinterStateStore(),
    };
  },
  props: {},
  data: (): Data => ({
    fileHandlingSettings: {
      autoRemoveOldFilesBeforeUpload: false,
      autoRemoveOldFilesAtBoot: false,
      autoRemoveOldFilesCriteriumDays: 7,
    },
  }),
  async created() {
    const settings = await SettingsService.getSettings();
    this.fileHandlingSettings = settings.printerFileClean;
  },
  mounted() {},
  computed: {},
  methods: {
    async updateTimeoutSettings() {
      if (!this.settingsStore.settings?.timeout?.apiTimeout) {
        this.snackbar.error("Timeout not set");
        return;
      }
      if (this.settingsStore.settings.timeout.apiTimeout < 1000) {
        this.snackbar.error("Timeout is too low - please set it to at least 1000 milliseconds");
      } else {
        await this.settingsStore.updateTimeoutSettings(this.settingsStore.settings?.timeout);
        this.snackbar.info("Timeout settings updated");
      }
    },
    async setFileCleanSettings() {
      const serverSettings = await SettingsService.setFileCleanSettings(this.fileHandlingSettings);
      this.fileHandlingSettings = serverSettings.printerFileClean;

      this.snackbar.openInfoMessage({
        title: `Successfully saved file cleanup settings`,
      });
    },
    async purgeFiles() {
      await PrinterFileService.purgeFiles();

      this.snackbar.openInfoMessage({
        title: `Successfully purged all references to printer files!`,
      });
    },
    async bulkDisableGCodeAnalysis() {
      const printers = this.printerStateStore.onlinePrinters;
      this.snackbar.openInfoMessage({
        title: `Trying to disable gcode analysis for ${printers.length} online printers.`,
      });
      for (const printer of Object.values(printers)) {
        await PrinterSettingsService.setGCodeAnalysis(printer.id, false);
      }
      this.snackbar.openInfoMessage({
        title: `Finished disabling gcode analysis for ${printers.length} online printers.`,
      });
    },
  },
  watch: {},
});
</script>
